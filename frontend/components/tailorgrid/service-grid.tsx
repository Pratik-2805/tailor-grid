'use client'

import Image from 'next/image'
import { ArrowRight, Clock, Sparkles, Zap } from 'lucide-react'
import { type Screen } from './data'

interface ServiceGridProps {
  go: (s: Screen) => void
  onSelectGarment?: (garmentId: string) => void
}

const MVP_SERVICES = [
  {
    id: 'trousers',
    title: 'Trousers & Jeans',
    desc: 'Plain hem, original denim chainstitch, waist take-in / let-out & leg tapering.',
    turnaround: '24h / 48h Service',
    price: 'From $20',
    garmentId: 'trousers',
    image: '/images/service_trousers.jpg',
  },
  {
    id: 'shirts',
    title: 'Shirts & Tops',
    desc: 'Sleeve shortening, side tapering darts, shoulder adjustment & collar refitting.',
    turnaround: '24h / 48h Service',
    price: 'From $22',
    garmentId: 'shirts',
    image: '/images/service_shirt.jpg',
  },
  {
    id: 'dresses',
    title: 'Dresses & Gowns',
    desc: 'Hem adjustment, strap & shoulder shortening, side seam contouring & zipper repair.',
    turnaround: '24h / 48h Service',
    price: 'From $24',
    garmentId: 'dresses',
    image: '/images/service_dress.jpg',
  },
  {
    id: 'jackets',
    title: 'Jackets & Blazers',
    desc: 'Sleeve shortening with buttons, center seam taper & waist suppression.',
    turnaround: '24h / 48h Service',
    price: 'From $45',
    garmentId: 'jackets',
    image: '/images/service_jacket.jpg',
  },
  {
    id: 'suits',
    title: 'Suits & Formalwear',
    desc: 'Complete 2-piece & 3-piece bespoke tailored fitting for weddings & business.',
    turnaround: '48h Standard Service',
    price: 'From $68',
    garmentId: 'suits',
    image: '/images/service_suit.jpg',
  },
  {
    id: 'ethnic',
    title: 'Ethnic & Occasion Wear',
    desc: 'Blouse padding & fitting, lehenga shortening & delicate silk alterations.',
    turnaround: '48h Standard Service',
    price: 'From $38',
    garmentId: 'ethnic',
    image: '/images/service_ethnic.jpg',
  },
]

export function ServiceGrid({ go, onSelectGarment }: ServiceGridProps) {
  const handleSelect = (garmentId: string) => {
    onSelectGarment?.(garmentId)
    go('booking')
  }

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Uber Style: Explore what you can do with Uber) */}
        <div className="mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0F1115] tracking-tight">
            Explore what you can do with Darzi
          </h2>
          <p className="mt-2 text-sm text-[#5A5D64]">
            Standardized alteration services across all garments with guaranteed 24h &amp; 48h turnaround speeds.
          </p>
        </div>

        {/* 6 Clean Category Cards (Matching Uber Grid from Screenshot 2) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MVP_SERVICES.map((svc) => (
            <div
              key={svc.id}
              onClick={() => handleSelect(svc.garmentId)}
              className="group flex flex-col justify-between rounded-3xl p-6 bg-white hover:bg-[#F4EFEA] border border-[#E8E1D5] hover:border-[#0F1115] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-[#0F1115] mb-1.5">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-[#5A5D64] leading-relaxed line-clamp-3">
                    {svc.desc}
                  </p>
                </div>

                {/* Right Product Graphic */}
                <div className="relative size-20 sm:size-24 shrink-0 rounded-2xl overflow-hidden bg-white border border-[#E8E1D5] shadow-xs group-hover:scale-105 transition-transform">
                  <Image
                    src={svc.image}
                    alt={svc.title}
                    fill
                    className="object-contain p-1.5"
                    sizes="100px"
                  />
                </div>
              </div>

              {/* Bottom Card Footer with Details Pill Button */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5]">
                <span className="text-xs font-bold text-[#0F1115]">{svc.price} · {svc.turnaround.split(' ')[0]}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(svc.garmentId)
                  }}
                  className="rounded-full bg-[#FAF8F5] group-hover:bg-[#0F1115] group-hover:text-white border border-[#E8E1D5] group-hover:border-[#0F1115] px-4 py-1.5 text-xs font-bold text-[#0F1115] transition-all shadow-2xs"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
