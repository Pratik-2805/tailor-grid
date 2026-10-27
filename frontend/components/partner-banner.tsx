'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Banknote, Calendar, CheckCircle2, ShoppingBag } from 'lucide-react'
import { motion } from 'motion/react'
import { type Screen } from './data'
import { STUDIO_BASE_URL } from '@/lib/api'

export function PartnerBanner({ go }: { go?: (s: Screen) => void }) {
  return (
    <section className="py-12 sm:py-18 lg:py-24 bg-[#0F1115] text-white overflow-hidden relative border-b border-[#1E2229]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column: Copy & Benefit Pillars with motion */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-3 sm:mb-4">
              Drive customer footfall<br />
              <span className="text-[#E7C9BA] italic">&amp; monetise alteration capacity.</span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-white/70 leading-relaxed max-w-[560px] mb-6 sm:mb-8">
              Join the Raffu Partner Network. We allocate local paid alteration customers to your store for fittings and collections, while driving high-margin in-store retail sales.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-6 sm:mb-8">
              <motion.div
                whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                transition={{ duration: 0.2 }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 transition-colors"
              >
                <div className="size-8 rounded-lg bg-[#9E593B]/20 text-[#E7C9BA] grid place-items-center mb-2.5">
                  <Banknote size={16} />
                </div>
                <h4 className="text-xs font-bold text-white">Direct Customer Payments</h4>
                <p className="text-[11px] text-white/60 mt-1">Customers pay your studio directly upon fitting or pickup. Zero commission withholding.</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                transition={{ duration: 0.2 }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 transition-colors"
              >
                <div className="size-8 rounded-lg bg-[#10B981]/20 text-[#10B981] grid place-items-center mb-2.5">
                  <ShoppingBag size={16} />
                </div>
                <h4 className="text-xs font-bold text-white">Retail Conversion</h4>
                <p className="text-[11px] text-white/60 mt-1">Footfall drives merchandise purchases in your shop during fittings.</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                transition={{ duration: 0.2 }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 transition-colors"
              >
                <div className="size-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] grid place-items-center mb-2.5">
                  <Calendar size={16} />
                </div>
                <h4 className="text-xs font-bold text-white">Fill Idle Capacity</h4>
                <p className="text-[11px] text-white/60 mt-1">Control your daily capacity limits and accept/reject orders in real-time.</p>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/for-partners"
                className="flex items-center gap-2 rounded-full bg-white text-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-[#FAF8F5] active:scale-95 group"
              >
                <span>Apply as Partner Store</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href={STUDIO_BASE_URL || '/for-partners'}
                className="rounded-full border border-white/20 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                Partner Store Portal
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Visual Card with motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 w-full"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-4 sm:p-6 shadow-2xl">
              <div className="relative h-48 sm:h-60 lg:h-64 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-5">
                <Image
                  src="/images/seam_press.jpg"
                  alt="Precision seam pressing"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-white/70">Alteration Earnings</span>
                  <span className="text-sm font-bold text-white">Direct studio payout</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-white/70">In-Store Footfall</span>
                  <span className="text-xs font-bold text-[#10B981]">High-intent local clients</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <CheckCircle2 size={13} className="text-[#10B981] shrink-0" />
                  <span>Integrated with Partner Store Portal &amp; automated order tracking</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
