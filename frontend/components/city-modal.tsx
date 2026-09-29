'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Navigation, Loader2, Building2, MapPin } from 'lucide-react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { setStoredCity, getCityCoordinates, getSessionCoordinates } from './use-city-location'
import {
  getCachedPlaceDetails,
  setCachedPlaceDetails,
  getOrCreatePlacesSessionToken,
  resetPlacesSessionToken,
} from '@/lib/geocode-cache'

export interface CityItem {
  name: string
  fullName: string
  state: string
  code: string
  countryCode: string
  popular?: boolean
}

export interface PlaceResult {
  id: string
  title: string
  subtitle: string
  fullName: string
  lat?: number
  lng?: number
  placeId?: string
  type?: 'apartment' | 'building' | 'street' | 'city' | 'poi'
}

export const US_CITIES_LIST: CityItem[] = [
  // Popular Regions & Metros
  { name: 'Vasai', fullName: 'Vasai, IN-MH', state: 'Maharashtra', code: 'MH', countryCode: 'in', popular: true },
  { name: 'Mumbai', fullName: 'Mumbai, IN', state: 'Maharashtra', code: 'MH', countryCode: 'in', popular: true },
  { name: 'Delhi NCR', fullName: 'Delhi NCR, IN', state: 'Delhi', code: 'DL', countryCode: 'in', popular: true },
  { name: 'Bengaluru', fullName: 'Bengaluru, IN', state: 'Karnataka', code: 'KA', countryCode: 'in', popular: true },
  { name: 'London', fullName: 'London, UK', state: 'Greater London', code: 'UK', countryCode: 'gb', popular: true },
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

  // Additional Metropolitan Cities
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
  onSelectCity: (formattedCity: string, coords?: { lat: number; lng: number }, isLiveGps?: boolean) => void
}

