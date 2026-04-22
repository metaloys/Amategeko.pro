'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/home', label: 'Ahabanza', icon: '🏠' },
  { href: '/practice', label: 'Kwiga', icon: '✏️' },
  { href: '/exam', label: 'Ikizamini', icon: '📋' },
  { href: '/progress', label: 'Imibare', icon: '📊' },
  { href: '/account', label: 'Konti', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider h-16 z-50">
      <div className="max-w-[480px] mx-auto h-full flex items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[56px]',
                isActive ? 'text-brand-primary' : 'text-[#AAAAAA]'
              )}
            >
              <span className="text-[20px] leading-none">{tab.icon}</span>
              <span className={cn(
                'text-[10px] leading-none',
                isActive ? 'font-semibold text-brand-primary' : 'font-normal text-[#AAAAAA]'
              )}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
