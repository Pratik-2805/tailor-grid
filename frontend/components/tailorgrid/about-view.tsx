'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Leaf,
  Megaphone,
  MessageSquare,
  Newspaper,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from 'lucide-react'
import { type Screen } from './data'

interface AboutViewProps {
  go: (s: Screen) => void
}

export function AboutView({ go }: AboutViewProps) {
  const [showCeoLetter, setShowCeoLetter] = useState(false)

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#0F1115]">
      
      {/* 1. Hero Vector Banner (Clean Minimalist Illustrator Style) */}
      <section className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] bg-[#FAF8F5] border-b border-[#E8E1D5] overflow-hidden">
        <Image
          src="/images/about_hero_art.jpg"
          alt="Clean vector illustration of tailoring atelier salon"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        
        {/* Soft top gradient to highlight back button and title */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/80 via-transparent to-[#FAF8F5]/90 pointer-events-none" />

        <div className="relative mx-auto h-full max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6 sm:py-8">
          <div>
            <button
              onClick={() => go('home')}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0F1115] border border-[#E8E1D5] hover:bg-white transition-colors shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Back to Home</span>
            </button>
          </div>

          <div>
            <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-2 inline-block">
              Our Vision
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-[#0F1115]">
              About us
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Mission Statement (Uber Style Headline + Narrative) */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-[880px]">
            <h2 className="text-3xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight text-[#0F1115] leading-[1.14]">
              We reimagine the way clothes fit and endure for the better
            </h2>

            <p className="mt-8 text-base sm:text-lg text-[#5A5D64] leading-relaxed font-normal">
              Precision craft is what we power. It&apos;s our lifeblood. It runs through our ateliers. It&apos;s what gets our master tailors to the cutting table each morning. It pushes us to constantly reimagine how clothes can fit better. For you. For all the garments in your wardrobe you love and want to wear. For all the local studios who take pride in their craft. In real time, with seamless 5-minute walk-in fitting.
            </p>
          </div>
        </div>
      </section>

      {/* 3. A Letter from our Founder & CEO (Clean Dark Luxury Split Feature) */}
      <section className="py-20 sm:py-28 bg-[#F4EFEA] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-[36px] overflow-hidden bg-[#0F1115] text-white shadow-xl border border-white/10">
            <div className="grid lg:grid-cols-12 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F9C933] block mb-3">
                  Executive Note
                </span>
                
                <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-tight">
                  A letter from our Founder
                </h3>

                <p className="mt-5 text-sm sm:text-base text-white/75 leading-relaxed max-w-[440px]">
                  Read about our team&apos;s commitment to provide everyone with the transparent alteration network and master craftsmanship that fits their everyday life.
                </p>

                <div className="mt-8">
                  <button
                    onClick={() => setShowCeoLetter(true)}
                    className="rounded-full bg-white text-[#0F1115] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider hover:bg-[#FAF8F5] transition-all active:scale-95 shadow-md"
                  >
                    Read the letter
                  </button>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="lg:col-span-6 relative h-[300px] sm:h-[380px] lg:h-[440px] bg-[#18191B]">
                <Image
                  src="/images/about_founder_art.jpg"
                  alt="Vector illustration of designers drafting patterns at cutting table"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. Alternating Feature Pillars (Uber Style: Offerings & Sustainability with Vector Art) */}
      <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
          
          {/* Block 1: Alterations and Beyond */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative h-[300px] sm:h-[380px] rounded-3xl overflow-hidden shadow-xs border border-[#E8E1D5] bg-[#FAF8F5]">
              <Image
                src="/images/about_network_art.jpg"
                alt="City map of independent tailoring studios and ateliers"
                fill
                className="object-contain object-center p-2"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="lg:col-span-6">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
                Alterations and beyond
              </h3>

              <p className="mt-4 text-sm sm:text-base text-[#5A5D64] leading-relaxed">
                In addition to helping customers find trusted tailors within walking distance, we&apos;re removing barriers to sustainable circular fashion, eliminating fit-based clothing returns, and helping independent neighbourhood studios double their weekly machine capacity. And always ensuring master artisans earn fair, transparent, and direct weekly compensation.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-bold">
                <button
                  onClick={() => go('how-it-works')}
                  className="text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
                >
                  How to use TailorGrid
                </button>
                <button
                  onClick={() => go('booking')}
                  className="text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
                >
                  Our services
                </button>
              </div>
            </div>
          </div>

          {/* Block 2: Sustainability (Reversed Grid) */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
                Sustainability &amp; Circular Wardrobe
              </h3>

              <p className="mt-4 text-sm sm:text-base text-[#5A5D64] leading-relaxed">
                Over 60% of unworn clothes sit idle in wardrobes simply due to minor fit flaws: long hems, loose waists, or sleeve lengths. TailorGrid is committed to extending the lifespan of 1,000,000 garments by 2030, keeping high-quality textiles out of landfills through precision seam adjustments, denim hemming, and jacket tapering. Extending a garment&apos;s life by just 9 months cuts its carbon and water footprint by 20% to 30%.
              </p>

              <div className="mt-6">
                <button
                  onClick={() => go('booking')}
                  className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Start tailoring your wardrobe</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 relative h-[300px] sm:h-[380px] rounded-3xl overflow-hidden shadow-xs border border-[#E8E1D5] bg-[#FAF8F5]">
              <Image
                src="/images/about_sustainable_art.jpg"
                alt="Vector illustration of sustainable circular fashion with thread and leaves"
                fill
                className="object-contain object-center p-3"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Block 3: Craft Standards & Safety with Vector Art */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 relative h-[300px] sm:h-[380px] rounded-3xl overflow-hidden shadow-xs border border-[#E8E1D5] bg-[#FAF8F5]">
              <Image
                src="/images/about_standards_art.jpg"
                alt="Vector illustration of sewing machine, gold shears and quality standards seal"
                fill
                className="object-contain object-center p-3"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="lg:col-span-6">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
                Your craft and care drives us
              </h3>

              <p className="mt-4 text-sm sm:text-base text-[#5A5D64] leading-relaxed">
                Whether you&apos;re fitting a bespoke tuxedo or tapering everyday raw denim, care and consistency are essential. We are committed to doing our part: audited machinery calibration, upfront standardized pricing with no hidden markups, and responsive studio support on every ticket.
              </p>

              <div className="mt-6">
                <button
                  onClick={() => go('how-it-works')}
                  className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Learn about our craft standards</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Company Info / Leadership & Integrity (Clean Vector Artwork Cards) */}
      <section className="py-20 sm:py-28 bg-[#F4EFEA] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Company info
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Card 1 */}
            <div className="flex flex-col justify-between bg-white rounded-3xl overflow-hidden border border-[#E8E1D5] shadow-xs">
              <div className="relative h-[240px] sm:h-[280px] w-full bg-[#FAF8F5] p-2">
                <Image
                  src="/images/about_team_art.jpg"
                  alt="Vector illustration of team and artisans collaborating in studio"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 sm:p-8 border-t border-[#E8E1D5]">
                <h3 className="text-xl font-bold text-[#0F1115] mb-2">
                  Who&apos;s crafting TailorGrid
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-6">
                  We&apos;re building a culture within TailorGrid that emphasizes doing the right thing, period, for customers, studio partners, and our engineering team. Find out more about the craftsmen leading the way.
                </p>
                <button
                  onClick={() => go('for-partners')}
                  className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
                >
                  See our studio network
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col justify-between bg-white rounded-3xl overflow-hidden border border-[#E8E1D5] shadow-xs">
              <div className="relative h-[240px] sm:h-[280px] w-full bg-[#FAF8F5] p-2">
                <Image
                  src="/images/about_charter_art.jpg"
                  alt="Vector illustration of artisan quality audit charter and thread matching swatches"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 sm:p-8 border-t border-[#E8E1D5]">
                <h3 className="text-xl font-bold text-[#0F1115] mb-2">
                  Acting with integrity &amp; craft
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-6">
                  TailorGrid&apos;s Quality Charter outlines our commitment to transparency at the highest levels. We achieve this through thread matching audits, blind-stitch capability testing, and non-destructive alteration methods.
                </p>
                <button
                  onClick={() => go('how-it-works')}
                  className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
                >
                  Learn about our craft standards
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Keep Up with the Latest (Uber Style 3 Columns with Icons) */}
      <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Keep up with the latest
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <Megaphone size={20} className="text-[#9E593B]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Newsroom
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-4">
                Get announcements about studio partnerships, new neighborhood launches, and sustainable fashion initiatives near you.
              </p>
              <button
                onClick={() => go('for-partners')}
                className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
              >
                Go to Newsroom
              </button>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <Users size={20} className="text-[#0F1115]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Atelier Journal
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-4">
                Explore garment longevity advice, fabric care secrets, and deep dives into the artisanal masters in our network.
              </p>
              <button
                onClick={() => go('home')}
                className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
              >
                Read our stories
              </button>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <Globe size={20} className="text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Local Impact &amp; Economics
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-4">
                Discover how our direct payout model keeps local artisan shops vibrant, fueling neighborhood retail footfall.
              </p>
              <button
                onClick={() => go('for-partners')}
                className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors"
              >
                View partner economics
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Come Reimagine with Us / Careers (Clean Vector Globe Illustration) */}
      <section className="py-20 sm:py-28 bg-[#F4EFEA]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#E8E1D5] shadow-xs">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7">
                <h2 className="text-3xl sm:text-5xl font-black text-[#0F1115] tracking-tight">
                  Come reimagine fit with us
                </h2>

                <p className="mt-4 text-sm sm:text-base text-[#5A5D64] leading-relaxed max-w-[500px]">
                  We&apos;re building a world where every garment in your closet fits flawlessly. Join our engineering, operations, and master artisan liaison teams.
                </p>

                <div className="mt-8">
                  <button
                    onClick={() => go('for-partners')}
                    className="rounded-full bg-[#0F1115] hover:bg-[#9E593B] px-8 py-4 text-xs font-extrabold uppercase tracking-wider text-white transition-all active:scale-95 shadow-md"
                  >
                    Search open roles
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="relative size-60 sm:size-72 rounded-full overflow-hidden border-2 border-[#E8E1D5] bg-[#FAF8F5] shadow-xs">
                  <Image
                    src="/images/about_globe_art.jpg"
                    alt="Globe vector illustration with tailoring stitches"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 240px, 288px"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CEO Letter Modal */}
      {showCeoLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-3xl bg-[#FAF8F5] p-6 sm:p-10 border border-[#E8E1D5] shadow-2xl">
            <button
              onClick={() => setShowCeoLetter(false)}
              className="absolute top-5 right-5 size-9 rounded-full bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center hover:bg-[#F4EFEA] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 pb-6 border-b border-[#E8E1D5] mb-6">
              <div className="relative size-16 rounded-full overflow-hidden border-2 border-[#0F1115] shrink-0 bg-[#18191B]">
                <Image src="/images/about_founder_art.jpg" alt="Founder illustration" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-[#0F1115]">A Letter from our Founder</h4>
                <p className="text-xs text-[#5A5D64]">Building the future of personal fit and circular clothing</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#374151] leading-relaxed">
              <p>
                When we started TailorGrid, we noticed a glaring disconnect in modern retail: brands manufacture millions of standardized garments, yet no two human bodies are identical.
              </p>
              <p>
                The traditional alteration experience was broken — opaque pricing, cash-only transactions, long 2-week turnarounds, and zero communication. At the same time, master artisan tailors in our neighborhoods had idle machines and empty fitting cabins between walk-in rush hours.
              </p>
              <p>
                TailorGrid bridges this gap with technology. By providing fixed upfront rates, instant neighborhood routing, and guaranteed 48-hour turnarounds backed by audited craftsmanship, we make tailoring as easy as ordering a ride.
              </p>
              <p className="font-serif italic text-base pt-2 text-[#0F1115]">
                &ldquo;Every garment you alter is a garment you love for another decade. Thank you for joining us on this mission.&rdquo;
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8E1D5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F1115]">Founder &amp; CEO, TailorGrid</span>
              <button
                onClick={() => setShowCeoLetter(false)}
                className="rounded-full bg-[#0F1115] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
