/**
 * Client-Side Geocoding & Places Cache Manager for Studio
 * Prevents redundant Google Maps API calls, caching coordinate lookups and place details.
 */

export interface CachedAddress {
  houseNo: string
  apartment: string
  locality: string
  city: string
  postcode?: string
  formattedAddress: string
  timestamp: number
}

const memoryGeocodeCache = new Map<string, CachedAddress>()
const memoryPlaceDetailsCache = new Map<string, { lat: number; lng: number; formattedAddress: string }>()

/** Round coordinate to 4 decimals (~11 meters precision) for optimal cache hit rate */
export function getCoordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`
}

/** Check and retrieve cached reverse geocode result */
export function getCachedReverseGeocode(lat: number, lng: number): CachedAddress | null {
  const key = getCoordKey(lat, lng)

  if (memoryGeocodeCache.has(key)) {
    return memoryGeocodeCache.get(key)!
  }

  if (typeof window !== 'undefined') {
    try {
      const item = sessionStorage.getItem(`tg_studio_geo_${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        memoryGeocodeCache.set(key, parsed)
        return parsed
      }
    } catch { }
  }

  return null
}

/** Store reverse geocode result into cache */
export function setCachedReverseGeocode(lat: number, lng: number, data: Omit<CachedAddress, 'timestamp'>): void {
  const key = getCoordKey(lat, lng)
  const fullData: CachedAddress = {
    ...data,
    timestamp: Date.now(),
  }

  memoryGeocodeCache.set(key, fullData)

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`tg_studio_geo_${key}`, JSON.stringify(fullData))
    } catch { }
  }
}

/** Retrieve cached Place Details coordinates */
export function getCachedPlaceDetails(placeId: string): { lat: number; lng: number; formattedAddress: string } | null {
  if (memoryPlaceDetailsCache.has(placeId)) {
    return memoryPlaceDetailsCache.get(placeId)!
  }

  if (typeof window !== 'undefined') {
    try {
      const item = sessionStorage.getItem(`tg_studio_place_${placeId}`)
      if (item) {
        const parsed = JSON.parse(item)
        memoryPlaceDetailsCache.set(placeId, parsed)
        return parsed
      }
    } catch { }
  }

  return null
}

/** Store Place Details coordinates into cache */
export function setCachedPlaceDetails(placeId: string, data: { lat: number; lng: number; formattedAddress: string }): void {
  memoryPlaceDetailsCache.set(placeId, data)
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`tg_studio_place_${placeId}`, JSON.stringify(data))
    } catch { }
  }
}

/**
 * Autocomplete Session Token Manager
 */
let currentSessionToken: any = null

export function getOrCreatePlacesSessionToken(): any {
  if (!currentSessionToken && typeof google !== 'undefined' && google.maps?.places) {
    try {
      if ((google.maps.places as any).AutocompleteSessionToken) {
        currentSessionToken = new (google.maps.places as any).AutocompleteSessionToken()
      }
    } catch { }
  }
  return currentSessionToken
}

export function resetPlacesSessionToken(): void {
  currentSessionToken = null
}
