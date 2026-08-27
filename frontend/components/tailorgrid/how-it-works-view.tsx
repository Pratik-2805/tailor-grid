'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  MapPin,
  QrCode,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  UserCheck,
  ChevronRight,
} from 'lucide-react'
import { FaqAccordion } from './faq-accordion'
import { GARMENT_CATEGORIES, type Screen } from './data'
import {
  HeroTailoringIllustration,
  Step1Illustration,
  Step2Illustration,
  Step3Illustration,
  Step4Illustration,
  Step5Illustration,
  OnlineBookingIllustration,
  TrousersSilhouette,
  SuitSilhouette,
  DressSilhouette,
  OccasionSilhouette,
  RepairSilhouette,
} from './how-it-works-illustrations'

interface HowItWorksViewProps {
  go: (s: Screen) => void
  onQuickSearch?: (postcode: string, garmentId: string) => void
  onSelectService?: (garmentId: string, serviceId: string) => void
}

export function HowItWorksView({ go, onQuickSearch, onSelectService }: HowItWorksViewProps) {
  // Quick estimation hero state
  const [selectedGarment, setSelectedGarment] = useState('trousers')
  const [postcode, setPostcode] = useState('W8 4EP')

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onQuickSearch) {
      onQuickSearch(postcode.trim() || 'W8 4EP', selectedGarment)
    }
    go('booking')
  }

  const handleSuggestionClick = (garmentId: string) => {
    if (onQuickSearch) {
      onQuickSearch(postcode.trim() || 'W8 4EP', garmentId)
    }
    go('booking')
  }

  // 5 Step-by-Step Milestones
  const steps = [
    {
      num: '1',
      title: 'Getting started',
      desc: 'The customer selects their garment (trousers, jeans, shirts, dresses, blazers, or occasion wear) and the exact alteration needed. You review fixed, standardized pricing before confirming with zero hidden fees or surprise studio surcharges.',
      tips: ['Standardized upfront rates', 'Custom fit notes & fabric options'],
      Illustration: Step1Illustration,
    },
    {
      num: '2',
      title: 'Matching customer and master atelier',
      desc: 'TailorGrid instantly matches your order to the best-rated certified master atelier within 1–3 miles, verified to have the exact specialist industrial machinery (OEM blindstitch, heavy denim chainstitch, overlock) your fabric requires.',
      tips: ['Vetted master artisans', 'Accurate neighborhood walking distance'],
      Illustration: Step2Illustration,
    },
    {
      num: '3',
      title: 'In-studio fitting or express drop-off',
      desc: 'Walk into your allocated partner atelier with your instant Digital Fitting Pass. Enjoy a 5-minute personal fitting and pinning session with a master tailor in a private fitting room, or drop off pre-pinned garments in under 60 seconds.',
      tips: ['Private luxury fitting rooms', 'Bring intended shoes for exact hem break'],
      Illustration: Step3Illustration,
    },
    {
      num: '4',
      title: 'Precision crafting & 48-hour completion',
      desc: 'Your garment is altered with precision stitching and color-matched OEM thread. Follow every status update in real time on your digital tracker. You receive an instant SMS the moment your garment is steamed, inspected, and ready.',
      tips: ['Live order status updates', 'Automatic Digital Fit Passport recording'],
      Illustration: Step4Illustration,
    },
    {
      num: '5',
      title: 'Try-on & 100% Fit Guarantee',
      desc: 'Pick up your freshly pressed garment and try it on in the studio. If any micro-adjustment is needed, our 100% Fit Guarantee ensures your master tailor refines it complimentary on the spot.',
      tips: ['100% Fit Guarantee', 'Complimentary in-store adjustments'],
      Illustration: Step5Illustration,
    },
  ]

  // Suggestions Cards
  const suggestions = [
    {
      id: 'trousers',
      name: 'Trousers & Jeans',
      desc: 'Precision hemming, waist adjustments, tapering, and selvedge chainstitch.',
      Icon: TrousersSilhouette,
      starting: 'From $20',
    },
    {
      id: 'suits',
      name: 'Suits & Blazers',
      desc: 'Sleeve shortening from cuff, shoulder resets, and waist suppression.',
      Icon: SuitSilhouette,
      starting: 'From $45',
    },
    {
      id: 'dresses',
      name: 'Dresses & Gowns',
      desc: 'Bodice contouring, hem tiers, strap shortening, and neckline resets.',
      Icon: DressSilhouette,
      starting: 'From $24',
    },
    {
      id: 'occasion',
      name: 'Ethnic & Occasion',
      desc: 'Lehenga border resets, blouse darts, and delicate silk embroidery fits.',
      Icon: OccasionSilhouette,
      starting: 'From $38',
    },
    {
      id: 'skirts',
      name: 'Repairs & Zips',
      desc: 'Invisible zip replacement, tear stitching, and waistband reconstructions.',
      Icon: RepairSilhouette,
      starting: 'From $24',
    },
  ]

  return (
    <div className="bg-[#FAF8F5] text-[#0F1115] min-h-screen">
      
      {/* Top Breadcrumb & Page Container */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        
        {/* Back link */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#0F1115] transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Overview</span>
        </button>

        {/* ========================================================================= */}
        {/* HERO SECTION (Matches Uber Reference Screenshot 1) */}
        {/* ========================================================================= */}
        <section className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 lg:pb-24 border-b border-[#EBE6DF]">
          
          {/* Left Column: Heading, Description & Quick Input Form */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F1115] leading-[1.1]">
              How TailorGrid works
            </h1>

            <p className="text-base sm:text-lg text-[#5A5D64] leading-relaxed max-w-[540px]">
              Understanding how TailorGrid connects you with certified master ateliers and alteration studios can enhance your experience. Scroll to learn how the service works, or request a fitting now by entering your service and location below.
            </p>

            {/* Quick Interactive Location / Service Box */}
            <form
              onSubmit={handleHeroSubmit}
              className="mt-6 rounded-2xl bg-white border border-[#E5E0D8] p-5 shadow-sm space-y-3.5 max-w-[480px]"
            >
              {/* Garment Selector */}
              <div className="relative">
                <div className="flex items-center gap-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] px-3.5 py-3 focus-within:border-[#0F1115] focus-within:bg-white transition-all">
                  <div className="size-6 rounded-full bg-[#0F1115] text-white grid place-items-center shrink-0">
                    <Scissors size={12} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7E85]">
                      Select Service
                    </label>
                    <select
                      value={selectedGarment}
                      onChange={(e) => setSelectedGarment(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F1115] focus:outline-none cursor-pointer"
                    >
                      {GARMENT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (from ${cat.startingPrice})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Input */}
              <div className="relative">
                <div className="flex items-center gap-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] px-3.5 py-3 focus-within:border-[#0F1115] focus-within:bg-white transition-all">
                  <div className="size-6 rounded-full bg-[#9E593B] text-white grid place-items-center shrink-0">
                    <MapPin size={12} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7E85]">
                      Postcode or Neighborhood
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="e.g. W8 4EP, SoHo, Beverly Hills"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F1115] placeholder:text-[#9CA3AF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#0F1115] py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[#9E593B] shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>See prices & studios</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="flex items-center gap-4 text-xs text-[#7A7E85]">
              <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <ShieldCheck size={14} /> 100% Fit Guarantee
              </span>
              <span>·</span>
              <span>48-Hour Turnaround</span>
              <span>·</span>
              <span>Fixed Transparent Rates</span>
            </div>
          </div>

          {/* Right Column: Hero Illustration */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
            <div className="w-full max-w-[520px] rounded-3xl overflow-hidden shadow-lg border border-[#EBE6DF] bg-white p-2 sm:p-4 hover:shadow-xl transition-shadow duration-300">
              <HeroTailoringIllustration className="w-full h-auto drop-shadow-sm" />
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* TIMELINE GUIDE SECTION (Matches Uber Reference Screenshots 2 & 3) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#EBE6DF]">
          
          <div className="max-w-[760px] mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115]">
              A quick guide to TailorGrid
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#5A5D64]">
              Here&apos;s how the TailorGrid app and web platform connect master artisans with customers on demand, step by step:
            </p>
          </div>

          {/* Step Timeline with Vertical Connected Rail */}
          <div className="relative">
            {/* Vertical Continuous Line for Desktop */}
            <div className="hidden lg:block absolute left-[295px] top-6 bottom-6 w-[1.5px] bg-[#0F1115]/80" />

            <div className="space-y-12 sm:space-y-16">
              {steps.map((step) => {
                const StepIllustration = step.Illustration
                return (
                  <div
                    key={step.num}
                    className="grid lg:grid-cols-[270px_50px_1fr] gap-5 lg:gap-0 items-center"
                  >
                    {/* Left Column: Clean Vector Graphic */}
                    <div className="w-full h-[175px] sm:h-[185px] rounded-2xl overflow-hidden border border-[#EBE6DF] bg-[#FAF8F5] shadow-xs flex items-center justify-center p-2">
                      <StepIllustration className="w-full h-full object-contain" />
                    </div>

                    {/* Middle Column: Clean Solid Square Node */}
                    <div className="hidden lg:flex justify-center items-center h-full relative">
                      <div className="size-3.5 bg-[#0F1115] rounded-[2px] shadow-xs" />
                    </div>

                    {/* Right Column: Step Title & Description */}
                    <div className="lg:pl-4 max-w-[580px]">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] tracking-tight">
                        {step.num}. {step.title}
                      </h3>
                      <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#5A5D64]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* SUGGESTIONS SECTION (Matches Uber Reference Screenshot 3 Bottom) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#EBE6DF]">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="pill-badge bg-white text-[#9E593B] border border-[#EBE6DF] mb-3">
                Tailoring Categories
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0F1115]">
                Suggestions
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[#5A5D64]">
                Popular alterations with upfront fixed pricing ready for immediate booking:
              </p>
            </div>

            <button
              onClick={() => go('booking')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start"
            >
              <span>View full catalog</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Horizontal Card Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {suggestions.map((item) => {
              const ItemIcon = item.Icon
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#F3EFEA] border border-[#E5DFD5] p-5 flex flex-col justify-between hover:bg-white hover:border-[#9E593B] hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-12 rounded-xl bg-white border border-[#E2DDD5] grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
                        <ItemIcon className="size-7" />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#9E593B] bg-white px-2 py-0.5 rounded border border-[#E2DDD5]">
                        {item.starting}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#0F1115] mb-1.5">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#5A5D64] leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E5DFD5]/60 flex items-center justify-between">
                    <button
                      onClick={() => handleSuggestionClick(item.id)}
                      className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-[#0F1115] border border-[#D1D5DB] hover:bg-[#0F1115] hover:text-white hover:border-[#0F1115] transition-colors shadow-2xs"
                    >
                      Details
                    </button>
                    <span className="text-[11px] font-medium text-[#7A7E85]">48h ready</span>
                  </div>
                </div>
              )
            })}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* ONLINE BOOKING FEATURE SPLIT (Matches Uber Reference Screenshot 4) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#EBE6DF]">
          
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headline, Copy & Action */}
            <div className="lg:col-span-6 space-y-6">
              <span className="pill-badge bg-white text-[#9E593B] border border-[#EBE6DF]">
                Universal Web Booking
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115]">
                Request tailoring online
              </h2>

              <p className="text-base sm:text-lg text-[#5A5D64] leading-relaxed max-w-[500px]">
                You can find verified master ateliers and book fitting appointments online without needing to download an app. Simply head to the TailorGrid web booking tool, and you&apos;re ready to enjoy the convenience of precision alterations from your computer, tablet, or phone.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => go('booking')}
                  className="rounded-full bg-[#0F1115] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
                >
                  <span>Book tailoring without an app</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Right Column: Multi-device Illustration */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[500px] rounded-3xl bg-white border border-[#EBE6DF] p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                <OnlineBookingIllustration className="w-full h-auto" />
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* "IT'S EASIER WITH TAILORGRID" FEATURE CARDS (Screenshot 4 Bottom) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#EBE6DF]">
          
          <div className="max-w-[760px] mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0F1115]">
              It&apos;s easier with TailorGrid
            </h2>
            <p className="mt-2 text-base text-[#5A5D64]">
              Built from the ground up for transparent craftsmanship and effortless garment care.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            
            {/* Card 1: Digital QR Fitting Pass */}
            <div className="rounded-2xl bg-white border border-[#EBE6DF] p-6 shadow-xs hover:border-[#9E593B] transition-all duration-200">
              <div className="size-12 rounded-xl bg-[#FAF8F5] border border-[#EBE6DF] grid place-items-center text-[#9E593B] mb-5">
                <QrCode size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F1115] mb-2">
                Digital Fit Passport
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                Scan into any partner atelier with zero paperwork. Your exact measurements, break preferences, and alteration history are securely saved.
              </p>
            </div>

            {/* Card 2: 100% Fit Guarantee */}
            <div className="rounded-2xl bg-white border border-[#EBE6DF] p-6 shadow-xs hover:border-[#9E593B] transition-all duration-200">
              <div className="size-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] grid place-items-center text-[#10B981] mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F1115] mb-2">
                100% Fit Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                Try on your garment in the studio fitting room. If any micro-tweak is needed, the atelier refines it complimentary within 24 hours.
              </p>
            </div>

            {/* Card 3: Upfront Standardized Pricing */}
            <div className="rounded-2xl bg-white border border-[#EBE6DF] p-6 shadow-xs hover:border-[#9E593B] transition-all duration-200">
              <div className="size-12 rounded-xl bg-[#FFF7F2] border border-[#F0DFD5] grid place-items-center text-[#9E593B] mb-5">
                <Scissors size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F1115] mb-2">
                Fixed Transparent Rates
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                No awkward dry cleaner price haggling. Every service has standardized pricing with OEM thread and steam press included.
              </p>
            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* FREQUENTLY ASKED QUESTIONS SECTION */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 border-b border-[#EBE6DF]">
          
          <div className="text-center max-w-[640px] mx-auto mb-12">
            <span className="pill-badge bg-white text-[#9E593B] border border-[#EBE6DF] mb-3">
              Clear Answers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64]">
              Everything you need to know about fittings, turnarounds, pricing, and our fit guarantee.
            </p>
          </div>

          <FaqAccordion />

        </section>

        {/* ========================================================================= */}
        {/* FINAL HIGH-CONVERSION CTA BANNER */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-20 rounded-3xl bg-[#0F1115] text-[#FAF8F5] p-8 sm:p-14 relative overflow-hidden shadow-xl">
          
          {/* Subtle background decorative shapes */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#9E593B]/10 rounded-l-full pointer-events-none" />
          <div className="absolute left-10 -bottom-10 size-40 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 max-w-[640px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#F59E0B] mb-4">
              <Sparkles size={13} /> 40+ Certified Master Partner Ateliers
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-4">
              Ready to get your clothes tailored?
            </h2>

            <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed mb-8">
              Book in 60 seconds. Choose your alteration service, enter your postcode, and get matched to your local master studio with fixed pricing and 100% Fit Guarantee.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => go('booking')}
                className="rounded-full bg-[#FAF8F5] text-[#0F1115] px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-all hover:bg-[#9E593B] hover:text-white active:scale-95 inline-flex items-center gap-2"
              >
                <span>Book a fitting pass now</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => go('for-partners')}
                className="rounded-full border border-white/30 px-7 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                For Partner Studios
              </button>
            </div>
          </div>

        </section>

      </div>
    </div>
  )
}
