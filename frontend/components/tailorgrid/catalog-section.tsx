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
    <section id="services-catalog" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="pill-badge bg-white text-[#9E593B] border border-[#E5E7EB] mb-3">
              Upfront Pricing Matrix
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115] tracking-tight">
              Standardized, transparent rates.
            </h2>
            <p className="mt-2 text-sm text-[#6B7280] max-w-[520px]">
              No hidden fees, no studio markups. All prices include precision artisan work and our 100% Free Fit Guarantee.
            </p>
          </div>
          <button
            onClick={() => go('booking')}
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
                className={`rounded-full px-5 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-[#0F1115] text-white shadow-sm'
                    : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {/* Active Category Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E5E7EB] mb-6 shadow-2xs">
          <div>
            <span className="text-xs font-bold text-[#0F1115] block">{cat.name} Alterations</span>
            <p className="text-xs text-[#6B7280] mt-0.5">{cat.tagline}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#0F1115]">
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <Clock size={13} className="text-[#9E593B]" /> Avg. {cat.avgTurnaround}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EBE6DF] text-[#9E593B]">
              Starting at ${cat.startingPrice}
            </span>
          </div>
        </div>

        {/* Service cards — clean list with price & direct book button */}
        <div className="grid gap-3.5">
          {cat.popularServices.map((svc) => (
            <div
              key={svc.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:px-6 border border-[#E5E7EB] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#D1D5DB]"
            >
              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-[#FAF8F5] grid place-items-center shrink-0 border border-[#EBE6DF] text-[#0F1115] mt-0.5">
                  <Check size={16} className="text-[#9E593B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-[#0F1115] group-hover:text-[#9E593B] transition-colors">
                      {svc.name}
                    </h4>
                    {svc.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7F2] border border-[#F3D7C8] px-2 py-0.5 text-[10px] font-bold text-[#9E593B]">
                        <Sparkles size={9} /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed max-w-[540px]">
                    {svc.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F6] shrink-0">
                <div className="text-left sm:text-right">
                  <div className="font-serif text-2xl font-bold text-[#0F1115]">${svc.customerPrice}</div>
                  <span className="text-[11px] font-medium text-[#10B981]">{svc.turnaroundDays} days delivery</span>
                </div>
                <button
                  onClick={() => {
                    onSelectService?.(cat.id, svc.id)
                    go('booking')
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
            onClick={() => go('booking')}
            className="text-[#0F1115] font-bold underline hover:text-[#9E593B] ml-1"
          >
            Book an Artisan Consultation →
          </button>
        </div>

      </div>
    </section>
  )
}

