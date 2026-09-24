'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
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

export function calculateDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
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
  isFixed?: boolean
  fixedBoxMiles?: number
  showUserPin?: boolean
  userPinLabel?: string
  stores?: StoreOption[]
  selectedStoreId?: string
  radiusMiles?: number
  showRadiusCircle?: boolean
  showCurvedConnection?: boolean
  onSelectStore?: (store: StoreOption) => void
  onStoresFound?: (stores: StoreOption[]) => void
}

export function generateCurvedPoints(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  curvature: number = 0.18,
  numPoints: number = 24
): google.maps.LatLng[] {
  const points: google.maps.LatLng[] = []
  const midLat = (p1.lat + p2.lat) / 2
  const midLng = (p1.lng + p2.lng) / 2
  const dLat = p2.lat - p1.lat
  const dLng = p2.lng - p1.lng

  // Perpendicular control point offset for natural arc
  const ctrlLat = midLat - dLng * curvature
  const ctrlLng = midLng + dLat * curvature

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const lat = (1 - t) * (1 - t) * p1.lat + 2 * (1 - t) * t * ctrlLat + t * t * p2.lat
    const lng = (1 - t) * (1 - t) * p1.lng + 2 * (1 - t) * t * ctrlLng + t * t * p2.lng
    points.push(new google.maps.LatLng(lat, lng))
  }
  return points
}

