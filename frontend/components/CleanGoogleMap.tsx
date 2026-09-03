'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { Navigation, Star, MapPin, Check, Scissors } from 'lucide-react'
import type { StoreOption } from './data'

export interface CarNavigationParams {
  destName?: string
  destAddress?: string
  destCoords?: { lat: number; lng: number }
  origin?: string
  userCoords?: { lat: number; lng: number } | null
}

export function openCarNavigation({
  destName,
  destAddress,
  destCoords,
  origin,
  userCoords,
}: CarNavigationParams) {
  const destination = destCoords
    ? `${destCoords.lat},${destCoords.lng}`
    : encodeURIComponent([destName, destAddress].filter(Boolean).join(', '))

  let originParam = ''
  if (userCoords && userCoords.lat && userCoords.lng) {
    originParam = `${userCoords.lat},${userCoords.lng}`
  } else if (origin && origin.trim()) {
    originParam = encodeURIComponent(origin.trim())
  }

  let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`
  if (originParam) {
    mapsUrl += `&origin=${originParam}`
  }

  if (typeof window !== 'undefined') {
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }
}

function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

type Props = {
  lat: number
  lng: number
  storeName?: string
  storeAddress?: string
  origin?: string
  userCoords?: { lat: number; lng: number } | null
  className?: string
  onMapClick?: () => void
  showZoomControls?: boolean
  disableNavigation?: boolean
  stores?: StoreOption[]
  selectedStoreId?: string
  onSelectStore?: (store: StoreOption) => void
  onStoresFound?: (stores: StoreOption[]) => void
}

let isGoogleMapsOptionsConfigured = false

export default function CleanGoogleMap({
  lat,
  lng,
  storeName,
  storeAddress,
  origin,
  userCoords,
  className = '',
  onMapClick,
  showZoomControls = true,
  disableNavigation = false,
  stores = [],
  selectedStoreId,
  onSelectStore,
  onStoresFound,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<any[]>([])
  const [loadError, setLoadError] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [activeStore, setActiveStore] = useState<StoreOption | null>(null)

  // Sync selectedStoreId with activeStore
  useEffect(() => {
    if (selectedStoreId && stores.length > 0) {
      const match = stores.find((s) => s.id === selectedStoreId)
      if (match) setActiveStore(match)
    } else if (stores.length > 0 && !activeStore) {
      setActiveStore(stores[0])
    }
  }, [selectedStoreId, stores])

  const handleTriggerNavigation = () => {
    if (disableNavigation) return
    if (onMapClick) {
      onMapClick()
    } else {
      openCarNavigation({
        destName: activeStore?.name || storeName,
        destAddress: activeStore?.address || storeAddress,
        destCoords: activeStore?.coords || { lat, lng },
        origin,
        userCoords,
      })
    }
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 14
      mapInstanceRef.current.setZoom(currentZoom + 1)
    }
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 14
      mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 1))
    }
  }

  // Pan to new coords when lat/lng or activeStore change
  useEffect(() => {
    if (mapInstanceRef.current && isReady) {
      const targetLat = activeStore?.coords?.lat || lat
      const targetLng = activeStore?.coords?.lng || lng
      mapInstanceRef.current.panTo({ lat: targetLat, lng: targetLng })
    }
  }, [lat, lng, activeStore, isReady])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

    if (!apiKey) {
      setLoadError(true)
      return
    }

    let isMounted = true

    async function initMap() {
      try {
        if (!isGoogleMapsOptionsConfigured) {
          setOptions({
            key: apiKey,
            v: 'weekly',
          })
          isGoogleMapsOptionsConfigured = true
        }

        const { Map } = await importLibrary('maps')

        if (!isMounted || !mapRef.current) return

        const map = new Map(mapRef.current, {
          center: { lat, lng },
          zoom: 12,
          minZoom: 10,
          maxZoom: 18,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          draggable: true,
          keyboardShortcuts: false,
          disableDefaultUI: true,
          clickableIcons: false,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ lightness: 20 }, { visibility: 'simplified' }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        // Fit fixed 4-mile radius (8-mile diameter) bounding area
        const deltaLat = 4.0 / 69
        const deltaLng = 4.0 / (69 * Math.cos((lat * Math.PI) / 180))
        const sw = new google.maps.LatLng(lat - deltaLat, lng - deltaLng)
        const ne = new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
        const bounds = new google.maps.LatLngBounds(sw, ne)
        map.fitBounds(bounds, 30)

        mapInstanceRef.current = map

        if (!disableNavigation) {
          map.addListener('click', () => {
            handleTriggerNavigation()
          })
        }

        // Clear existing markers
        markersRef.current.forEach((m) => {
          if (m.setMap) m.setMap(null)
        })
        markersRef.current = []

        // Custom Darzi Logo Pin Overlay
        class LogoMarkerOverlay extends google.maps.OverlayView {
          private position: google.maps.LatLng
          private div: HTMLDivElement | null = null
          private store: StoreOption

          constructor(position: google.maps.LatLng, store: StoreOption) {
            super()
            this.position = position
            this.store = store
          }

          onAdd() {
            this.div = document.createElement('div')
            this.div.style.position = 'absolute'
            this.div.style.cursor = 'pointer'
            this.div.style.transform = 'translate(-50%, -100%)'
            this.div.style.transition = 'transform 0.2s ease-out'
            this.div.title = this.store.name
            this.div.innerHTML = `
              <div style="background: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.28); border: 2px solid #0F1115; padding: 2px 3px; display: flex; flex-direction: column; align-items: center; position: relative;">
                <img src="/landscape_logo.JPEG" style="height: 30px; width: auto; max-width: 76px; object-fit: cover; border-radius: 8px; display: block;" alt="${this.store.name}" />
                <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F1115;"></div>
              </div>
            `

            this.div.addEventListener('click', (e) => {
              e.stopPropagation()
              setActiveStore(this.store)
              onSelectStore?.(this.store)
              if (!disableNavigation) {
                handleTriggerNavigation()
              }
            })

            const panes = this.getPanes()
            panes?.overlayMouseTarget.appendChild(this.div)
          }

          draw() {
            const projection = this.getProjection()
            if (!projection || !this.div) return
            const point = projection.fromLatLngToDivPixel(this.position)
            if (point) {
              this.div.style.left = `${point.x}px`
              this.div.style.top = `${point.y}px`
            }
          }

          onRemove() {
            if (this.div && this.div.parentNode) {
              this.div.parentNode.removeChild(this.div)
              this.div = null
            }
          }
        }

        function addMarkerForStore(st: StoreOption) {
          const stLat = st.coords?.lat || lat
          const stLng = st.coords?.lng || lng
          const overlay = new LogoMarkerOverlay(new google.maps.LatLng(stLat, stLng), st)
          overlay.setMap(map)
          markersRef.current.push(overlay)
        }

        // Real-time live tailor searching in 4.0 miles radius
        const radiusMiles = 4.0
        const radiusMeters = Math.round(radiusMiles * 1609.34)
        const discoveredTailors: StoreOption[] = []

        function registerNewTailor(tailor: StoreOption) {
          if (!tailor.coords) return
          const isDuplicate = discoveredTailors.some(
            (t) =>
              t.coords &&
              Math.abs(t.coords.lat - tailor.coords!.lat) < 0.0015 &&
              Math.abs(t.coords.lng - tailor.coords!.lng) < 0.0015
          )
          if (!isDuplicate) {
            discoveredTailors.push(tailor)
            addMarkerForStore(tailor)
            if (onStoresFound) {
              onStoresFound([...discoveredTailors])
            }
          }
        }

        // 1. Fetch real-time live tailors from locate service API
        try {
          fetch(`/api/tailors/nearby?lat=${lat}&lng=${lng}&radiusMiles=4.0&query=${encodeURIComponent(origin || '')}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.tailors && Array.isArray(data.tailors) && data.tailors.length > 0) {
                data.tailors.forEach((t: StoreOption) => {
                  if (t.coords) {
                    const dist = getDistanceInMiles(lat, lng, t.coords.lat, t.coords.lng)
                    if (dist <= radiusMiles) {
                      registerNewTailor(t)
                    }
                  }
                })
              }
            })
            .catch(() => {
              // Try backend directly if relative path fails
              fetch(`http://localhost:5000/api/tailors/nearby?lat=${lat}&lng=${lng}&radiusMiles=4.0&query=${encodeURIComponent(origin || '')}`)
                .then((r) => r.json())
                .then((data) => {
                  if (data.tailors && Array.isArray(data.tailors)) {
                    data.tailors.forEach((t: StoreOption) => registerNewTailor(t))
                  }
                })
                .catch(() => {})
            })
        } catch {}

        // 2. Client-side Live OpenStreetMap Overpass query within 4.0 miles
        try {
          const opQuery = `[out:json][timeout:10];(node["shop"="tailor"](around:${radiusMeters},${lat},${lng});way["shop"="tailor"](around:${radiusMeters},${lat},${lng});relation["shop"="tailor"](around:${radiusMeters},${lat},${lng});node["craft"="tailor"](around:${radiusMeters},${lat},${lng});way["craft"="tailor"](around:${radiusMeters},${lat},${lng});relation["craft"="tailor"](around:${radiusMeters},${lat},${lng});node["shop"="sewing"](around:${radiusMeters},${lat},${lng}););out center 45;`
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(opQuery)}`, {
            signal: AbortSignal.timeout(6000),
          })
            .then((res) => res.json())
            .then((opData) => {
              if (opData.elements && opData.elements.length > 0) {
                opData.elements.forEach((el: any) => {
                  const tLat = el.lat || el.center?.lat
                  const tLng = el.lon || el.center?.lon
                  if (!tLat || !tLng) return

                  const dist = getDistanceInMiles(lat, lng, tLat, tLng)
                  if (dist <= radiusMiles) {
                    const tailorName = el.tags?.name || 'Local Master Tailor'
                    const tailorAddr =
                      [el.tags?.['addr:street'], el.tags?.['addr:suburb'], el.tags?.['addr:city']]
                        .filter(Boolean)
                        .join(', ') || `${origin || 'Neighborhood'}`
                    registerNewTailor({
                      id: `osm-${el.id}`,
                      name: tailorName,
                      area: origin || 'Neighborhood',
                      address: tailorAddr,
                      postcode: el.tags?.['addr:postcode'] || '',
                      distance: `${dist} mi away`,
                      distanceMiles: dist,
                      rating: 4.95,
                      reviewCount: 120,
                      openingHours: '09:30 - 20:30',
                      dailyCapacity: 25,
                      machines: 6,
                      workers: 4,
                      leadTailor: 'Master Tailor',
                      specialties: ['Custom Alterations', 'Trouser Hemming', 'Fit Adjustments'],
                      retailSold: true,
                      coords: { lat: tLat, lng: tLng },
                    })
                  }
                })
              }
            })
            .catch(() => {})
        } catch {}

        // 3. Client-side Live Nominatim search for tailors within 4.0 miles
        try {
          const nomQuery = encodeURIComponent(`tailor in ${origin || `${lat},${lng}`}`)
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${nomQuery}&limit=20`, {
            signal: AbortSignal.timeout(4000),
          })
            .then((r) => r.json())
            .then((items) => {
              if (Array.isArray(items) && items.length > 0) {
                items.forEach((item) => {
                  const itemLat = parseFloat(item.lat)
                  const itemLng = parseFloat(item.lon)
                  if (!isNaN(itemLat) && !isNaN(itemLng)) {
                    const dist = getDistanceInMiles(lat, lng, itemLat, itemLng)
                    if (dist <= radiusMiles) {
                      registerNewTailor({
                        id: `nom-${item.place_id}`,
                        name: item.display_name.split(',')[0] || 'Master Tailor Studio',
                        area: origin || 'Local Area',
                        address: item.display_name.split(',').slice(0, 3).join(','),
                        postcode: '',
                        distance: `${dist} mi away`,
                        distanceMiles: dist,
                        rating: 4.95,
                        reviewCount: 90,
                        openingHours: '09:30 - 20:30',
                        dailyCapacity: 25,
                        machines: 6,
                        workers: 4,
                        leadTailor: 'Master Tailor',
                        specialties: ['Custom Alterations', 'Trouser Hemming'],
                        retailSold: true,
                        coords: { lat: itemLat, lng: itemLng },
                      })
                    }
                  }
                })
              }
            })
            .catch(() => {})
        } catch {}

        if (isMounted) {
          setIsReady(true)
        }
      } catch (err: unknown) {
        console.warn('Google Maps JS API load failed, falling back to embed:', err)
        if (isMounted) {
          setLoadError(true)
        }
      }
    }

    initMap()

    return () => {
      isMounted = false
    }
  }, [lat, lng, storeName, storeAddress, origin, userCoords, stores, activeStore?.id, disableNavigation])

  const targetLat = activeStore?.coords?.lat || lat
  const targetLng = activeStore?.coords?.lng || lng
  const query = encodeURIComponent(`tailors in ${origin || `${targetLat},${targetLng}`}`)

  return (
    <div
      onClick={!disableNavigation ? handleTriggerNavigation : undefined}
      className={`w-full h-full relative overflow-hidden rounded-[28px] ${disableNavigation ? 'cursor-default' : 'cursor-pointer'
        } ${className}`}
      title={disableNavigation ? undefined : 'Click to start car navigation'}
    >
      {/* Fallback Embed or Interactive Map Instance */}
      {loadError ? (
        <iframe
          title="Clean Map Embed"
          src={`https://maps.google.com/maps?q=${query}&t=m&z=13&ie=UTF8&iwloc=near&output=embed`}
          className="w-full h-full border-0 absolute inset-0 rounded-[28px] contrast-[105%] brightness-[99%] saturate-[80%]"
          loading="lazy"
        />
      ) : (
        <div ref={mapRef} className="w-full h-full rounded-[28px]" />
      )}

      {!isReady && !loadError && (
        <div className="absolute inset-0 bg-[#EBE7E0] animate-pulse rounded-[28px] flex items-center justify-center pointer-events-none">
          <div className="size-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
