import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('questions_answered_total, exams_taken_total, current_streak_days, subscription_tier')
    .single()

  // Fetch last 10 completed exam sessions
  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('id, mode, score_percent, passed, correct_count, total_questions, completed_at, category_scores')
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(10)

  // Fetch category progress
  const { data: categoryProgress } = await supabase
    .from('user_category_progress')
    .select('category, questions_seen, questions_correct, accuracy_percent')
    .eq('user_id', user.id)

  // Calculate average score from sessions
  const completedExams = sessions ?? []
  const avgScore = completedExams.length > 0
    ? Math.round(completedExams.reduce((sum, s) => sum + (s.score_percent ?? 0), 0) / completedExams.length)
    : 0

  return NextResponse.json({
    profile,
    sessions: completedExams,
    categoryProgress: categoryProgress ?? [],
    avgScore,
  })
}
