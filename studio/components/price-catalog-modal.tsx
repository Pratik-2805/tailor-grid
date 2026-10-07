'use client'

import { X, Scissors } from 'lucide-react'
import type { User } from '@/components/data'
import { PriceCatalogView } from './price-catalog-view'
import type { StudioCatalogItemData } from '@/lib/api'

interface PriceCatalogModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSaved?: (items: StudioCatalogItemData[], currency?: string, currencySymbol?: string) => void
}

export function PriceCatalogModal({
  isOpen,
  onClose,
  user,
  onSaved,
}: PriceCatalogModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E1D5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header - Warm Atelier Linen Bar */}
        <div className="px-6 py-4.5 bg-[#F5EFE6] border-b border-[#E8E1D5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9E593B] to-[#C87D55] text-white flex items-center justify-center shadow-xs shrink-0">
              <Scissors className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] tracking-tight">
                  Workshop Price Catalog
                </h2>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-[#78543E] bg-white/90 border border-[#E2D7C8] px-2.5 py-0.5 rounded-full shadow-2xs">
                  {user?.studioName || 'Your Workshop'}
                </span>
              </div>
              <p className="text-xs text-[#5A5D64]">
                Set bespoke alteration pricing and turnaround times for incoming customer dispatches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#7A7E85] hover:text-[#0F1115] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#FAF8F5]">
          <PriceCatalogView
            user={user}
            isModal={true}
            onClose={onClose}
            onSaved={(items, currency, currencySymbol) => {
              if (onSaved) onSaved(items, currency, currencySymbol)
              onClose()
            }}
          />
        </div>
      </div>
    </div>
  )
}
