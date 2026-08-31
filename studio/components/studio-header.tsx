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

interface StudioHeaderProps {
  user?: User | null
  onOpenAuth?: (authType?: 'signin' | 'signup') => void
  onSignOut?: () => void
}

export function StudioHeader({ user, onOpenAuth, onSignOut }: StudioHeaderProps) {
  const [open, setOpen] = useState(false)
  const customerSiteUrl = process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL || 'http://localhost:3000'

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 lg:gap-5 shrink-0">
          <a
            href="/"
            className="flex items-center gap-3 group text-left shrink-0 py-1"
            aria-label="Darzi Studio Portal"
          >
            <img
              src="/bg_logo.png"
              alt="Darzi"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#9E593B] block leading-none">
                On-Demand
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#6B7280] block mt-0.5 leading-none">
                Studio Portal
              </span>
            </div>
          </a>
        </div>

        {/* Right CTAs & User Auth */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
          
          {/* Link back to Main Customer Site (Port 3000) */}
          <a
            href={customerSiteUrl}
            className="flex items-center gap-1.5 rounded-full px-3 lg:px-4 py-2 text-[13px] font-medium text-[#1E2229] hover:bg-[#F3EFEA] transition-colors whitespace-nowrap shrink-0 border border-[#E8E1D5] bg-white shadow-2xs"
          >
            <ArrowLeft size={13} className="text-[#9E593B] shrink-0" />
            <span>Customer Site</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full px-3 py-1.5 bg-[#FAF8F5] whitespace-nowrap shrink-0 hover:border-[#DDD6CB] transition-colors shadow-2xs">
              <div className="size-6 rounded-full bg-[#9E593B] text-white grid place-items-center text-xs font-bold shrink-0">
                <Store size={12} />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[12px] font-semibold text-[#1E2229] block leading-tight max-w-[130px] truncate">
                  {user.studioName || user.name.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold uppercase tracking-wider block">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Studio Active
                </span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-0.5 hover:text-red-600 text-gray-400 transition-colors shrink-0 ml-1 cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth?.('signin')}
                className="flex items-center gap-2 rounded-full border border-[#0F1115] px-4 py-2 text-[13px] font-semibold text-[#0F1115] hover:bg-[#0F1115] hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserIcon size={14} className="shrink-0" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth?.('signup')}
                className="rounded-full bg-[#0F1115] px-4 lg:px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#9E593B] transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Partner Register
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#0F1115] hover:bg-[#F3EFEA] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#E8E1D5] bg-[#FAF8F5] px-5 py-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2229]">
              <ShieldCheck size={14} className="text-[#9E593B]" />
              <span>Studio Portal</span>
            </div>
            <a
              href={customerSiteUrl}
              className="text-[11px] px-2.5 py-1 rounded bg-[#F4EFEA] text-[#9E593B] font-bold border border-[#E8E1D5] flex items-center gap-1"
            >
              <ArrowLeft size={11} /> Customer Site
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    setOpen(false)
                    onOpenAuth?.('signin')
                  }}
                  className="w-full rounded-full border border-[#0F1115] py-2.5 text-center text-[13px] font-bold text-[#0F1115]"
                >
                  Studio Log In
                </button>
                <button
                  onClick={() => {
                    setOpen(false)
                    onOpenAuth?.('signup')
                  }}
                  className="w-full rounded-full bg-[#0F1115] py-3 text-center text-[13.5px] font-semibold text-white shadow-sm"
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
                className="w-full rounded-full border border-red-200 bg-red-50 text-red-700 py-2.5 text-center text-[13px] font-bold"
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
