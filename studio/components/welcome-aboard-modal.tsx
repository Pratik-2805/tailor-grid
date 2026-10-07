'use client'

import { useState } from 'react'
import {
  Scissors,
  ArrowRight,
  X,
  Check,
} from 'lucide-react'
import type { User } from '@/components/data'
import { AVAILABLE_CURRENCIES, getCurrencySymbol } from './price-catalog-view'

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
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => (user as any)?.currency || 'GBP')

  if (!isOpen) return null

  const tailorName = user?.name?.trim() || 'Master Tailor'
  const studioName = user?.studioName?.trim() || 'Your Workshop'
  const currencySymbol = getCurrencySymbol(selectedCurrency)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-[420px] bg-[#FAF8F5] rounded-[28px] shadow-2xl border border-[#E8E1D5] overflow-hidden text-[#0F1115] font-sans animate-in zoom-in-95 duration-150 p-6 sm:p-8 text-center space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle Warm Amber Glow in Background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#9E593B]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-800 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Atelier Craft Icon Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9E593B] to-[#B86B47] text-white flex items-center justify-center shadow-lg shadow-[#9E593B]/25 border border-white/20 mt-1">
          <Scissors className="w-7 h-7 rotate-45" />
          <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-[#FAF8F5] flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 text-white stroke-[3]" />
          </span>
        </div>

        {/* Workshop Live Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/80 shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Workshop Live</span>
            {studioName && <span className="text-emerald-900/60 font-medium">· {studioName}</span>}
          </span>
        </div>

        {/* Clean, Human Headline & 1-line Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-[#0F1115] tracking-tight">
            Welcome, {tailorName}!
          </h2>
          <p className="text-xs text-[#5A5D64] leading-relaxed max-w-xs mx-auto">
            Your tailoring shop is all set up. Set your alteration prices so customers in your local area can book drop-offs.
          </p>
        </div>

        {/* Compact Currency Selector */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs max-w-xs mx-auto text-xs">
          <span className="text-[#7A7E85] font-medium pl-2">Currency:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="font-bold text-[#0F1115] bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            {AVAILABLE_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onProceedToCatalog(selectedCurrency)}
            className="w-full py-3.5 px-5 rounded-xl bg-[#9E593B] hover:bg-[#854529] text-white font-bold text-sm shadow-md shadow-[#9E593B]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
          >
            <span>Set Up Prices ({currencySymbol})</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {onSkipToDashboard && (
            <button
              type="button"
              onClick={onSkipToDashboard}
              className="w-full py-2 text-xs font-semibold text-[#7A7E85] hover:text-[#0F1115] transition-colors cursor-pointer"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
