'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

type Props = {
  lat: number
  lng: number
  storeName?: string
  storeAddress?: string
  className?: string
}

let isGoogleMapsOptionsConfigured = false

export default function CleanGoogleMap({ lat, lng, storeName, storeAddress, className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loadError, setLoadError] = useState(false)
  const [isReady, setIsReady] = useState(false)

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
              this.div.title = storeName || 'Tailor Studio'
              this.div.innerHTML = `
                <div style="background: transparent; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.28); border: 2px solid #0F1115; display: flex; flex-direction: column; align-items: center; position: relative;">
                  <img src="/landscape_logo.JPEG" style="height: 38px; width: auto; max-width: 96px; object-fit: cover; border-radius: 9px; display: block;" alt="${storeName || 'Darzi Studio'}" />
                  <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F1115;"></div>
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

          const overlay = new LogoMarkerOverlay(new google.maps.LatLng(lat, lng))
          overlay.setMap(map)
        } else {
          // Standard Marker with custom landscape logo image icon
          new Marker({
            position: { lat, lng },
            map,
            title: storeName || 'Tailor Studio',
            icon: {
              url: '/landscape_logo.JPEG',
              scaledSize: new google.maps.Size(84, 34),
              anchor: new google.maps.Point(42, 17),
            },
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
  }, [lat, lng, storeName])

  // Graceful fallback to clean embed iframe if API key fails or is invalid
  if (loadError) {
    const query = storeName && storeAddress
      ? encodeURIComponent(`${storeName}, ${storeAddress}`)
      : `${lat},${lng}`

    return (
      <div className={`w-full h-full relative overflow-hidden rounded-2xl ${className}`}>
        <iframe
          title="Clean Map Embed"
          src={`https://maps.google.com/maps?q=${query}&t=m&z=15&ie=UTF8&iwloc=near&output=embed`}
          className="w-full h-full border-0 absolute inset-0 rounded-2xl contrast-[105%] brightness-[99%] saturate-[80%]"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-2xl" />
      {!isReady && (
        <div className="absolute inset-0 bg-[#EBE7E0] animate-pulse rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="size-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
