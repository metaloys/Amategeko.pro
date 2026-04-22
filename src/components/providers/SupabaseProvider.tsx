'use client'

import { ReactNode } from 'react'

interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return <>{children}</>
}
