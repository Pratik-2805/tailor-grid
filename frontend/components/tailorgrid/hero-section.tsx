'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  ChevronDown,
  Clock,
  MapPin,
  Scissors,
  Sparkles,
  Zap,
} from 'lucide-react'
import { GARMENT_CATEGORIES, type Screen } from './data'

interface HeroSectionProps {
  go: (s: Screen) => void
  onQuickSearch?: (postcode: string, garmentId: string) => void
}

const COMMON_ALTERATIONS: Record<string, string[]> = {
  trousers: ['Plain Hem Shortening', 'Denim Original Hem', 'Waist Take-in / Let-out', 'Leg Tapering & Slimming'],
  shirts: ['Sleeve Shortening', 'Side Tapering Darts', 'Shoulder Slimming', 'Collar Adjustment'],
  dresses: ['Hem Adjustment', 'Strap & Shoulder Shortening', 'Side Seam Contouring', 'Zipper Replacement'],
  jackets: ['Sleeve Shortening with Buttons', 'Waist Suppression', 'Shoulder Narrowing', 'Center Seam Taper'],
  suits: ['Full 2-Piece Fitting', 'Jacket Sleeves & Waist', 'Trouser Hem & Taper', '3-Piece Formal Fitting'],
  ethnic: ['Lehenga Hem Shortening', 'Blouse Side Fitting & Padding', 'Kurta Sleeve & Length', 'Anarkali Seam Contouring'],
}

const CITIES = [
  'New York, NY (SoHo & Manhattan)',
  'Los Angeles, CA (Beverly Hills)',
  'Brooklyn, NY (Williamsburg)',
  'Chicago, IL (Magnificent Mile)',
]

export function HeroSection({ go, onQuickSearch }: HeroSectionProps) {
  const [selectedGarment, setSelectedGarment] = useState('trousers')
  const [selectedAlteration, setSelectedAlteration] = useState('Plain Hem Shortening')
  const [speed, setSpeed] = useState<'48h' | '24h'>('48h')
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [showCityPicker, setShowCityPicker] = useState(false)

  const handleGarmentChange = (garmentId: string) => {
    setSelectedGarment(garmentId)
    const defaults = COMMON_ALTERATIONS[garmentId] || []
    if (defaults.length > 0) {
      setSelectedAlteration(defaults[0])
    }
  }

  const handleSeePrices = () => {
    onQuickSearch?.(selectedCity.includes('Los Angeles') ? '90210' : '10012', selectedGarment)
    go('booking')
  }

  const alterationOptions = COMMON_ALTERATIONS[selectedGarment] || ['Standard Seam Alteration']

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-10">
        
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Authentic Uber Style Hero Booking Box */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* City Selector (Uber Style: 📍 City, State · Change city) */}
            <div className="relative mb-4">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F1115]">
                <MapPin size={15} className="text-[#0F1115]" />
                <span className="font-bold">{selectedCity.split(' (')[0]}</span>
                <button
                  type="button"
                  onClick={() => setShowCityPicker(!showCityPicker)}
                  className="text-[#9E593B] underline font-bold hover:text-[#0F1115] ml-1 transition-colors"
                >
                  Change city
                </button>
              </div>

              {showCityPicker && (
                <div className="absolute top-7 left-0 z-30 w-72 rounded-2xl bg-white p-2 border border-[#E8E1D5] shadow-xl space-y-1 mt-1">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c)
                        setShowCityPicker(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#0F1115] hover:bg-[#FAF8F5] transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Headline (Uber Style: Go anywhere with Uber -> Alter anything with TailorGrid) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black tracking-tight text-[#0F1115] leading-[1.06] mb-7">
              Alter clothes with TailorGrid
            </h1>

            {/* Uber-Style Clean Connected Input Box */}
            <div className="space-y-4 max-w-[520px] w-full">

              {/* Connected Input Fields (Uber Route Container) */}
              <div className="relative rounded-2xl bg-[#F4EFEA] p-2.5 border border-[#E8E1D5]">
                
                {/* Vertical connecting line */}
                <div className="absolute left-[26px] top-[30px] bottom-[30px] w-[2px] bg-[#0F1115] z-0" />

                {/* Input 1: Category of Clothes (Circle Marker) */}
                <div className="relative z-10 flex items-center bg-white rounded-xl mb-2 border border-[#E8E1D5] focus-within:border-[#0F1115] transition-colors shadow-2xs">
                  <div className="pl-4 pr-3">
                    <span className="block size-2.5 rounded-full bg-[#0F1115]" />
                  </div>
                  <div className="flex-1 py-2 pr-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7E85]">
                      Category of clothes
                    </label>
                    <select
                      value={selectedGarment}
                      onChange={(e) => handleGarmentChange(e.target.value)}
                      className="w-full bg-transparent text-[15px] font-bold text-[#0F1115] focus:outline-none cursor-pointer py-0.5"
                    >
                      {GARMENT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (from ${cat.startingPrice})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Input 2: What needs to be done? (Square Marker) */}
                <div className="relative z-10 flex items-center bg-white rounded-xl border border-[#E8E1D5] focus-within:border-[#0F1115] transition-colors shadow-2xs">
                  <div className="pl-4 pr-3">
                    <span className="block size-2.5 bg-[#0F1115]" />
                  </div>
                  <div className="flex-1 py-2 pr-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7E85]">
                      What needs to be done?
                    </label>
                    <select
                      value={selectedAlteration}
                      onChange={(e) => setSelectedAlteration(e.target.value)}
                      className="w-full bg-transparent text-[15px] font-bold text-[#0F1115] focus:outline-none cursor-pointer py-0.5"
                    >
                      {alterationOptions.map((alt) => (
                        <option key={alt} value={alt}>
                          {alt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Action Buttons & Activity Link (Uber Style) */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleSeePrices}
                  className="rounded-xl bg-[#0F1115] hover:bg-[#9E593B] px-8 py-4 text-base font-extrabold text-white transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  See prices
                </button>

                <button
                  onClick={() => go('how-it-works')}
                  className="text-xs sm:text-sm font-bold text-[#0F1115] hover:text-[#9E593B] underline transition-colors"
                >
                  How 5-minute walk-in fitting works
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT: Clean Tailoring & Clothes Atelier Illustration */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[620px] aspect-[16/10] rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-[#FAF8F5]">
              <Image
                src="/images/about_hero_art.jpg"
                alt="Modern tailoring salon with tailored suit mannequins, garment racks, and craft tools"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
