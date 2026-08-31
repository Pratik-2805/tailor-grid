'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Check, MapPin, Scissors, Star } from 'lucide-react'
import { PARTNER_STORES, type Screen, type StoreOption } from './data'
import { fetchStores } from '@/lib/api'

interface StudiosPreviewProps {
  go: (s: Screen) => void
  onSelectStore?: (store: StoreOption) => void
}

export function StudiosPreview({ go, onSelectStore }: StudiosPreviewProps) {
  const [stores, setStores] = useState<StoreOption[]>(PARTNER_STORES)

  useEffect(() => {
    fetchStores().then((st) => {
      if (st && st.length > 0) setStores(st)
    }).catch(() => {})
  }, [])

  return (
    <section className="py-16 sm:py-24 bg-[#F4EFEA] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="pill-badge bg-white text-[#9E593B] border border-[#E8E1D5] mb-3">
              Verified Atelier Network
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F1115] tracking-tight">
              {stores.length} certified neighbourhood studios.
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64] max-w-[500px]">
              Every atelier in our network is audited for master craftsmanship, industrial overlock machinery, and fitting comfort.
            </p>
          </div>
          <button
            onClick={() => go('for-partners')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start"
          >
            Join as a Partner Atelier <ArrowRight size={13} />
          </button>
        </div>

        {/* Studios Grid (Uber/Rapido style cards) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((store, i) => (
            <div
              key={store.id}
              className="group flex flex-col justify-between bg-white rounded-3xl overflow-hidden border border-[#E5E7EB] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-[#D1D5DB]"
            >
              {/* Studio Thumbnail */}
              <div className="relative h-44 overflow-hidden bg-[#E5E7EB]">
                <Image
                  src={i % 2 === 0 ? '/images/atelier_studio.jpg' : '/images/garments_rack.jpg'}
                  alt={store.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Distance pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#0F1115] shadow-xs">
                  <MapPin size={11} className="text-[#9E593B]" />
                  <span>{store.distance}</span>
                </div>

                {/* Status pill */}
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#065F46]">
                  <span className="size-1.5 rounded-full bg-[#10B981]" />
                  Open
                </div>
              </div>

              {/* Info Container */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif text-base font-bold text-[#0F1115] leading-snug">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#0F1115] shrink-0">
                    <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{store.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] mb-3">{store.area} · Lead: {store.leadTailor}</p>

                {/* Specialties Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                  {store.specialties.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-[#FAF8F5] border border-[#EBE6DF] px-2 py-0.5 text-[10px] font-semibold text-[#4B5563]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    onSelectStore?.(store)
                    go('booking')
                  }}
                  className="w-full rounded-2xl bg-[#FAF8F5] hover:bg-[#0F1115] hover:text-white border border-[#EBE6DF] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0F1115] transition-all active:scale-95"
                >
                  Book This Atelier
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