export default function CleanGoogleMap({
  lat,
  lng,
  storeName,
  storeAddress,
  origin,
  userCoords,
  className = '',
  onMapClick,
  showZoomControls = false,
  disableNavigation = false,
  isFixed = false,
  fixedBoxMiles = 6.0,
  showUserPin = true,
  userPinLabel = 'You',
  stores = [],
  selectedStoreId,
  radiusMiles = 3.0,
  showRadiusCircle = false,
  showCurvedConnection = false,
  onSelectStore,
  onStoresFound,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<any[]>([])

  const [loadError, setLoadError] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // 1. Initial Google Maps Engine Mount (RUNS ONCE ONLY - prevents unneeded re-renders)
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

    if (!apiKey) {
      setLoadError(true)
      return
    }

    let isMounted = true

    async function initMapEngine() {
      try {
        if (typeof window !== 'undefined') {
          const w = window as any
          if (!w.__googleMapsOptionsConfigured) {
            try {
              setOptions({
                key: apiKey,
                v: 'weekly',
              })
              w.__googleMapsOptionsConfigured = true
            } catch (e) {
              // Ignore if already configured
            }
          }
        }

        const { Map } = await importLibrary('maps')

        if (!isMounted || !mapRef.current) return

        // Calculate 8 miles by 8 miles bounding box around center (4 miles in each cardinal direction)
        const halfMiles = fixedBoxMiles / 2.0
        const deltaLat = halfMiles / 69.0
        const deltaLng = halfMiles / (69.0 * Math.cos((lat * Math.PI) / 180))

        const bounds8x8 = new google.maps.LatLngBounds(
          new google.maps.LatLng(lat - deltaLat, lng - deltaLng),
          new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
        )

        // Create persistent clean Google Map instance
        const map = new Map(mapRef.current, {
          center: { lat, lng },
          zoom: 13,
          minZoom: 10,
          maxZoom: 18,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          draggable: !isFixed,
          keyboardShortcuts: false,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: isFixed ? 'none' : 'cooperative',
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

        if (isFixed) {
          map.fitBounds(bounds8x8, 0)
          map.setCenter({ lat, lng })
        }

        mapInstanceRef.current = map

        if (isMounted) {
          setIsReady(true)
        }
      } catch (err) {
        console.warn('Google Maps JS API load failed, falling back to embed:', err)
        if (isMounted) {
          setLoadError(true)
        }
      }
    }

    initMapEngine()

    return () => {
      isMounted = false
      markersRef.current.forEach((m) => {
        if (m && m.setMap) m.setMap(null)
      })
      markersRef.current = []
    }
  }, [])

  // 2. Pan or Lock center coordinates when lat/lng change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    if (isFixed) {
      const halfMiles = fixedBoxMiles / 2.0
      const deltaLat = halfMiles / 69.0
      const deltaLng = halfMiles / (69.0 * Math.cos((lat * Math.PI) / 180))

      const bounds8x8 = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat - deltaLat, lng - deltaLng),
        new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
      )
      map.fitBounds(bounds8x8, 0)
      map.setCenter({ lat, lng })
    } else if (!showCurvedConnection) {
      map.panTo({ lat, lng })
    }
  }, [lat, lng, isReady, isFixed, fixedBoxMiles, showCurvedConnection])

  // 3. Filter stores strictly within radius and render pins
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    // Clear existing partner pins & overlays
    markersRef.current.forEach((m) => {
      if (m && m.setMap) m.setMap(null)
    })
    markersRef.current = []

    // Filter stores strictly to those within the service radius (or 8x8 box)
    const validStoresInRadius = stores.filter((st) => {
      const stLat = st.coords?.lat
      const stLng = st.coords?.lng
      if (typeof stLat !== 'number' || typeof stLng !== 'number') return false
      const dist = calculateDistanceInMiles(lat, lng, stLat, stLng)
      return dist <= (radiusMiles || fixedBoxMiles / 2.0)
    })

    if (onStoresFound && validStoresInRadius.length !== stores.length) {
      onStoresFound(validStoresInRadius)
    }

    // A. Custom Center Marker: Customer Location Pin ("You")
    if (showUserPin) {
      class CustomerLocationMarkerOverlay extends google.maps.OverlayView {
        private position: google.maps.LatLng
        private div: HTMLDivElement | null = null

        constructor(position: google.maps.LatLng) {
          super()
          this.position = position
        }

        onAdd() {
          this.div = document.createElement('div')
          this.div.style.position = 'absolute'
          this.div.style.transform = 'translate(-50%, -50%)'
          this.div.style.zIndex = '50'
          this.div.style.pointerEvents = 'none'

          this.div.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
              <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 0, 0, 0.12); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 18px; height: 18px; border-radius: 50%; background: #0F1115; border: 3px solid #FFFFFF; box-shadow: 0 2px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 2;">
                <div style="width: 5px; height: 5px; border-radius: 50%; background: #FFFFFF;"></div>
              </div>
              <div style="margin-top: 3px; background: #0F1115; color: #FFFFFF; font-size: 8px; font-weight: 800; padding: 1.5px 5px; border-radius: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; letter-spacing: 0.5px; text-transform: uppercase;">
                ${userPinLabel}
              </div>
            </div>
          `

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

      const userMarker = new CustomerLocationMarkerOverlay(new google.maps.LatLng(lat, lng))
      userMarker.setMap(map)
      markersRef.current.push(userMarker)
    }

    // B. Custom Tailor Studio Pin Overlay
    class CustomStudioMarkerOverlay extends google.maps.OverlayView {
      private position: google.maps.LatLng
      private div: HTMLDivElement | null = null
      private store: StoreOption
      private isSelected: boolean

      constructor(position: google.maps.LatLng, store: StoreOption, isSelected: boolean) {
        super()
        this.position = position
        this.store = store
        this.isSelected = isSelected
      }

      onAdd() {
        this.div = document.createElement('div')
        this.div.style.position = 'absolute'
        this.div.style.cursor = 'pointer'
        this.div.style.transform = 'translate(-50%, -100%)'
        this.div.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        this.div.style.zIndex = this.isSelected ? '999' : '100'
        this.div.title = `${this.store.name} (${this.store.distance || 'Near you'})`

        const activeBorder = this.isSelected
          ? 'border: 2.5px solid #000000; box-shadow: 0 8px 24px rgba(0,0,0,0.35);'
          : 'border: 1.5px solid #0F1115; box-shadow: 0 4px 14px rgba(0,0,0,0.22);'
        const badgeScale = this.isSelected ? 'scale(1.12)' : 'scale(1.0)'

        this.div.innerHTML = `
          <div style="transform: ${badgeScale}; transition: transform 0.2s ease; background: #FFFFFF; border-radius: 12px; ${activeBorder} padding: 2px 3px; display: flex; flex-direction: column; align-items: center; position: relative;">
            <div style="display: flex; align-items: center; justify-content: center; padding: 1px;">
              <img src="/landscape_logo.JPEG" style="height: 24px; width: auto; max-width: 60px; object-fit: cover; border-radius: 6px; display: block;" alt="${this.store.name}" />
            </div>
            <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F1115;"></div>
          </div>
        `

        this.div.addEventListener('click', (e) => {
          e.stopPropagation()
          if (onSelectStore) {
            onSelectStore(this.store)
          }
          if (!disableNavigation) {
            openCarNavigation({
              destName: this.store.name,
              destAddress: this.store.address,
              destCoords: this.store.coords,
              origin,
              userCoords,
            })
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

    // Render pins for each store inside the radius
    validStoresInRadius.forEach((st) => {
      const isSelected = st.id === selectedStoreId
      const overlay = new CustomStudioMarkerOverlay(
        new google.maps.LatLng(st.coords.lat, st.coords.lng),
        st,
        isSelected
      )
      overlay.setMap(map)
      markersRef.current.push(overlay)
    })

    // C. Dotted Curved Connection Polyline between Customer & Tailor Atelier
    if (showCurvedConnection && validStoresInRadius.length > 0) {
      const originPoint = (userCoords && userCoords.lat && userCoords.lng)
        ? userCoords
        : { lat, lng }
      const targetStore = validStoresInRadius.find((s) => s.id === selectedStoreId) || validStoresInRadius[0]

      if (
        originPoint &&
        targetStore?.coords &&
        typeof targetStore.coords.lat === 'number' &&
        typeof targetStore.coords.lng === 'number'
      ) {
        const curvePoints = generateCurvedPoints(originPoint, targetStore.coords, 0.2, 32)

        // Dotted line symbol
        const lineSymbol: google.maps.Symbol = {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 3,
          strokeColor: '#0F1115',
        }

        const curvedDottedLine = new google.maps.Polyline({
          path: curvePoints,
          strokeOpacity: 0,
          icons: [
            {
              icon: lineSymbol,
              offset: '0',
              repeat: '13px',
            },
          ],
          map,
        })

        markersRef.current.push(curvedDottedLine)

        // Smart Bounds: Extend across all curve points + apex + marker buffers
        const connectionBounds = new google.maps.LatLngBounds()
        connectionBounds.extend(new google.maps.LatLng(originPoint.lat, originPoint.lng))
        connectionBounds.extend(new google.maps.LatLng(targetStore.coords.lat, targetStore.coords.lng))

        // Extend with all curve arc points
        curvePoints.forEach((pt) => {
          connectionBounds.extend(pt)
        })

        // Add 15% margin buffer so top of tailor badge and bottom of YOU badge never touch map edges
        const ne = connectionBounds.getNorthEast()
        const sw = connectionBounds.getSouthWest()
        const latDelta = Math.max(0.003, (ne.lat() - sw.lat()) * 0.25)
        const lngDelta = Math.max(0.003, (ne.lng() - sw.lng()) * 0.25)

        const bufferedBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(sw.lat() - latDelta, sw.lng() - lngDelta),
          new google.maps.LatLng(ne.lat() + latDelta, ne.lng() + lngDelta)
        )

        map.fitBounds(bufferedBounds, { top: 32, right: 32, bottom: 32, left: 32 })

        // Smart Zoom Clamping: Prevent extreme over-zoom or under-zoom
        const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
          const currentZoom = map.getZoom() || 14
          if (currentZoom > 16.5) {
            map.setZoom(16)
          } else if (currentZoom < 12.5) {
            map.setZoom(13)
          }
        })
        setTimeout(() => google.maps.event.removeListener(listener), 1500)
      }
    } else if (!isFixed && validStoresInRadius.length > 1) {
      // If map is NOT fixed and stores exist, fit bounds to show all pins
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(new google.maps.LatLng(lat, lng))
      validStoresInRadius.forEach((st) => {
        bounds.extend(new google.maps.LatLng(st.coords.lat, st.coords.lng))
      })
      map.fitBounds(bounds, 36)
    }
  }, [stores, selectedStoreId, lat, lng, radiusMiles, disableNavigation, isReady, origin, userCoords, isFixed, fixedBoxMiles, showUserPin, userPinLabel, showCurvedConnection, onSelectStore, onStoresFound])

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 13
      mapInstanceRef.current.setZoom(currentZoom + 1)
    }
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 13
      mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 1))
    }
  }

  const query = encodeURIComponent(`tailor in ${origin || `${lat},${lng}`}`)

  return (
    <div
      onClick={!disableNavigation && onMapClick ? onMapClick : undefined}
      className={`w-full h-full relative overflow-hidden rounded-[28px] ${disableNavigation ? 'cursor-default' : 'cursor-pointer'
        } ${className}`}
    >
      {/* Fallback Embed or Dynamic Map Instance */}
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

      {/* Optional Zoom Controls */}
      {showZoomControls && isReady && !loadError && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 shadow-sm">
          <button
            type="button"
            onClick={handleZoomIn}
            className="size-8 rounded-lg bg-white hover:bg-neutral-100 text-black font-bold flex items-center justify-center border border-gray-200 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="size-8 rounded-lg bg-white hover:bg-neutral-100 text-black font-bold flex items-center justify-center border border-gray-200 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Zoom out"
          >
            &minus;
          </button>
        </div>
      )}

      {!isReady && !loadError && (
        <div className="absolute inset-0 bg-[#EBE7E0] animate-pulse rounded-[28px] flex items-center justify-center pointer-events-none">
          <div className="size-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
