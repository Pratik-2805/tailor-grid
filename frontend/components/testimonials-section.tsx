'use client'

import Image from 'next/image'
import {
  BadgeCheck,
  CheckCircle2,
  Scissors,
  ShieldCheck,
} from 'lucide-react'
import { motion } from 'motion/react'

const CRAFT_PILLARS = [
  {
    icon: ShieldCheck,
    tag: 'Fit Guarantee',
    title: '100% Free Re-Fit Guarantee',
    description:
      'No measuring tape or guessing needed. Your tailor measures and pins everything in person. If the fit ever needs a small tweak, the studio adjusts it for free within 48 hours.',
    badges: ['In-person fitting by your tailor', 'Free adjustments if needed'],
  },
  {
    icon: Scissors,
    tag: 'Quality Craft',
    title: 'Original Hem & Clean Finishing',
    description:
      'We protect your clothes’ authentic details. Designer denim keeps its original faded hem, trousers get invisible hand hems, and stitches are color-matched to the fabric.',
    badges: ['Original factory hems preserved', 'Invisible stitching & clean seams'],
  },
  {
    icon: BadgeCheck,
    tag: 'Total Transparency',
    title: 'Standardized Rates, Total Clarity',
    description:
      'Know the exact price before you book. Every service has clear, fixed rates based on standard atelier bench times, so the price you see is the price you pay.',
    badges: ['Upfront itemized pricing', 'Direct studio accountability'],
  },
]

const CRAFT_FAQS = [
  {
    q: 'Who takes the measurements for my alteration?',
    a: 'Your tailor takes care of every measurement and fitting. Simply select your garment and service, and hand your clothes to the tailor when you visit the studio that accepted your order, who handles all precision measurements and fitting in person.',
  },
  {
    q: 'What if the garment fit is not 100% right upon collection?',
    a: 'Every single booking is protected by our 100% Fit Guarantee. Try on your altered garment at the studio when the tailor hands it over. If any minor tweak is needed, your partner atelier alters it complimentary within 24 hours.',
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
  return (
    <section className="py-12 sm:py-18 lg:py-24 bg-[#FAF8F5] border-b border-[#E8E1D5] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header with motion */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-[640px] mx-auto mb-10 sm:mb-14"
        >
          <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-3 inline-flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck size={13} className="text-[#9E593B]" />
            The Raffu Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#0F1115] tracking-tight leading-tight">
            Tailored with care. Guaranteed for fit.
          </h2>
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5A5D64] leading-relaxed">
            No guessing or self-measuring. Hand your clothes directly to a vetted local tailor who fits everything in person, backed by our 100% free re-fit guarantee.
          </p>
        </motion.div>

        {/* Craftsmanship & Guarantee Pillars with motion */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-16">
          {CRAFT_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            const isLastOdd = i === 2
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#E8E1D5] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] hover:border-[#9E593B]/40 group ${isLastOdd ? 'sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none w-full' : ''
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
              </motion.div>
            )
          })}
        </div>

        {/* Quality Guarantee Visual Banner with motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl min-h-64 sm:h-72 border border-[#E5E7EB] shadow-sm"
        >
          <Image
            src="/images/fabric_pins.jpg"
            alt="Artisan sewing table"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/95 via-[#0F1115]/85 to-[#0F1115]/60 sm:via-[#0F1115]/75 sm:to-transparent" />
          <div className="relative sm:absolute sm:inset-0 flex items-center px-6 py-8 sm:px-12 sm:py-0 text-white">
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
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#E7C9BA]">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> OEM Thread Match</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Chainstitch Hem</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Hand-Finished Blind Hem</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Industrial Steam Press</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
