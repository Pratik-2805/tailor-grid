'use client'

import { useState, useEffect, useCallback } from 'react'

const SESSION_CITY_KEY = 'tg_session_city'
const SESSION_COORDS_KEY = 'tg_session_coords'

const DEFAULT_CITY_ENV = process.env.NEXT_PUBLIC_DEFAULT_CITY || ''
const DEFAULT_LAT_ENV = process.env.NEXT_PUBLIC_DEFAULT_LAT ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT) : null
const DEFAULT_LNG_ENV = process.env.NEXT_PUBLIC_DEFAULT_LNG ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG) : null

export function getStoredCity(): string {
  if (typeof window === 'undefined') return DEFAULT_CITY_ENV
  try {
    return (
      sessionStorage.getItem(SESSION_CITY_KEY) ||
      localStorage.getItem(SESSION_CITY_KEY) ||
      DEFAULT_CITY_ENV
    )
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
    const raw =
      sessionStorage.getItem(SESSION_COORDS_KEY) ||
      localStorage.getItem(SESSION_COORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}

  if (DEFAULT_LAT_ENV !== null && DEFAULT_LNG_ENV !== null) {
    return { lat: DEFAULT_LAT_ENV, lng: DEFAULT_LNG_ENV }
  }
  return null
}

export function formatLocationDisplay(locationStr?: string): string {
  if (!locationStr) return ''

  const parts = locationStr.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]

  const first = parts[0]
  const second = parts[1]

  // If first part is a flat/unit/house number (e.g. "Flat 204", "B-12", "House No. 5", "#4B"), combine with 2nd part
  if (/^(flat|apt|apartment|house|room|bldg|building|plot|no|#|\d+[\w-]*)\b/i.test(first) && parts.length >= 2) {
    return `${first}, ${second}`
  }

  return first
}

export function setStoredCity(city: string, coords?: { lat: number; lng: number }) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_CITY_KEY, city)
    localStorage.setItem(SESSION_CITY_KEY, city)
    if (coords) {
      sessionStorage.setItem(SESSION_COORDS_KEY, JSON.stringify(coords))
      localStorage.setItem(SESSION_COORDS_KEY, JSON.stringify(coords))
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
): { cityName: string; stateCode: string; fullFormatted: string; specificArea: string } {
  if (!Array.isArray(comps) || comps.length === 0) {
    const fallback = getStoredCity() || DEFAULT_CITY_ENV
    return { cityName: fallback, stateCode: '', fullFormatted: fallback, specificArea: fallback }
  }

  const getComp = (type: string) => comps.find((c: any) => c.types && c.types.includes(type))?.long_name || ''
  const getShort = (type: string) => comps.find((c: any) => c.types && c.types.includes(type))?.short_name || ''

  const neighborhood = getComp('neighborhood')
  const sublocality3 = getComp('sublocality_level_3')
  const sublocality2 = getComp('sublocality_level_2')
  const sublocality1 = getComp('sublocality_level_1') || getComp('sublocality')
  const locality = getComp('locality')
  const admin3 = getComp('administrative_area_level_3')
  const admin2 = getComp('administrative_area_level_2')
  const stateCode = getShort('administrative_area_level_1') || getShort('country') || ''

  // Most specific sublocality/area (e.g. "Naigaon West")
  const specificArea = sublocality2 || sublocality1 || neighborhood || locality || ''

  // Local town/locality (e.g. "Naigaon West" or "Naigaon") prioritized over broad metropolitan locality ("Mumbai")
  const resolvedCity = sublocality2 || sublocality1 || neighborhood || locality || admin3 || admin2 || specificArea || ''

  const fullFormatted = stateCode && resolvedCity && !resolvedCity.includes(stateCode)
    ? `${resolvedCity}, ${stateCode}`
    : resolvedCity

  return {
    cityName: resolvedCity,
    stateCode,
    fullFormatted,
    specificArea,
  }
}

export function useCityLocation(defaultCity?: string) {
  const [city, setCityState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const inSession =
          sessionStorage.getItem(SESSION_CITY_KEY) ||
          localStorage.getItem(SESSION_CITY_KEY)
        if (inSession) return inSession
      } catch {}
    }
    return defaultCity || getStoredCity() || DEFAULT_CITY_ENV
  })

  // On page mount, detect live GPS dynamically
  useEffect(() => {
    const sessionCity =
      typeof window !== 'undefined'
        ? sessionStorage.getItem(SESSION_CITY_KEY) || localStorage.getItem(SESSION_CITY_KEY)
        : null

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const liveCoords = { lat: latitude, lng: longitude }

          // If Google Maps Geocoder is available, reverse-geocode dynamically
          if ((window as any).google?.maps?.Geocoder) {
            try {
              const geocoder = new (window as any).google.maps.Geocoder()
              geocoder.geocode({ location: liveCoords }, (results: any, status: any) => {
                if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                  const comps = results[0]?.address_components || []
                  const formattedAddress = results[0]?.formatted_address || ''
                  const accurate = resolveAccurateCityFromComponents(comps, latitude, longitude, formattedAddress)
                  
                  if (!sessionCity) {
                    setStoredCity(accurate.fullFormatted, liveCoords)
                    setCityState(accurate.fullFormatted)
                  }
                }
              })
              return
            } catch {}
          }

          if (!sessionCity) {
            setStoredCity(city || DEFAULT_CITY_ENV, liveCoords)
          }
        },
        (err) => {
          console.warn('Live location detection skipped/denied:', err)
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    }

    // Sync state if city changes anywhere in app in the current active session
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
  }, [city])

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
