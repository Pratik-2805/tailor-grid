'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, MapPin, Scissors, ShieldCheck, Store } from 'lucide-react'
import { type Screen } from './data'
import { useApp } from './app-provider'

export function HowItWorksPreview({ go }: { go: (s: Screen) => void }) {
  const { user } = useApp()
  const isCustomer = Boolean(user && user.role === 'CUSTOMER')

  const steps = [
    {
      n: '01',
      title: 'Enter ZIP & Alteration',
      desc: 'Select your garment category (Trousers, Dresses, Shirts, Suits). See guaranteed fixed prices upfront.',
      icon: Scissors,
    },
    {
      n: '02',
      title: 'Studio Accepts Your Order',
      desc: 'A verified partner studio near you picks up and accepts your order, and you get its location.',
      icon: Store,
    },
    {
      n: '03',
      title: 'Visit the Studio',
      desc: 'Travel to the studio and hand your garment to the tailor, who measures and starts the alteration in person.',
      icon: MapPin,
    },
    {
      n: '04',
      title: 'Collect at the Studio',
      desc: 'Get notified when it is ready. The tailor hands over your fitted garment at the studio, backed by our Free Re-fit Guarantee.',
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="py-12 sm:py-18 lg:py-24 bg-[#F4EFEA] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-3">
              Raffu — Own Your Fit
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115] tracking-tight">
              How the Alteration Network Works
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64] max-w-[500px]">
              Simple, transparent, and hyper-local. We connect you with vetted neighborhood partner tailors in minutes.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start"
          >
            Full Journey Guide <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4 Clean Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-14">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.n}
                className="relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FAF8F5] border border-[#EBE6DF] transition-all duration-200 hover:border-[#D1D5DB] hover:bg-white hover:shadow-md group"
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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0F1115] text-white p-6 sm:p-10 lg:p-12 shadow-lg">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden lg:block">
            <Image
              src="/images/garments_rack.jpg"
              alt="Atelier rack"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 max-w-[560px]">
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug mb-3">
              Ready to get your clothes altered?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
              Enter your postcode, choose your garment, and get allocated to your closest certified atelier with instant QR fitting pass.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/book"
                className="flex items-center gap-2 rounded-full bg-white text-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-[#FAF8F5] active:scale-95"
              >
                <span>Book Fitting Pass</span>
                <ArrowRight size={14} />
              </Link>
              {!isCustomer && (
                <Link
                  href="/for-partners"
                  className="rounded-full border border-white/30 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                >
                  For Partner Stores
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}


