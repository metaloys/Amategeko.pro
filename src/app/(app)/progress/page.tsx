'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type Session = {
  id: string
  mode: string
  score_percent: number
  passed: boolean
  correct_count: number
  total_questions: number
  completed_at: string
}

type CategoryStat = {
  category: string
  accuracy_percent: number
  questions_seen: number
}

type ProgressData = {
  profile: {
    current_streak_days: number
    exams_taken_total: number
    subscription_tier: string
  }
  sessions: Session[]
  categoryProgress: CategoryStat[]
  avgScore: number
}

const CATEGORY_LABELS: Record<string, string> = {
  traffic_rules: 'Amategeko y\'Umuhanda',
  road_signs: 'Ibimenyetso',
  vehicle_regulations: 'Ibinyabiziga',
  right_of_way: 'Uburenganzira',
  overtaking_parking: 'Guhagarara',
  driver_responsibilities: 'Inshingano',
  special_conditions: 'Ibihe Bidasanzwe',
}

export default function ProgressPage() {
  const router = useRouter()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress')
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null }
        return res.json()
      })
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!data) return null

  const { profile, sessions, categoryProgress, avgScore } = data

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 pt-6 pb-24">
      <div className="max-w-[480px] mx-auto flex flex-col gap-5">

        <h1 className="text-[22px] font-bold text-dark">Iterambere Ryawe</h1>

        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ibizamini Wakoze', value: sessions.length },
            { label: 'Amanota y\'Wagize', value: `${avgScore}%` },
            { label: 'Imyitozo Wakoze🔥', value: `${profile.current_streak_days}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 text-center border border-divider">
              <p className="text-[20px] font-bold text-dark">{stat.value}</p>
              <p className="text-[11px] text-body mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category accuracy */}
        {categoryProgress.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-divider flex flex-col gap-3">
            <p className="font-semibold text-dark text-[15px]">Ubumenyi ku Bice</p>
            {categoryProgress
              .sort((a, b) => a.accuracy_percent - b.accuracy_percent)
              .map((cat) => {
                const pct = Math.round(cat.accuracy_percent)
                return (
                  <div key={cat.category} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-body">
                        {CATEGORY_LABELS[cat.category] ?? cat.category}
                      </span>
                      <span className={cn(
                        'font-semibold',
                        pct >= 80 ? 'text-success' : pct >= 60 ? 'text-brand-amber' : 'text-error'
                      )}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-[6px] bg-divider rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-brand-amber' : 'bg-error'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-body">{cat.questions_seen} ibibazo</p>
                  </div>
                )
              })}
          </div>
        )}

        {/* Exam history */}
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-dark text-[15px]">Amateka y'Ibizamini</p>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-divider">
              <p className="text-body text-[14px]">Nta kizamini warangije.</p>
              <button
                onClick={() => router.push('/exam')}
                className="mt-3 text-brand-primary font-semibold text-[14px]"
              >
                Tangira Ikizamini →
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-4 border border-divider flex justify-between items-center"
              >
                <div>
                  <p className={cn(
                    'font-semibold text-[15px]',
                    session.passed ? 'text-success' : 'text-error'
                  )}>
                    {session.passed ? '✓ WARAGITSINZE' : '✗ WARAGITSINZWE'}
                  </p>
                  <p className="text-body text-[12px] mt-0.5">
                    {new Date(session.completed_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-bold text-dark">{session.score_percent}%</p>
                  <p className="text-[11px] text-body">
                    {session.correct_count}/{session.total_questions}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}
