'use client'

import { useState, useMemo } from 'react'
import { Navigation, Loader2 } from 'lucide-react'

export interface CityItem {
  name: string
  fullName: string
  state: string
  code: string
  countryCode: string
  popular?: boolean
}

export const US_CITIES_LIST: CityItem[] = [
  // Popular US Metro Cities
  { name: 'New York City', fullName: 'New York City, NY', state: 'New York', code: 'NY', countryCode: 'us', popular: true },
  { name: 'Los Angeles', fullName: 'Los Angeles, CA', state: 'California', code: 'CA', countryCode: 'us', popular: true },
  { name: 'Chicago', fullName: 'Chicago, IL', state: 'Illinois', code: 'IL', countryCode: 'us', popular: true },
  { name: 'Houston', fullName: 'Houston, TX', state: 'Texas', code: 'TX', countryCode: 'us', popular: true },
  { name: 'Miami', fullName: 'Miami, FL', state: 'Florida', code: 'FL', countryCode: 'us', popular: true },
  { name: 'San Francisco', fullName: 'San Francisco, CA', state: 'California', code: 'CA', countryCode: 'us', popular: true },
  { name: 'Dallas-Fort Worth', fullName: 'Dallas-Fort Worth, TX', state: 'Texas', code: 'TX', countryCode: 'us', popular: true },
  { name: 'Seattle', fullName: 'Seattle, WA', state: 'Washington', code: 'WA', countryCode: 'us', popular: true },
  { name: 'Washington D.C.', fullName: 'Washington D.C.', state: 'District of Columbia', code: 'DC', countryCode: 'us', popular: true },
  { name: 'Boston', fullName: 'Boston, MA', state: 'Massachusetts', code: 'MA', countryCode: 'us', popular: true },
  { name: 'Austin', fullName: 'Austin, TX', state: 'Texas', code: 'TX', countryCode: 'us', popular: true },
  { name: 'Las Vegas', fullName: 'Las Vegas, NV', state: 'Nevada', code: 'NV', countryCode: 'us', popular: true },

  // Additional US Metropolitan Cities
  { name: 'Atlanta', fullName: 'Atlanta, GA', state: 'Georgia', code: 'GA', countryCode: 'us' },
  { name: 'Baltimore', fullName: 'Baltimore, MD', state: 'Maryland', code: 'MD', countryCode: 'us' },
  { name: 'Charlotte', fullName: 'Charlotte, NC', state: 'North Carolina', code: 'NC', countryCode: 'us' },
  { name: 'Columbus', fullName: 'Columbus, OH', state: 'Ohio', code: 'OH', countryCode: 'us' },
  { name: 'Denver', fullName: 'Denver, CO', state: 'Colorado', code: 'CO', countryCode: 'us' },
  { name: 'Detroit', fullName: 'Detroit, MI', state: 'Michigan', code: 'MI', countryCode: 'us' },
  { name: 'Indianapolis', fullName: 'Indianapolis, IN', state: 'Indiana', code: 'IN', countryCode: 'us' },
  { name: 'Jacksonville', fullName: 'Jacksonville, FL', state: 'Florida', code: 'FL', countryCode: 'us' },
  { name: 'Kansas City', fullName: 'Kansas City, MO', state: 'Missouri', code: 'MO', countryCode: 'us' },
  { name: 'Memphis', fullName: 'Memphis, TN', state: 'Tennessee', code: 'TN', countryCode: 'us' },
  { name: 'Minneapolis', fullName: 'Minneapolis, MN', state: 'Minnesota', code: 'MN', countryCode: 'us' },
  { name: 'Nashville', fullName: 'Nashville, TN', state: 'Tennessee', code: 'TN', countryCode: 'us' },
  { name: 'New Orleans', fullName: 'New Orleans, LA', state: 'Louisiana', code: 'LA', countryCode: 'us' },
  { name: 'Orlando', fullName: 'Orlando, FL', state: 'Florida', code: 'FL', countryCode: 'us' },
  { name: 'Philadelphia', fullName: 'Philadelphia, PA', state: 'Pennsylvania', code: 'PA', countryCode: 'us' },
  { name: 'Phoenix', fullName: 'Phoenix, AZ', state: 'Arizona', code: 'AZ', countryCode: 'us' },
  { name: 'Pittsburgh', fullName: 'Pittsburgh, PA', state: 'Pennsylvania', code: 'PA', countryCode: 'us' },
  { name: 'Portland', fullName: 'Portland, OR', state: 'Oregon', code: 'OR', countryCode: 'us' },
  { name: 'Raleigh', fullName: 'Raleigh, NC', state: 'North Carolina', code: 'NC', countryCode: 'us' },
  { name: 'Sacramento', fullName: 'Sacramento, CA', state: 'California', code: 'CA', countryCode: 'us' },
  { name: 'Salt Lake City', fullName: 'Salt Lake City, UT', state: 'Utah', code: 'UT', countryCode: 'us' },
  { name: 'San Antonio', fullName: 'San Antonio, TX', state: 'Texas', code: 'TX', countryCode: 'us' },
  { name: 'San Diego', fullName: 'San Diego, CA', state: 'California', code: 'CA', countryCode: 'us' },
  { name: 'San Jose', fullName: 'San Jose, CA', state: 'California', code: 'CA', countryCode: 'us' },
  { name: 'St. Louis', fullName: 'St. Louis, MO', state: 'Missouri', code: 'MO', countryCode: 'us' },
  { name: 'Tampa', fullName: 'Tampa, FL', state: 'Florida', code: 'FL', countryCode: 'us' },
]

