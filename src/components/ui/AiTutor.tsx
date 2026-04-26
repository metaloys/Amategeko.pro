'use client'

import { useState } from 'react'
import type { Question, AnswerOption } from '@/types/database'

interface AiTutorProps {
  question: Question
  userAnswer: AnswerOption
  language: 'kw' | 'en'
}

export default function AiTutor({ question, userAnswer, language }: AiTutorProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [asked, setAsked] = useState(false)

  async function askTutor() {
    setLoading(true)
    setError(null)
    setAsked(true)

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question_text_kw,
          userAnswer,
          correctAnswer: question.correct_answer,
          options: {
            a: question.option_a_kw,
            b: question.option_b_kw,
            c: question.option_c_kw,
            d: question.option_d_kw,
          },
          language,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Habaye ikosa.')
        return
      }

      setExplanation(data.explanation)
    } catch {
      setError('Ntabwo gutumanahana bishobotse. Gerageza uruhererekane.')
    } finally {
      setLoading(false)
    }
  }

  // Only show for wrong answers
  if (userAnswer === question.correct_answer) return null

  return (
    <div className="mt-3">
      {!asked ? (
        <button
          onClick={askTutor}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#1A56A0',
            color: 'white',
            borderRadius: '10px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          🎓 {language === 'en' ? 'Ask AI Tutor — Why is this wrong?' : 'Baza Umwarimu w\'AI — Kuki ntibyo?'}
        </button>
      ) : loading ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#E8F0FB',
          borderRadius: '10px',
          border: '1px solid #1A56A0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '18px',
            height: '18px',
            border: '3px solid #1A56A0',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '14px', color: '#1A56A0', margin: 0 }}>
            {language === 'en' ? 'Tutor is thinking...' : 'Umwarimu aribaza...'}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FDEDEC',
          borderRadius: '10px',
          border: '1px solid #C0392B',
        }}>
          <p style={{ fontSize: '13px', color: '#C0392B', margin: 0 }}>⚠ {error}</p>
          <button
            onClick={askTutor}
            style={{ marginTop: '8px', fontSize: '13px', color: '#1A56A0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            {language === 'en' ? 'Try again' : 'Ongera ugerageze'}
          </button>
        </div>
      ) : explanation ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#E8F0FB',
          borderRadius: '10px',
          border: '1.5px solid #1A56A0',
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#1A56A0',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            🎓 {language === 'en' ? 'AI Tutor' : 'Umwarimu w\'AI'}
          </p>
          <p style={{
            fontSize: '15px',
            color: '#1A1A1A',
            lineHeight: '1.6',
            margin: 0,
          }}>
            {explanation}
          </p>
        </div>
      ) : null}
    </div>
  )
}
