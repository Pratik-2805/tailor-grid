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
  const [stores, setStores] = useState<StoreOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStores()
      .then((st) => {
        if (st) setStores(st)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
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
              {stores.length > 0
                ? `${stores.length} certified neighbourhood studios.`
                : 'Certified Neighbourhood Studios'}
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64] max-w-[500px]">
              Every atelier in our network is audited for master craftsmanship, industrial overlock machinery, and fitting comfort.
            </p>
          </div>
          <button
            onClick={() => go('for-partners')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E593B] hover:text-[#0F1115] transition-colors self-start cursor-pointer"
          >
            Join as a Partner Atelier <ArrowRight size={13} />
          </button>
        </div>

        {/* Studios Grid (Uber/Rapido style cards) */}
        {stores.length > 0 ? (
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
                    <span>{store.distance || `${store.distanceMiles || 0.5} mi away`}</span>
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
                    {(store.specialties || []).slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-[#FAF8F5] border border-[#EBE6DF] px-2 py-0.5 text-[10px] font-semibold text-[#4B5563]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => {
                      if (onSelectStore) onSelectStore(store)
                      go('confirm-measurement')
                    }}
                    className="w-full rounded-2xl bg-[#FAF8F5] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0F1115] border border-[#E8E1D5] transition-all hover:bg-[#0F1115] hover:text-white hover:border-[#0F1115] active:scale-98 cursor-pointer"
                  >
                    Book This Atelier
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#DDD6CB] bg-white p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="size-12 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] grid place-items-center mx-auto text-[#9E593B]">
              <Scissors size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0F1115]">Partner Atelier Network Expanding</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                New master tailor workshops and alteration studios are added upon completing our 10-point craftsmanship audit.
              </p>
            </div>
            <button
              onClick={() => go('for-partners')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F1115] text-white text-xs font-bold hover:bg-[#9E593B] transition-colors cursor-pointer"
            >
              <span>Register Your Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
