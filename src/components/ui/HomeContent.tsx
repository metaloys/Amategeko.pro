'use client'

import Link from 'next/link'
import { PencilSimple, ClipboardText } from '@phosphor-icons/react'

interface HomeContentProps {
  userEmail: string
}

export default function HomeContent({ userEmail }: HomeContentProps) {
  return (
    <>
      <div>
        <h1 className="text-[22px] font-bold text-dark">Muraho! 👋</h1>
        <p className="text-body text-[14px] mt-1">
          Reba ibibazo byo kwiga uyu munsi.
        </p>
      </div>

      {/* Quick start cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/practice" className="bg-white rounded-[16px] p-4 flex flex-col gap-2 shadow-sm border border-divider hover:shadow-md transition-shadow">
          <PencilSimple size={32} weight="bold" color="#1A56A0" />
          <span className="font-semibold text-dark text-[15px]">Kwiga</span>
          <span className="text-body text-[12px]">Practice Mode</span>
        </Link>
        <Link href="/exam" className="bg-white rounded-[16px] p-4 flex flex-col gap-2 shadow-sm border border-divider hover:shadow-md transition-shadow">
          <ClipboardText size={32} weight="bold" color="#1A56A0" />
          <span className="font-semibold text-dark text-[15px]">Ikizamini</span>
          <span className="text-body text-[12px]">Mock Exam</span>
        </Link>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-[16px] p-4 border border-divider">
        <p className="text-[13px] text-body">Konti yawe</p>
        <p className="text-dark font-semibold text-[15px] mt-1 break-all">{userEmail}</p>
      </div>
    </>
  )
}
