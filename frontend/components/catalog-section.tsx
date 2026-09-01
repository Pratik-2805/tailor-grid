'use client'

import { useState } from 'react'
import { ArrowRight, Check, Clock, Sparkles } from 'lucide-react'
import { GARMENT_CATEGORIES, type Screen } from './data'

interface CatalogSectionProps {
  go: (s: Screen) => void
  onSelectService?: (garmentId: string, serviceId: string) => void
}

export function CatalogSection({ go, onSelectService }: CatalogSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(GARMENT_CATEGORIES[0].id)

  const cat = GARMENT_CATEGORIES.find((c) => c.id === activeCategoryId) || GARMENT_CATEGORIES[0]

  return (
    <section id="services-catalog" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-3">
              Upfront Pricing Matrix
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115] tracking-tight">
              Standardized, transparent rates.
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64] max-w-[520px]">
              No hidden fees, no studio markups. All prices include precision artisan work and our 100% Free Fit Guarantee.
            </p>
          </div>
          <button
            onClick={() => go('confirm-measurement')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start"
          >
            Custom order request <ArrowRight size={13} />
          </button>
        </div>

        {/* Category Pills (Uber style quick horizontal scroller) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-8">
          {GARMENT_CATEGORIES.map((c) => {
            const active = c.id === activeCategoryId
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategoryId(c.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#0F1115] text-white shadow-xs'
                    : 'bg-white border border-[#E8E1D5] text-[#5A5D64] hover:border-[#9E593B] hover:text-[#0F1115]'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {/* Services List for Category */}
        <div className="space-y-3">
          {cat.popularServices.map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#9E593B] hover:shadow-xs transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-lg font-bold text-[#18191B]">{svc.name}</h4>
                  {svc.popular && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#9E593B] border border-[#E8E1D5]">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5A5D64] max-w-[500px]">{svc.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-[#7A7E85] pt-1">
                  <span>⏱ {svc.turnaroundDays} business days</span>
                  <span>•</span>
                  <span>✨ 100% Free Fit Guarantee</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F3EFEA]">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#7A7E85] block uppercase font-medium">Standard</span>
                  <span className="font-serif text-xl font-bold text-[#18191B]">${svc.customerPrice}</span>
                </div>
                <button
                  onClick={() => {
                    onSelectService?.(cat.id, svc.id)
                    go('confirm-measurement')
                  }}
                  className="rounded-full bg-[#0F1115] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#9E593B] active:scale-95 shadow-2xs"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-[#F3EFEA] border border-[#EBE6DF] text-center text-xs text-[#6B7280]">
          Looking for a custom consultation or complex bridal alteration?{' '}
          <button
            onClick={() => go('confirm-measurement')}
            className="text-[#0F1115] font-bold underline hover:text-[#9E593B] ml-1"
          >
            Book an Artisan Consultation →
          </button>
        </div>

      </div>
    </section>
  )
}
