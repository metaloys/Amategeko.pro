import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { AnswerOption } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { questions_snapshot, answers, duration_seconds } = body

  if (!questions_snapshot || !answers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Score the exam server-side — never trust client scoring
  let correct_count = 0
  const category_scores: Record<string, { correct: number; total: number }> = {}

  for (const question of questions_snapshot) {
    const userAnswer = answers[question.id] as AnswerOption | undefined
    const isCorrect = userAnswer === question.correct_answer

    if (isCorrect) correct_count++

    // Track by category
    if (!category_scores[question.category]) {
      category_scores[question.category] = { correct: 0, total: 0 }
    }
    category_scores[question.category].total++
    if (isCorrect) category_scores[question.category].correct++
  }

  const total_questions = questions_snapshot.length
  const score_percent = Math.round((correct_count / total_questions) * 100)
  const passed = score_percent >= 70

  // Save to database
  const { data: session, error } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: user.id,
      mode: 'mock_exam',
      questions_snapshot,
      answers,
      total_questions,
      correct_count,
      score_percent,
      passed,
      pass_threshold: 70,
      category_scores,
      duration_seconds,
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Exam save error:', error)
    return NextResponse.json({ error: 'Failed to save exam' }, { status: 500 })
  }

  // After successful session insert, update category progress
  if (session) {
    for (const [category, scores] of Object.entries(category_scores)) {
      await supabase
        .from('user_category_progress')
        .upsert({
          user_id: user.id,
          category,
          questions_seen: scores.total,
          questions_correct: scores.correct,
          last_updated: new Date().toISOString(),
        }, { 
          onConflict: 'user_id,category',
          ignoreDuplicates: false,
        })
    }

    // Increment exams_taken_total
    await supabase.rpc('update_user_streak', { p_user_id: user.id })
  }

  return NextResponse.json({
    session_id: session.id,
    score_percent,
    correct_count,
    total_questions,
    passed,
    category_scores,
  })
}
