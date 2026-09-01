'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  User as UserIcon,
  X,
} from 'lucide-react'
import { type User } from './data'
import { CUSTOMER_SITE_URL } from '@/lib/api'

interface StudioHeaderProps {
  user?: User | null
  onOpenAuth?: (authType?: 'signin' | 'signup') => void
  onSignOut?: () => void
}

export function StudioHeader({ user, onOpenAuth, onSignOut }: StudioHeaderProps) {
  const [open, setOpen] = useState(false)
  const customerSiteUrl = CUSTOMER_SITE_URL

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all font-sans">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          <a
            href="/"
            className="flex items-center gap-3 group text-left shrink-0 py-1"
            aria-label="Darzi Studio Portal"
          >
            <img
              src="/bg_logo.png"
              alt="Darzi"
              className="h-9 sm:h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
            <div className="hidden sm:flex flex-col justify-center border-l border-[#E8E1D5] pl-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#1E2229] leading-tight">
                Darzi Atelier
              </span>
              <span className="text-[10px] text-[#9E593B] font-semibold">
                Workbench Node
              </span>
            </div>
          </a>
        </div>

        {/* Right CTAs & User Auth */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">

          {/* Link back to Main Customer Site */}
          <a
            href={customerSiteUrl}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1E2229] hover:text-black transition-colors whitespace-nowrap shrink-0 hover:bg-[#F3EFEA] rounded-full border border-[#E8E1D5] bg-white shadow-2xs"
          >
            <ArrowLeft size={13} className="text-[#9E593B] shrink-0" />
            <span>Customer Site</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2 border border-[#E8E1D5] rounded-full px-3 py-1.5 bg-white whitespace-nowrap shrink-0 shadow-2xs">
              <div className="size-6 rounded-full bg-[#9E593B] text-white grid place-items-center text-xs font-semibold shrink-0">
                <Store size={12} />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-[#1E2229] block leading-tight max-w-[130px] truncate">
                  {user.studioName || user.name.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold uppercase tracking-wider block">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-1 text-[#6B7280] hover:text-red-600 transition-colors shrink-0 ml-1 cursor-pointer rounded"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth?.('signin')}
                className="flex items-center gap-1.5 border border-[#1E2229] rounded-full px-4 py-1.5 text-xs font-medium text-[#1E2229] hover:bg-[#1E2229] hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserIcon size={13} className="shrink-0" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth?.('signup')}
                className="bg-[#0F1115] hover:bg-[#9E593B] rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                Partner Register
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#1E2229] hover:bg-[#F3EFEA] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#E8E1D5] bg-[#FAF8F5] px-5 py-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2229]">
              <ShieldCheck size={14} className="text-[#9E593B]" />
              <span>Studio Workbench</span>
            </div>
            <a
              href={customerSiteUrl}
              className="text-xs px-2.5 py-1 rounded bg-white text-[#1E2229] font-medium border border-[#E8E1D5] flex items-center gap-1"
            >
              <ArrowLeft size={11} /> Customer Site
            </a>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    setOpen(false)
                    onOpenAuth?.('signin')
                  }}
                  className="w-full border border-[#E8E1D5] rounded-xl py-2 text-center text-xs font-medium text-[#1E2229] bg-white"
                >
                  Studio Log In
                </button>
                <button
                  onClick={() => {
                    setOpen(false)
                    onOpenAuth?.('signup')
                  }}
                  className="w-full bg-[#0F1115] hover:bg-[#9E593B] rounded-xl py-2.5 text-center text-xs font-semibold text-white"
                >
                  Partner Register
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false)
                  onSignOut?.()
                }}
                className="w-full border border-red-200 rounded-xl bg-red-50 text-red-700 py-2 text-center text-xs font-medium"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
