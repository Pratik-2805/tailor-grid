'use client'

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { FaqAccordion } from './faq-accordion'
import { type Screen } from './data'

export function HowItWorksView({ go }: { go: (s: Screen) => void }) {
  const uberGuideSteps = [
    {
      num: 1,
      title: 'Getting started & requesting alterations',
      desc: 'The customer enters their garment type (trousers, suit blazer, dress, shirt) into the "Garment & Service" selector, reviews fixed transparent pricing, and confirms doorstep pickup or atelier drop-off.',
      image: '/images/hero_alteration_art.jpg',
      linkText: 'Book an alteration now',
      screen: 'booking' as Screen,
    },
    {
      num: 2,
      title: 'Matching customer and certified atelier',
      desc: 'A nearby certified master tailor accepts the alteration request. The customer is automatically notified with matched studio details, walking distance, and artisan profile.',
      image: '/images/about_network_art.jpg',
      linkText: 'Explore certified ateliers',
      screen: 'booking' as Screen,
    },
    {
      num: 3,
      title: 'Fitting and garment handoff',
      desc: 'The customer meets the tailor for an in-person pin fitting or drops off pre-pinned items with their 10-second Digital QR Fitting Pass.',
      image: '/images/partner_team_art.jpg',
      linkText: 'How fitting passes work',
      screen: 'how-it-works' as Screen,
    },
    {
      num: 4,
      title: 'Precision crafting & live tracking',
      desc: 'The master artisan tailors the garment with original thread matching and steam pressing. The app provides real-time status updates from cutting to pressing.',
      image: '/images/about_founder_art.jpg',
      linkText: 'Track an existing order',
      screen: 'orders' as Screen,
    },
    {
      num: 5,
      title: 'Leaving ratings & 100% Fit Guarantee',
      desc: 'At completion, the customer receives their pressed garment at their door or in studio. They try it on, with our 100% Free Fit Guarantee ensuring free refits if any micro-adjustment is needed. Customers and tailors can rate each other and leave compliments.',
      image: '/images/about_standards_art.jpg',
      linkText: 'Read about our 100% Fit Guarantee',
      screen: 'about' as Screen,
    },
  ]

  return (
    <div className="py-10 lg:py-16 bg-[#FAF8F5]">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        
        {/* Back Navigation */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Overview
        </button>

        {/* ========================================================
            HERO SECTION (Uber Style Split Layout)
        ======================================================== */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center border-b border-[#DDD6CB] pb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] text-[12px] font-semibold text-[#9E593B] border border-[#E2DDD5] mb-4">
              <Sparkles size={13} />
              <span>Uber for Clothing Alterations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#18191B] leading-[1.1]">
              How TailorGrid works: an overview for everyone.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#5A5D64] leading-relaxed font-normal">
              TailorGrid connects customers needing precision clothing alterations directly with certified local master tailors. Choose doorstep pickup &amp; delivery or visit neighborhood studios in minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => go('booking')}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#18191B] px-7 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
              >
                <span>Book an Alteration</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => go('for-partners')}
                className="inline-flex items-center gap-2.5 rounded-full border border-[#18191B] bg-transparent px-7 py-4 text-xs font-semibold uppercase tracking-wider text-[#18191B] transition-all hover:bg-[#18191B] hover:text-white active:scale-95"
              >
                <span>Join as a Partner Atelier</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="mt-10 flex flex-wrap gap-4 text-xs font-medium text-[#18191B]">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD5]">
                <ShieldCheck size={16} className="text-[#9E593B]" />
                <span>100% Free Fit Guarantee</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD5]">
                <Clock size={16} className="text-[#9E593B]" />
                <span>48h Standard Turnaround</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD5]">
                <MapPin size={16} className="text-[#9E593B]" />
                <span>Certified Local Ateliers</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative overflow-hidden rounded-3xl border border-[#E2DDD5] bg-white p-3 shadow-xl group">
            <img
              src="/images/about_hero_art.jpg"
              alt="How TailorGrid Works Illustration"
              className="w-full h-auto rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* ========================================================
            EXACT UBER-STYLE VERTICAL TIMELINE SECTION
            ("A quick guide to TailorGrid")
        ======================================================== */}
        <div className="mt-20 border-b border-[#DDD6CB] pb-20">
          <div className="max-w-[920px] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#18191B]">
              A quick guide to TailorGrid
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
              Here's how the TailorGrid app and TailorGrid.com connect customers and master tailors on demand, step by step:
            </p>

            <div className="mt-12 relative">
              {/* Continuous Vertical Timeline Line */}
              <div className="hidden md:block absolute left-[300px] top-[12px] bottom-[120px] w-[2px] bg-[#18191B] z-0" />

              <div className="space-y-12">
                {uberGuideSteps.map((step) => (
                  <div
                    key={step.num}
                    className="grid md:grid-cols-[280px_40px_1fr] gap-6 md:gap-8 items-start relative z-10"
                  >
                    {/* Step Illustration */}
                    <div className="rounded-xl border border-[#DDD6CB] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-[165px] object-cover"
                      />
                    </div>

                    {/* Timeline Square Dot */}
                    <div className="hidden md:flex flex-col items-center pt-2 h-full">
                      <div className="size-2.5 bg-[#18191B] rounded-xs shrink-0" />
                    </div>

                    {/* Step Title & Content */}
                    <div className="pt-0.5">
                      <h3 className="text-lg font-bold text-[#18191B] tracking-tight">
                        {step.num}. {step.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                        {step.desc}
                      </p>
                      {step.linkText && (
                        <div className="mt-3">
                          <button
                            onClick={() => go(step.screen)}
                            className="text-xs font-semibold text-[#18191B] underline hover:text-[#9E593B] transition-colors"
                          >
                            {step.linkText}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            SAFETY & QUALITY GUARANTEE (Uber Style)
        ======================================================== */}
        <div className="mt-20 rounded-3xl border border-[#E2DDD5] bg-white p-8 sm:p-12 shadow-sm grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Safety &amp; Quality Guarantee
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#18191B]">
              Your garments are in certified artisan hands.
            </h2>
            <p className="mt-4 text-sm text-[#5A5D64] leading-relaxed">
              Every tailor in the TailorGrid network undergoes rigorous craft verification, studio equipment inspection, and quality auditing. We treat designer garments and vintage heirlooms with extreme care.
            </p>

            <div className="mt-8 space-y-4 text-xs font-semibold text-[#18191B]">
              <div className="flex items-center gap-3">
                <div className="grid size-7 place-items-center rounded-full bg-[#F4EFEA] text-[#9E593B]">
                  <CheckCircle2 size={16} />
                </div>
                <span>Certified Master Atelier Standards (20+ years craftsmanship benchmark)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid size-7 place-items-center rounded-full bg-[#F4EFEA] text-[#9E593B]">
                  <ShieldCheck size={16} />
                </div>
                <span>100% Free Refit Guarantee within 14 days of delivery</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid size-7 place-items-center rounded-full bg-[#F4EFEA] text-[#9E593B]">
                  <Lock size={16} />
                </div>
                <span>256-Bit Encrypted Escrow Payment (funds released only when satisfied)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2DDD5] overflow-hidden shadow-md bg-white">
            <img
              src="/images/about_charter_art.jpg"
              alt="Quality and Safety Guarantee Badge"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* ========================================================
            FAQ SECTION
        ======================================================== */}
        <div className="mt-24">
          <div className="text-center max-w-[640px] mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Got Questions?
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#18191B]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-[840px] mx-auto">
            <FaqAccordion />
          </div>
        </div>

        {/* ========================================================
            DUAL CALL TO ACTION CARDS (Uber Style)
        ======================================================== */}
        <div className="mt-20 grid md:grid-cols-2 gap-6">
          {/* Customer CTA Card */}
          <div className="rounded-3xl border border-[#DDD6CB] bg-[#F4EFEA] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9E593B]">
                For Clothing Owners
              </span>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#18191B]">
                Ready for garments that fit perfectly?
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#5A5D64]">
                Book doorstep collection or allocate your neighborhood atelier in under 60 seconds.
              </p>
            </div>
            <button
              onClick={() => go('booking')}
              className="mt-8 w-fit inline-flex items-center gap-2.5 rounded-full bg-[#18191B] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-all shadow-sm"
            >
              <span>Book an Alteration</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Partner CTA Card */}
          <div className="rounded-3xl border border-[#DDD6CB] bg-[#18191B] p-8 sm:p-10 text-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E7C9BA]">
                For Tailors &amp; Ateliers
              </span>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Become a Certified Partner Atelier
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#B1ACA4]">
                Receive steady local alteration orders, digitized ticketing, and guaranteed payouts.
              </p>
            </div>
            <button
              onClick={() => go('for-partners')}
              className="mt-8 w-fit inline-flex items-center gap-2.5 rounded-full bg-[#9E593B] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#b06746] transition-all shadow-sm"
            >
              <span>Apply as a Partner</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
