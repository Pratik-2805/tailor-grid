'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { Check, Search, X, MapPin, Loader2 } from 'lucide-react'
import type { StoreOption } from './data'
import {
  getCachedReverseGeocode,
  setCachedReverseGeocode,
  getCachedPlaceDetails,
  setCachedPlaceDetails,
  getOrCreatePlacesSessionToken,
  resetPlacesSessionToken,
} from '@/lib/geocode-cache'

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
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2
  const clampedA = Math.min(1, Math.max(0, a))
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA))
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
  isFixed?: boolean
  fixedBoxMiles?: number
  showUserPin?: boolean
  isLiveLocation?: boolean
  isLocationSaved?: boolean
  userPinLabel?: string
  stores?: StoreOption[]
  selectedStoreId?: string
  radiusMiles?: number
  showRadiusCircle?: boolean
  showCurvedConnection?: boolean
  onSelectStore?: (store: StoreOption) => void
  onStoresFound?: (stores: StoreOption[]) => void
  onPinLocationChange?: (coords: { lat: number; lng: number }) => void
  onConfirmPinLocation?: (coords: { lat: number; lng: number }, address?: string) => void
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

const MINIMALIST_MAP_STYLES: google.maps.MapTypeStyle[] = [
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
]

const CHOOSING_MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 3 }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { lightness: 10 }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
]

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
  fixedBoxMiles = 5.0,
  showUserPin = true,
  isLiveLocation = false,
  isLocationSaved = false,
  userPinLabel = 'You',
  stores = [],
  selectedStoreId,
  radiusMiles = 5.0,
  showRadiusCircle = false,
  showCurvedConnection = false,
  onSelectStore,
  onStoresFound,
  onPinLocationChange,
  onConfirmPinLocation,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const googlePlacesServiceRef = useRef<any>(null)
  const googleGeocoderRef = useRef<any>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [loadError, setLoadError] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Map Search Bar State in Choosing Mode
  const [mapSearchText, setMapSearchText] = useState('')
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      title: string
      subtitle: string
      fullName: string
      placeId?: string
    }>
  >([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMapDragging, setIsMapDragging] = useState(false)

  const isChoosing = !isLiveLocation && !isLocationSaved

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

        // Load Geocoding library for pin reverse-geocoding
        try {
          const { Geocoder } = (await importLibrary('geocoding')) as any
          googleGeocoderRef.current = new Geocoder()
        } catch {}

        if (!isMounted || !mapRef.current) return

        // Calculate 5-mile radius bounding box (10 miles diameter in all directions)
        const radius = radiusMiles || fixedBoxMiles || 5.0
        const deltaLat = radius / 69.0
        const deltaLng = radius / (69.0 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)))

        const boundsBox = new google.maps.LatLngBounds(
          new google.maps.LatLng(lat - deltaLat, lng - deltaLng),
          new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
        )

        // When choosing location, enable zooming and panning to select actual location
        const isInteractive = isChoosing

        // Create persistent clean Google Map instance
        const map = new Map(mapRef.current, {
          center: { lat, lng },
          zoom: isChoosing ? 16 : 13,
          minZoom: isChoosing ? 10 : 13,
          maxZoom: isChoosing ? 21 : 13,
          scrollwheel: isInteractive,
          disableDoubleClickZoom: !isInteractive,
          draggable: isInteractive,
          keyboardShortcuts: false,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: isInteractive ? 'cooperative' : 'none',
          styles: isChoosing ? CHOOSING_MAP_STYLES : MINIMALIST_MAP_STYLES,
        })

        if ((isFixed || isLocationSaved || isLiveLocation) && !isChoosing && !showCurvedConnection) {
          map.fitBounds(boundsBox, 0)
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

  // Update map interactive gestures and style labels dynamically when isChoosing changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    const isInteractive = isChoosing
    map.setOptions({
      draggable: isInteractive,
      scrollwheel: isInteractive,
      disableDoubleClickZoom: !isInteractive,
      gestureHandling: isInteractive ? 'cooperative' : 'none',
      minZoom: isChoosing ? 10 : 13,
      maxZoom: isChoosing ? 21 : 13,
      styles: isChoosing ? CHOOSING_MAP_STYLES : MINIMALIST_MAP_STYLES,
    })

    if (!isChoosing && !showCurvedConnection) {
      const halfMiles = fixedBoxMiles / 2.0
      const deltaLat = halfMiles / 69.0
      const deltaLng = halfMiles / (69.0 * Math.cos((lat * Math.PI) / 180))

      const boundsBox = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat - deltaLat, lng - deltaLng),
        new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
      )
      map.fitBounds(boundsBox, 0)
      map.setCenter({ lat, lng })
    }
  }, [isChoosing, isReady, lat, lng, fixedBoxMiles, showCurvedConnection])

  // Move the map or click on map to fine-tune/select actual desired location drop pin when in choosing mode
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady || !isChoosing) return

    const dragStartListener = map.addListener('dragstart', () => {
      setIsMapDragging(true)
    })

    const dragEndListener = map.addListener('dragend', () => {
      setIsMapDragging(false)
      const center = map.getCenter()
      if (center && onPinLocationChange) {
        onPinLocationChange({ lat: center.lat(), lng: center.lng() })
      }
    })

    const idleListener = map.addListener('idle', () => {
      setIsMapDragging(false)
    })

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onPinLocationChange) {
        map.panTo(e.latLng)
        onPinLocationChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      }
    })

    return () => {
      google.maps.event.removeListener(dragStartListener)
      google.maps.event.removeListener(dragEndListener)
      google.maps.event.removeListener(idleListener)
      google.maps.event.removeListener(clickListener)
    }
  }, [isReady, isChoosing, onPinLocationChange])

  // 2. Pan or Lock center coordinates when lat/lng change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    if (!isChoosing && !showCurvedConnection) {
      const radius = radiusMiles || fixedBoxMiles || 5.0
      const deltaLat = radius / 69.0
      const deltaLng = radius / (69.0 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)))

      const boundsBox = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat - deltaLat, lng - deltaLng),
        new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
      )
      map.fitBounds(boundsBox, 0)
      map.setCenter({ lat, lng })
    } else if (!showCurvedConnection) {
      const currentCenter = map.getCenter()
      if (currentCenter) {
        const dLat = Math.abs(currentCenter.lat() - lat)
        const dLng = Math.abs(currentCenter.lng() - lng)
        // Only pan if coordinate significantly changed from external source (> 30 meters)
        if (dLat > 0.0003 || dLng > 0.0003) {
          map.panTo({ lat, lng })
        }
      }
    }
  }, [lat, lng, isReady, isChoosing, fixedBoxMiles, radiusMiles, showCurvedConnection])

  // 3. Filter stores strictly within radius and render pins
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    // Clear existing partner pins & overlays
    markersRef.current.forEach((m) => {
      if (m && m.setMap) m.setMap(null)
    })
    markersRef.current = []

    // Filter stores strictly to those within the 5-mile service radius
    const validStoresInRadius = stores.filter((st) => {
      const stLat = st.coords?.lat
      const stLng = st.coords?.lng
      if (typeof stLat !== 'number' || typeof stLng !== 'number') return false
      const dist = calculateDistanceInMiles(lat, lng, stLat, stLng)
      return dist <= (radiusMiles || fixedBoxMiles)
    })

    if (onStoresFound && validStoresInRadius.length !== stores.length) {
      onStoresFound(validStoresInRadius)
    }

    // A. Custom Center Marker: Customer Location Pin ("You" GPS pulse vs Saved Blue Pin Point)
    // In choosing mode, we render the screen-fixed Center Pin to ensure 120fps ultra-smooth movement with zero lag
    if (showUserPin && !isChoosing) {
      if (userMarkerRef.current && userMarkerRef.current.isLiveGps === isLiveLocation) {
        userMarkerRef.current.updatePosition(new google.maps.LatLng(lat, lng))
      } else {
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null)
          userMarkerRef.current = null
        }

        class CustomerLocationMarkerOverlay extends google.maps.OverlayView {
          public position: google.maps.LatLng
          private div: HTMLDivElement | null = null
          public isLiveGps: boolean

          constructor(position: google.maps.LatLng, isLiveGps: boolean = false) {
            super()
            this.position = position
            this.isLiveGps = isLiveGps
          }

          updatePosition(newPos: google.maps.LatLng) {
            this.position = newPos
            this.draw()
          }

          onAdd() {
            this.div = document.createElement('div')
            this.div.style.position = 'absolute'
            this.div.style.zIndex = '50'
            this.div.style.pointerEvents = 'none'

            if (this.isLiveGps) {
              // 1. LIVE GPS LOCATION: Pulsating Google Maps blue dot & accuracy disc
              this.div.style.transform = 'translate(-50%, -50%)'
              this.div.innerHTML = `
                <style>
                  @keyframes gmaps-ring-pulse {
                    0%   { transform: scale(1);   opacity: 1; }
                    100% { transform: scale(3.2); opacity: 0; }
                  }
                </style>
                <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
                  <div style="
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: rgba(66, 133, 244, 0.15);
                  "></div>
                  <div style="
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: rgba(66, 133, 244, 0.4);
                    animation: gmaps-ring-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                  "></div>
                  <div style="
                    position: relative;
                    z-index: 2;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #4285F4;
                    border: 3px solid #FFFFFF;
                    box-shadow:
                      0 1px 4px rgba(0,0,0,0.3),
                      0 0 0 1px rgba(66,133,244,0.3);
                  "></div>
                </div>
              `
            } else {
              // 2. SAVED / PINNED LOCATION: Sleek Compact Fluid Google Blue Pin Point marker
              this.div.style.transform = 'translate(-50%, -100%)'
              this.div.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                  <div style="width: 20px; height: 28px; position: relative; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));">
                    <svg width="20" height="28" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 0C6.26801 0 0 6.26801 0 14C0 23.8 12.3 35.7 12.9 36.3C13.5 36.9 14.5 36.9 15.1 36.3C15.7 35.7 28 23.8 28 14C28 6.26801 21.732 0 14 0Z" fill="#276EF1"/>
                      <circle cx="14" cy="13.5" r="5.5" fill="#FFFFFF"/>
                      <circle cx="14" cy="13.5" r="2.8" fill="#1B4FB8"/>
                    </svg>
                  </div>
                  <div style="width: 8px; height: 2.5px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(0.8px); margin-top: -1px;"></div>
                </div>
              `
            }

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

        const userMarker = new CustomerLocationMarkerOverlay(new google.maps.LatLng(lat, lng), isLiveLocation)
        userMarker.setMap(map)
        userMarkerRef.current = userMarker
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
      userMarkerRef.current = null
    }

    // B. Custom Tailor Studio Pin Overlay
    class CustomStudioMarkerOverlay extends google.maps.OverlayView {
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
        this.div.style.pointerEvents = 'none'
        this.div.style.userSelect = 'none'
        this.div.style.cursor = 'default'
        this.div.style.transform = 'translate(-50%, -100%)'
        this.div.style.zIndex = '100'

        this.div.innerHTML = `
          <div style="background: #FFFFFF; border-radius: 12px; border: 1.5px solid #0F1115; box-shadow: 0 4px 14px rgba(0,0,0,0.22); padding: 2px 3px; display: flex; flex-direction: column; align-items: center; position: relative; pointer-events: none;">
            <div style="display: flex; align-items: center; justify-content: center; padding: 1px;">
              <img src="/landscape_logo.JPEG" style="height: 24px; width: auto; max-width: 60px; object-fit: cover; border-radius: 6px; display: block; pointer-events: none;" alt="" />
            </div>
            <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F1115;"></div>
          </div>
        `

        const panes = this.getPanes()
        panes?.overlayLayer ? panes.overlayLayer.appendChild(this.div) : panes?.overlayMouseTarget.appendChild(this.div)
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
      const overlay = new CustomStudioMarkerOverlay(
        new google.maps.LatLng(st.coords.lat, st.coords.lng),
        st
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
    } else if (validStoresInRadius.length > 0 && !showCurvedConnection && !isChoosing) {
      const radius = radiusMiles || fixedBoxMiles || 5.0
      const deltaLat = radius / 69.0
      const deltaLng = radius / (69.0 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)))

      const boundsBox = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat - deltaLat, lng - deltaLng),
        new google.maps.LatLng(lat + deltaLat, lng + deltaLng)
      )
      map.fitBounds(boundsBox, 0)
      map.setCenter({ lat, lng })
    }
  }, [stores, selectedStoreId, lat, lng, radiusMiles, disableNavigation, isReady, origin, userCoords, isFixed, fixedBoxMiles, showUserPin, userPinLabel, showCurvedConnection, isChoosing, onSelectStore, onStoresFound])

  // Live place, address, and landmark search in Choosing Mode
  useEffect(() => {
    if (!isChoosing) {
      setIsSearchOpen(false)
      return
    }

    const trimmed = mapSearchText.trim()
    if (trimmed.length < 2) {
      setSearchResults([])
      setIsSearchingPlaces(false)
      return
    }

    setIsSearchingPlaces(true)
    const timeoutId = setTimeout(async () => {
      const sessionToken = getOrCreatePlacesSessionToken()

      // 1. Modern Google Maps Places AutocompleteSuggestion API
      if (typeof google !== 'undefined' && (google.maps as any)?.places?.AutocompleteSuggestion) {
        try {
          const req: any = {
            input: trimmed,
            locationBias: {
              center: { lat, lng },
              radius: 50000,
            },
          }
          if (sessionToken) req.sessionToken = sessionToken

          const { suggestions } = await (google.maps as any).places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)

          if (suggestions && suggestions.length > 0) {
            const mapped = suggestions.map((s: any, idx: number) => {
              const p = s.placePrediction
              const mainText = p.mainText?.text || p.text?.text?.split(',')[0] || ''
              const secondaryText = p.secondaryText?.text || p.text?.text || ''
              return {
                id: `sugg-${p.placeId || idx}`,
                title: mainText,
                subtitle: secondaryText,
                fullName: p.text?.text || `${mainText}, ${secondaryText}`,
                placeId: p.placeId,
              }
            })
            setSearchResults(mapped)
            setIsSearchingPlaces(false)
            setIsSearchOpen(true)
            return
          }
        } catch (err) {
          console.warn('Google AutocompleteSuggestion error in map:', err)
        }
      }

      // 2. Google Places AutocompleteService
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
              center: new google.maps.LatLng(lat, lng),
              radius: 50000,
            }),
          }
          if (sessionToken) req.sessionToken = sessionToken

          const predictions = await new Promise<any[]>((resolve) => {
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

          if (predictions && predictions.length > 0) {
            const mapped = predictions.map((p, idx) => ({
              id: `pred-${p.place_id || idx}`,
              title: p.structured_formatting?.main_text || p.description.split(',')[0],
              subtitle: p.structured_formatting?.secondary_text || p.description,
              fullName: p.description,
              placeId: p.place_id,
            }))
            setSearchResults(mapped)
            setIsSearchingPlaces(false)
            setIsSearchOpen(true)
            return
          }
        } catch (err) {
          console.warn('Google Places Autocomplete error in map:', err)
        }
      }

      // 3. Google Geocoder Fallback
      const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
      if (geocoder && typeof google !== 'undefined' && google.maps) {
        try {
          const geoResults = await new Promise<any[]>((resolve) => {
            geocoder.geocode({ address: trimmed }, (results: any, status: any) => {
              if (status === 'OK' && Array.isArray(results)) {
                resolve(results)
              } else {
                resolve([])
              }
            })
          })

          if (geoResults && geoResults.length > 0) {
            const mapped = geoResults.slice(0, 5).map((g, idx) => ({
              id: `geo-${g.place_id || idx}`,
              title: g.formatted_address.split(',')[0],
              subtitle: g.formatted_address,
              fullName: g.formatted_address,
              placeId: g.place_id,
            }))
            setSearchResults(mapped)
            setIsSearchingPlaces(false)
            setIsSearchOpen(true)
            return
          }
        } catch (err) {
          console.warn('Geocoder error in map:', err)
        }
      }

      setIsSearchingPlaces(false)
    }, 280)

    return () => clearTimeout(timeoutId)
  }, [mapSearchText, isChoosing, lat, lng])

  // Click outside to dismiss autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSearchResult = (result: { title: string; fullName: string; placeId?: string }) => {
    setMapSearchText(result.title)
    setIsSearchOpen(false)

    // Check cached place details first
    if (result.placeId) {
      const cached = getCachedPlaceDetails(result.placeId)
      if (cached) {
        const newCoords = { lat: cached.lat, lng: cached.lng }
        const map = mapInstanceRef.current
        if (map) {
          map.panTo(newCoords)
          map.setZoom(16)
        }
        if (onPinLocationChange) {
          onPinLocationChange(newCoords)
        }
        resetPlacesSessionToken()
        return
      }
    }

    const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
    if (!geocoder) return

    const geocodeReq = result.placeId ? { placeId: result.placeId } : { address: result.fullName || result.title }
    geocoder.geocode(geocodeReq, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]?.geometry?.location) {
        const loc = results[0].geometry.location
        const newCoords = { lat: loc.lat(), lng: loc.lng() }
        if (result.placeId) {
          setCachedPlaceDetails(result.placeId, { lat: loc.lat(), lng: loc.lng(), formattedAddress: result.fullName })
        }
        const map = mapInstanceRef.current
        if (map) {
          map.panTo(newCoords)
          map.setZoom(16)
        }
        if (onPinLocationChange) {
          onPinLocationChange(newCoords)
        }
      }
      resetPlacesSessionToken()
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0])
    } else if (mapSearchText.trim()) {
      const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
      if (!geocoder) return
      geocoder.geocode({ address: mapSearchText.trim() }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location
          const newCoords = { lat: loc.lat(), lng: loc.lng() }
          const map = mapInstanceRef.current
          if (map) {
            map.panTo(newCoords)
            map.setZoom(16)
          }
          if (onPinLocationChange) {
            onPinLocationChange(newCoords)
          }
          setIsSearchOpen(false)
        }
      })
    }
  }

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

      {/* Search Bar (Active ONLY in Choosing Mode, e.g. when picking custom location) */}
      {isChoosing && isReady && !loadError && (
        <div
          ref={searchContainerRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3.5 left-3.5 right-14 sm:right-auto sm:w-[320px] md:w-[360px] z-30 flex flex-col font-sans"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all overflow-hidden h-10 px-3 gap-2"
          >
            {isSearchingPlaces ? (
              <Loader2 className="size-4 text-black animate-spin shrink-0" />
            ) : (
              <Search className="size-4 text-neutral-400 shrink-0" />
            )}
            <input
              type="text"
              value={mapSearchText}
              onChange={(e) => setMapSearchText(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true)
              }}
              placeholder="Search area, landmark or street..."
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-hidden"
            />
            {mapSearchText && (
              <button
                type="button"
                onClick={() => {
                  setMapSearchText('')
                  setSearchResults([])
                  setIsSearchOpen(false)
                }}
                className="size-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="mt-1.5 w-full bg-white/98 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.14)] overflow-hidden py-1 max-h-56 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100/80 transition-colors flex items-start gap-2.5 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <MapPin className="size-3.5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-[11px] text-neutral-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Precision Center Drop Pin in Choosing Mode (Zero-lag 120fps smooth lock) */}
      {isChoosing && isReady && !loadError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center select-none">
          <div
            className={`transition-transform duration-150 ease-out ${
              isMapDragging ? '-translate-y-2.5 scale-105' : 'translate-y-0 scale-100'
            }`}
          >
            <div className="w-5 h-7 relative flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
              <svg width="20" height="28" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.26801 0 0 6.26801 0 14C0 23.8 12.3 35.7 12.9 36.3C13.5 36.9 14.5 36.9 15.1 36.3C15.7 35.7 28 23.8 28 14C28 6.26801 21.732 0 14 0Z" fill="#276EF1"/>
                <circle cx="14" cy="13.5" r="5.5" fill="#FFFFFF"/>
                <circle cx="14" cy="13.5" r="2.8" fill="#1B4FB8"/>
              </svg>
            </div>
          </div>
          {/* Ground target shadow dot */}
          <div
            className={`bg-black/35 rounded-full filter blur-[0.8px] -mt-0.5 transition-all duration-150 ${
              isMapDragging ? 'w-1.5 h-0.5 opacity-25 scale-75' : 'w-2 h-0.5 opacity-60 scale-100'
            }`}
          />
        </div>
      )}

      {/* Zoom Controls (Active only when actively choosing location) */}
      {isChoosing && isReady && !loadError && (
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={handleZoomIn}
            className="size-9 rounded-xl bg-white hover:bg-neutral-100 text-black font-extrabold text-lg flex items-center justify-center border border-gray-200 shadow-md active:scale-95 transition-all cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="size-9 rounded-xl bg-white hover:bg-neutral-100 text-black font-extrabold text-lg flex items-center justify-center border border-gray-200 shadow-md active:scale-95 transition-all cursor-pointer"
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
