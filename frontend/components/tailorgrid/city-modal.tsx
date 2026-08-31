'use client'

import { useState, useMemo } from 'react'
import { Search, X, Check } from 'lucide-react'

export interface CityItem {
  name: string
  fullName: string
  state: string
  code: string
  popular?: boolean
  flag: string
}

export const US_CITIES: CityItem[] = [
  // Popular US Cities
  { name: 'New York City', fullName: 'New York City, NY', state: 'New York', code: 'NY', popular: true, flag: '🇺🇸' },
  { name: 'Los Angeles', fullName: 'Los Angeles, CA', state: 'California', code: 'CA', popular: true, flag: '🇺🇸' },
  { name: 'Chicago', fullName: 'Chicago, IL', state: 'Illinois', code: 'IL', popular: true, flag: '🇺🇸' },
  { name: 'Houston', fullName: 'Houston, TX', state: 'Texas', code: 'TX', popular: true, flag: '🇺🇸' },
  { name: 'Miami', fullName: 'Miami, FL', state: 'Florida', code: 'FL', popular: true, flag: '🇺🇸' },
  { name: 'San Francisco', fullName: 'San Francisco, CA', state: 'California', code: 'CA', popular: true, flag: '🇺🇸' },
  { name: 'Dallas-Fort Worth', fullName: 'Dallas-Fort Worth, TX', state: 'Texas', code: 'TX', popular: true, flag: '🇺🇸' },
  { name: 'Seattle', fullName: 'Seattle, WA', state: 'Washington', code: 'WA', popular: true, flag: '🇺🇸' },
  { name: 'Washington D.C.', fullName: 'Washington D.C.', state: 'District of Columbia', code: 'DC', popular: true, flag: '🇺🇸' },
  { name: 'Boston', fullName: 'Boston, MA', state: 'Massachusetts', code: 'MA', popular: true, flag: '🇺🇸' },
  { name: 'Austin', fullName: 'Austin, TX', state: 'Texas', code: 'TX', popular: true, flag: '🇺🇸' },
  { name: 'Las Vegas', fullName: 'Las Vegas, NV', state: 'Nevada', code: 'NV', popular: true, flag: '🇺🇸' },

  // United States Cities
  { name: 'Atlanta', fullName: 'Atlanta, GA', state: 'Georgia', code: 'GA', flag: '🇺🇸' },
  { name: 'Baltimore', fullName: 'Baltimore, MD', state: 'Maryland', code: 'MD', flag: '🇺🇸' },
  { name: 'Charlotte', fullName: 'Charlotte, NC', state: 'North Carolina', code: 'NC', flag: '🇺🇸' },
  { name: 'Columbus', fullName: 'Columbus, OH', state: 'Ohio', code: 'OH', flag: '🇺🇸' },
  { name: 'Denver', fullName: 'Denver, CO', state: 'Colorado', code: 'CO', flag: '🇺🇸' },
  { name: 'Detroit', fullName: 'Detroit, MI', state: 'Michigan', code: 'MI', flag: '🇺🇸' },
  { name: 'Indianapolis', fullName: 'Indianapolis, IN', state: 'Indiana', code: 'IN', flag: '🇺🇸' },
  { name: 'Jacksonville', fullName: 'Jacksonville, FL', state: 'Florida', code: 'FL', flag: '🇺🇸' },
  { name: 'Kansas City', fullName: 'Kansas City, MO', state: 'Missouri', code: 'MO', flag: '🇺🇸' },
  { name: 'Memphis', fullName: 'Memphis, TN', state: 'Tennessee', code: 'TN', flag: '🇺🇸' },
  { name: 'Minneapolis', fullName: 'Minneapolis, MN', state: 'Minnesota', code: 'MN', flag: '🇺🇸' },
  { name: 'Nashville', fullName: 'Nashville, TN', state: 'Tennessee', code: 'TN', flag: '🇺🇸' },
  { name: 'New Orleans', fullName: 'New Orleans, LA', state: 'Louisiana', code: 'LA', flag: '🇺🇸' },
  { name: 'Orlando', fullName: 'Orlando, FL', state: 'Florida', code: 'FL', flag: '🇺🇸' },
  { name: 'Philadelphia', fullName: 'Philadelphia, PA', state: 'Pennsylvania', code: 'PA', flag: '🇺🇸' },
  { name: 'Phoenix', fullName: 'Phoenix, AZ', state: 'Arizona', code: 'AZ', flag: '🇺🇸' },
  { name: 'Pittsburgh', fullName: 'Pittsburgh, PA', state: 'Pennsylvania', code: 'PA', flag: '🇺🇸' },
  { name: 'Portland', fullName: 'Portland, OR', state: 'Oregon', code: 'OR', flag: '🇺🇸' },
  { name: 'Raleigh', fullName: 'Raleigh, NC', state: 'North Carolina', code: 'NC', flag: '🇺🇸' },
  { name: 'Sacramento', fullName: 'Sacramento, CA', state: 'California', code: 'CA', flag: '🇺🇸' },
  { name: 'Salt Lake City', fullName: 'Salt Lake City, UT', state: 'Utah', code: 'UT', flag: '🇺🇸' },
  { name: 'San Antonio', fullName: 'San Antonio, TX', state: 'Texas', code: 'TX', flag: '🇺🇸' },
  { name: 'San Diego', fullName: 'San Diego, CA', state: 'California', code: 'CA', flag: '🇺🇸' },
  { name: 'San Jose', fullName: 'San Jose, CA', state: 'California', code: 'CA', flag: '🇺🇸' },
  { name: 'St. Louis', fullName: 'St. Louis, MO', state: 'Missouri', code: 'MO', flag: '🇺🇸' },
  { name: 'Tampa', fullName: 'Tampa, FL', state: 'Florida', code: 'FL', flag: '🇺🇸' },
]

