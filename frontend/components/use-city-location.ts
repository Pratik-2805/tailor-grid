'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'tg_selected_city'

export function getStoredCity(): string {
  if (typeof window === 'undefined') return 'New York City, NY'
  try {
    return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || 'New York City, NY'
  } catch {
    return 'New York City, NY'
  }
}

export function setStoredCity(city: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, city)
    sessionStorage.setItem(STORAGE_KEY, city)
    window.dispatchEvent(new CustomEvent('tg_city_changed', { detail: city }))
  } catch (err) {
    console.warn('Error saving city to storage:', err)
  }
}

export function useCityLocation(defaultCity: string = 'New York City, NY') {
  const [city, setCityState] = useState<string>(defaultCity)

  // Initialize from storage & check permission on mount
  useEffect(() => {
    const stored = getStoredCity()
    if (stored) {
      setCityState(stored)
    }

    // Check if geolocation permission is already granted
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
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
                  const formatted = `${cityName}, ${stateCode}`
                  setStoredCity(formatted)
                  setCityState(formatted)
                }
              } catch {
                // Ignore silent failure
              }
            },
            () => {},
            { timeout: 5000 }
          )
        }
      }).catch(() => {})
    }

    // Sync state if city changes anywhere in app
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setCityState(customEvent.detail)
      } else {
        setCityState(getStoredCity())
      }
    }

    window.addEventListener('tg_city_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener('tg_city_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const updateCity = useCallback((newCity: string) => {
    setCityState(newCity)
    setStoredCity(newCity)
  }, [])

  return [city, updateCity] as const
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Vasai, IN-MH': { lat: 19.3919, lng: 72.8397 },
  'Mumbai, IN': { lat: 19.0760, lng: 72.8777 },
  'Delhi NCR, IN': { lat: 28.6139, lng: 77.2090 },
  'Bengaluru, IN': { lat: 12.9716, lng: 77.5946 },
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
  'London, UK': { lat: 51.5074, lng: -0.1278 },
}

export function getCityCoordinates(cityStr?: string): { lat: number; lng: number } {
  if (!cityStr) return CITY_COORDINATES['Vasai, IN-MH']
  if (CITY_COORDINATES[cityStr]) return CITY_COORDINATES[cityStr]

  const lower = cityStr.toLowerCase()
  if (lower.includes('vasai') || lower.includes('manickpur') || lower.includes('virar')) {
    return CITY_COORDINATES['Vasai, IN-MH']
  }
  if (lower.includes('mumbai') || lower.includes('in-mh') || lower.includes('bombay')) {
    return CITY_COORDINATES['Mumbai, IN']
  }
  if (lower.includes('new york') || lower.includes('ny') || lower.includes('soho')) {
    return CITY_COORDINATES['New York, NY']
  }
  if (lower.includes('los angeles') || lower.includes('beverly') || lower.includes('la') || lower.includes('ca')) {
    return CITY_COORDINATES['Los Angeles, CA']
  }
  if (lower.includes('london') || lower.includes('uk')) {
    return CITY_COORDINATES['London, UK']
  }
  if (lower.includes('delhi')) {
    return CITY_COORDINATES['Delhi NCR, IN']
  }
  if (lower.includes('bengaluru') || lower.includes('bangalore')) {
    return CITY_COORDINATES['Bengaluru, IN']
  }
  if (lower.includes('chicago')) {
    return CITY_COORDINATES['Chicago, IL']
  }
  if (lower.includes('san francisco') || lower.includes('sf')) {
    return CITY_COORDINATES['San Francisco, CA']
  }

  return { lat: 19.3919, lng: 72.8397 }
}
