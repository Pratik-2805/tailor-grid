'use client'

import Image from 'next/image'
import { ArrowRight, Banknote, Calendar, CheckCircle2, Scissors, ShieldCheck, ShoppingBag, Store, TrendingUp } from 'lucide-react'
import { type Screen } from './data'

export function PartnerBanner({ go }: { go: (s: Screen) => void }) {
  return (
    <section className="py-16 sm:py-24 bg-[#0F1115] text-white overflow-hidden relative border-b border-[#1E2229]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Copy & Benefit Pillars */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#F59E0B] mb-4">
              <Store size={13} /> Partner Store Portal · Tailors &amp; Fashion Retailers
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              Drive customer footfall<br />
              <span className="text-[#E7C9BA] italic">&amp; monetise alteration capacity.</span>
            </h2>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-[560px] mb-8">
              Join the TailorGrid Partner Network. We allocate local paid alteration customers to your store for fittings and collections, while driving high-margin in-store retail sales.
            </p>

            {/* 3 Pillars matching Tech Brief */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="size-8 rounded-lg bg-[#9E593B]/20 text-[#E7C9BA] grid place-items-center mb-2.5">
                  <Banknote size={16} />
                </div>
                <h4 className="text-xs font-bold text-white">Guaranteed Payouts</h4>
                <p className="text-[11px] text-white/60 mt-1">75%-80% partner payout per alteration settled weekly to your account.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="size-8 rounded-lg bg-[#10B981]/20 text-[#10B981] grid place-items-center mb-2.5">
                  <ShoppingBag size={16} />
                </div>
                <h4 className="text-xs font-bold text-white">Retail Conversion</h4>
                <p className="text-[11px] text-white/60 mt-1">Footfall drives merchandise purchases in your shop during fittings.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="size-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] grid place-items-center mb-2.5">
                  <Calendar size={16} />
                </div>
                <h4 className="text-xs font-bold text-white">Fill Idle Capacity</h4>
                <p className="text-[11px] text-white/60 mt-1">Control your daily capacity limits and accept/reject orders in real-time.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => go('for-partners')}
                className="flex items-center gap-2 rounded-full bg-white text-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-[#FAF8F5] active:scale-95"
              >
                <span>Apply as Partner Store</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => go('partner')}
                className="rounded-full border border-white/20 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                Partner Store Portal
              </button>
            </div>
          </div>

          {/* Right Column: Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-6 shadow-2xl">
              <div className="relative h-64 rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/images/seam_press.jpg"
                  alt="Precision seam pressing"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-white/70">Average Monthly Partner Payout</span>
                  <span className="font-serif text-lg font-bold text-white">£3,400+</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-white/70">Customer Retail Upsell Rate</span>
                  <span className="text-xs font-bold text-[#10B981]">34% in-store purchase</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>Integrated with Partner Store Portal &amp; automated order tracking</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

