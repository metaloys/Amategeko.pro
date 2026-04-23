'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Injiza imeyili yuzuye.')
      return
    }
    setLoading(true)
    setError(null)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
        shouldCreateUser: true,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[480px] text-center flex flex-col gap-6">
          <div className="text-5xl">📧</div>
          <h2 className="text-[22px] font-bold text-dark">Reba imeyili yawe</h2>
          <p className="text-[16px] text-dark">
            Twohereje link kuri <strong>{email}</strong>.
          </p>
          <p className="text-[13px]" style={{color:'#555'}}>
            Check your email for the magic link to sign in.
          </p>
          <Link href="/login" className="text-[15px] font-semibold" style={{color:'#1A56A0'}}>
            ← Subira ku kwinjira
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col px-4 pt-16">
      <div className="w-full max-w-[480px] mx-auto flex flex-col gap-6">
        <div>
          <Link href="/" className="text-[15px] font-semibold" style={{color:'#1A56A0'}}>
            ← Subira
          </Link>
          <h1 className="text-[22px] font-bold mt-4" style={{color:'#1A1A1A'}}>
            Iyandikishe — Register
          </h1>
          <p className="text-[14px] mt-1" style={{color:'#555'}}>
            Injiza imeyili yawe kugira ngo ubone link yo kwinjira
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[14px] font-semibold" style={{color:'#1A1A1A'}}>
              Imeyili — Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              style={{
                height: '52px',
                border: '1.5px solid #DDDDDD',
                borderRadius: '10px',
                padding: '0 16px',
                fontSize: '16px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p className="text-[13px]" style={{color:'#C0392B'}}>⚠ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: loading ? '#DDDDDD' : '#F0A500',
              color: loading ? '#AAAAAA' : 'white',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Tegereza...' : 'Ohereza Link — Send Magic Link'}
          </button>
        </form>

        <p className="text-[14px] text-center" style={{color:'#555'}}>
          Usanzwe ufite konti?{' '}
          <Link href="/login" className="font-semibold" style={{color:'#1A56A0'}}>
            Injira
          </Link>
        </p>
      </div>
    </main>
  )
}
