import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all active questions and pick 30 randomly server-side
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text_kw, option_a_kw, option_b_kw, option_c_kw, option_d_kw, correct_answer, explanation_kw, category, difficulty')
    .eq('is_active', true)

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }

  // Server-side shuffle and take 30 (or all if less than 30)
  const shuffled = data.sort(() => Math.random() - 0.5)
  const examQuestions = shuffled.slice(0, Math.min(30, shuffled.length))

  return NextResponse.json({
    questions: examQuestions,
    total: examQuestions.length,
    time_limit_seconds: 1800, // 30 minutes
  })
}
