'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  Menu,
  Scissors,
  Store,
  X,
} from 'lucide-react'
import { type Screen, type User } from './data'

interface StudioHeaderProps {
  currentScreen: Screen
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: (role: 'CUSTOMER' | 'STUDIO', authType?: 'signin' | 'signup') => void
  onSignOut?: () => void
}

export function StudioHeader({
  currentScreen,
  go,
  user,
  onOpenAuth,
  onSignOut,
}: StudioHeaderProps) {
  const [open, setOpen] = useState(false)

  const nav = (s: Screen) => {
    go(s)
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isStudioUser = user && user.role === 'STUDIO'

  return (
    <header className="sticky top-0 z-50 bg-[#0F1115] text-[#FAF8F5] border-b border-[#1E2229] transition-all">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Clean TailorGrid Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <button
            onClick={() => nav('home')}
            className="flex items-center gap-2.5 group text-left shrink-0"
            aria-label="TailorGrid Home"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-white text-[#0F1115] shadow-xs group-hover:scale-105 transition-transform">
              <Scissors size={18} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-extrabold text-[19px] tracking-tight text-white leading-none">
                TailorGrid
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9E593B] mt-0.5">
                On-Demand Alterations
              </span>
            </div>
          </button>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[13.5px] font-medium text-[#D1D5DB] shrink-0">
          <a
            href="#why-partner"
            onClick={() => currentScreen !== 'for-partners' && go('for-partners')}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Why Partner
          </a>
          <a
            href="#requirements"
            onClick={() => currentScreen !== 'for-partners' && go('for-partners')}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Requirements
          </a>
          <a
            href="#safety"
            onClick={() => currentScreen !== 'for-partners' && go('for-partners')}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Standards
          </a>

          <a
            href="#faq"
            onClick={() => currentScreen !== 'for-partners' && go('for-partners')}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            FAQ
          </a>
        </nav>

        {/* Right Actions: Clean Login & Sign Up */}
        <div className="hidden md:flex items-center gap-3.5 shrink-0">
          
          {/* Switch to Customer Site */}
          <button
            onClick={() => nav('home')}
            className="text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors px-2 py-1.5 whitespace-nowrap"
          >
            Customer Site
          </button>

          {isStudioUser ? (
            <div className="flex items-center gap-2.5 bg-[#1A1E24] border border-[#2D333D] rounded-full pl-3 pr-2 py-1">
              <div className="size-6 rounded-full bg-[#9E593B] text-white grid place-items-center text-xs font-bold shrink-0">
                <Store size={12} />
              </div>
              <div className="text-left">
                <span className="text-[12px] font-semibold text-white block leading-tight max-w-[110px] truncate">
                  {user.studioName || user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#10B981] font-bold uppercase tracking-wider block">
                  Studio Active
                </span>
              </div>
              <button
                onClick={() => nav('partner')}
                className="rounded-full bg-white text-[#0F1115] px-3.5 py-1 text-xs font-bold hover:bg-[#FAF8F5] transition-colors ml-1"
              >
                Dashboard
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-1 hover:text-red-400 text-gray-400 transition-colors shrink-0"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth && onOpenAuth('STUDIO', 'signin')}
                className="text-xs font-bold text-white hover:text-[#9E593B] transition-colors px-2 py-1.5"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth && onOpenAuth('STUDIO', 'signup')}
                className="rounded-full bg-white text-[#0F1115] px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] shadow-xs transition-all active:scale-95 whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#1E2229] bg-[#0F1115] px-5 py-5 flex flex-col gap-3 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2229]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E593B]">
              For Studios
            </span>
            <button
              onClick={() => nav('home')}
              className="text-xs text-[#9CA3AF] hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Customer Site
            </button>
          </div>

          {[
            { label: 'Why Partner With Us', href: '#why-partner' },
            { label: 'Studio Requirements', href: '#requirements' },
            { label: 'Craft & Machine Standards', href: '#safety' },
            { label: 'Partner FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => {
                setOpen(false)
                if (currentScreen !== 'for-partners') go('for-partners')
              }}
              className="py-2 text-sm text-[#D1D5DB] hover:text-white flex items-center justify-between"
            >
              <span>{item.label}</span>
              <ChevronRight size={14} className="text-[#6B7280]" />
            </a>
          ))}

          <div className="pt-3 border-t border-[#1E2229] flex flex-col gap-2">
            {!isStudioUser ? (
              <>
                <button
                  onClick={() => {
                    setOpen(false)
                    if (onOpenAuth) onOpenAuth('STUDIO')
                  }}
                  className="w-full rounded-full bg-white text-[#0F1115] py-3 text-center text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Sign up / Log in
                </button>
              </>
            ) : (
              <button
                onClick={() => nav('partner')}
                className="w-full rounded-full bg-white text-[#0F1115] py-3 text-center text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                Open Studio Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
