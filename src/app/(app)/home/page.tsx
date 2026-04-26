import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeContent from '@/components/ui/HomeContent'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 pt-6 pb-24">
      <div className="max-w-[480px] mx-auto flex flex-col gap-6">
        <HomeContent userEmail={user.email || ''} />
      </div>
    </main>
  )
}
