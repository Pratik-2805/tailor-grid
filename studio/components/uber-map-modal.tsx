'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  MapPin,
  Search,
  Crosshair,
  X,
  AlertTriangle,
  Check,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react'
import { AnimatedLocationPin } from './animated-location-pin'

export interface SelectedLocationData {
  area: string
  postcode: string
  streetAddress: string
  city?: string
  lat: number
  lng: number
  fullAddress: string
}

interface GoogleMapModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (data: SelectedLocationData) => void
  initialCity?: string
  initialArea?: string
  initialAddress?: string
  initialPostcode?: string
  initialLat?: number
  initialLng?: number
}

export function UberMapModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialCity = '',
  initialArea = '',
  initialAddress = '',
  initialPostcode = '',
  initialLat,
  initialLng,
}: GoogleMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Coordinates & Map State (Use provided initial coordinates or Mumbai fallback)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: initialLat && !isNaN(initialLat) ? initialLat : 19.076,
    lng: initialLng && !isNaN(initialLng) ? initialLng : 72.8777,
  }))
  const [isDragging, setIsDragging] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Geolocation Status / Alert
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gpsActive, setGpsActive] = useState<boolean | null>(null)

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{ description: string; lat: number; lng: number; primaryText?: string }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Selected Address Details
  const [selectedArea, setSelectedArea] = useState(initialArea || '')
  const [selectedPostcode, setSelectedPostcode] = useState(initialPostcode || '')
  const [selectedStreet, setSelectedStreet] = useState(initialAddress || '')
  const [selectedCity, setSelectedCity] = useState(initialCity || '')
  const [detectedCountryCode, setDetectedCountryCode] = useState<string>('in')
  const [formattedAddress, setFormattedAddress] = useState('')

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
        setCoords({ lat: initialLat, lng: initialLng })
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([initialLat, initialLng], 16)
        }
      }
      if (initialArea) setSelectedArea(initialArea)
      if (initialAddress) setSelectedStreet(initialAddress)
      if (initialPostcode) setSelectedPostcode(initialPostcode)
      if (initialCity) setSelectedCity(initialCity)
    }
  }, [isOpen, initialLat, initialLng, initialArea, initialAddress, initialPostcode, initialCity])

  // Debounce helpers
  const reverseGeocodeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Dynamically load Leaflet for Google Maps tile rendering (100% Free)
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const loadLeaflet = (): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).L) {
          return resolve()
        }

        // 1. Inject Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // 2. Inject Leaflet JS
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script')
          script.id = 'leaflet-js'
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.async = true
          script.onload = () => resolve()
          document.head.appendChild(script)
        } else {
          const script = document.getElementById('leaflet-js') as HTMLScriptElement
          script.addEventListener('load', () => resolve())
          if ((window as any).L) resolve()
        }
      })
    }

    loadLeaflet().then(() => {
      if (!isMounted) return
      initFreeGoogleMap()
    })

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen])

  // Initialize Free Google Maps Roadmap View with Leaflet
  const initFreeGoogleMap = useCallback(() => {
    if (!mapContainerRef.current || !(window as any).L) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const L = (window as any).L
    const initialLat = coords.lat
    const initialLng = coords.lng

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    })

    // Free Google Maps Roadmap Raster Layer
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map)

    mapInstanceRef.current = map

    // Fix partial rendering in modal: recalculate tile canvas dimensions
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }

    setTimeout(invalidate, 50)
    setTimeout(invalidate, 150)
    setTimeout(invalidate, 350)
    setTimeout(invalidate, 700)

    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      const ro = new ResizeObserver(() => invalidate())
      ro.observe(mapContainerRef.current)
    }
    window.addEventListener('resize', invalidate)

    // Listen for center change on pan/drag
    map.on('movestart', () => {
      setIsDragging(true)
    })

    map.on('moveend', () => {
      setIsDragging(false)
      const center = map.getCenter()
      if (center) {
        setCoords({ lat: center.lat, lng: center.lng })
        triggerReverseGeocode(center.lat, center.lng)
      }
    })

    // Detect user current location on launch
    acquireUserLocation(map)
  }, [])

  // Acquire User GPS Location
  const acquireUserLocation = (mapInstance?: any) => {
    const map = mapInstance || mapInstanceRef.current
    setIsLocating(true)
    setLocationError(null)

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setIsLocating(false)
      setGpsActive(false)
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        setGpsActive(true)
        setLocationError(null)
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        setCoords({ lat: userLat, lng: userLng })

        if (map) {
          map.setView([userLat, userLng], 17, { animate: true })
        }
        triggerReverseGeocode(userLat, userLng)
      },
      (err) => {
        setIsLocating(false)
        setGpsActive(false)
        console.warn('Geolocation error:', err)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            'Location access is blocked. Please allow location access or search your locality above.'
          )
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('GPS location unavailable. Please search your locality using the search bar above.')
        } else {
          setLocationError('Location request timed out. You can search your locality using the search bar.')
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    )
  }

  // Reverse Geocoding using OpenStreetMap with rich POI & Street extraction
  const triggerReverseGeocode = (lat: number, lng: number) => {
    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current)
    }

    setIsGeocoding(true)

    reverseGeocodeTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
          { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(4500) }
        )
        const data = await res.json()
        setIsGeocoding(false)

        if (data && data.address) {
          const addr = data.address
          const rawParts = (data.display_name || '').split(',').map((s: string) => s.trim()).filter(Boolean)

          // 1. Extract POI / Landmark / Shop / Building
          const poi =
            addr.amenity ||
            addr.shop ||
            addr.building ||
            addr.tourism ||
            addr.historic ||
            addr.office ||
            addr.leisure ||
            addr.house_name ||
            ''

          // 2. Extract Road / Street
          const road =
            addr.road ||
            addr.street ||
            addr.footway ||
            addr.pedestrian ||
            addr.highway ||
            addr.path ||
            ''
          const houseNumber = addr.house_number || ''

          // 3. Extract Locality / Suburb / Village / District
          const neighborhood =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.quarter ||
            addr.city_district ||
            ''
          const village = addr.village || addr.hamlet || addr.town || ''
          const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || ''
          const post = addr.postcode || ''

          if (addr.country_code) {
            setDetectedCountryCode(addr.country_code.toLowerCase())
          }

          // Build proper Area / Neighborhood
          let parsedArea = ''
          if (neighborhood && village && neighborhood !== village) {
            parsedArea = `${neighborhood}, ${village}`
          } else {
            parsedArea = neighborhood || village || city || (rawParts.length > 2 ? rawParts[2] : rawParts[0]) || 'Local Area'
          }

          // Build detailed Street Address (avoiding bare single-word duplicates)
          let parsedStreet = ''
          const roadWithNum = [houseNumber, road].filter(Boolean).join(' ')

          if (poi && roadWithNum && poi !== roadWithNum) {
            parsedStreet = `${poi}, ${roadWithNum}`
          } else if (poi) {
            parsedStreet = poi
          } else if (roadWithNum) {
            parsedStreet = roadWithNum
          } else if (rawParts.length >= 2) {
            // Take the first 2 specific place segments from display_name
            const specificParts = rawParts.slice(0, 2).filter((p: string) => p !== post && p !== 'India')
            parsedStreet = specificParts.join(', ')
          } else {
            parsedStreet = rawParts[0] || parsedArea
          }

          // If parsedStreet is just the exact same single word as parsedArea, enrich it with road/landmark or village context
          if (parsedStreet.trim().toLowerCase() === parsedArea.trim().toLowerCase()) {
            if (rawParts.length >= 2 && rawParts[0] !== rawParts[1]) {
              parsedStreet = `${rawParts[0]}, ${rawParts[1]}`
            } else if (road) {
              parsedStreet = `${road}, ${parsedArea}`
            } else if (poi) {
              parsedStreet = `${poi}, ${parsedArea}`
            }
          }

          setSelectedArea(parsedArea)
          setSelectedStreet(parsedStreet)
          setSelectedCity(city)
          if (post) setSelectedPostcode(post)
          setFormattedAddress(data.display_name || `${parsedStreet}, ${parsedArea}`)
        }
      } catch {
        setIsGeocoding(false)
      }
    }, 300)
  }

  // Free Autocomplete Search (Photon + OpenStreetMap with Proximity & Country Biasing)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setIsSearching(false)
      return
    }

    setShowDropdown(true)
    setIsSearching(true)

    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current)
    }

    searchDebounceTimerRef.current = setTimeout(async () => {
      try {
        // 1. First try Photon (Fast, typo-tolerant, free OpenStreetMap POI & street search)
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query
        )}&lat=${coords.lat}&lon=${coords.lng}&limit=8`

        let items: Array<{ description: string; lat: number; lng: number; primaryText?: string }> = []

        try {
          const photonRes = await fetch(photonUrl, { signal: AbortSignal.timeout(3500) })
          const photonData = await photonRes.json()
          if (photonData && Array.isArray(photonData.features) && photonData.features.length > 0) {
            items = photonData.features.map((f: any) => {
              const p = f.properties || {}
              const name = p.name || p.street || ''
              const details = [
                p.street,
                p.district || p.suburb,
                p.city || p.county,
                p.state,
                p.postcode,
                p.country,
              ]
                .filter(Boolean)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(', ')

              return {
                primaryText: name || details.split(',')[0],
                description: details || name || 'Location',
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
              }
            })
          }
        } catch {
          // Photon fallback
        }

        // 2. If Photon didn't return results, fallback to Nominatim with viewbox biasing
        if (items.length === 0) {
          const delta = 2.5
          const minLon = (coords.lng - delta).toFixed(4)
          const maxLat = (coords.lat + delta).toFixed(4)
          const maxLon = (coords.lng + delta).toFixed(4)
          const minLat = (coords.lat - delta).toFixed(4)
          const countryParam = detectedCountryCode ? `&countrycodes=${detectedCountryCode}` : ''

          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=0${countryParam}&limit=7&addressdetails=1`

          const nomRes = await fetch(nomUrl, {
            headers: { 'Accept-Language': 'en' },
            signal: AbortSignal.timeout(4000),
          })
          const nomData = await nomRes.json()

          if (Array.isArray(nomData) && nomData.length > 0) {
            items = nomData.map((item: any) => ({
              primaryText: item.display_name.split(',')[0],
              description: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }))
          }
        }

        setIsSearching(false)
        setSearchResults(items)
      } catch {
        setIsSearching(false)
        setSearchResults([])
      }
    }, 250)
  }

  // Select Search Item
  const handleSelectSearchResult = (result: { description: string; lat: number; lng: number }) => {
    setSearchQuery(result.description)
    setShowDropdown(false)

    setCoords({ lat: result.lat, lng: result.lng })
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([result.lat, result.lng], 17, { animate: true })
    }
    triggerReverseGeocode(result.lat, result.lng)
  }

  // Handle Search Submission (Enter key)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0])
    }
  }

  // Zoom Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  // Confirm Selection and store exact coordinates
  const handleConfirmLocation = () => {
    onSelectLocation({
      area: selectedArea || 'Neighborhood',
      postcode: selectedPostcode,
      streetAddress: selectedStreet || formattedAddress || selectedArea,
      city: selectedCity,
      lat: coords.lat,
      lng: coords.lng,
      fullAddress: formattedAddress || `${selectedStreet}, ${selectedArea}`,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[92vh] max-h-[740px] bg-white text-[#202124] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        {/* Top Header Bar */}
        <div className="relative z-20 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#EA4335]/10 flex items-center justify-center shrink-0">
              <AnimatedLocationPin size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#202124] flex items-center gap-2">
                <span>Google Maps Store Locator</span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md hidden sm:inline">
                  Pin Exact Location
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => acquireUserLocation()}
              disabled={isLocating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1A73E8] text-xs font-bold transition-all cursor-pointer border border-blue-200 shadow-xs"
            >
              {isLocating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Crosshair size={13} />
              )}
              <span>{isLocating ? 'Locating…' : 'Use Current Location'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center cursor-pointer transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Location Inactive Warning Banner */}
        {locationError && (
          <div className="relative z-20 px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900 animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span className="text-[11px] leading-tight font-medium">{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => acquireUserLocation()}
              className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
            >
              Turn On / Retry
            </button>
          </div>
        )}

        {/* Google Map Canvas Area */}
        <div className="relative flex-1 min-h-0 w-full bg-[#E5E3DF] overflow-hidden">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', minHeight: '300px' }}
          />

          {/* Floating Google Maps Search Bar */}
          <div className="absolute top-4 left-3 sm:left-4 right-3 sm:right-auto sm:w-[420px] z-[1000]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-white rounded-xl px-3.5 py-2.5 shadow-xl border border-gray-200 focus-within:border-[#4285F4] focus-within:ring-2 focus-within:ring-[#4285F4]/20 transition-all">
                <Search size={17} className="text-gray-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search shop, street, locality, PIN code..."
                  className="w-full bg-transparent text-sm text-[#202124] placeholder:text-gray-400 outline-none font-medium"
                />
                {isSearching && <Loader2 size={15} className="text-gray-400 animate-spin mr-2 shrink-0" />}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setShowDropdown(false)
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Live Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-[1001] divide-y divide-gray-100">
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50/80 flex items-start gap-3 transition-colors cursor-pointer"
                    >
                      <MapPin size={16} className="text-[#EA4335] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        {res.primaryText && (
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {res.primaryText}
                          </div>
                        )}
                        <div className="text-[11px] font-normal text-gray-600 leading-snug line-clamp-2">
                          {res.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Classic Red Google Map Pin Marker (Center Positioned) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-[1000]">
            <div
              className={`flex flex-col items-center -translate-y-6 transition-transform duration-200 ${
                isDragging ? '-translate-y-10 scale-110' : '-translate-y-6 scale-100'
              }`}
            >
              {/* Floating Coordinates Tag */}
              <div className="bg-white border border-gray-300 text-[#202124] px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md flex items-center gap-1.5 mb-1 select-none">
                <span className="size-2 rounded-full bg-[#EA4335] animate-ping" />
                <span>Shop Entrance</span>
              </div>

              {/* Red Google Pin */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#EA4335] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                </div>
                {/* Pointer Arrow */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#EA4335] mx-auto -mt-0.5" />
              </div>

              {/* Pin Ground Shadow */}
              <div
                className={`w-4 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5 transition-all duration-200 ${
                  isDragging ? 'scale-75 opacity-30' : 'scale-100 opacity-80'
                }`}
              />
            </div>
          </div>

          {/* Google Maps Controls (Right Side) */}
          <div className="absolute bottom-5 right-4 z-[1000] flex flex-col gap-2.5">
            {/* GPS Current Location Target Button */}
            <button
              type="button"
              onClick={() => acquireUserLocation()}
              disabled={isLocating}
              className={`size-11 rounded-xl shadow-lg border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                gpsActive
                  ? 'bg-[#1A73E8] border-[#1A73E8] text-white shadow-blue-500/30'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Locate My Current GPS Position"
            >
              {isLocating ? (
                <Loader2 size={20} className="animate-spin text-[#1A73E8]" />
              ) : (
                <Crosshair size={20} />
              )}
            </button>

            {/* Zoom Controls */}
            <div className="flex flex-col rounded-xl bg-white border border-gray-300 shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                className="size-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                title="Zoom in"
              >
                <Plus size={17} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="size-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
                title="Zoom out"
              >
                <Minus size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Address Confirmation Bar */}
        <div className="relative z-20 bg-white border-t border-gray-200 p-4 sm:p-5 shadow-lg shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              {isGeocoding && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#EA4335] font-medium">
                  <Loader2 size={11} className="animate-spin" /> Resolving exact address…
                </div>
              )}

              <p className="text-xs text-gray-600 truncate">
                {formattedAddress || selectedStreet || 'Drag map or search your locality above'}
                {selectedPostcode ? ` · PIN ${selectedPostcode}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                className="px-5 py-2.5 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.98]"
              >
                <Check size={16} className="stroke-[2.5]" />
                <span>Confirm Store Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
