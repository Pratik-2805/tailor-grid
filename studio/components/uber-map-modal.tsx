'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
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
  Navigation,
  Layers,
} from 'lucide-react'
import {
  getCachedReverseGeocode,
  setCachedReverseGeocode,
  getOrCreatePlacesSessionToken,
  resetPlacesSessionToken,
} from '@/lib/geocode-cache'

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

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// High-contrast, sharp building outlines and architectural clarity
const ENHANCED_BUILDING_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#DFDBD3' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#A39D90' }, { weight: 1.2 }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D5D2C9' }, { weight: 1 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#FFE082' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#F5C84C' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F4F2EC' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#D5EDD0' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#C5DCF2' }],
  },
]

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
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)

  // Coordinates & Map State (Use provided initial coordinates or Mumbai fallback)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: initialLat && !isNaN(initialLat) ? initialLat : 19.076,
    lng: initialLng && !isNaN(initialLng) ? initialLng : 72.8777,
  }))
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap')
  const [isMapReady, setIsMapReady] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Geolocation Status / Alert
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gpsActive, setGpsActive] = useState<boolean | null>(null)

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{ description: string; placeId: string; primaryText?: string; secondaryText?: string }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Debounce helpers
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
        setCoords({ lat: initialLat, lng: initialLng })
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat: initialLat, lng: initialLng })
          mapInstanceRef.current.setZoom(17)
        }
      }
      setIsSubmitting(false)
      setIsDragging(false)
    }
  }, [isOpen, initialLat, initialLng])

  // Parse Google Geocoding Address Components
  const parseGoogleAddressComponents = useCallback((results: google.maps.GeocoderResult[]) => {
    if (!results || results.length === 0) return null

    const bestResult = results[0]
    let streetNumber = ''
    let route = ''
    let sublocality = ''
    let locality = ''
    let city = ''
    let postalCode = ''
    let premise = ''

    for (const res of results) {
      for (const comp of res.address_components) {
        const types = comp.types
        if (types.includes('street_number') && !streetNumber) streetNumber = comp.long_name
        if (types.includes('route') && !route) route = comp.long_name
        if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
          if (!sublocality) sublocality = comp.long_name
        }
        if (types.includes('neighborhood') && !sublocality) {
          sublocality = comp.long_name
        }
        if (types.includes('locality') && !city) city = comp.long_name
        if (types.includes('administrative_area_level_2') && !city) city = comp.long_name
        if (types.includes('postal_code') && !postalCode) postalCode = comp.long_name
        if ((types.includes('premise') || types.includes('point_of_interest') || types.includes('establishment')) && !premise) {
          premise = comp.long_name
        }
      }
    }

    const streetParts = [premise, streetNumber ? `${streetNumber} ${route}` : route].filter(Boolean)
    const streetAddress = streetParts.length > 0 ? streetParts.join(', ') : bestResult.formatted_address.split(',')[0]
    const area = sublocality || locality || city || 'Neighborhood'
    const fullAddress = bestResult.formatted_address

    return {
      streetAddress: streetAddress || area,
      area: area || 'Neighborhood',
      city: city || 'City',
      postcode: postalCode || '',
      fullAddress: fullAddress || `${streetAddress}, ${area}`,
    }
  }, [])

  // Initialize Official Google Maps JS API Instance
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    async function initGoogleMap() {
      try {
        if (typeof window !== 'undefined') {
          const w = window as any
          if (!w.__googleMapsOptionsConfiguredStudio) {
            try {
              setOptions({
                key: GOOGLE_MAPS_API_KEY,
                v: 'weekly',
              })
              w.__googleMapsOptionsConfiguredStudio = true
            } catch {
              // Ignore if already configured
            }
          }
        }

        const { Map } = (await importLibrary('maps')) as any
        const { Geocoder } = (await importLibrary('geocoding')) as any
        await importLibrary('places')

        if (!isMounted || !mapContainerRef.current) return

        geocoderRef.current = new Geocoder()

        const initialCenter = {
          lat: coords.lat,
          lng: coords.lng,
        }

        const map = new Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 17,
          styles: ENHANCED_BUILDING_STYLES,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          clickableIcons: true,
          maxZoom: 21,
          minZoom: 3,
        })

        mapInstanceRef.current = map
        setIsMapReady(true)

        // Event Listeners for center-pin positioning (WITHOUT reverse geocoding on every move)
        map.addListener('dragstart', () => {
          setIsDragging(true)
        })

        map.addListener('idle', () => {
          setIsDragging(false)
          const center = map.getCenter()
          if (center) {
            const newLat = typeof center.lat === 'function' ? center.lat() : center.lat
            const newLng = typeof center.lng === 'function' ? center.lng() : center.lng
            setCoords({ lat: newLat, lng: newLng })
          }
        })
      } catch (err) {
        console.error('Failed to initialize Google Maps in Studio:', err)
      }
    }

    initGoogleMap()

    return () => {
      isMounted = false
      mapInstanceRef.current = null
      setIsMapReady(false)
    }
  }, [isOpen])

  // Acquire User GPS Location
  const acquireUserLocation = useCallback(() => {
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

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat: userLat, lng: userLng })
          mapInstanceRef.current.setZoom(17)
        }
      },
      (err) => {
        setIsLocating(false)
        setGpsActive(false)
        console.warn('Geolocation notice:', err)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            'Location access is blocked. Please allow location access or search your shop address above.'
          )
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('GPS location unavailable. Please search your locality using the search bar above.')
        } else {
          setLocationError('Location request timed out. You can search your locality using the search bar.')
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    )
  }, [])

  // Google Maps Places Autocomplete Search
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
      const sessionToken = getOrCreatePlacesSessionToken()

      // 1. Modern Google Maps Places AutocompleteSuggestion API (Recommended Places API)
      if (typeof google !== 'undefined' && (google.maps as any)?.places?.AutocompleteSuggestion) {
        try {
          const req: any = {
            input: query,
            locationBias: {
              center: { lat: coords.lat, lng: coords.lng },
              radius: 50000,
            },
          }
          if (sessionToken) req.sessionToken = sessionToken

          const { suggestions } = await (google.maps as any).places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)

          if (suggestions && suggestions.length > 0) {
            const mapped = suggestions.map((s: any) => {
              const p = s.placePrediction
              const mainText = p.mainText?.text || p.text?.text?.split(',')[0] || ''
              const secondaryText = p.secondaryText?.text || p.text?.text || ''
              return {
                description: p.text?.text || `${mainText}, ${secondaryText}`,
                placeId: p.placeId,
                primaryText: mainText,
                secondaryText: secondaryText,
              }
            })

            setIsSearching(false)
            setSearchResults(mapped)
            return
          }
        } catch (err) {
          console.warn('AutocompleteSuggestion error, falling back:', err)
        }
      }

      // 2. Fallback to AutocompleteService if AutocompleteSuggestion is not supported
      if (!autocompleteServiceRef.current && typeof google !== 'undefined' && google.maps?.places?.AutocompleteService) {
        try {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        } catch { }
      }

      if (!autocompleteServiceRef.current) {
        setIsSearching(false)
        return
      }

      try {
        const request: google.maps.places.AutocompletionRequest = {
          input: query,
          locationBias: new google.maps.Circle({
            center: new google.maps.LatLng(coords.lat, coords.lng),
            radius: 50000,
          }),
        }
        if (sessionToken) request.sessionToken = sessionToken

        autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
          setIsSearching(false)
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions &&
            predictions.length > 0
          ) {
            setSearchResults(
              predictions.map((p) => ({
                description: p.description,
                placeId: p.place_id,
                primaryText: p.structured_formatting?.main_text || p.description.split(',')[0],
                secondaryText: p.structured_formatting?.secondary_text || p.description,
              }))
            )
          } else {
            setSearchResults([])
          }
        })
      } catch (err) {
        console.warn('Google Places Autocomplete error:', err)
        setIsSearching(false)
        setSearchResults([])
      }
    }, 200)
  }

  // Select Search Item & Pan Map
  const handleSelectSearchResult = (result: {
    description: string
    placeId: string
    primaryText?: string
  }) => {
    setSearchQuery(result.description)
    setShowDropdown(false)

    if (!geocoderRef.current && typeof google !== 'undefined' && google.maps?.Geocoder) {
      geocoderRef.current = new google.maps.Geocoder()
    }

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: result.placeId }, (results, status) => {
        resetPlacesSessionToken()
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const loc = results[0].geometry.location
          const newLat = loc.lat()
          const newLng = loc.lng()
          setCoords({ lat: newLat, lng: newLng })

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: newLat, lng: newLng })
            mapInstanceRef.current.setZoom(17)
          }
        }
      })
    }
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
      const cur = mapInstanceRef.current.getZoom() || 16
      mapInstanceRef.current.setZoom(Math.min(20, cur + 1))
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const cur = mapInstanceRef.current.getZoom() || 16
      mapInstanceRef.current.setZoom(Math.max(4, cur - 1))
    }
  }

  // Toggle between Enhanced Street Map & Real-world Satellite View
  const toggleMapType = () => {
    const nextType = mapType === 'roadmap' ? 'hybrid' : 'roadmap'
    setMapType(nextType)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(nextType)
    }
  }

  // Confirm Location: Reverse geocode ONCE upon button click and populate directly
  const handleConfirmLocation = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    let area = initialArea || 'Neighborhood'
    let streetAddress = initialAddress || ''
    let city = initialCity || ''
    let postcode = initialPostcode || ''
    let fullAddress = ''

    try {
      // 1. Check local cache
      const cached = getCachedReverseGeocode(coords.lat, coords.lng)
      if (cached) {
        area = cached.locality || cached.city || area
        streetAddress = cached.houseNo ? `${cached.houseNo} ${cached.locality}` : (cached.locality || streetAddress)
        city = cached.city || city
        postcode = cached.postcode || postcode
        fullAddress = cached.formattedAddress
      } else {
        if (!geocoderRef.current && typeof google !== 'undefined' && google.maps?.Geocoder) {
          geocoderRef.current = new google.maps.Geocoder()
        }

        if (geocoderRef.current) {
          const response = await geocoderRef.current.geocode({
            location: { lat: coords.lat, lng: coords.lng },
          })

          if (response.results && response.results.length > 0) {
            const parsed = parseGoogleAddressComponents(response.results)
            if (parsed) {
              area = parsed.area
              streetAddress = parsed.streetAddress
              city = parsed.city
              postcode = parsed.postcode
              fullAddress = parsed.fullAddress

              setCachedReverseGeocode(coords.lat, coords.lng, {
                houseNo: '',
                apartment: '',
                locality: parsed.area,
                city: parsed.city,
                postcode: parsed.postcode,
                formattedAddress: parsed.fullAddress,
              })
            }
          }
        }
      }
    } catch (err) {
      console.warn('Geocode resolution error upon confirmation:', err)
    }

    onSelectLocation({
      area: area || 'Neighborhood',
      postcode: postcode,
      streetAddress: streetAddress || fullAddress || area,
      city: city,
      lat: coords.lat,
      lng: coords.lng,
      fullAddress: fullAddress || `${streetAddress}, ${area}`,
    })

    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[90vh] max-h-[720px] bg-white text-[#202124] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        {/* Top Header Bar */}
        <div className="relative z-20 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[#1A73E8]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#202124] flex items-center gap-2">
                <span>Google Maps Store Locator</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md hidden sm:inline">
                  Google Maps API Active
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={acquireUserLocation}
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
              onClick={acquireUserLocation}
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
              <div className="flex items-center bg-white rounded-xl px-3.5 py-2.5 shadow-xl border border-gray-200 focus-within:border-[#1A73E8] focus-within:ring-2 focus-within:ring-[#1A73E8]/20 transition-all">
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
                      <MapPin size={16} className="text-[#1A73E8] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        {res.primaryText && (
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {res.primaryText}
                          </div>
                        )}
                        <div className="text-[11px] font-normal text-gray-600 leading-snug line-clamp-2">
                          {res.secondaryText || res.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Sleek Compact & Curvy Blue Location Pin Marker (Exact Map Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000]">
            <div className="relative flex flex-col items-center select-none">
              {/* Floating Pin with Smooth Lift & Drop Animation */}
              <div
                className="transition-all duration-200 ease-out origin-bottom flex flex-col items-center"
                style={{
                  transform: isDragging ? 'translateY(-8px) scale(1.06)' : 'translateY(0) scale(1)',
                }}
              >
                <div className="filter drop-shadow-[0_4px_10px_rgba(29,78,216,0.32)]">
                  <svg
                    width="24"
                    height="32"
                    viewBox="0 0 24 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="curvyBluePin" x1="12" y1="0" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                    </defs>
                    {/* Soft Curvy Organic Droplet Pin */}
                    <path
                      d="M12 0C5.37258 0 0 5.37258 0 12C0 19.8 10.2 30.7 11.2 31.7C11.6 32.1 12.4 32.1 12.8 31.7C13.8 30.7 24 19.8 24 12C24 5.37258 18.6274 0 12 0Z"
                      fill="url(#curvyBluePin)"
                    />
                    {/* Inner White Focal Circle */}
                    <circle cx="12" cy="11.5" r="4.2" fill="#FFFFFF" />
                    {/* Core Blue Dot */}
                    <circle cx="12" cy="11.5" r="2.1" fill="#1D4ED8" />
                  </svg>
                </div>
              </div>

              {/* Compact Ground Shadow directly beneath pin point */}
              <div className="absolute -bottom-0.5 flex items-center justify-center">
                <div
                  className={`w-2.5 h-1 bg-black/25 rounded-full blur-[0.6px] transition-all duration-200 ${isDragging ? 'scale-50 opacity-20' : 'scale-100 opacity-80'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Google Maps Controls (Right Side) */}
          <div className="absolute bottom-5 right-4 z-[1000] flex flex-col gap-2.5">
            {/* Satellite / Street Map Switcher */}
            <button
              type="button"
              onClick={toggleMapType}
              className={`size-11 rounded-xl shadow-lg border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${mapType === 'hybrid'
                  ? 'bg-[#0F172A] border-slate-700 text-white shadow-slate-900/30 ring-2 ring-blue-500/50'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              title={mapType === 'hybrid' ? 'Switch to Street Map' : 'Switch to High-Res Satellite View'}
            >
              <Layers size={19} className={mapType === 'hybrid' ? 'text-cyan-400' : 'text-gray-700'} />
            </button>

            {/* GPS Current Location Target Button */}
            <button
              type="button"
              onClick={acquireUserLocation}
              disabled={isLocating}
              className={`size-11 rounded-xl shadow-lg border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${gpsActive
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

        {/* Clean Bottom Action Bar */}
        <div className="relative z-20 bg-white border-t border-gray-200 px-5 py-3.5 shadow-md shrink-0 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Location…</span>
              </>
            ) : (
              <>
                <Check size={16} className="stroke-[2.5]" />
                <span>Confirm Store Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UberMapModal
