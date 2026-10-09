'use client'

import { useState, useEffect, useCallback } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { getCachedReverseGeocode, setCachedReverseGeocode } from '@/lib/geocode-cache'

const SESSION_CITY_KEY = 'tg_session_city'
const SESSION_COORDS_KEY = 'tg_session_coords'

const DEFAULT_CITY_ENV = process.env.NEXT_PUBLIC_DEFAULT_CITY || ''
const DEFAULT_LAT_ENV = process.env.NEXT_PUBLIC_DEFAULT_LAT ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT) : null
const DEFAULT_LNG_ENV = process.env.NEXT_PUBLIC_DEFAULT_LNG ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG) : null

export function deduplicateAddressParts(parts: string[]): string {
  const cleaned = parts.map((p) => p.trim()).filter(Boolean)
  const result: string[] = []

  for (const part of cleaned) {
    const isRedundant = result.some(
      (existing) =>
        existing.toLowerCase().includes(part.toLowerCase()) ||
        part.toLowerCase().includes(existing.toLowerCase())
    )
    if (!isRedundant) {
      result.push(part)
    } else {
      const idx = result.findIndex(
        (existing) =>
          existing.toLowerCase().includes(part.toLowerCase()) ||
          part.toLowerCase().includes(existing.toLowerCase())
      )
      if (idx !== -1 && part.length > result[idx].length) {
        result[idx] = part
      }
    }
  }

  return result.join(', ')
}

export function cleanCityName(rawCity: string): string {
  if (!rawCity) return ''
  return rawCity.split(',')[0].trim()
}

export function getStoredCity(): string {
  if (typeof window === 'undefined') return DEFAULT_CITY_ENV
  try {
    localStorage.removeItem(SESSION_CITY_KEY)
    return sessionStorage.getItem(SESSION_CITY_KEY) || DEFAULT_CITY_ENV
  } catch {
    return DEFAULT_CITY_ENV
  }
}

export function getSessionCoordinates(): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') {
    return DEFAULT_LAT_ENV !== null && DEFAULT_LNG_ENV !== null
      ? { lat: DEFAULT_LAT_ENV, lng: DEFAULT_LNG_ENV }
      : null
  }
  try {
    localStorage.removeItem(SESSION_COORDS_KEY)
    const raw = sessionStorage.getItem(SESSION_COORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}

  if (DEFAULT_LAT_ENV !== null && DEFAULT_LNG_ENV !== null) {
    return { lat: DEFAULT_LAT_ENV, lng: DEFAULT_LNG_ENV }
  }
  return null
}

export function formatLocationDisplay(locationStr?: string, localityStr?: string): string {
  if (localityStr && localityStr.trim()) {
    const cleanLoc = deduplicateAddressParts(localityStr.split(','))
    if (cleanLoc) return cleanLoc
  }

  if (locationStr && locationStr.trim()) {
    const parts = locationStr.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length > 0) return parts[0]
  }

  return ''
}

export function setStoredCity(city: string, coords?: { lat: number; lng: number }) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_CITY_KEY, city)
    localStorage.removeItem(SESSION_CITY_KEY)
    if (coords) {
      sessionStorage.setItem(SESSION_COORDS_KEY, JSON.stringify(coords))
      localStorage.removeItem(SESSION_COORDS_KEY)
    }
    window.dispatchEvent(new CustomEvent('tg_city_changed', { detail: city }))
  } catch (err) {
    console.warn('Error saving session city:', err)
  }
}

export function resolveAccurateCityFromComponents(
  comps: any[],
  lat?: number,
  lng?: number,
  formattedAddress?: string
): {
  houseNo: string
  apartment: string
  locality: string
  cityName: string
  stateCode: string
  cityStateFormatted: string
  fullFormatted: string
  specificArea: string
  displayLocality: string
} {
  if (!Array.isArray(comps) || comps.length === 0) {
    const fallback = getStoredCity() || DEFAULT_CITY_ENV
    return {
      houseNo: '',
      apartment: '',
      locality: '',
      cityName: fallback,
      stateCode: '',
      cityStateFormatted: fallback,
      fullFormatted: fallback,
      specificArea: fallback,
      displayLocality: fallback,
    }
  }

  const getComp = (type: string) => comps.find((c: any) => c.types && c.types.includes(type))?.long_name || ''
  const getShort = (type: string) => comps.find((c: any) => c.types && c.types.includes(type))?.short_name || ''

  const streetNumber = getComp('street_number')
  const subpremise = getComp('subpremise')
  const premise = getComp('premise')
  const route = getComp('route')
  const neighborhood = getComp('neighborhood')
  const sublocality3 = getComp('sublocality_level_3')
  const sublocality2 = getComp('sublocality_level_2')
  const sublocality1 = getComp('sublocality_level_1') || getComp('sublocality')
  const locality = getComp('locality')
  const admin3 = getComp('administrative_area_level_3')
  const admin2 = getComp('administrative_area_level_2')
  const stateCode = getShort('administrative_area_level_1') || getShort('country') || ''
  const poi = getComp('point_of_interest') || getComp('establishment')

  const houseNo = subpremise || streetNumber || ''
  let apartment = ''
  if (premise && premise !== houseNo) {
    apartment = premise
  } else if (poi) {
    apartment = poi
  }

  // Locality / Area with intelligent deduplication
  const rawLocalityParts = [sublocality2 || neighborhood, sublocality1].filter(Boolean)
  const specificArea = deduplicateAddressParts(rawLocalityParts) || route || ''

  // Genuine City Name from Google address components
  const admin1Name = getComp('administrative_area_level_1')
  let actualCity = locality
  if (!actualCity) {
    if (admin1Name && admin1Name.toLowerCase() === 'delhi') {
      actualCity = 'Delhi'
    } else if (admin2 && !admin2.toLowerCase().includes('district') && !admin2.toLowerCase().includes('division')) {
      actualCity = admin2
    } else if (admin1Name) {
      actualCity = admin1Name
    } else {
      actualCity = admin3 || sublocality1 || ''
    }
  }

  // City + State
  const cityStateFormatted = stateCode && actualCity && !actualCity.includes(stateCode)
    ? `${actualCity}, ${stateCode}`
    : actualCity

  const displayLocality = specificArea || actualCity

  return {
    houseNo,
    apartment,
    locality: specificArea,
    cityName: actualCity,
    stateCode,
    cityStateFormatted,
    fullFormatted: cityStateFormatted,
    specificArea,
    displayLocality,
  }
}

