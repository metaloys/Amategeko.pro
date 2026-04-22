'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Question, AnswerOption } from '@/types/database'

type ExamState = 'loading' | 'ready' | 'active' | 'submitting' | 'results'

type Results = {
  score_percent: number
  correct_count: number
  total_questions: number
  passed: boolean
  category_scores: Record<string, { correct: number; total: number }>
}

const EXAM_DURATION = 1200 // 20 minutes in seconds

export default function ExamPage() {
  const router = useRouter()
  const [examState, setExamState] = useState<ExamState>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, AnswerOption>>({})
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [startedAt] = useState(Date.now())
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load questions on mount
  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch('/api/questions/exam')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setQuestions(data.questions)
        setExamState('ready')
      } catch {
        setError('Ikizamini ntikishoboye gutangira. Ongera ugerageze.')
        setExamState('ready')
      }
    }
    loadExam()
  }, [router])

  // Countdown timer — only runs during active exam
  useEffect(() => {
    if (examState !== 'active') return
    if (timeLeft <= 0) {
      submitExam()
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [examState, timeLeft])

  const submitExam = useCallback(async () => {
    if (examState === 'submitting' || examState === 'results') return
    setExamState('submitting')

    const duration_seconds = Math.round((Date.now() - startedAt) / 1000)

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions_snapshot: questions,
          answers,
          duration_seconds,
        }),
      })

      if (!res.ok) throw new Error('Submit failed')
      const data = await res.json()
      setResults(data)
      setExamState('results')
    } catch {
      setError('Ikizamini ntikishoboye guhunikwa. Ongera ugerageze.')
      setExamState('active')
    }
  }, [examState, startedAt, questions, answers])

  function handleAnswer(option: AnswerOption) {
    if (examState !== 'active') return
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: option }))
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const unansweredCount = questions.length - Object.keys(answers).length

  // ── LOADING ──────────────────────────────────────────────
  if (examState === 'loading') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-sm">Gutegura ikizamini...</p>
        </div>
      </main>
    )
  }

  // ── READY / START SCREEN ─────────────────────────────────
  if (examState === 'ready') {
    return (
      <main className="min-h-screen bg-white flex flex-col px-4 pt-8 pb-24">
        <div className="max-w-[480px] mx-auto w-full flex flex-col gap-6">
          <button
            onClick={() => router.push('/home')}
            className="text-brand-primary font-semibold text-sm self-start"
          >
            ← Subira
          </button>

          <div className="bg-brand-light rounded-2xl p-6 text-center flex flex-col gap-3">
            <span className="text-4xl">📋</span>
            <h1 className="text-[22px] font-bold text-dark">Ikizamini — Mock Exam</h1>
            <p className="text-body text-[14px]">
              Ibibazo: {questions.length} | Igihe: 20 min
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              'Ibibazo ' +
                questions.length +
                ' bizakugaragarira rimwe na rimwe',
              "Ntuzabona igisubizo cy'ukuri mu gihe cy'ikizamini",
              'Ugomba gutunga nibura 70% kugira ngo utsinde',
              'Ikizamini kizarangira igihe cyose igihe kirangiye',
            ].map((rule, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-brand-primary font-bold text-sm mt-0.5">
                  →
                </span>
                <p className="text-dark text-[14px]">{rule}</p>
              </div>
            ))}
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <button
            onClick={() => setExamState('active')}
            disabled={questions.length === 0}
            style={{
              backgroundColor: questions.length === 0 ? '#CCCCCC' : '#F0A500',
              color: questions.length === 0 ? '#888888' : '#FFFFFF',
              cursor: questions.length === 0 ? 'not-allowed' : 'pointer',
            }}
            className="w-full font-semibold text-[15px] h-[52px] rounded-[10px]"
          >
            Tangira Ikizamini →
          </button>
        </div>
      </main>
    )
  }

  // ── RESULTS ──────────────────────────────────────────────
  if (examState === 'results' && results) {
    const passed = results.passed
    return (
      <main className="min-h-screen bg-white flex flex-col px-4 pt-8 pb-24">
        <div className="max-w-[480px] mx-auto w-full flex flex-col gap-6">
          {/* Verdict card */}
          <div
            className="rounded-2xl p-6 text-center flex flex-col gap-2"
            style={{
              backgroundColor: passed ? '#E6F4EC' : '#FDEDEC',
            }}
          >
            <span className="text-4xl">{passed ? '🎉' : '📚'}</span>
            <p
              className="text-[28px] font-bold"
              style={{ color: passed ? '#1A7A4A' : '#C0392B' }}
            >
              {results.score_percent}%
            </p>
            <p
              className="text-[18px] font-semibold"
              style={{ color: passed ? '#1A7A4A' : '#C0392B' }}
            >
              {passed ? '✓ WATSINZE!' : '✗ WATSINZWE'}
            </p>
            <p className="text-body text-sm">
              {passed ? 'You Passed!' : 'Keep Practicing!'}
            </p>
          </div>

          {/* Stats */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-body text-[14px]">Ibibazo byasubijwe neza</span>
              <span className="font-semibold text-dark">
                {results.correct_count} / {results.total_questions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-[14px]">Amanota</span>
              <span className="font-semibold text-dark">{results.score_percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-[14px]">Amanota watsindiyeho</span>
              <span className="font-semibold text-dark">70%</span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-dark text-[15px]">Ibisobanuro by'Ibice</p>
            {Object.entries(results.category_scores).map(([cat, score]) => {
              const pct = Math.round((score.correct / score.total) * 100)
              const barColor =
                pct >= 80 ? '#1A7A4A' : pct >= 60 ? '#F0A500' : '#C0392B'
              const textColor =
                pct >= 80 ? '#1A7A4A' : pct >= 60 ? '#F0A500' : '#C0392B'
              return (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-body capitalize">
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: textColor }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-[6px] bg-divider rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => router.push('/exam')}
            style={{
              backgroundColor: '#F0A500',
              cursor: 'pointer',
            }}
            className="w-full text-white font-semibold text-[15px] h-[52px] rounded-[10px]"
          >
            Ongera Ugerageze
          </button>
          <button
            onClick={() => router.push('/practice')}
            className="w-full border-[1.5px] border-brand-primary text-brand-primary font-semibold text-[15px] h-[52px] rounded-[10px]"
          >
            Jya Kwiga — Practice
          </button>
        </div>
      </main>
    )
  }

  // ── ACTIVE EXAM ──────────────────────────────────────────
  const question = questions[currentIndex]
  const selectedAnswer = answers[question?.id]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isTimeCritical = timeLeft <= 300 // 5 minutes
  const isTimeUrgent = timeLeft <= 120 // 2 minutes

  const options: { key: AnswerOption; text: string }[] = [
    { key: 'a', text: question?.option_a_kw },
    { key: 'b', text: question?.option_b_kw },
    { key: 'c', text: question?.option_c_kw },
    { key: 'd', text: question?.option_d_kw },
  ]

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Exam top bar — replaces normal nav */}
      <div className="px-4 pt-4 pb-2 border-b border-divider">
        <div className="flex justify-between items-center mb-2">
          <span className="text-dark font-semibold text-sm">
            {currentIndex + 1} / {questions.length}
          </span>
          {/* Timer */}
          <span
            className="font-bold text-[16px] tabular-nums"
            style={{
              color: isTimeUrgent
                ? '#C0392B'
                : isTimeCritical
                ? '#F0A500'
                : '#1A1A1A',
              animation: isTimeUrgent ? 'pulse 1s infinite' : 'none',
            }}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>
        <div className="w-full h-[6px] bg-divider rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: '#F0A500',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 pt-6 pb-48 overflow-y-auto">
        <p className="text-[11px] font-semibold text-brand-mid uppercase tracking-wide mb-3">
          Ikibazo {currentIndex + 1}
        </p>
        <p className="text-[16px] text-dark leading-[1.6] mb-6">
          {question?.question_text_kw}
        </p>

        <div className="flex flex-col gap-3">
          {options.map(({ key, text }) => {
            const isSelected = selectedAnswer === key
            return (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                className="w-full text-left px-4 py-4 rounded-[12px] border-2 text-[16px] leading-[1.5] transition-all duration-150"
                style={{
                  borderColor: isSelected ? '#1A56A0' : '#DDDDDD',
                  backgroundColor: isSelected ? '#1A56A0' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#1A1A1A',
                  fontWeight: isSelected ? '600' : '400',
                }}
              >
                <span className="font-semibold mr-2 uppercase">{key})</span>
                {text}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fixed bottom nav for exam */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-divider px-4 py-3 z-50">
        <div className="max-w-[480px] mx-auto flex flex-col gap-2">
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex-1 border border-divider text-body font-semibold text-[14px] h-[44px] rounded-[10px]"
              style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
            >
              ← Subira ku kibazo Giheruka
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(i => i + 1)}
                style={{
                  backgroundColor: '#1A56A0',
                  cursor: 'pointer',
                }}
                className="flex-1 text-white font-semibold text-[14px] h-[44px] rounded-[10px]"
              >
                Komeza →
              </button>
            ) : (
              <button
                onClick={() => {
                  if (unansweredCount > 0) {
                    const confirmed = window.confirm(
                      `Ufite ibibazo ${unansweredCount} utarashubije. Uracyashaka gusubika?`
                    )
                    if (!confirmed) return
                  }
                  submitExam()
                }}
                disabled={examState === 'submitting'}
                style={{
                  backgroundColor: examState === 'submitting' ? '#CCCCCC' : '#F0A500',
                  cursor:
                    examState === 'submitting' ? 'not-allowed' : 'pointer',
                  color: examState === 'submitting' ? '#888888' : '#FFFFFF',
                }}
                className="flex-1 font-semibold text-[14px] h-[44px] rounded-[10px]"
              >
                {examState === 'submitting' ? 'Tegereza...' : 'Soza Ikizamini ✓'}
              </button>
            )}
          </div>
          <p className="text-center text-[12px] text-body">
            {unansweredCount > 0
              ? `Ibibazo ${unansweredCount} utarasubiza`
              : '✓ Ibibazo byose wabisubije'}
          </p>
        </div>
      </div>
    </main>
  )
}
