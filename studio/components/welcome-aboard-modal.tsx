'use client'

import {
  Scissors,
  ArrowRight,
  X,
} from 'lucide-react'
import type { User } from '@/components/data'

interface WelcomeAboardModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onProceedToCatalog: (selectedCurrency?: string) => void
  onSkipToDashboard?: () => void
}

export function WelcomeAboardModal({
  isOpen,
  onClose,
  user,
  onProceedToCatalog,
  onSkipToDashboard,
}: WelcomeAboardModalProps) {
  if (!isOpen) return null

  const rawName = user?.name?.trim() || ''
  const tailorName = rawName || 'Master Tailor'
  const studioName = user?.studioName?.trim() || user?.area?.trim() || 'Darzi Workshop'
  const userCurrency = (user as any)?.currency || 'GBP'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F1115]/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-[620px] bg-[#FAF7F2] rounded-[26px] shadow-[0_24px_60px_-12px_rgba(20,15,10,0.35)] border border-[#E9E1D5] overflow-hidden text-[#1E2229] font-sans animate-in zoom-in-95 duration-150 text-center px-8 py-7 sm:px-12 sm:py-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Soft Organic Watercolor Splashes */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-[#C2CEBD]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#D8BEA8]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-10 w-44 h-44 bg-[#D8BEA8]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-10 w-44 h-44 bg-[#C2CEBD]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 p-1.5 text-[#8C8275] hover:text-[#0F1115] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── 1. Atelier Theme Brand & Status Header ── */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-1.5">
          {/* Brand Logo */}
          <div className="relative">
            <img
              src="/removed_bg_logo.png"
              alt="Darzi Atelier"
              className="h-9 sm:h-10 w-auto object-contain mx-auto"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = document.getElementById('darzi-fallback-badge-sm')
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div
              id="darzi-fallback-badge-sm"
              style={{ display: 'none' }}
              className="size-9 rounded-xl bg-gradient-to-br from-[#9E593B] to-[#B86B47] text-white items-center justify-center shadow-xs mx-auto"
            >
              <Scissors className="w-4 h-4 rotate-45" />
            </div>
          </div>

          {/* Sub-Brand Text */}
          <div className="text-center">
            <span className="font-serif text-xs sm:text-[13px] font-bold tracking-[0.2em] uppercase text-[#9E593B] block leading-tight">
              Darzi Atelier
            </span>
            <span className="text-[9.5px] font-medium tracking-widest uppercase text-[#8C8275]">
              Bespoke Tailoring Network
            </span>
          </div>

          {/* Workshop Live Pill */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#EAF3E7] text-[#3D6633] border border-[#CDE0C7]">
              <span className="size-1.5 rounded-full bg-[#3D6633] animate-pulse" />
              <span>Workshop Live</span>
              {studioName && (
                <span className="text-[#3D6633]/70 font-normal truncate max-w-[220px]">
                  · {studioName}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ── Elegant Atelier Divider ── */}
        <div className="relative z-10 flex items-center justify-center gap-3 my-4 sm:my-5 opacity-70">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#D8BEA8]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#9E593B]/40" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#D8BEA8]" />
        </div>

        {/* ── 2. Seamless Welcome Greeting (No nested box - open & elegant) ── */}
        <div className="relative z-10 space-y-1 mb-6 sm:mb-7">
          {/* Kicker */}
          <p className="text-[10px] sm:text-[10.5px] font-semibold tracking-[0.24em] uppercase text-[#6E7B68] font-sans">
            Explore Your Workshop
          </p>

          {/* Headline */}
          <h2 className="font-serif text-2xl sm:text-[32px] font-bold tracking-[0.06em] uppercase text-[#2C3127] leading-tight">
            Welcome Aboard
          </h2>

          {/* Tailor Greeting */}
          <p className="font-serif text-sm sm:text-base italic text-[#805036]">
            {tailorName}
          </p>
        </div>

        {/* ── 3. Action Area: Primary Button & Direct Dashboard Link ── */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onProceedToCatalog(userCurrency)}
            className="py-3 px-9 rounded-full bg-[#9E593B] hover:bg-[#854529] active:bg-[#70381F] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#9E593B]/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Set Up Catalog</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {onSkipToDashboard && (
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="text-xs font-semibold text-[#8C8275] hover:text-[#1E2229] transition-colors cursor-pointer hover:underline underline-offset-4 pt-1"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
