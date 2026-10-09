'use client'

export interface SavedAddressItem {
  id: string
  title: string
  address: string
  locality?: string
  city?: string
  lat: number
  lng: number
  details?: {
    houseNo?: string
    apartment?: string
    locality?: string
    city?: string
    landmark?: string
  }
  savedAt: number
}

const STORAGE_KEY_PREFIX = 'tg_saved_addresses'

export function getSavedAddresses(userId?: string): SavedAddressItem[] {
  if (typeof window === 'undefined') return []

  try {
    const key = userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }

    // Fallback: check legacy single saved address key
    const singleRaw = localStorage.getItem(`tg_saved_address_${userId || 'guest'}`)
    if (singleRaw) {
      const single = JSON.parse(singleRaw)
      if (single && single.address && single.coords) {
        const item: SavedAddressItem = {
          id: 'legacy-saved',
          title: single.details?.apartment || single.details?.locality || 'Saved Address',
          address: single.address,
          locality: single.details?.locality,
          city: single.details?.city,
          lat: single.coords.lat,
          lng: single.coords.lng,
          details: single.details,
          savedAt: Date.now(),
        }
        return [item]
      }
    }
  } catch (err) {
    console.warn('Error reading saved addresses:', err)
  }

  return []
}

export function addSavedAddress(
  item: {
    title?: string
    address: string
    locality?: string
    city?: string
    lat: number
    lng: number
    details?: {
      houseNo?: string
      apartment?: string
      locality?: string
      city?: string
      landmark?: string
    }
  },
  userId?: string
): SavedAddressItem[] {
  if (typeof window === 'undefined') return []

  try {
    const existing = getSavedAddresses(userId)
    const title =
      item.title ||
      item.details?.apartment ||
      item.details?.locality ||
      item.locality ||
      item.address.split(',')[0] ||
      'Saved Address'

    const newItem: SavedAddressItem = {
      id: `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      address: item.address,
      locality: item.locality || item.details?.locality,
      city: item.city || item.details?.city,
      lat: item.lat,
      lng: item.lng,
      details: item.details,
      savedAt: Date.now(),
    }

    // Prevent exact duplicates
    const filtered = existing.filter(
      (a) =>
        Math.abs(a.lat - item.lat) > 0.0001 ||
        Math.abs(a.lng - item.lng) > 0.0001 ||
        a.address.trim().toLowerCase() !== item.address.trim().toLowerCase()
    )

    const updated = [newItem, ...filtered].slice(0, 10)
    const key = userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX
    localStorage.setItem(key, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(updated))

    window.dispatchEvent(new CustomEvent('tg_saved_addresses_changed', { detail: updated }))
    return updated
  } catch (err) {
    console.warn('Error saving address:', err)
    return []
  }
}

export function removeSavedAddress(id: string, userId?: string): SavedAddressItem[] {
  if (typeof window === 'undefined') return []

  try {
    const existing = getSavedAddresses(userId)
    const updated = existing.filter((a) => a.id !== id)
    const key = userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX
    localStorage.setItem(key, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(updated))

    window.dispatchEvent(new CustomEvent('tg_saved_addresses_changed', { detail: updated }))
    return updated
  } catch (err) {
    console.warn('Error removing saved address:', err)
    return []
  }
}
