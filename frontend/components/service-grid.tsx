'use client'

import Image from 'next/image'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { type Screen } from './data'

interface ServiceGridProps {
  go?: (s: Screen) => void
  onSelectGarment?: (garmentId: string) => void
}

const LOOKBOOK_SERVICES = [
  {
    id: 'trousers',
    num: '01',
    category: 'Denim & Trousers',
    title: 'Trousers & Jeans',
    desc: 'Shorten length with original faded hem kept, waist in or out, and tailored leg tapering.',
    specialties: ['Original Hem Kept', 'Waist & Seat', 'Leg Tapering'],
    turnaround: '24h Express',
    garmentId: 'trousers',
    image: '/images/service_trousers.jpg',
  },
  {
    id: 'shirts',
    num: '02',
    category: 'Tops & Blouses',
    title: 'Shirts & Tops',
    desc: 'Sleeve shortening with cuffs reset, side body slimming, back darts, and collar adjustments.',
    specialties: ['Sleeve Shorten', 'Body Slimming', 'Back Darts'],
    turnaround: '24h Express',
    garmentId: 'shirts',
    image: '/images/service_shirt.jpg',
  },
  {
    id: 'dresses',
    num: '03',
    category: 'Occasion & Daywear',
    title: 'Dresses & Gowns',
    desc: 'Precision hemline adjustment, delicate strap shortening, bust & waist reshaping, and zip repairs.',
    specialties: ['Hem (Plain/Rolled)', 'Bust & Waist', 'Strap Fit'],
    turnaround: '24h Express',
    garmentId: 'dresses',
    image: '/images/service_dress.jpg',
  },
  {
    id: 'jackets',
    num: '04',
    category: 'Tailored Outerwear',
    title: 'Jackets & Blazers',
    desc: 'Sleeve shortening with surgeon buttons, waist suppression, shoulder resets, and lining mending.',
    specialties: ['Sleeve Shorten', 'Waist Suppression', 'Shoulder Reset'],
    turnaround: '48h Atelier',
    garmentId: 'jackets',
    image: '/images/service_jacket.jpg',
  },
  {
    id: 'suits',
    num: '05',
    category: 'Suits & Formal',
    title: 'Suits & Formalwear',
    desc: 'Complete 2-piece and 3-piece bespoke tailoring for weddings, black-tie events, and business suiting.',
    specialties: ['Full 2/3-Piece Fit', 'Lapel & Chest', 'Trouser Pairing'],
    turnaround: '48h Atelier',
    garmentId: 'suits',
    image: '/images/service_suit.jpg',
  },
  {
    id: 'ethnic',
    num: '06',
    category: 'Artisan & Occasion',
    title: 'Ethnic & Occasion Wear',
    desc: 'Specialist care for bridal lehengas, custom blouse padding, necklines, kurtas, and delicate zari fabrics.',
    specialties: ['Lehenga & Blouse', 'Kurta & Sherwani', 'Delicate Zari Care'],
    turnaround: '48h Specialist',
    garmentId: 'ethnic',
    image: '/images/service_ethnic.jpg',
  },
]

export function ServiceGrid({ go, onSelectGarment }: ServiceGridProps = {}) {
  const handleCardClick = (garmentId: string) => {
    onSelectGarment?.(garmentId)
    go?.('book')
  }

  return (
    <section className="py-10 sm:py-14 lg:py-18 bg-[#FAF8F5] border-b border-[#E8E1D5] overflow-hidden">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header with smooth entrance */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-9 sm:mb-12"
        >
          <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-2.5 inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={12} className="text-[#9E593B]" />
            The Alterations Catalogue
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#0F1115] tracking-tight leading-tight">
            Tailored to perfection, piece by piece.
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
            Everyday staples to occasionwear. Choose a garment to explore common alterations, fixed transparent pricing, and instant studio booking.
          </p>
        </motion.div>

        {/* Editorial Fashion Lookbook Grid — Compact & Sleek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {LOOKBOOK_SERVICES.map((svc, idx) => (
            <motion.div
              key={svc.id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: idx * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(svc.garmentId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCardClick(svc.garmentId)
                }
              }}
              className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] overflow-hidden transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(15,17,21,0.08)] hover:border-[#9E593B]/50 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#9E593B]/30"
            >
              {/* Product Visual Showcase Frame (Compact height) */}
              <div className="relative h-44 sm:h-48 w-full bg-gradient-to-b from-[#F5EFE7]/70 via-[#FAF8F5] to-white overflow-hidden border-b border-[#F0ECE4]">
                {/* Floating Category Number Tag */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase text-[#0F1115] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#E8E1D5] shadow-2xs">
                    {svc.num} • {svc.category}
                  </span>
                </div>

                {/* Floating Turnaround Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0F1115] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#E8E1D5] shadow-2xs">
                    <span className="size-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    {svc.turnaround}
                  </span>
                </div>

                {/* Garment Image with zoom animation */}
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  className="object-contain p-3.5 group-hover:scale-108 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Card Body & Details (Tight & Refined) */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0F1115] group-hover:text-[#9E593B] tracking-tight transition-colors mb-1.5">
                    {svc.title}
                  </h3>

                  <p className="text-xs text-[#5A5D64] leading-relaxed mb-3 line-clamp-2">
                    {svc.desc}
                  </p>

                  {/* Curated Service Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {svc.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center text-[10px] sm:text-[10.5px] font-medium text-[#4B5563] bg-[#FAF8F5] border border-[#EBE5DC] rounded-md px-2 py-0.5 group-hover:border-[#9E593B]/30 transition-colors"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Guarantee and Action Arrow */}
                <div className="pt-3 border-t border-[#F3EFEA] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-medium text-[11px]">
                    <CheckCircle2 size={13} />
                    <span className="text-[#5A5D64]">100% Fit Guarantee</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F1115] group-hover:text-[#9E593B] transition-colors">
                    <span>Book Alteration</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
