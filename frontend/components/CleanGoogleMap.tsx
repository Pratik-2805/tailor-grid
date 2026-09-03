'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { Navigation } from 'lucide-react'

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
  // Destination: use exact GPS coords or full address string for precise routing
  const destination = destCoords
    ? `${destCoords.lat},${destCoords.lng}`
    : encodeURIComponent([destName, destAddress].filter(Boolean).join(', '))

  // Origin: either user's GPS coords or custom entered address / city
  let originParam = ''
  if (userCoords && userCoords.lat && userCoords.lng) {
    originParam = `${userCoords.lat},${userCoords.lng}`
  } else if (origin && origin.trim()) {
    originParam = encodeURIComponent(origin.trim())
  }

  // Universal Driving / Car Navigation URL (supported natively by Google Maps iOS/Android and browser)
  // - travelmode=driving: sets Car / Driving navigation mode
  // - dir_action=navigate: directly initiates turn-by-turn car navigation on mobile map apps
  let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`
  if (originParam) {
    mapsUrl += `&origin=${originParam}`
  }

  if (typeof window !== 'undefined') {
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }
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
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const handleTriggerNavigation = () => {
    if (onMapClick) {
      onMapClick()
    } else {
      openCarNavigation({
        destName: storeName,
        destAddress: storeAddress,
        destCoords: { lat, lng },
        origin,
        userCoords,
      })
    }
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 15
      mapInstanceRef.current.setZoom(currentZoom + 1)
    }
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 15
      mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 1))
    }
  }

  // Pan to new coords when lat/lng change
  useEffect(() => {
    if (mapInstanceRef.current && isReady) {
      mapInstanceRef.current.panTo({ lat, lng })
    }
  }, [lat, lng, isReady])

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
        const { Marker } = await importLibrary('marker')

        if (!isMounted || !mapRef.current) return

        const map = new Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
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

        mapInstanceRef.current = map

        // Click anywhere on map -> launch car navigation directly
        map.addListener('click', () => {
          handleTriggerNavigation()
        })

        // Custom OverlayView Logo Marker
        if (google.maps.OverlayView) {
          class LogoMarkerOverlay extends google.maps.OverlayView {
            private position: google.maps.LatLng
            private div: HTMLDivElement | null = null

            constructor(position: google.maps.LatLng) {
              super()
              this.position = position
            }

            onAdd() {
              this.div = document.createElement('div')
              this.div.style.position = 'absolute'
              this.div.style.cursor = 'pointer'
              this.div.style.transform = 'translate(-50%, -100%)'
              this.div.style.transition = 'transform 0.2s ease-out'
              this.div.title = 'Click to start car navigation to studio'
              this.div.innerHTML = `
                <div style="background: transparent; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.28); border: 2px solid #0F1115; display: flex; flex-direction: column; align-items: center; position: relative;">
                  <img src="/landscape_logo.JPEG" style="height: 38px; width: auto; max-width: 96px; object-fit: cover; border-radius: 9px; display: block;" alt="${storeName || 'Darzi Studio'}" />
                  <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F1115;"></div>
                </div>
              `

              this.div.addEventListener('click', (e) => {
                e.stopPropagation()
                handleTriggerNavigation()
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

          const overlay = new LogoMarkerOverlay(new google.maps.LatLng(lat, lng))
          overlay.setMap(map)
        } else {
          // Standard Marker with custom landscape logo image icon
          const marker = new Marker({
            position: { lat, lng },
            map,
            title: 'Click to start car navigation',
            icon: {
              url: '/landscape_logo.JPEG',
              scaledSize: new google.maps.Size(84, 34),
            },
          })

          marker.addListener('click', () => {
            handleTriggerNavigation()
          })
        }

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
  }, [lat, lng, storeName, storeAddress, origin, userCoords])

  // Graceful fallback to clean embed iframe if API key fails or is invalid
  if (loadError) {
    const query = storeName && storeAddress
      ? encodeURIComponent(`${storeName}, ${storeAddress}`)
      : `${lat},${lng}`

    return (
      <div
        onClick={handleTriggerNavigation}
        className={`w-full h-full relative overflow-hidden rounded-[28px] cursor-pointer ${className}`}
        title="Click to start car navigation in your map app"
      >
        <iframe
          title="Clean Map Embed"
          src={`https://maps.google.com/maps?q=${query}&t=m&z=15&ie=UTF8&iwloc=near&output=embed`}
          className="w-full h-full border-0 absolute inset-0 rounded-[28px] contrast-[105%] brightness-[99%] saturate-[80%]"
          loading="lazy"
        />

        {/* Uber-style Zoom Controls Floating Pill */}
        {showZoomControls && (
          <div className="absolute bottom-6 right-6 z-20 flex flex-col bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden divide-y divide-gray-200">
            <button
              type="button"
              onClick={handleZoomIn}
              className="size-10 flex items-center justify-center text-black hover:bg-neutral-100 font-bold text-lg active:scale-95 transition-all cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="size-10 flex items-center justify-center text-black hover:bg-neutral-100 font-bold text-lg active:scale-95 transition-all cursor-pointer"
              title="Zoom out"
            >
              −
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={handleTriggerNavigation}
      className={`w-full h-full relative cursor-pointer ${className}`}
      title="Click map to start car navigation in your map app"
    >
      <div ref={mapRef} className="w-full h-full rounded-[28px]" />

      {/* Uber-style Zoom Controls Floating Pill */}
      {showZoomControls && isReady && (
        <div className="absolute bottom-6 right-6 z-20 flex flex-col bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden divide-y divide-gray-200">
          <button
            type="button"
            onClick={handleZoomIn}
            className="size-10 flex items-center justify-center text-black hover:bg-neutral-100 font-bold text-lg active:scale-95 transition-all cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="size-10 flex items-center justify-center text-black hover:bg-neutral-100 font-bold text-lg active:scale-95 transition-all cursor-pointer"
            title="Zoom out"
          >
            −
          </button>
        </div>
      )}

      {!isReady && (
        <div className="absolute inset-0 bg-[#EBE7E0] animate-pulse rounded-[28px] flex items-center justify-center pointer-events-none">
          <div className="size-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
