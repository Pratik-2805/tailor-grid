'use client'

import { useState, useEffect, useCallback } from 'react'

const SESSION_CITY_KEY = 'tg_session_city'
const SESSION_COORDS_KEY = 'tg_session_coords'

export function getStoredCity(): string {
  if (typeof window === 'undefined') return 'Vasai, IN-MH'
  try {
    return sessionStorage.getItem(SESSION_CITY_KEY) || 'Vasai, IN-MH'
  } catch {
    return 'Vasai, IN-MH'
  }
}

export function getSessionCoordinates(): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_COORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function setStoredCity(city: string, coords?: { lat: number; lng: number }) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_CITY_KEY, city)
    const effectiveCoords = coords || getCityCoordinates(city)
    sessionStorage.setItem(SESSION_COORDS_KEY, JSON.stringify(effectiveCoords))
    window.dispatchEvent(new CustomEvent('tg_city_changed', { detail: city }))
  } catch (err) {
    console.warn('Error saving session city:', err)
  }
}

export function useCityLocation(defaultCity: string = 'Vasai, IN-MH') {
  const [city, setCityState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const inSession = sessionStorage.getItem(SESSION_CITY_KEY)
        if (inSession) return inSession
      } catch {}
    }
    return defaultCity
  })

  // On page mount, if no session city was manually picked, detect live GPS
  useEffect(() => {
    const sessionCity = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_CITY_KEY) : null

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const liveCoords = { lat: latitude, lng: longitude }
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            if (res.ok) {
              const data = await res.json()
              const cityName = data.city || data.locality || data.principalSubdivision || 'Vasai'
              const stateCode = data.principalSubdivisionCode?.replace('US-', '') || data.countryCode || ''
              const formatted = stateCode ? `${cityName}, ${stateCode}` : cityName
              
              if (!sessionCity) {
                setStoredCity(formatted, liveCoords)
                setCityState(formatted)
              }
            }
          } catch {
            // Ignore silent fallback
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
  }, [])

  const updateCity = useCallback((newCity: string, coords?: { lat: number; lng: number }) => {
    setCityState(newCity)
    setStoredCity(newCity, coords)
  }, [])

  return [city, updateCity] as const
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Vasai, IN-MH': { lat: 19.3919, lng: 72.8397 },
  'Mumbai, IN': { lat: 19.0760, lng: 72.8777 },
  'Delhi NCR, IN': { lat: 28.6139, lng: 77.2090 },
  'Bengaluru, IN': { lat: 12.9716, lng: 77.5946 },
  'London, UK': { lat: 51.5074, lng: -0.1278 },
  'New York City, NY': { lat: 40.7128, lng: -74.0060 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Dallas-Fort Worth, TX': { lat: 32.7767, lng: -96.7970 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Washington D.C.': { lat: 38.9072, lng: -77.0369 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Las Vegas, NV': { lat: 36.1699, lng: -115.1398 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
}

export function getCityCoordinates(cityStr?: string): { lat: number; lng: number } {
  if (!cityStr) return CITY_COORDINATES['Vasai, IN-MH']
  if (CITY_COORDINATES[cityStr]) return CITY_COORDINATES[cityStr]

  const lower = cityStr.toLowerCase()
  if (lower.includes('vasai') || lower.includes('manickpur') || lower.includes('virar') || lower.includes('palghar')) {
    return CITY_COORDINATES['Vasai, IN-MH']
  }
  if (lower.includes('mumbai') || lower.includes('in-mh') || lower.includes('bombay') || lower.includes('bandra') || lower.includes('andheri')) {
    return CITY_COORDINATES['Mumbai, IN']
  }
  if (lower.includes('delhi') || lower.includes('ncr') || lower.includes('gurgaon') || lower.includes('noida')) {
    return CITY_COORDINATES['Delhi NCR, IN']
  }
  if (lower.includes('bengaluru') || lower.includes('bangalore')) {
    return CITY_COORDINATES['Bengaluru, IN']
  }
  if (lower.includes('london') || lower.includes('uk') || lower.includes('kensington') || lower.includes('chelsea')) {
    return CITY_COORDINATES['London, UK']
  }
  if (lower.includes('new york') || lower.includes('ny') || lower.includes('soho') || lower.includes('manhattan') || lower.includes('brooklyn')) {
    return CITY_COORDINATES['New York, NY']
  }
  if (lower.includes('los angeles') || lower.includes('beverly') || lower.includes('la') || lower.includes('hollywood')) {
    return CITY_COORDINATES['Los Angeles, CA']
  }
  if (lower.includes('chicago')) {
    return CITY_COORDINATES['Chicago, IL']
  }
  if (lower.includes('san francisco') || lower.includes('sf')) {
    return CITY_COORDINATES['San Francisco, CA']
  }
  if (lower.includes('miami')) {
    return CITY_COORDINATES['Miami, FL']
  }
  if (lower.includes('houston')) {
    return CITY_COORDINATES['Houston, TX']
  }
  if (lower.includes('seattle')) {
    return CITY_COORDINATES['Seattle, WA']
  }
  if (lower.includes('austin')) {
    return CITY_COORDINATES['Austin, TX']
  }
  if (lower.includes('boston')) {
    return CITY_COORDINATES['Boston, MA']
  }

  return { lat: 19.3919, lng: 72.8397 }
}
