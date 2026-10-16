'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const CRAFT_PILLARS = [
  {
    icon: ShieldCheck,
    tag: 'Fit Confidence',
    title: '100% Free Re-Fit Guarantee',
    description:
      'No measuring tape or self-pinning needed. Your assigned master tailor takes all measurements directly in person. If the drape or hem ever needs fine-tuning, your atelier adjusts it complimentary within 24 hours.',
    badges: ['Direct tailor measurements in person', 'Complimentary 24h adjustment'],
  },
  {
    icon: Scissors,
    tag: 'Artisan Precision',
    title: 'Original Hem & OEM Thread Match',
    description:
      'We never perform rough chop-and-sews. Raw denim keeps its authentic distressed chainstitch hem, suit trousers receive hand-finished blind hems, and fine silks get exact OEM thread color-matching.',
    badges: ['Factory distressed hem kept', 'Blind-stitch & chainstitch'],
  },
  {
    icon: Sparkles,
    tag: 'Total Transparency',
    title: 'Standardized Rates, Zero Surprises',
    description:
      'Know the exact price before you book. Every service has clear, fixed rates based on standard atelier bench times—no awkward counter haggling, no unexpected surcharges at pickup.',
    badges: ['Upfront itemized pricing', 'Direct studio accountability'],
  },
]

const CRAFT_FAQS = [
  {
    q: 'Do I need to take measurements or pre-fit my clothes before booking?',
    a: 'Not at all. You never need to measure, pin, or pre-fit anything yourself. Simply select your garment and service, and hand your clothes directly to your assigned master tailor, who handles all precision measurements and fitting in person.',
  },
  {
    q: 'What if the garment fit is not 100% right upon collection?',
    a: 'Every single booking is protected by our 100% Fit Guarantee. Try on your altered garment upon pickup or delivery. If any minor tweak is needed, your partner atelier alters it complimentary within 24 hours.',
  },
  {
    q: 'How do you preserve original hems on denim and designer jeans?',
    a: 'Our partner studios use precision original-hem preservation. The factory-washed distress and chainstitch hem is carefully detached, the leg shortened to your target inseam, and re-attached invisibly so original fading remains intact.',
  },
  {
    q: 'How are partner tailor studios audited and verified?',
    a: 'Every partner atelier undergoes an in-person equipment and skill audit before joining our network. We check industrial machine calibrations—including blind-stitch, chainstitch, multi-thread overlock, and steam press systems.',
  },
]

export function TestimonialsSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-12 sm:py-18 lg:py-24 bg-[#FAF8F5] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-14">
          <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-3 inline-flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck size={13} className="text-[#9E593B]" />
            The Raffu Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#0F1115] tracking-tight leading-tight">
            Tailored with care. Guaranteed for fit.
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5A5D64] leading-relaxed">
            No pre-fitting, measuring tape, or guesswork required. Hand your clothes directly to a vetted local master tailor who takes all measurements in person, backed by our 100% free re-fit guarantee.
          </p>
        </div>

        {/* Smart Craftsmanship & Guarantee Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-16">
          {CRAFT_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            const isLastOdd = i === 2
            return (
              <div
                key={i}
                className={`flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#E8E1D5] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-[#9E593B]/40 group ${
                  isLastOdd ? 'sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none w-full' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="size-10 sm:size-11 rounded-2xl bg-[#0F1115] text-[#FAF8F5] grid place-items-center group-hover:bg-[#9E593B] transition-colors duration-300 shadow-xs">
                      <Icon size={19} />
                    </div>
                    <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[#9E593B] bg-[#9E593B]/10 px-2.5 py-1 rounded-full">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#0F1115] mb-2 sm:mb-2.5 tracking-tight group-hover:text-[#9E593B] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-5 sm:mb-6">
                    {pillar.description}
                  </p>
                </div>

                {/* Verification badges */}
                <div className="pt-3.5 sm:pt-4 border-t border-[#F3F4F6] flex flex-col gap-2">
                  {pillar.badges.map((badge, bi) => (
                    <div key={bi} className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-[#0F1115]">
                      <CheckCircle2 size={13} className="text-[#10B981] shrink-0" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Smart FAQ / Fitting Assistance Accordion */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] p-5 sm:p-8 lg:p-10 mb-10 sm:mb-14 shadow-2xs">
          <div className="max-w-[700px] mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] mb-1.5">
              <HelpCircle size={14} /> Fitting &amp; Service Clarity
            </span>
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F1115] tracking-tight">
              Common questions answered upfront.
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5D64] mt-1.5">
              Everything you need to know before handing over your favorite garments.
            </p>
          </div>

          <div className="divide-y divide-[#F0ECE4]">
            {CRAFT_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="py-4.5 sm:py-5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group"
                  >
                    <span className="font-serif text-base sm:text-lg font-bold text-[#0F1115] group-hover:text-[#9E593B] transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`grid size-7 place-items-center rounded-full border border-[#E8E1D5] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-[#0F1115] text-white border-[#0F1115]' : 'bg-[#FAF8F5] text-[#5A5D64]'
                      }`}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>

                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-[#5A5D64] leading-relaxed max-w-3xl pr-4 animate-in fade-in-50 duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quality Guarantee Visual Banner */}
        <div className="relative overflow-hidden rounded-3xl h-64 sm:h-72 border border-[#E5E7EB] shadow-sm">
          <Image
            src="/images/fabric_pins.jpg"
            alt="Artisan sewing table"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/95 via-[#0F1115]/75 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 sm:px-12 text-white">
            <div className="max-w-[540px]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#F59E0B] block mb-2">
                Craftsmanship Standard
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
                Every seam, thread &amp; hem matters.
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-2 mb-5 leading-relaxed">
                We inspect every garment against rigorous tailoring standards before dispatch. Verified stitch tension, matched thread, and professional steam press.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-[#E7C9BA]">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> OEM Thread Match</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Chainstitch Hem</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Hand-Finished Blind Hem</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Industrial Steam Press</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
