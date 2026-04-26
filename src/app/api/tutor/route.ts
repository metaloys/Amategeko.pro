import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { question, userAnswer, correctAnswer, options, language } = body

  if (!question || !correctAnswer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Build readable options string
  const optionLabels = ['a', 'b', 'c', 'd']
  const optionsText = optionLabels
    .map(l => `${l.toUpperCase()}) ${options?.[l] ?? ''}`)
    .join('\n')

  const userAnswerText = options?.[userAnswer] ?? userAnswer
  const correctAnswerText = options?.[correctAnswer] ?? correctAnswer

  const isKinyarwanda = language === 'kw' || !language

  const systemPrompt = isKinyarwanda
    ? `Uri umwarimu w'amategeko y'umuhanda mu Rwanda. Soma ikibazo, reba igisubizo cy'ukuri, hanyuma sobanura neza mu Kinyarwanda ubusobanuro busobanutse n'inzira igomba gukurikizwa. Subiza mu magambo make ariko asobanutse neza. Sobanura impamvu igisubizo cy'ukuri ari icyo, n'impamvu izindi ntabyo. Koresha urugero rw'ibyongera. Ntugaragaze ikibazo ubwacyo — sobanura gusa.`
    : `You are a driving theory tutor for Rwanda. Explain clearly in English why the correct answer is right, and why the other options are wrong. Be concise but thorough. Give a real-world example from Rwandan roads where possible. Do not repeat the question back — just explain the concept.`

  const userPrompt = isKinyarwanda
    ? `Ikibazo: ${question}

Amahitamo:
${optionsText}

Igisubizo cy'umunyeshuri: ${userAnswer?.toUpperCase()}) ${userAnswerText}
Igisubizo cy'ukuri: ${correctAnswer?.toUpperCase()}) ${correctAnswerText}

Sobanura impamvu igisubizo cy'ukuri ari "${correctAnswer?.toUpperCase()}) ${correctAnswerText}" — kandi impamvu igisubizo cy'umunyeshuri ("${userAnswer?.toUpperCase())") atari icyo.`
    : `Question: ${question}

Options:
${optionsText}

Student answered: ${userAnswer?.toUpperCase()}) ${userAnswerText}
Correct answer: ${correctAnswer?.toUpperCase()}) ${correctAnswerText}

Explain why "${correctAnswer?.toUpperCase()}) ${correctAnswerText}" is correct, and why the student's answer "${userAnswer?.toUpperCase()}) ${userAnswerText}" is wrong.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 0.4,
    })

    const explanation = completion.choices[0]?.message?.content ?? 'Nta bisobanuro bihari.'

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('Groq error:', error)
    return NextResponse.json(
      { error: 'AI tutor temporarily unavailable' },
      { status: 503 }
    )
  }
}
