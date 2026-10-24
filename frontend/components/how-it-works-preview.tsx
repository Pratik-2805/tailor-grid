'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, MapPin, Scissors, ShieldCheck, Store } from 'lucide-react'
import { motion } from 'motion/react'
import { type Screen } from './data'
import { useApp } from './app-provider'

export function HowItWorksPreview({ go }: { go: (s: Screen) => void }) {
  const { user } = useApp()
  const isCustomer = Boolean(user && user.role === 'CUSTOMER')

  const steps = [
    {
      n: '01',
      title: 'Choose Garment & Service',
      desc: 'Select your item and see fixed, transparent pricing upfront. No hidden counter haggling.',
      icon: Scissors,
      time: 'Instant Online',
      milestone: 'Fixed upfront pricing',
    },
    {
      n: '02',
      title: 'Studio Allocation',
      desc: 'Our network instantly matches you with your closest certified neighborhood atelier.',
      icon: Store,
      time: 'In Minutes',
      milestone: 'Verified local atelier',
    },
    {
      n: '03',
      title: 'In-Person Master Fitting',
      desc: 'Hand your clothes directly to your master tailor, who pins and fits everything in person.',
      icon: MapPin,
      time: 'Drop-off or Pickup',
      milestone: 'Tailor measures in person',
    },
    {
      n: '04',
      title: 'Wear with Confidence',
      desc: 'Collect your finished garments within 48 hours, protected by our 100% Free Re-fit Guarantee.',
      icon: ShieldCheck,
      time: '24h – 48h Return',
      milestone: '100% Free Re-fit Guarantee',
    },
  ]

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-[#F4EFEA] border-b border-[#E8E1D5] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16"
        >
          <div>
            <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-3 inline-flex items-center gap-1.5 shadow-2xs">
              Simple 4-Step Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0F1115] tracking-tight">
              How the Alteration Network Works
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#5A5D64] max-w-[540px] leading-relaxed">
              Simple, transparent, and hyper-local. We connect you with vetted neighborhood partner tailors in minutes.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start group"
          >
            <span>Full Journey Guide</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>

        {/* Clean Step Journey with proper inter-step connectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-14 sm:mb-20">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLast = idx === steps.length - 1

            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col justify-between"
              >
                <div>
                  {/* Step Header: Icon + Number + Connecting Line to Next Step */}
                  <div className="relative flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="size-13 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs flex items-center justify-center text-[#0F1115] group-hover:bg-[#0F1115] group-hover:text-white group-hover:border-[#0F1115] transition-all duration-300">
                        <Icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div>
                        <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#9E593B] leading-none">
                          {step.n}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-[#8C8F96] mt-0.5">
                          {step.time}
                        </span>
                      </div>
                    </div>

                    {/* Proper connector line that only goes between steps and stops at step 4 */}
                    {!isLast && (
                      <div className="hidden lg:flex items-center flex-1 ml-4 mr-2">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#9E593B]/40 to-[#9E593B]/20" />
                        <ArrowRight size={13} className="-ml-1 text-[#9E593B]/60 shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Step Title & Explanation */}
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0F1115] mb-2 leading-snug group-hover:text-[#9E593B] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                {/* Specific Step Milestone */}
                <div className="pt-3 border-t border-[#E8E1D5]/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span className="text-[#0F1115]">{step.milestone}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* High Conversion Store Pass Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl bg-[#0F1115] text-white p-7 sm:p-10 lg:p-12 shadow-xl"
        >
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
                className="flex items-center gap-2 rounded-full bg-white text-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:bg-[#FAF8F5] active:scale-95 group"
              >
                <span>Book Fitting Pass</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
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
        </motion.div>

      </div>
    </section>
  )
}
