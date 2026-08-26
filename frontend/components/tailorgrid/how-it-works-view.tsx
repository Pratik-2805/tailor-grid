'use client'

import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Compass, HelpCircle, MapPin, Ruler, Scissors, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { FaqAccordion } from './faq-accordion'
import { type Screen } from './data'

export function HowItWorksView({ go }: { go: (s: Screen) => void }) {
  const steps = [
    {
      num: '01',
      title: 'Choose your garment and service',
      desc: 'Select from our standardized catalog of trousers, shirts, dresses, suits, and occasion wear. You see fixed, guaranteed pricing before confirming — zero hidden fees.',
      tips: ['Standardized transparent rates', 'Custom notes for vintage or designer garments'],
      icon: Scissors,
    },
    {
      num: '02',
      title: 'Smart neighborhood studio allocation',
      desc: 'Enter your postcode and TailorGrid instantly matches your order to the best-rated certified atelier within 1–3 miles, equipped with the exact specialist machinery your fabric requires.',
      tips: ['Verified master artisans', 'Accurate walking/transit distance'],
      icon: Compass,
    },
    {
      num: '03',
      title: 'Visit your studio for fitting or drop-off',
      desc: 'Walk into your matched studio with your Digital Fitting Pass. If you need fitting advice, the master tailor will pin and measure your garment in person. If pre-pinned, drop off in under a minute.',
      tips: ['Private fitting rooms', 'Bring the shoes you plan to wear for perfect hems'],
      icon: UserCheck,
    },
    {
      num: '04',
      title: 'Live tracking and 48-hour completion',
      desc: 'Your garment is tailored with OEM thread and precision stitching. Follow every status update in real-time. You receive an instant notification the moment your piece is pressed and ready.',
      tips: ['Live order status tracker', 'Automatic digital fit passport recording'],
      icon: Clock,
    },
    {
      num: '05',
      title: 'Try on in studio & 100% Fit Guarantee',
      desc: 'Pick up your garment and try it on in the studio fitting room. If any micro-adjustment is needed, our 100% Fit Guarantee ensures your tailor refines it complimentary.',
      tips: ['100% satisfaction guarantee', 'Free in-store adjustment if needed'],
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        
        {/* Back navigation & Page Header */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Overview
        </button>

        <div className="max-w-[780px]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
            The In-Studio Experience
          </span>
          <h1 className="mt-4 font-serif text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-[#18191B]">
            Alterations made seamless, transparent &amp; local.
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#5A5D64]">
            TailorGrid connects you directly with neighborhood master tailors. No confusing price lists, no awkward dry-cleaner fittings, and no guesswork.
          </p>
        </div>

        {/* Detailed 5-Step Process */}
        <div className="mt-16 space-y-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="rounded-2xl border border-[#DDD6CB] bg-white p-7 sm:p-10 shadow-xs hover:border-[#9E593B] transition-all duration-300 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#9E593B] bg-[#F4EFEA] px-3 py-1 rounded">
                      STEP {step.num}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7E85]">
                      Studio Journey
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold text-[#18191B]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#5A5D64]">
                    {step.desc}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4">
                    {step.tips.map((tip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs text-[#18191B] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E2DDD5]"
                      >
                        <CheckCircle2 size={13} className="text-[#9E593B]" />
                        <span>{tip}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-[#F4EFEA] p-6 border border-[#E2DDD5] flex flex-col justify-center items-center text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] shadow-sm">
                    <Icon size={24} />
                  </div>
                  <h4 className="mt-4 font-serif text-lg font-semibold text-[#18191B]">
                    {step.title.split(' ')[0]} {step.title.split(' ')[1]}
                  </h4>
                  <p className="text-xs text-[#7A7E85] mt-1">Coordinated via TailorGrid</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Studio Fitting Pro-Tips */}
        <div className="mt-20 rounded-2xl bg-[#18191B] p-8 sm:p-12 text-[#FAF8F5]">
          <div className="max-w-[680px]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C9BA]">
              Studio Fitting Guide
            </span>
            <h3 className="mt-3 font-serif text-3xl font-normal text-white">
              How to prepare for your studio visit
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#B1ACA4]">
              A few simple steps help our partner master tailors achieve your ideal silhouette on the first try.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3 text-xs">
            <div className="rounded-xl bg-[#25282F] p-5 border border-[#3A3F4A]">
              <p className="font-serif text-sm font-semibold text-white">1. Bring your shoes</p>
              <p className="mt-2 text-[#B1ACA4] leading-relaxed">
                For trouser and dress hemming, wear or bring the exact heel height and shoe style you plan to wear.
              </p>
            </div>
            <div className="rounded-xl bg-[#25282F] p-5 border border-[#3A3F4A]">
              <p className="font-serif text-sm font-semibold text-white">2. Wear intended undergarments</p>
              <p className="mt-2 text-[#B1ACA4] leading-relaxed">
                For bodice, waist, or gown tailoring, wear the correct bra or base layers for accurate contouring.
              </p>
            </div>
            <div className="rounded-xl bg-[#25282F] p-5 border border-[#3A3F4A]">
              <p className="font-serif text-sm font-semibold text-white">3. Show your Digital Fitting Pass</p>
              <p className="mt-2 text-[#B1ACA4] leading-relaxed">
                Your QR pass allows the studio to scan and pull up your order instructions with zero paperwork.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center max-w-[640px] mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Got Questions?
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-normal text-[#18191B]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-[840px] mx-auto">
            <FaqAccordion />
          </div>
        </div>

        {/* CTA Bar */}
        <div className="mt-16 text-center">
          <button
            onClick={() => go('booking')}
            className="inline-flex items-center gap-3 rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-md"
          >
            <span>Book Your Studio Fitting Now</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  )
}
