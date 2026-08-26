'use client'

import Image from 'next/image'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'
import { type Screen } from './data'

interface ServiceGridProps {
  go: (s: Screen) => void
  onSelectGarment?: (garmentId: string) => void
}

const MVP_SERVICES = [
  {
    id: 'trousers',
    title: 'Trousers & Jeans',
    tagline: 'Plain hem, original jean hem & waist adjustment',
    turnaround: '2 days',
    price: 'From £20',
    popular: true,
    garmentId: 'trousers',
    image: '/images/service_trousers.jpg',
  },
  {
    id: 'shirts',
    title: 'Shirts & Tops',
    tagline: 'Sleeve shortening, side tapering & collar adjust',
    turnaround: '2 days',
    price: 'From £18',
    popular: false,
    garmentId: 'shirts',
    image: '/images/service_shirt.jpg',
  },
  {
    id: 'dresses',
    title: 'Dresses & Gowns',
    tagline: 'Hem adjustment, strap shortening & side contouring',
    turnaround: '3 days',
    price: 'From £28',
    popular: true,
    garmentId: 'dresses',
    image: '/images/service_dress.jpg',
  },
  {
    id: 'jackets',
    title: 'Jackets & Blazers',
    tagline: 'Sleeve shortening with buttons & waist suppression',
    turnaround: '3 days',
    price: 'From £35',
    popular: false,
    garmentId: 'jackets',
    image: '/images/service_jacket.jpg',
  },
  {
    id: 'suits',
    title: 'Suits & Formalwear',
    tagline: 'Complete 2-piece & 3-piece tailored fitting',
    turnaround: '3 days',
    price: 'From £45',
    popular: false,
    garmentId: 'suits',
    image: '/images/service_suit.jpg',
  },
  {
    id: 'ethnic',
    title: 'Ethnic & Occasion Wear',
    tagline: 'Blouse padding, lehenga shortening & sherwani fit',
    turnaround: '4 days',
    price: 'From £32',
    popular: false,
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
    <section className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Rapido Yellow Accent Bar */}
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
            Our Services
          </h2>
          <div className="h-1.5 w-16 bg-[#F9C933] mt-2.5 rounded-full" />
        </div>

        {/* 6 Clean Category Cards (Rapido style with product images on the right) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MVP_SERVICES.map((svc) => (
            <div
              key={svc.id}
              onClick={() => handleSelect(svc.garmentId)}
              className="group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 bg-[#F8F9FD] hover:bg-white border border-[#E5E7EB] hover:border-[#0F1115] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg overflow-hidden"
            >
              {/* Popular badge */}
              {svc.popular && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-[#0F1115] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                  <Sparkles size={9} className="text-[#F9C933]" />
                  Popular
                </div>
              )}

              {/* Main row: Text on left, Image on right (Rapido layout) */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="text-[17px] font-extrabold text-[#0F1115] leading-snug group-hover:text-[#0F1115]">
                    {svc.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] mt-1">
                    <Clock size={12} />
                    <span>{svc.turnaround}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed mt-2 line-clamp-2">
                    {svc.tagline}
                  </p>
                </div>

                {/* Right Product Image */}
                <div className="relative size-20 sm:size-24 shrink-0 rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-xs group-hover:scale-105 transition-transform">
                  <Image
                    src={svc.image}
                    alt={svc.title}
                    fill
                    className="object-contain p-1"
                    sizes="100px"
                  />
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between pt-3.5 border-t border-[#E5E7EB]/70 mt-auto">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider block">Standardized Rate</span>
                  <span className="text-base font-extrabold text-[#0F1115]">{svc.price}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(svc.garmentId)
                  }}
                  className="flex items-center gap-1 rounded-xl bg-white group-hover:bg-[#F9C933] group-hover:text-[#0F1115] border border-[#E5E7EB] group-hover:border-[#F9C933] px-3.5 py-1.5 text-xs font-extrabold text-[#0F1115] transition-all shadow-2xs"
                >
                  <span>Book</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}



