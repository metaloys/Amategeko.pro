'use client'

import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title?: string
  onLanguageChange?: (lang: 'kw' | 'en') => void
  currentLanguage?: 'kw' | 'en'
}

export function TopBar({ 
  title = 'Amategeko Pro', 
  onLanguageChange, 
  currentLanguage = 'en' 
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-divider">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-semibold text-dark">{title}</h1>
        
        {onLanguageChange && (
          <div className="flex items-center gap-1 bg-brand-light rounded-lg p-1">
            <button
              onClick={() => onLanguageChange('kw')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                currentLanguage === 'kw'
                  ? 'bg-brand-primary text-white'
                  : 'text-body hover:bg-white'
              )}
            >
              KIN
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                currentLanguage === 'en'
                  ? 'bg-brand-primary text-white'
                  : 'text-body hover:bg-white'
              )}
            >
              EN
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