export function CityModal({ isOpen, onClose, selectedCity, onSelectCity }: CityModalProps) {
  const [search, setSearch] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([])
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const googlePlacesServiceRef = useRef<any>(null)
  const googleGeocoderRef = useRef<any>(null)

  const currentCityDisplayName = useMemo(() => {
    if (!selectedCity) return 'Vasai'
    const match = US_CITIES_LIST.find(
      (c) => c.fullName === selectedCity || selectedCity.startsWith(c.name)
    )
    if (match) return match.name
    return selectedCity.split(',')[0]
  }, [selectedCity])

  const popularCities = useMemo(() => {
    return US_CITIES_LIST.filter((c) => c.popular)
  }, [])

  const otherCities = useMemo(() => {
    return US_CITIES_LIST.filter((c) => !c.popular)
  }, [])

  // Lazy initialize Google Maps Services only when modal is opened
  useEffect(() => {
    if (!isOpen) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!apiKey) return

    async function loadGoogleServices() {
      try {
        if (typeof window !== 'undefined') {
          const w = window as any
          if (!w.__googleMapsOptionsConfigured) {
            try {
              setOptions({ key: apiKey, v: 'weekly' })
              w.__googleMapsOptionsConfigured = true
            } catch {}
          }
        }
        if (!googleGeocoderRef.current) {
          const { Geocoder } = (await importLibrary('geocoding')) as any
          googleGeocoderRef.current = new Geocoder()
        }
      } catch (err) {
        console.warn('Google Places library load skipped, using proximity geocoding:', err)
      }
    }

    loadGoogleServices()
  }, [isOpen])

  // Haversine distance calculator in kilometers
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Live place, apartment, society, and address search powered EXCLUSIVELY by Google Maps Places Autocomplete
  useEffect(() => {
    const trimmed = search.trim()
    if (trimmed.length < 2) {
      setPlaceResults([])
      setIsSearchingPlaces(false)
      return
    }

    setIsSearchingPlaces(true)

    // Center coordinates for Google Maps proximity biasing
    const centerCoords = getSessionCoordinates() || getCityCoordinates(selectedCity)
    const isIndia = centerCoords.lat > 8 && centerCoords.lat < 36 && centerCoords.lng > 68 && centerCoords.lng < 98
    const isUS = centerCoords.lat > 24 && centerCoords.lat < 50 && centerCoords.lng > -125 && centerCoords.lng < -66
    const isUK = centerCoords.lat > 49 && centerCoords.lat < 60 && centerCoords.lng > -8 && centerCoords.lng < 2

    const timeoutId = setTimeout(async () => {
      const sessionToken = getOrCreatePlacesSessionToken()

      // 1. Modern Google Maps Places AutocompleteSuggestion API (New Places API v3.56+)
      if (typeof google !== 'undefined' && (google.maps as any)?.places?.AutocompleteSuggestion) {
        try {
          const regionCodes = isIndia ? ['in'] : isUS ? ['us'] : isUK ? ['gb'] : undefined
          const req: any = {
            input: trimmed,
            locationBias: {
              center: { lat: centerCoords.lat, lng: centerCoords.lng },
              radius: 50000,
            },
            includedRegionCodes: regionCodes,
          }
          if (sessionToken) req.sessionToken = sessionToken

          const { suggestions } = await (google.maps as any).places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)

          if (suggestions && suggestions.length > 0) {
            const mapped: PlaceResult[] = suggestions.map((s: any, idx: number) => {
              const p = s.placePrediction
              const mainText = p.mainText?.text || p.text?.text?.split(',')[0] || ''
              const secondaryText = p.secondaryText?.text || p.text?.text || ''
              const fullName = p.text?.text || `${mainText}, ${secondaryText}`
              const types = p.types || []

              return {
                id: `gplace-sugg-${p.placeId || idx}`,
                title: mainText,
                subtitle: secondaryText,
                fullName: fullName,
                placeId: p.placeId,
                type: types.includes('route') ? 'street' : types.includes('locality') ? 'city' : 'building',
              }
            })

            setPlaceResults(mapped)
            setIsSearchingPlaces(false)
            return
          }
        } catch (err) {
          console.warn('Google AutocompleteSuggestion API call failed, falling back to service:', err)
        }
      }

      // 2. Google Maps Places AutocompleteService (using non-deprecated locationBias Circle)
      let service = googlePlacesServiceRef.current
      if (!service && typeof google !== 'undefined' && google.maps?.places?.AutocompleteService) {
        try {
          service = new google.maps.places.AutocompleteService()
          googlePlacesServiceRef.current = service
        } catch {}
      }
      
      if (service && typeof google !== 'undefined' && google.maps) {
        try {
          const req: any = {
            input: trimmed,
            locationBias: new google.maps.Circle({
              center: new google.maps.LatLng(centerCoords.lat, centerCoords.lng),
              radius: 50000,
            }),
          }
          if (sessionToken) req.sessionToken = sessionToken

          if (isIndia) {
            req.componentRestrictions = { country: 'in' }
          } else if (isUS) {
            req.componentRestrictions = { country: 'us' }
          } else if (isUK) {
            req.componentRestrictions = { country: 'gb' }
          }

          const predictions: google.maps.places.AutocompletePrediction[] = await new Promise((resolve) => {
            service.getPlacePredictions(
              req,
              (results: any, status: any) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && Array.isArray(results)) {
                  resolve(results)
                } else {
                  resolve([])
                }
              }
            )
          })

          if (predictions.length > 0) {
            const mapped: PlaceResult[] = predictions.map((p, idx) => ({
              id: `gplace-${p.place_id || idx}`,
              title: p.structured_formatting?.main_text || p.description.split(',')[0],
              subtitle: p.structured_formatting?.secondary_text || p.description,
              fullName: p.description,
              placeId: p.place_id,
              type: p.types?.includes('route') ? 'street' : p.types?.includes('locality') ? 'city' : 'building',
            }))
            setPlaceResults(mapped)
            setIsSearchingPlaces(false)
            return
          }
        } catch (err) {
          console.warn('Google Places Autocomplete error:', err)
        }
      }

      // 2. Google Maps Geocoder as secondary Google direct resolver
      const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
      if (geocoder && typeof google !== 'undefined' && google.maps) {
        try {
          const geoResults: google.maps.GeocoderResult[] = await new Promise((resolve) => {
            geocoder.geocode(
              {
                address: trimmed,
                componentRestrictions: isIndia ? { country: 'in' } : isUS ? { country: 'us' } : undefined,
              },
              (results: any, status: any) => {
                if (status === 'OK' && Array.isArray(results)) {
                  resolve(results)
                } else {
                  resolve([])
                }
              }
            )
          })

          if (geoResults.length > 0) {
            const mapped: PlaceResult[] = geoResults.slice(0, 8).map((gr, idx) => {
              const loc = gr.geometry.location
              return {
                id: `geocoder-${gr.place_id || idx}`,
                title: gr.formatted_address.split(',')[0],
                subtitle: gr.formatted_address,
                fullName: gr.formatted_address,
                lat: loc.lat(),
                lng: loc.lng(),
                placeId: gr.place_id,
                type: gr.types?.includes('route') ? 'street' : gr.types?.includes('locality') ? 'city' : 'building',
              }
            })
            setPlaceResults(mapped)
            setIsSearchingPlaces(false)
            return
          }
        } catch (err) {
          console.warn('Google Geocoder search fallback error:', err)
        }
      }

      // 3. Fallback to predefined cities catalogue if offline/typing city name
      const localMatches = US_CITIES_LIST.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          c.state.toLowerCase().includes(trimmed.toLowerCase()) ||
          c.code.toLowerCase() === trimmed.toLowerCase()
      ).map((c) => {
        const coords = getCityCoordinates(c.fullName)
        return {
          id: `local-${c.fullName}`,
          title: c.name,
          subtitle: `${c.state}, ${c.countryCode === 'in' ? 'India' : c.countryCode === 'gb' ? 'United Kingdom' : 'United States'}`,
          fullName: c.fullName,
          lat: coords.lat,
          lng: coords.lng,
          type: 'city' as const,
        }
      })

      setPlaceResults(localMatches)
      setIsSearchingPlaces(false)
    }, 200)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [search, selectedCity])

  // Clear search input whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setPlaceResults([])
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelect = (c: CityItem) => {
    const cityCoords = getCityCoordinates(c.fullName)
    setStoredCity(c.fullName, cityCoords)
    onSelectCity(c.fullName, cityCoords, false)
    setSearch('')
    setPlaceResults([])
    onClose()
  }

  const handleSelectPlace = async (place: PlaceResult) => {
    let coords = place.lat && place.lng ? { lat: place.lat, lng: place.lng } : null

    // Check cache first to avoid redundant API call
    if (!coords && place.placeId) {
      const cached = getCachedPlaceDetails(place.placeId)
      if (cached) {
        coords = { lat: cached.lat, lng: cached.lng }
      }
    }

    // Resolve exact Google Maps Lat/Lng via Google Geocoder if not cached
    const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
    if (!coords && place.placeId && geocoder) {
      try {
        const geoRes = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
          geocoder.geocode({ placeId: place.placeId }, (results: any, status: any) => {
            if (status === 'OK' && Array.isArray(results) && results[0]?.geometry?.location) {
              resolve(results)
            } else {
              resolve(null)
            }
          })
        })
        if (geoRes && geoRes[0]?.geometry?.location) {
          const loc = geoRes[0].geometry.location
          coords = { lat: loc.lat(), lng: loc.lng() }
          setCachedPlaceDetails(place.placeId, { lat: loc.lat(), lng: loc.lng(), formattedAddress: place.fullName })
        }
      } catch (err) {
        console.warn('Error resolving Google Place coordinates:', err)
      }
    }

    resetPlacesSessionToken()

    const resolvedCoords = coords || getCityCoordinates(place.fullName)
    setStoredCity(place.fullName, resolvedCoords)
    onSelectCity(place.fullName, resolvedCoords, false)
    setSearch('')
    setPlaceResults([])
    onClose()
  }

  const isSelected = (c: CityItem) => {
    return selectedCity === c.fullName || selectedCity.startsWith(c.name)
  }

  const handleDetectLocation = () => {
    setIsLocating(true)

    if (!navigator.geolocation) {
      setIsLocating(false)
      onClose()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const liveCoords = { lat: latitude, lng: longitude }

        const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
        
        if (geocoder) {
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any, status: any) => {
              let resolvedCity = selectedCity || 'Vasai, IN-MH'
              if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                const comps = results[0]?.address_components || []
                const locality = comps.find((c: any) => c.types.includes('locality'))
                const sublocality = comps.find((c: any) => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'))
                const admin2 = comps.find((c: any) => c.types.includes('administrative_area_level_2'))
                const state = comps.find((c: any) => c.types.includes('administrative_area_level_1'))
                const country = comps.find((c: any) => c.types.includes('country'))

                const cityName = locality?.long_name || sublocality?.long_name || admin2?.long_name || 'Vasai'
                const stateCode = state?.short_name || country?.short_name || ''
                resolvedCity = stateCode ? `${cityName}, ${stateCode}` : cityName
              }

              setStoredCity(resolvedCity, liveCoords)
              onSelectCity(resolvedCity, liveCoords, true)
              setSearch('')
              setPlaceResults([])
              setIsLocating(false)
              onClose()
            }
          )
        } else {
          setStoredCity('Current Location', liveCoords)
          onSelectCity(selectedCity || 'Current Location', liveCoords, true)
          setSearch('')
          setPlaceResults([])
          setIsLocating(false)
          onClose()
        }
      },
      (err) => {
        console.warn('Geolocation failed or permission denied:', err)
        setIsLocating(false)
        onClose()
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
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
              {isSearchingPlaces ? (
                <Loader2 size={20} className="animate-spin text-black" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="m22.355 20.935-4.68-4.68a8.963 8.963 0 0 0 1.97-5.61 9 9 0 1 0-9 9c2.12 0 4.07-.74 5.61-1.97l4.68 4.68 1.42-1.42Zm-11.71-3.29c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7Z" fill="currentColor"></path>
                </svg>
              )}
            </div>
            <input
              aria-label="Search for a city or apartment"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apartment, street, or city"
              className="w-full bg-transparent pl-3 pr-2 text-[16px] font-medium text-black placeholder:text-[#757575] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="size-6 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center transition-colors text-[#4B5563] shrink-0 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable City & Place List: Hidden scrollbar track */}
        <div className="overflow-y-auto flex-1 space-y-5 max-h-[480px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* If user searched an apartment / address / city */}
          {search.trim().length >= 2 ? (
            <div>
              <div className="text-[14px] font-bold text-[#5E5E5E] mb-2 py-1 flex items-center justify-between">
                <span>Search Results</span>
                {isSearchingPlaces && <span className="text-xs font-normal text-gray-500">Searching…</span>}
              </div>

              {placeResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {placeResults.map((place, idx) => (
                    <button
                      key={`${place.id}-${idx}`}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="w-full text-left py-3.5 px-1 transition-colors flex items-start gap-3.5 group cursor-pointer hover:bg-[#F9FAFB] rounded-xl"
                    >
                      <div className="size-8 rounded-full bg-[#F3F3F3] text-black flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#276EF1]/10 group-hover:text-[#276EF1] transition-colors">
                        {place.type === 'city' ? (
                          <MapPin size={16} />
                        ) : (
                          <Building2 size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-medium text-black group-hover:text-[#276EF1] transition-colors truncate">
                          {place.title}
                        </p>
                        {place.subtitle && (
                          <p className="text-[13px] text-[#5E5E5E] truncate mt-0.5">
                            {place.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : !isSearchingPlaces ? (
                <div className="py-8 text-center text-[#5E5E5E] text-[15px]">
                  No places found matching "{search}".
                </div>
              ) : null}
            </div>
          ) : (
            <>
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
                                src={c.countryCode === 'in' ? 'https://flagcdn.com/w40/in.png' : c.countryCode === 'gb' ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/us.png'}
                                srcSet={c.countryCode === 'in' ? 'https://flagcdn.com/w80/in.png 2x' : c.countryCode === 'gb' ? 'https://flagcdn.com/w80/gb.png 2x' : 'https://flagcdn.com/w80/us.png 2x'}
                                alt={c.countryCode.toUpperCase()}
                                width="24px"
                                data-iso={c.countryCode.toUpperCase()}
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
            </>
          )}

        </div>

      </div>
    </div>
  )
}
