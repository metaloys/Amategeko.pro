import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  // Auth check — tutor is for authenticated users only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { question_text, option_a, option_b, option_c, option_d, correct_answer, user_answer, language } = body

  if (!question_text || !correct_answer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isKinyarwanda = language !== 'en'

  const systemPrompt = isKinyarwanda
    ? `Uri umwarimu w'amategeko y'umuhanda mu Rwanda. Guha ibisobanuro bifupi, binonosoye kandi byoroshye gusobanukirwa mu Kinyarwanda. Subiza gusa mu Kinyarwanda. Subiza mu magambo make — ntarenze interuro 3. Ntukavuge ko ari ikizamini cyangwa app.`
    : `You are a Rwanda driving theory exam tutor. Give short, clear, easy-to-understand explanations in English. Reply only in English. Keep it to 3 sentences maximum. Do not mention it is an exam or app.`

  const correctOptionText = {
    a: option_a, b: option_b, c: option_c, d: option_d
  }[correct_answer as 'a'|'b'|'c'|'d']

  const userOptionText = user_answer ? {
    a: option_a, b: option_b, c: option_c, d: option_d
  }[user_answer as 'a'|'b'|'c'|'d'] : null

  const userPrompt = isKinyarwanda
    ? `Ikibazo: "${question_text}"
${userOptionText ? `Umunyeshuri yasubije: "${userOptionText}" — ibi si byo.` : ''}
Igisubizo cy'ukuri ni: "${correctOptionText}"
Sobanura impamvu "${correctOptionText}" ari igisubizo cy'ukuri mu magambo make.`
    : `Question: "${question_text}"
${userOptionText ? `The student answered: "${userOptionText}" — which is incorrect.` : ''}
The correct answer is: "${correctOptionText}"
Explain briefly why "${correctOptionText}" is the correct answer.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Fast, free, good quality
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.3, // Low temperature = consistent, factual answers
    })

    const explanation = completion.choices[0]?.message?.content?.trim()

    if (!explanation) {
      return NextResponse.json({ error: 'No response from tutor' }, { status: 500 })
    }

    return NextResponse.json({ explanation })

  } catch (error) {
    console.error('Groq API error:', error)
    return NextResponse.json(
      { error: 'Umwarimu ntabasha gusubiza ubu. Ongera ugerageze.' },
      { status: 500 }
    )
  }
}
