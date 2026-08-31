'use client'

import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Scissors,
  Store,
  User as UserIcon,
} from 'lucide-react'
import { type User } from './data'

interface StudioHeaderProps {
  user?: User | null
  onOpenAuth?: (authType?: 'signin' | 'signup') => void
  onSignOut?: () => void
}

export function StudioHeader({ user, onOpenAuth, onSignOut }: StudioHeaderProps) {
  const customerSiteUrl = process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL || 'http://localhost:3000'

  return (
    <header className="sticky top-0 z-50 bg-[#0F1115] text-[#FAF8F5] border-b border-[#1E2229] transition-all">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <div className="flex items-center gap-2.5 text-left shrink-0">
            <div className="grid size-9 place-items-center rounded-xl bg-white text-[#0F1115] shadow-xs">
              <Scissors size={18} />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="font-serif font-extrabold text-[19px] tracking-tight text-white leading-none">
                  Darzi
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#9E593B]/20 text-[#E7C9BA] border border-[#9E593B]/40">
                  Studio Atelier
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9E593B] mt-0.5">
                Master Tailor Portal · Port 3001
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Link back to Main Customer Site (Port 3000) */}
          <a
            href={customerSiteUrl}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/5 border border-white/10"
          >
            <ArrowLeft size={13} />
            <span>Customer Site</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2.5 bg-[#1A1E24] border border-[#2D333D] rounded-full pl-3 pr-2 py-1">
              <div className="size-6 rounded-full bg-[#9E593B] text-white grid place-items-center text-xs font-bold shrink-0">
                <Store size={12} />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[12px] font-semibold text-white block leading-tight max-w-[130px] truncate">
                  {user.studioName || user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#10B981] font-bold uppercase tracking-wider block">
                  Studio Active
                </span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-1 hover:text-red-400 text-gray-400 transition-colors shrink-0 ml-1"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.('signin')}
                className="text-xs font-bold text-white hover:text-[#9E593B] transition-colors px-3 py-1.5"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth?.('signup')}
                className="rounded-full bg-white text-[#0F1115] px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] shadow-xs transition-all active:scale-95 whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  )
}
