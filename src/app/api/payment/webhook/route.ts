import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Step 1: Verify webhook signature
  const signature = request.headers.get('verif-hash')
  const expectedSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET

  if (!signature || !expectedSecret || signature !== expectedSecret) {
    console.error('Webhook signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = await request.json()

  // Step 2: Only process successful charge events
  if (payload.event !== 'charge.completed' || payload.data?.status !== 'successful') {
    return NextResponse.json({ received: true })
  }

  const tx_ref: string = payload.data?.tx_ref ?? ''
  const transaction_id: string = String(payload.data?.id ?? '')
  const amount: number = payload.data?.amount ?? 0
  const currency: string = payload.data?.currency ?? ''

  if (!tx_ref.startsWith('amategeko-')) {
    return NextResponse.json({ received: true })
  }

  const payment_id = tx_ref.replace('amategeko-', '')

  // Step 3: Server-to-server verification with Flutterwave
  const verifyRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  )
  const verifyData = await verifyRes.json()

  if (
    verifyData.status !== 'success' ||
    verifyData.data?.status !== 'successful' ||
    verifyData.data?.tx_ref !== tx_ref
  ) {
    console.error('Flutterwave verification failed:', verifyData)
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Step 4: Fetch the pending payment from our database
  const supabase = await createClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('id, amount_rwf, user_id, plan_purchased, plan_duration_days, webhook_verified')
    .eq('id', payment_id)
    .single()

  if (!payment) {
    console.error('Payment record not found:', payment_id)
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  // Idempotency check — don't process the same webhook twice
  if (payment.webhook_verified) {
    return NextResponse.json({ received: true, note: 'already processed' })
  }

  // Step 5: Verify amount matches what we expect
  if (currency !== 'RWF' || amount !== payment.amount_rwf) {
    console.error('Amount mismatch:', { received: amount, expected: payment.amount_rwf })
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  // Step 6: Flip webhook_verified to TRUE
  // This fires the database trigger that activates the subscription
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      provider_tx_id: transaction_id,
      provider_ref: tx_ref,
      status: 'success',
      webhook_verified: true, // ← This triggers activate_subscription_on_payment()
      webhook_payload: payload,
    })
    .eq('id', payment_id)

  if (updateError) {
    console.error('Failed to update payment:', updateError)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true, activated: true })
}
