'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
  Scissors,
  ShieldCheck,
  Star,
  Store
} from 'lucide-react'
import { GARMENT_CATEGORIES, type Screen } from './data'

interface HeroSectionProps {
  go: (s: Screen) => void
  onQuickSearch?: (postcode: string, garmentId: string) => void
}

export function HeroSection({ go, onQuickSearch }: HeroSectionProps) {
  const [postcode, setPostcode] = useState('W8 4EP')
  const [selectedGarment, setSelectedGarment] = useState('trousers')

  const handleFindNearest = () => {
    onQuickSearch?.(postcode || 'W8 4EP', selectedGarment)
    go('booking')
  }

  const handleUseLocation = () => {
    setPostcode('W1K 7JA (Mayfair)')
  }

  return (
    <section className="relative overflow-hidden bg-[#F8F9FD] pt-10 pb-16 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Rapido / Uber Style Headline & Quick Booking Card */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#0F1115] leading-[1.12]">
              Your Clothes,<br />
              <span className="text-[#0F1115]">Altered to Perfection.</span>
            </h1>
            
            <p className="mt-3.5 text-base sm:text-lg text-[#4B5563] font-normal">
              Fixed upfront prices · 5-minute store fitting · Ready in 48 hours
            </p>

            {/* Rapido-Style Floating Booking Box */}
            <div className="mt-8 bg-white rounded-3xl p-5 sm:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.06)] border border-[#E5E7EB] max-w-[500px]">
              
              <div className="space-y-3.5">
                {/* Input 1: Location */}
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#0F1115]">
                    <MapPin size={18} className="text-[#0F1115]" />
                  </div>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Enter Postcode / Location"
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] pl-11 pr-24 py-3.5 text-[15px] font-medium text-[#0F1115] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleUseLocation}
                    type="button"
                    className="absolute right-2.5 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0F1115] hover:bg-[#F3F4F6] transition-colors"
                  >
                    <Navigation size={12} className="text-[#F59E0B]" />
                    Locate
                  </button>
                </div>

                {/* Input 2: Garment Category Selector */}
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#0F1115]">
                    <Scissors size={18} className="text-[#0F1115]" />
                  </div>
                  <select
                    value={selectedGarment}
                    onChange={(e) => setSelectedGarment(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] pl-11 pr-10 py-3.5 text-[15px] font-medium text-[#0F1115] focus:bg-white focus:border-[#0F1115] focus:outline-none transition-colors cursor-pointer"
                  >
                    {GARMENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (Fixed from £{cat.startingPrice})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none text-[#6B7280]">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Quick Area Tags */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none">
                <span className="text-xs text-[#9CA3AF] shrink-0">Popular:</span>
                {['Kensington', 'Mayfair', 'Soho', 'Chelsea', 'Shoreditch'].map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setPostcode(area)}
                    className="rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] px-2.5 py-0.5 text-xs font-medium text-[#4B5563] shrink-0 transition-colors"
                  >
                    {area}
                  </button>
                ))}
              </div>

              {/* Themed Action Button */}
              <button
                onClick={handleFindNearest}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0F1115] hover:bg-[#9E593B] py-4 text-base font-bold tracking-wide text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Find Nearest Store</span>
                <ArrowRight size={18} />
              </button>

              <div className="mt-3.5 flex items-center justify-between text-xs text-[#6B7280]">
                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-[#10B981]" /> 100% Free Re-fit</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-[#0F1115]" /> 48h Turnaround</span>
                <span className="flex items-center gap-1"><Store size={14} className="text-[#0F1115]" /> Partner Network</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Clean Hero Image Frame */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            <div className="relative w-full max-w-[560px] h-[360px] sm:h-[420px] lg:h-[460px]">
              
              {/* Organic Cutout Image Container */}
              <div className="absolute inset-0 rounded-[36px] overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/craft_fitting.jpg"
                  alt="Master tailor fitting clothes at partner atelier"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/75 via-transparent to-transparent" />
                
                {/* Bottom Overlay Label */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#E7C9BA] block mb-1">
                    Verified Partner Atelier Network
                  </span>
                  <p className="font-serif text-lg sm:text-xl font-bold leading-tight">
                    Walk in for a 5-minute precision fitting at your nearest store.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}



