import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const PLANS = {
  standard: { amount_rwf: 1500, duration_days: 30, label: 'Standard — 30 days' },
  pass_guarantee: { amount_rwf: 3500, duration_days: 90, label: 'Pass Guarantee — 90 days' },
} as const

type PlanKey = keyof typeof PLANS

export async function POST(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as PlanKey

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const selectedPlan = PLANS[plan]

  // Create a pending payment record first
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      provider: 'flutterwave',
      amount_rwf: selectedPlan.amount_rwf,
      plan_purchased: plan,
      plan_duration_days: selectedPlan.duration_days,
      status: 'pending',
      webhook_verified: false,
    })
    .select('id')
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
  }

  // Build Flutterwave payment payload
  const flwPayload = {
    tx_ref: `amategeko-${payment.id}`,
    amount: selectedPlan.amount_rwf,
    currency: 'RWF',
    redirect_url: `${appUrl}/api/payment/callback`,
    customer: {
      email: user.email,
    },
    customizations: {
      title: 'Amategeko Pro',
      description: selectedPlan.label,
      logo: `${appUrl}/logo.png`,
    },
    meta: {
      payment_id: payment.id,
      user_id: user.id,
      plan,
    },
  }

  // Call Flutterwave to get the hosted payment link
  const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    },
    body: JSON.stringify(flwPayload),
  })

  const flwData = await flwRes.json()

  if (flwData.status !== 'success' || !flwData.data?.link) {
    console.error('Flutterwave error:', flwData)
    return NextResponse.json({ error: 'Payment provider error' }, { status: 502 })
  }

  return NextResponse.json({
    payment_url: flwData.data.link,
    payment_id: payment.id,
  })
}
