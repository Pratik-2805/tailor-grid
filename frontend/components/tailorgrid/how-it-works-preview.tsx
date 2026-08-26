'use client'

import Image from 'next/image'
import { ArrowRight, CheckCircle2, Clock, MapPin, Scissors, ShieldCheck, Sparkles, Store } from 'lucide-react'
import { type Screen } from './data'

export function HowItWorksPreview({ go }: { go: (s: Screen) => void }) {
  const steps = [
    {
      n: '01',
      title: 'Enter ZIP & Alteration',
      desc: 'Select your garment category (Trousers, Dresses, Shirts, Suits). See guaranteed fixed prices upfront.',
      icon: Scissors,
    },
    {
      n: '02',
      title: 'Nearest Store Allocation',
      desc: 'Our network instantly identifies and allocates your nearest certified partner atelier with matching machinery.',
      icon: Store,
    },
    {
      n: '03',
      title: 'Visit Store for Fitting',
      desc: 'Walk into your allocated partner store with your QR pass for a quick 5-minute precision pinning session.',
      icon: MapPin,
    },
    {
      n: '04',
      title: 'Collect in 48 Hours',
      desc: 'Receive SMS completion notice. Collect your perfectly fitted garment with our 100% Free Re-fit Guarantee.',
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="pill-badge bg-[#FAF8F5] text-[#9E593B] border border-[#EBE6DF] mb-3">
              Core Customer Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115] tracking-tight">
              How the Alteration Network Works.
            </h2>
            <p className="mt-2 text-sm text-[#6B7280] max-w-[500px]">
              Simple, transparent, and hyper-local. We connect you with vetted neighborhood partner tailors in minutes.
            </p>
          </div>
          <button
            onClick={() => go('how-it-works')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start"
          >
            Full Journey Guide <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 Clean Step Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.n}
                className="relative flex flex-col justify-between p-6 rounded-3xl bg-[#FAF8F5] border border-[#EBE6DF] transition-all duration-200 hover:border-[#D1D5DB] hover:bg-white hover:shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-xl bg-[#0F1115] text-white grid place-items-center shadow-xs">
                      <Icon size={18} />
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#9E593B]/60 group-hover:text-[#9E593B] transition-colors">
                      {step.n}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#0F1115] mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EBE6DF]/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#0F1115]">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>Step {step.n} Milestone</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* High Conversion Store Pass Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0F1115] text-white p-8 sm:p-12 shadow-lg">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden lg:block">
            <Image
              src="/images/garments_rack.jpg"
              alt="Atelier rack"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 max-w-[560px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#F59E0B] mb-4">
              <Sparkles size={12} /> Standardized Pricing · 42 London Partner Stores
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug mb-3">
              Ready to get your clothes altered?
            </h3>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Enter your postcode, choose your garment, and get allocated to your closest certified atelier with instant QR fitting pass.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => go('booking')}
                className="flex items-center gap-2 rounded-full bg-white text-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-[#FAF8F5] active:scale-95"
              >
                <span>Book Fitting Pass</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => go('for-partners')}
                className="rounded-full border border-white/30 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                For Partner Stores
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}


