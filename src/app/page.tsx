import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] flex flex-col items-center gap-8">
        
        {/* Language toggle — top right */}
        <div className="w-full flex justify-end">
          <button className="text-sm font-semibold text-brand-primary border border-brand-primary rounded-full px-4 py-1">
            KINY | EN
          </button>
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-[36px] font-bold text-dark leading-tight">
            AMATEGEKO PRO
          </h1>
          <p className="text-dark text-base mt-2">
            Rwanda Driving Theory Test
          </p>
        </div>

        {/* Feature card */}
        <div className="w-full bg-brand-light rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">📋</p>
          <p className="font-semibold text-dark text-[20px]">
            433 Official Questions
          </p>
          <p className="text-dark text-[14px] font-medium mt-1">
            Mock Exams • Progress Tracking
          </p>
        </div>

        {/* Primary CTA */}
        <Link
          href="/register"
          className="w-full bg-brand-amber text-white text-center font-semibold text-[15px] py-4 rounded-[10px] block"
        >
          Tangira Umwitozo W'ubuntu — Start Free Practice
        </Link>

        {/* Secondary CTA */}
        <Link
          href="/login"
          className="w-full border-[1.5px] border-brand-primary text-brand-primary text-center font-semibold text-[15px] py-4 rounded-[10px] block"
        >
          Injira — Login
        </Link>

        {/* Footer */}
        <p className="text-[12px] text-dark font-medium">
          Uburenganzira bwose bwihariwe © 2026 Amategeko Pro
        </p>
      </div>
    </main>
  )
}
