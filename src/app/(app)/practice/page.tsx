'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Question } from '@/types/database'

type AnswerOption = 'a' | 'b' | 'c' | 'd'

type AnswerState = {
  selected: AnswerOption | null
  revealed: boolean
}

export default function PracticePage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>({ selected: null, revealed: false })
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, AnswerOption>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    try {
      const res = await fetch('/api/questions/practice?limit=20')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setQuestions(data.questions)
    } catch {
      setError('Ibazyo ntibyashoboye gupakirwa. Ongera ugerageze.')
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(option: AnswerOption) {
    if (answerState.revealed) return
    setAnswerState({ selected: option, revealed: true })
    setSessionAnswers(prev => ({ ...prev, [questions[currentIndex].id]: option }))
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setAnswerState({ selected: null, revealed: false })
    } else {
      router.push('/progress')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-sm">Gutegura ibibazo...</p>
        </div>
      </main>
    )
  }

  if (error || questions.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-error font-semibold">{error ?? 'Nta bibazo bihari.'}</p>
          <button onClick={fetchQuestions} className="mt-4 text-brand-primary font-semibold">
            Ongera ugerageze
          </button>
        </div>
      </main>
    )
  }

  const question = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const options: { key: AnswerOption; text: string }[] = [
    { key: 'a', text: question.option_a_kw },
    { key: 'b', text: question.option_b_kw },
    { key: 'c', text: question.option_c_kw },
    { key: 'd', text: question.option_d_kw },
  ]

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => router.push('/home')} className="text-brand-primary font-semibold text-sm">
            ← Subira
          </button>
          <span className="text-dark font-semibold text-sm">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-[6px] bg-divider rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 pt-6 pb-32 overflow-y-auto">
        <p className="text-[11px] font-semibold text-brand-mid uppercase tracking-wide mb-3">
          Ikibazo {currentIndex + 1}
        </p>
        <p className="text-[16px] text-dark leading-[1.6] mb-6">
          {question.question_text_kw}
        </p>

        {/* Answer options */}
        <div className="flex flex-col gap-3">
          {options.map(({ key, text }) => {
            const isSelected = answerState.selected === key
            const isCorrect = question.correct_answer === key
            const isRevealed = answerState.revealed

            return (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                className={`w-full text-left px-4 py-4 rounded-[12px] border text-[16px] leading-[1.5] transition-all duration-200 ${
                  // Default state
                  !isRevealed
                    ? 'border-divider bg-white text-dark hover:border-brand-primary hover:bg-brand-light'
                    : // Correct answer revealed
                    isCorrect
                    ? 'border-2 border-success bg-success-light text-success font-semibold'
                    : // Wrong answer selected
                    isSelected && !isCorrect
                    ? 'border-2 border-error bg-error-light text-error'
                    : // Dimmed non-selected after reveal
                    'opacity-40 border-divider bg-white text-dark'
                }`}
              >
                <span className="font-semibold mr-2 uppercase">{key})</span>
                {text}
              </button>
            )
          })}
        </div>

        {/* Explanation — appears after answer */}
        {answerState.revealed && question.explanation_kw && (
          <div className="mt-4 p-4 bg-success-light border border-success rounded-[12px]">
            <p className="text-success text-[13px] font-semibold mb-1">
              ✓ Igisubizo cy'ukuri: {question.correct_answer.toUpperCase()}
            </p>
            <p className="text-dark text-[14px] leading-[1.5]">
              {question.explanation_kw}
            </p>
          </div>
        )}
      </div>

      {/* Next button — fixed bottom */}
      {answerState.revealed && (
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <button
            onClick={handleNext}
            style={{
              backgroundColor: '#F0A500',
              cursor: 'pointer',
            }}
            className="w-full text-white font-semibold text-[15px] h-[52px] rounded-[10px] max-w-[480px] mx-auto block"
          >
            {currentIndex < questions.length - 1 ? 'Komeza →' : 'Reba Ibisubizo'}
          </button>
        </div>
      )}

      {/* Bottom nav spacer */}
      <div className="h-20" />
    </main>
  )
}
