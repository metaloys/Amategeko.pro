'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const authError = searchParams.get('error')

  const supabase = createClient()

  useEffect(() => {
    if (authError === 'auth_failed') {
      setError('Murikane link yatotoziswe cyangwa ibize. Gerageza kuboneza link nshya.')
    }
  }, [authError])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes('@')) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?redirectTo=${redirectTo || '/home'}`,
        shouldCreateUser: false,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[480px] text-center gap-6 flex flex-col">
          <div className="text-5xl">📧</div>
          <h2 className="text-[26px] font-bold text-dark">
            Reba imeyili yawe
          </h2>
          <p className="text-dark text-[17px] font-medium">
            Twohereje link kuri <strong>{email}</strong>. 
            Kanda kuri iyo link kugira ngo winjire.
          </p>
          <p className="text-[15px] text-dark font-medium">
            Check your email for the magic link to sign in.
          </p>
          <Link href="/login" className="text-brand-primary font-semibold text-[15px]">
            ← Subira
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col px-4 pt-16">
      <div className="w-full max-w-[480px] mx-auto flex flex-col gap-6">

        <div>
          <Link href="/" className="text-brand-primary text-[16px] font-bold">
            ← Subira
          </Link>
          <h1 className="text-[28px] font-bold text-dark mt-4">
            Injira — Login
          </h1>
          <p className="text-dark text-[16px] font-medium mt-1">
            Injiza imeyili yawe kugira ngo ubone link yo kwinjira
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-[16px] font-bold text-dark"
            >
              Imeyili — Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="h-[52px] border-2 border-divider rounded-[10px] px-4 text-[16px] 
                         focus:outline-none focus:border-brand-primary focus:bg-brand-light
                         transition-colors duration-150
                         disabled:bg-gray-100 disabled:cursor-not-allowed
                         -webkit-appearance-none appearance-none"
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-error text-[15px] font-medium flex items-center gap-1">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full font-semibold text-[15px] h-[52px] rounded-[10px] transition-colors"
            style={{ 
              backgroundColor: '#F0A500',
              color: 'white',
              cursor: 'pointer',
              opacity: 1
            }}
          >
            {loading ? 'Tegereza...' : 'Ohereza Link — Send Magic Link'}
          </button>
        </form>

        <p className="text-[16px] text-dark font-medium text-center">
          Ntago ufite konti?{' '}
          <Link href="/register" className="text-brand-primary font-bold">
            Iyandikishe
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
