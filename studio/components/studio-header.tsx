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
import { StudioAvatar } from './studio-avatar'

interface StudioHeaderProps {
  user?: User | null
  onSignOut?: () => void
  onOpenProfile?: () => void
}

export function StudioHeader({ user, onSignOut, onOpenProfile }: StudioHeaderProps) {
  const [open, setOpen] = useState(false)
  const customerSiteUrl = CUSTOMER_SITE_URL

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all font-sans">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          <a
            href={user ? '/' : customerSiteUrl}
            className="flex items-center gap-3 group text-left shrink-0 py-1 cursor-pointer hover:opacity-90 transition-opacity"
            aria-label={user ? 'Darzi Studio Workbench' : 'Darzi Home'}
            title={user ? 'Darzi Studio Workbench' : 'Return to Darzi Home'}
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
          {user && user.studioName && user.phone ? (
            <div className="flex items-center gap-2 border border-[#E8E1D5] rounded-full px-3 py-1.5 bg-white whitespace-nowrap shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={onOpenProfile}
                title="Edit Studio Profile"
                className="flex items-center gap-2 text-left cursor-pointer group"
              >
                <StudioAvatar
                  avatar={user.avatar}
                  name={user.studioName || user.name}
                  size="xs"
                  showStatusDot={false}
                />
                <div className="hidden sm:block">
                  <span className="text-xs font-semibold text-[#1E2229] group-hover:text-[#9E593B] transition-colors block leading-tight max-w-[130px] truncate">
                    {user.studioName || user.name.split(' ')[0]}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold uppercase tracking-wider block">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
              </button>
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
            <a
              href={customerSiteUrl}
              className="flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-white px-4 py-2 text-xs font-semibold text-[#18191B] hover:bg-[#F3EFEA] transition-all whitespace-nowrap shrink-0 shadow-2xs"
            >
              <ArrowLeft size={13} className="text-[#9E593B] shrink-0" />
              <span>Return to Customer Site</span>
            </a>
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
            {user && user.studioName && user.phone ? (
              <button
                onClick={() => {
                  setOpen(false)
                  onSignOut?.()
                }}
                className="w-full border border-red-200 rounded-xl bg-red-50 text-red-700 py-2 text-center text-xs font-medium cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <a
                href={customerSiteUrl}
                className="w-full flex items-center justify-center gap-2 border border-[#E8E1D5] bg-white rounded-xl py-2.5 text-center text-xs font-semibold text-[#18191B] hover:bg-[#F3EFEA] transition-all shadow-2xs"
              >
                <ArrowLeft size={14} className="text-[#9E593B]" />
                <span>Return to Customer Site</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