export interface CityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCity: string
  onSelectCity: (formattedCity: string) => void
}

export function CityModal({ isOpen, onClose, selectedCity, onSelectCity }: CityModalProps) {
  const [search, setSearch] = useState('')
  const [isLocating, setIsLocating] = useState(false)

  const currentCityDisplayName = useMemo(() => {
    if (!selectedCity) return 'New York'
    const match = US_CITIES_LIST.find(
      (c) => c.fullName === selectedCity || selectedCity.startsWith(c.name)
    )
    if (match) return match.name === 'New York City' ? 'New York' : match.name
    return selectedCity.split(',')[0]
  }, [selectedCity])

  const popularCities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return US_CITIES_LIST.filter((c) => c.popular && (!q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.code.toLowerCase() === q))
  }, [search])

  const otherCities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return US_CITIES_LIST.filter((c) => !c.popular && (!q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.code.toLowerCase() === q))
  }, [search])

  if (!isOpen) return null

  const handleSelect = (c: CityItem) => {
    onSelectCity(c.fullName)
    onClose()
  }

  const isSelected = (c: CityItem) => {
    return selectedCity === c.fullName || selectedCity.startsWith(c.name)
  }

  const handleDetectLocation = () => {
    setIsLocating(true)

    if (!navigator.geolocation) {
      onSelectCity('New York City, NY')
      setIsLocating(false)
      onClose()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          if (res.ok) {
            const data = await res.json()
            const cityName = data.city || data.locality || data.principalSubdivision || 'New York'
            const stateCode = data.principalSubdivisionCode?.replace('US-', '') || 'NY'
            
            const matched = US_CITIES_LIST.find(
              (c) =>
                c.name.toLowerCase() === cityName.toLowerCase() ||
                c.state.toLowerCase() === data.principalSubdivision?.toLowerCase()
            )
            
            const finalCity = matched ? matched.fullName : `${cityName}, ${stateCode}`
            onSelectCity(finalCity)
          } else {
            onSelectCity('New York City, NY')
          }
        } catch {
          onSelectCity('New York City, NY')
        } finally {
          setIsLocating(false)
          onClose()
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err)
        onSelectCity('New York City, NY')
        setIsLocating(false)
        onClose()
      },
      { timeout: 8000 }
    )
  }

  return (
    <div
      tabIndex={-1}
      aria-modal="true"
      aria-label="dialog"
      role="dialog"
      data-testid="city-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
    >
      {/* Modal Card Container: Exact Uber BaseWeb 520px width & 32px padding */}
      <div className="relative w-full max-w-[520px] rounded-[16px] bg-white p-6 sm:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.2)] overflow-hidden max-h-[88vh] flex flex-col font-sans">
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-6 mb-4">
          <div data-testid="city-selector-headline" className="text-[30px] sm:text-[34px] font-bold tracking-tight text-black leading-[1.12]">
            You are currently in {currentCityDisplayName}
          </div>
          <button
            data-testid="city-selector-close"
            onClick={onClose}
            className="w-11 h-11 rounded-[12px] border border-[#276EF1] text-[#276EF1] hover:bg-[#F3F7FE] flex items-center justify-center transition-colors shrink-0 cursor-pointer mt-0.5"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="m20.71 4.71-1.42-1.42-7.29 7.3-7.29-7.3-1.42 1.42 7.3 7.29-7.3 7.29 1.42 1.42 7.29-7.3 7.29 7.3 1.42-1.42-7.3-7.29 7.3-7.29Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>

        {/* CTA Button */}
        <div className="mb-6">
          <button
            data-testid="city-selector-cta"
            onClick={onClose}
            aria-label="Explore city"
            className="px-5 py-3 rounded-[8px] bg-black text-white text-[15px] font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Explore city
          </button>
        </div>

        {/* Search Bar Input */}
        <div data-testid="city-search-input" className="relative mb-6">
          <div className="w-full h-[56px] rounded-full bg-[#F3F3F3] flex items-center px-5 text-black">
            <div className="shrink-0 text-black flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="m22.355 20.935-4.68-4.68a8.963 8.963 0 0 0 1.97-5.61 9 9 0 1 0-9 9c2.12 0 4.07-.74 5.61-1.97l4.68 4.68 1.42-1.42Zm-11.71-3.29c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7Z" fill="currentColor"></path>
              </svg>
            </div>
            <input
              aria-label="Search for a city"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Change city"
              className="w-full bg-transparent pl-3 pr-2 text-[16px] font-medium text-black placeholder:text-[#757575] focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="size-6 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center transition-colors text-[#4B5563] shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable City List: Hidden scrollbar track */}
        <div className="overflow-y-auto flex-1 space-y-5 max-h-[480px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Fetch Current Location Row (Placed right BEFORE Popular section) */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="w-full text-left h-[56px] px-1 transition-colors flex items-center justify-between group cursor-pointer border-b border-gray-100 hover:text-[#276EF1]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#F3F7FE] text-[#276EF1] flex items-center justify-center shrink-0">
                {isLocating ? (
                  <Loader2 size={16} className="animate-spin text-[#276EF1]" />
                ) : (
                  <Navigation size={15} className="text-[#276EF1]" />
                )}
              </div>
              <span className="text-[16px] font-semibold text-[#276EF1]">
                {isLocating ? 'Detecting your location…' : 'Use current location'}
              </span>
            </div>
          </button>

          {/* Popular Cities Section */}
          {popularCities.length > 0 && (
            <div>
              <div className="text-[14px] font-bold text-[#5E5E5E] mb-2 py-1">Popular</div>
              <div className="divide-y divide-gray-100">
                {popularCities.map((c) => {
                  const active = isSelected(c)
                  return (
                    <button
                      key={c.fullName}
                      type="button"
                      data-testid="city-row-button"
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left h-[56px] px-1 transition-colors flex items-center justify-between group cursor-pointer ${
                        active ? 'font-bold text-black' : 'text-[#000000] hover:text-[#276EF1]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span data-testid="city-row-flag" className="inline-flex items-center shrink-0">
                          <img
                            src="https://flagcdn.com/w40/us.png"
                            srcSet="https://flagcdn.com/w80/us.png 2x"
                            alt="US"
                            width="24px"
                            data-iso="US"
                            className="w-[24px] h-auto rounded-[2px]"
                          />
                        </span>
                        <span className="text-[16px] font-medium">{c.name}</span>
                      </div>
                      {active && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black shrink-0">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* United States Section */}
          {otherCities.length > 0 && (
            <div>
              <div className="text-[14px] font-bold text-[#5E5E5E] mb-2 py-1">United States</div>
              <div className="divide-y divide-gray-100">
                {otherCities.map((c) => {
                  const active = isSelected(c)
                  return (
                    <button
                      key={c.fullName}
                      type="button"
                      data-testid="city-row-button"
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left h-[56px] px-1 transition-colors flex items-center justify-between group cursor-pointer ${
                        active ? 'font-bold text-black' : 'text-[#000000] hover:text-[#276EF1]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span data-testid="city-row-flag" className="inline-flex items-center shrink-0">
                          <img
                            src="https://flagcdn.com/w40/us.png"
                            srcSet="https://flagcdn.com/w80/us.png 2x"
                            alt="US"
                            width="24px"
                            data-iso="US"
                            className="w-[24px] h-auto rounded-[2px]"
                          />
                        </span>
                        <span className="text-[16px] font-medium">{c.name}</span>
                      </div>
                      {active && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black shrink-0">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {popularCities.length === 0 && otherCities.length === 0 && (
            <div className="py-8 text-center text-[#5E5E5E] text-[15px]">
              No US city found matching "{search}".
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
