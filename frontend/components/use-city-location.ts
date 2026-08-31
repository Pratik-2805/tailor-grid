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
