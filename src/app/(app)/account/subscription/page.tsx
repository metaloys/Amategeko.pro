'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'

const PLANS = [
  {
    key: 'standard',
    name: 'Standard',
    price: '1,500 RWF',
    duration: '30 days',
    features: [
      'Ibibazo byose 433',
      'Ubushakashatsi budakwiye',
      'Ibizamini 3/umunsi',
      'Iterambere ryawe',
    ],
    recommended: false,
  },
  {
    key: 'pass_guarantee',
    name: 'Pass Guarantee ★',
    price: '3,500 RWF',
    duration: '90 days',
    features: [
      'Ibizamini bidakwiye umubare',
      'Ibimenyetso by\'Imihanda',
      'Inkunga ya Priority',
      'Ibisubizo byose bya Standard',
    ],
    recommended: true,
  },
]

function SubscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('standard')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadProfile()

    const payment = searchParams.get('payment')
    if (payment === 'failed') {
      setStatusMessage('❌ Kwishyura byanze. Ongera ugerageze.')
    } else if (payment === 'pending') {
      setStatusMessage('⏳ Kwishyura byagenze neza. Konti yawe iri gutegurwa...')
      // Poll for subscription activation (webhook may be delayed)
      const interval = setInterval(async () => {
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .single()
        if (data?.subscription_tier !== 'free') {
          clearInterval(interval)
          setStatusMessage('✅ Konti yawe yifunguye! Ugomba gutangira.')
          loadProfile()
        }
      }, 3000)
      setTimeout(() => clearInterval(interval), 60000) // Stop polling after 1 min
    }
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .single()

    setProfile(data)
    setPageLoading(false)
  }

  async function handleSubscribe() {
    setLoading(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })

      const data = await res.json()

      if (!res.ok || !data.payment_url) {
        setStatusMessage('❌ Ntibishoboye gutangira. Ongera ugerageze.')
        setLoading(false)
        return
      }

      // Redirect to Flutterwave hosted checkout
      window.location.href = data.payment_url
    } catch {
      setStatusMessage('❌ Ikibazo cy\'intego. Ongera ugerageze.')
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const isPaid = profile?.subscription_tier !== 'free'

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 pt-6 pb-24">
      <div className="max-w-[480px] mx-auto flex flex-col gap-5">
        <div>
          <button
            onClick={() => router.back()}
            className="text-brand-primary font-semibold text-sm"
          >
            ← Subira
          </button>
          <h1 className="text-[22px] font-bold text-dark mt-3">
            Ishyura — Subscribe
          </h1>
        </div>

        {/* Current status */}
        {isPaid && (
          <div className="bg-success-light border border-success rounded-2xl p-4">
            <p className="text-success font-semibold text-[15px]">
              ✓ Konti yawe yifunguye
            </p>
            <p className="text-body text-[13px] mt-1">
              Plan: {profile?.subscription_tier} | Irangira:{' '}
              {profile?.subscription_expires_at
                ? new Date(
                    profile.subscription_expires_at
                  ).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        )}

        {statusMessage && (
          <div className="bg-brand-light rounded-xl p-4">
            <p className="text-dark text-[14px]">{statusMessage}</p>
          </div>
        )}

        {/* Plan cards */}
        {PLANS.map((plan) => (
          <button
            key={plan.key}
            onClick={() => setSelectedPlan(plan.key)}
            className="w-full text-left bg-white rounded-2xl p-5 border-2 transition-all relative"
            style={{
              borderColor:
                selectedPlan === plan.key ? '#1A56A0' : '#DDDDDD',
            }}
          >
            {plan.recommended && (
              <span className="absolute top-3 right-4 bg-brand-amber text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                RECOMMENDED
              </span>
            )}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-dark text-[16px]">
                  {plan.name}
                </p>
                <p className="text-body text-[13px]">{plan.duration}</p>
              </div>
              <p className="font-bold text-brand-primary text-[18px]">
                {plan.price}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {plan.features.map((f, i) => (
                <p key={i} className="text-body text-[13px]">
                  ✓ {f}
                </p>
              ))}
            </div>
          </button>
        ))}

        <button
          onClick={handleSubscribe}
          disabled={loading || isPaid}
          style={{
            backgroundColor:
              loading || isPaid ? '#CCCCCC' : '#F0A500',
            color: loading || isPaid ? '#888888' : '#FFFFFF',
            cursor: loading || isPaid ? 'not-allowed' : 'pointer',
          }}
          className="w-full font-semibold text-[15px] h-[52px] rounded-[10px]"
        >
          {loading
            ? 'Tegereza...'
            : isPaid
            ? 'Usanzwe Wishyuye'
            : 'Ishyura Ubu →'}
        </button>

        <p className="text-[11px] text-body text-center">
          Kwishyura gukoreshwa na Flutterwave. Amakuru yawe afite umutekano.
        </p>
      </div>
    </main>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SubscriptionContent />
    </Suspense>
  )
}
