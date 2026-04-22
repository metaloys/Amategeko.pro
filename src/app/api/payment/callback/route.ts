import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const tx_ref = searchParams.get('tx_ref')
  const transaction_id = searchParams.get('transaction_id')

  // Always redirect — never show raw error to user
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (status !== 'successful' || !tx_ref || !transaction_id) {
    return NextResponse.redirect(`${baseUrl}/account/subscription?payment=failed`)
  }

  // Verify the transaction with Flutterwave server-to-server
  // This is a secondary check — the webhook is the source of truth
  const verifyRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  )

  const verifyData = await verifyRes.json()

  if (verifyData.status !== 'success' || verifyData.data?.status !== 'successful') {
    return NextResponse.redirect(`${baseUrl}/account/subscription?payment=failed`)
  }

  // Extract payment_id from tx_ref (format: amategeko-{uuid})
  const payment_id = tx_ref.replace('amategeko-', '')

  // Update payment record — but do NOT activate subscription here
  // Subscription activation happens ONLY via webhook (webhook_verified = TRUE)
  const supabase = await createClient()

  await supabase
    .from('payments')
    .update({
      provider_tx_id: transaction_id,
      provider_ref: tx_ref,
      status: 'success',
      // webhook_verified remains FALSE — webhook handler sets this
    })
    .eq('id', payment_id)

  // Redirect to success page — subscription may not be active yet
  // (webhook could arrive before or after this redirect)
  return NextResponse.redirect(`${baseUrl}/account/subscription?payment=pending`)
}
