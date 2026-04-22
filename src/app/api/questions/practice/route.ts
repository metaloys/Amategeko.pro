import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  let query = supabase
    .from('questions')
    .select('id, source_question_number, question_text_kw, option_a_kw, option_b_kw, option_c_kw, option_d_kw, correct_answer, explanation_kw, category, difficulty')
    .eq('is_active', true)
    .limit(limit)

  if (category) {
    query = query.eq('category', category)
  }

  // Server-side randomization
  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ questions: [], total: 0 })
  }

  // Shuffle server-side — never expose correct_answer ordering patterns
  const shuffled = data.sort(() => Math.random() - 0.5)

  return NextResponse.json({ questions: shuffled, total: shuffled.length })
}
