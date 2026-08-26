'use client'

import Image from 'next/image'
import { CheckCircle2, Star } from 'lucide-react'
import { TESTIMONIALS } from './data'

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-[580px] mx-auto mb-12">
          <span className="pill-badge bg-white text-[#9E593B] border border-[#E5E7EB] mb-3">
            Customer Reviews
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115] tracking-tight">
            Loved by 15,000+ conscious dressers.
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Real reviews from customers who saved time and gave their favorite clothes a second life.
          </p>
        </div>

        {/* Testimonials Grid (Uber/Rapido style cards) */}
        <div className="grid gap-5 md:grid-cols-3 mb-14">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="flex flex-col justify-between bg-white rounded-3xl p-6 border border-[#E5E7EB] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-[#D1D5DB]"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                  <span className="text-xs font-bold text-[#0F1115] ml-1">5.0</span>
                </div>

                <p className="text-sm leading-relaxed text-[#374151] italic font-serif">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#0F1115]">{t.author}</h4>
                  <p className="text-[11px] text-[#6B7280]">{t.role}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#0F1115] block">{t.garment}</span>
                  <span className="text-[10px] text-[#9E593B] font-medium">{t.store}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Guarantee Banner */}
        <div className="relative overflow-hidden rounded-3xl h-64 sm:h-72 border border-[#E5E7EB]">
          <Image
            src="/images/fabric_pins.jpg"
            alt="Artisan sewing table"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/90 via-[#0F1115]/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 sm:px-12 text-white">
            <div className="max-w-[500px]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#F59E0B] block mb-2">
                Craftsmanship Standard
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
                Every seam, thread &amp; hem matters.
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-2 mb-4">
                We inspect every garment against rigorous tailoring standards before dispatch.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-[#E7C9BA]">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> OEM Thread Match</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Chainstitch Hem</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Hand-Finished Blind Hem</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

