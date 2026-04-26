'use client'

import { Check } from '@phosphor-icons/react'

interface SubscriptionStatusProps {
  isPaid: boolean
  tier: string
}

export default function SubscriptionStatus({ isPaid, tier }: SubscriptionStatusProps) {
  return (
    <span className={`font-semibold text-[15px] flex items-center gap-2 ${isPaid ? 'text-success' : 'text-body'}`}>
      {isPaid && <Check size={16} weight="bold" />}
      {isPaid ? tier : 'Free tier'}
    </span>
  )
}
