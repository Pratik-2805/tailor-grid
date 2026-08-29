'use client'

import { Clock, Leaf, Scissors, ShieldCheck, Star } from 'lucide-react'

export function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: 'Audited Craft Standards', desc: 'Certified machinery calibration & seam quality' },
    { icon: Scissors,    title: 'Savile Row Artisans',    desc: 'Audited master tailors with 5+ yrs craft' },
    { icon: Clock,       title: '24h & 48h Turnaround',  desc: 'Rapid return with live status tracking' },
    { icon: Star,        title: '4.96 / 5.0 Rating',      desc: 'Across 15,000+ tailored garments' },
    { icon: Leaf,        title: 'Circular & Local',       desc: 'Zero shipping waste, hyper-local ateliers' },
  ]

  return (
    <section className="py-4 sm:py-5 bg-[#F4EFEA] border-y border-[#E8E1D5] w-full shrink-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-2.5 p-1">
                <div className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-[#0F1115] text-white shadow-xs">
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F1115] leading-tight truncate">{item.title}</p>
                  <p className="text-[10.5px] text-[#6B7280] mt-0.5 leading-snug truncate">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

