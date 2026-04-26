import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SubscriptionStatus from '@/components/ui/SubscriptionStatus'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_expires_at, exams_taken_total, questions_answered_total')
    .single()

  const isPaid = profile?.subscription_tier !== 'free'

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 pt-6 pb-24">
      <div className="max-w-[480px] mx-auto flex flex-col gap-4">

        <h1 className="text-[22px] font-bold text-dark">Konti — Account</h1>

        {/* Profile card */}
        <div className="bg-white rounded-2xl p-5 border border-divider flex flex-col gap-2">
          <p className="text-[13px] text-body">Imeyili</p>
          <p className="text-dark font-semibold text-[15px]">{user.email}</p>
          <div className="border-t border-divider my-1" />
          <p className="text-[13px] text-body">Ubwishingizi</p>
          <div className="flex items-center justify-between">
            <SubscriptionStatus isPaid={isPaid} tier={profile?.subscription_tier || 'Free tier'} />
            {isPaid && profile?.subscription_expires_at && (
              <span className="text-[12px] text-body">
                {new Date(profile.subscription_expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Upgrade prompt for free users */}
        {!isPaid && (
          <Link
            href="/account/subscription"
            style={{
              backgroundColor: '#F0A500',
              cursor: 'pointer',
            }}
            className="w-full text-white font-semibold text-[15px] h-[52px] rounded-[10px] flex items-center justify-center"
          >
            Fungura Konti Yawe →
          </Link>
        )}

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full border-2 border-error text-error font-semibold text-[15px] h-[52px] rounded-[10px]"
          >
            Sohoka — Sign Out
          </button>
        </form>
      </div>
    </main>
  )
}