export interface CityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCity: string
  onSelectCity: (formattedCity: string) => void
}

export function CityModal({ isOpen, onClose, selectedCity, onSelectCity }: CityModalProps) {
  const [search, setSearch] = useState('')

  const currentCityDisplayName = useMemo(() => {
    if (!selectedCity) return 'New York City'
    const match = US_CITIES.find(
      (c) => c.fullName === selectedCity || selectedCity.startsWith(c.name)
    )
    return match ? match.name : selectedCity.split(',')[0]
  }, [selectedCity])

  const popularCities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return US_CITIES.filter((c) => c.popular && (!q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.code.toLowerCase() === q))
  }, [search])

  const otherCities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return US_CITIES.filter((c) => !c.popular && (!q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.code.toLowerCase() === q))
  }, [search])

  if (!isOpen) return null

  const handleSelect = (c: CityItem) => {
    onSelectCity(c.fullName)
    onClose()
  }

  const isSelected = (c: CityItem) => {
    return selectedCity === c.fullName || selectedCity.startsWith(c.name)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[420px] rounded-[24px] bg-white p-7 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-sans">
        
        {/* Header: Title & Close Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-[26px] font-bold tracking-tight text-black leading-[1.2]">
            You are currently in {currentCityDisplayName}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#276EF1] text-[#276EF1] hover:bg-[#F3F7FE] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Explore city button */}
        <div className="mb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-black text-white text-[13px] font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Explore city
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Change city"
            className="w-full rounded-full bg-[#F6F6F6] pl-11 pr-4 py-3 text-[14px] font-medium text-black placeholder:text-[#6B7280] focus:outline-none focus:bg-[#EEEEEE] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center transition-colors text-[#4B5563]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Scrollable City List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-5">
          
          {/* Popular Cities Section */}
          {popularCities.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-[#5E5E5E] mb-2">Popular</p>
              <div className="divide-y divide-gray-100">
                {popularCities.map((c) => {
                  const active = isSelected(c)
                  return (
                    <button
                      key={c.fullName}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left py-3.5 transition-colors flex items-center justify-between group cursor-pointer ${
                        active ? 'font-semibold text-black' : 'text-[#000000] hover:text-[#276EF1]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <span className="text-[15px] font-medium">{c.name}</span>
                      </div>
                      {active && <Check size={18} className="text-black shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* United States Section */}
          {otherCities.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-[#5E5E5E] mb-2">United States</p>
              <div className="divide-y divide-gray-100">
                {otherCities.map((c) => {
                  const active = isSelected(c)
                  return (
                    <button
                      key={c.fullName}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left py-3.5 transition-colors flex items-center justify-between group cursor-pointer ${
                        active ? 'font-semibold text-black' : 'text-[#000000] hover:text-[#276EF1]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <span className="text-[15px] font-medium">{c.name}</span>
                      </div>
                      {active && <Check size={18} className="text-black shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {popularCities.length === 0 && otherCities.length === 0 && (
            <div className="py-8 text-center text-[#5E5E5E] text-sm">
              No US city found matching "{search}".
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
