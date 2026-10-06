'use client'

import Image from 'next/image'
import { type Screen } from './data'

interface ServiceGridProps {
  go?: (s: Screen) => void
  onSelectGarment?: (garmentId: string) => void
}

const MVP_SERVICES = [
  {
    id: 'trousers',
    title: 'Trousers & Jeans',
    desc: 'Shorten length, preserve distressed original hem, adjust waist & taper leg silhouette.',
    tags: ['Original Hem', 'Waist & Rise', 'Leg Taper', 'Zip Replace'],
    turnaround: '24h Express / 48h Std',
    garmentId: 'trousers',
    image: '/images/service_trousers.jpg',
  },
  {
    id: 'shirts',
    title: 'Shirts & Tops',
    desc: 'Shorten sleeves with reset plackets, slim body sides, insert back darts & adjust collar.',
    tags: ['Sleeve Shorten', 'Body Slimming', 'Back Darts', 'Collar & Cuffs'],
    turnaround: '24h Express / 48h Std',
    garmentId: 'shirts',
    image: '/images/service_shirt.jpg',
  },
  {
    id: 'dresses',
    title: 'Dresses & Gowns',
    desc: 'Precision hemline adjustment, shorten delicate straps, bust & waist taking in & zippers.',
    tags: ['Hem (Plain/Rolled)', 'Bust & Waist', 'Strap Adjustment', 'Invisible Zips'],
    turnaround: '24h Express / 48h Std',
    garmentId: 'dresses',
    image: '/images/service_dress.jpg',
  },
  {
    id: 'jackets',
    title: 'Jackets & Blazers',
    desc: 'Tailor sleeve length with surgeon buttons, suppress waist profile & reshape shoulders.',
    tags: ['Sleeve Shorten', 'Waist Suppression', 'Shoulder Reset', 'Lining Repair'],
    turnaround: '48h Precision Atelier',
    garmentId: 'jackets',
    image: '/images/service_jacket.jpg',
  },
  {
    id: 'suits',
    title: 'Suits & Formalwear',
    desc: 'Complete 2-piece and 3-piece custom alterations for weddings, galas & business suiting.',
    tags: ['Full 2/3-Piece Fit', 'Trousers & Jacket Pairing', 'Lapel Styling', 'Bespoke Fit'],
    turnaround: '48h Master Craft',
    garmentId: 'suits',
    image: '/images/service_suit.jpg',
  },
  {
    id: 'ethnic',
    title: 'Ethnic & Occasion Wear',
    desc: 'Delicate care for bridal lehengas, custom blouse pads, necklines, kurtas & sherwanis.',
    tags: ['Blouse Padding & Fit', 'Lehenga Hem & Waist', 'Kurta & Sherwani', 'Delicate Zari Care'],
    turnaround: '48h Artisan Specialist',
    garmentId: 'ethnic',
    image: '/images/service_ethnic.jpg',
  },
]

export function ServiceGrid({ go, onSelectGarment }: ServiceGridProps = {}) {
  return (
    <section className="min-h-[calc(100vh-68px)] min-h-[calc(100dvh-68px)] flex flex-col justify-center py-10 sm:py-12 lg:py-14 bg-[#FAF8F5] border-b border-[#E8E1D5]">
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0F1115] tracking-tight">
            Explore what you can do with Darzi
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#5A5D64] max-w-2xl">
            Standardized alteration services across all garments with guaranteed 24h &amp; 48h turnaround speeds.
          </p>
        </div>

        {/* 6 Clean Category Cards with tags & turnaround */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {MVP_SERVICES.map((svc) => (
            <div
              key={svc.id}
              className="group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 bg-white border border-[#E8E1D5] hover:border-[#9E593B]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out cursor-default"
            >
              {/* Top: Title & Description + Image */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0 pr-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1115] group-hover:text-[#9E593B] mb-1.5 tracking-tight transition-colors duration-300">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-[#5A5D64] leading-relaxed line-clamp-2">
                      {svc.desc}
                    </p>
                  </div>

                  {/* Right Product Graphic with hover zoom */}
                  <div className="relative size-18 sm:size-20 shrink-0 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E1D5] group-hover:border-[#9E593B]/30 group-hover:bg-[#F5EFE8] shadow-xs transition-colors duration-300">
                    <Image
                      src={svc.image}
                      alt={svc.title}
                      fill
                      className="object-contain p-2 group-hover:scale-108 transition-transform duration-300 ease-out"
                      sizes="(max-width: 768px) 72px, 80px"
                    />
                  </div>
                </div>

                {/* Service Highlights / Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {svc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-[#5A5D64] bg-[#FAF8F5] border border-[#EBE5DC] rounded-lg px-2.5 py-0.5 group-hover:border-[#DFD5C7] transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Turnaround & Fit Guarantee */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F3EFEA] text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 text-[#5A5D64]">
                  <span className="inline-block size-1.5 rounded-full bg-[#10B981]"></span>
                  <span className="font-medium">{svc.turnaround}</span>
                </div>
                <div className="flex items-center gap-1 text-[#8C8F96] text-[11px] font-medium">
                  <span>✨ 100% Fit Guarantee</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