let geocoderInstance: any = null

export async function reverseGeocodeCoords(lat: number, lng: number) {
  const cached = getCachedReverseGeocode(lat, lng)
  if (cached) {
    const cityName = cleanCityName(cached.city || '')
    const cleanLoc = deduplicateAddressParts((cached.locality || '').split(','))
    const displayLocality = cleanLoc || cityName

    return {
      houseNo: cached.houseNo || '',
      apartment: cached.apartment || '',
      locality: cleanLoc,
      cityName,
      stateCode: '',
      cityStateFormatted: cached.city || cityName,
      displayLocality,
      fullFormatted: cached.formattedAddress || cached.city || cityName,
    }
  }

  try {
    if (!geocoderInstance) {
      if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
        geocoderInstance = new (window as any).google.maps.Geocoder()
      } else {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
        if (apiKey) {
          if (typeof window !== 'undefined') {
            const w = window as any
            if (!w.__googleMapsOptionsConfigured) {
              try {
                setOptions({ key: apiKey, v: 'weekly' })
                w.__googleMapsOptionsConfigured = true
              } catch {}
            }
          }
          const { Geocoder } = (await importLibrary('geocoding')) as any
          geocoderInstance = new Geocoder()
        }
      }
    }

    if (geocoderInstance) {
      const results: any[] = await new Promise((resolve) => {
        geocoderInstance.geocode({ location: { lat, lng } }, (res: any, status: any) => {
          if (status === 'OK' && Array.isArray(res) && res.length > 0) {
            resolve(res)
          } else {
            resolve([])
          }
        })
      })

      if (results.length > 0) {
        const comps = results[0].address_components || []
        const formatted = results[0].formatted_address || ''
        const parsed = resolveAccurateCityFromComponents(comps, lat, lng, formatted)

        setCachedReverseGeocode(lat, lng, {
          houseNo: parsed.houseNo,
          apartment: parsed.apartment,
          locality: parsed.locality,
          city: parsed.cityStateFormatted,
          formattedAddress: formatted || parsed.cityStateFormatted,
        })

        return parsed
      }
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err)
  }

  const fallbackCity = getStoredCity() || DEFAULT_CITY_ENV
  return {
    houseNo: '',
    apartment: '',
    locality: '',
    cityName: fallbackCity,
    stateCode: '',
    cityStateFormatted: fallbackCity,
    displayLocality: fallbackCity,
    fullFormatted: fallbackCity,
  }
}

export function useCityLocation(defaultCity?: string) {
  const [city, setCityState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_CITY_KEY)
        const inSession = sessionStorage.getItem(SESSION_CITY_KEY)
        if (inSession) return inSession
      } catch {}
    }
    return defaultCity || getStoredCity() || DEFAULT_CITY_ENV
  })

  // Sync state if city changes anywhere in app in the current active session
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setCityState(customEvent.detail)
      }
    }

    window.addEventListener('tg_city_changed', handleSync)

    return () => {
      window.removeEventListener('tg_city_changed', handleSync)
    }
  }, [])

  const updateCity = useCallback((newCity: string, coords?: { lat: number; lng: number }) => {
    setCityState(newCity)
    setStoredCity(newCity, coords)
  }, [])

  return [city, updateCity] as const
}

export function getCityCoordinates(cityStr?: string): { lat: number; lng: number } {
  const sessionCoords = getSessionCoordinates()
  if (sessionCoords) return sessionCoords

  if (DEFAULT_LAT_ENV !== null && DEFAULT_LNG_ENV !== null) {
    return { lat: DEFAULT_LAT_ENV, lng: DEFAULT_LNG_ENV }
  }

  return { lat: 0, lng: 0 }
}
