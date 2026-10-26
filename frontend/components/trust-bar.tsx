'use client'

import { Clock, Leaf, Scissors, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'

export function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: 'Audited Craft Standards', desc: 'Certified machinery calibration & seam quality' },
    { icon: Scissors,    title: 'Verified Master Tailors', desc: 'Audited machinery & experienced artisan craft' },
    { icon: Clock,       title: '24h & 48h Turnaround',  desc: 'Rapid return with live status tracking' },
    { icon: ShieldCheck, title: '100% Fit Guarantee',     desc: 'Free complimentary re-fit if needed' },
    { icon: Leaf,        title: 'Circular & Local',       desc: 'Zero shipping waste, hyper-local ateliers' },
  ]

  return (
    <section className="py-3 sm:py-4 lg:py-5 bg-[#F4EFEA] border-y border-[#E8E1D5] w-full shrink-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex lg:grid lg:grid-cols-5 overflow-x-auto lg:overflow-visible scrollbar-none gap-3 sm:gap-4 lg:gap-6 py-0.5">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.07, ease: 'easeOut' }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="shrink-0 min-w-[200px] lg:min-w-0 flex items-center gap-2.5 p-1.5 lg:p-1 bg-white/40 lg:bg-transparent rounded-xl lg:rounded-none border border-[#E8E1D5]/40 lg:border-0 cursor-default"
              >
                <div className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-[#0F1115] text-white shadow-xs">
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F1115] leading-tight truncate">{item.title}</p>
                  <p className="text-[10.5px] text-[#6B7280] mt-0.5 leading-snug line-clamp-1">{item.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
