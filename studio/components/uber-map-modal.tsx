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
  Loader2,
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

// Crisp, high-contrast, beautiful Google Maps styling matching the Customer site
const CLEAN_CHOOSING_MAP_STYLES: google.maps.MapTypeStyle[] = [
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
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Coordinates & Map State (Use provided initial coordinates or Mumbai fallback)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: initialLat && !isNaN(initialLat) ? initialLat : 19.076,
    lng: initialLng && !isNaN(initialLng) ? initialLng : 72.8777,
  }))
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
      setShowDropdown(false)
      setSearchQuery('')
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
          styles: CLEAN_CHOOSING_MAP_STYLES,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          clickableIcons: true,
          maxZoom: 21,
          minZoom: 3,
        })

        mapInstanceRef.current = map
        setIsMapReady(true)

        // Event Listeners for center-pin positioning
        map.addListener('dragstart', () => {
          setIsDragging(true)
        })

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            map.panTo(e.latLng)
          }
        })

        map.addListener('idle', () => {
          setIsDragging(false)
          const center = map.getCenter()
          if (center) {
            const newLat = typeof center.lat === 'function' ? center.lat() : Number(center.lat)
            const newLng = typeof center.lng === 'function' ? center.lng() : Number(center.lng)
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

      // 1. Modern Google Maps Places AutocompleteSuggestion API
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

      // 2. Fallback to AutocompleteService
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
    secondaryText?: string
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

  // Confirm Location: Reverse geocode ONCE upon button click and populate directly
  const handleConfirmLocation = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    // ALWAYS read live center directly from Google Map instance to ensure exact pin position
    let activeLat: number = coords.lat
    let activeLng: number = coords.lng
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter()
      if (center) {
        activeLat = typeof center.lat === 'function' ? center.lat() : Number(center.lat)
        activeLng = typeof center.lng === 'function' ? center.lng() : Number(center.lng)
      }
    }

    let area = initialArea || 'Neighborhood'
    let streetAddress = initialAddress || ''
    let city = initialCity || ''
    let postcode = initialPostcode || ''
    let fullAddress = ''

    try {
      // 1. Check local cache
      const cached = getCachedReverseGeocode(activeLat, activeLng)
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
            location: { lat: activeLat, lng: activeLng },
          })

          if (response.results && response.results.length > 0) {
            const parsed = parseGoogleAddressComponents(response.results)
            if (parsed) {
              area = parsed.area
              streetAddress = parsed.streetAddress
              city = parsed.city
              postcode = parsed.postcode
              fullAddress = parsed.fullAddress

              setCachedReverseGeocode(activeLat, activeLng, {
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
      lat: activeLat,
      lng: activeLng,
      fullAddress: fullAddress || `${streetAddress}, ${area}`,
    })

    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-3xl h-[88vh] max-h-[720px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        {/* Google Map Full-Bleed Canvas */}
        <div className="relative w-full h-full bg-[#E5E3DF] overflow-hidden">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Floating Search Bar (Top Left - matching Customer Map) */}
          <div
            ref={searchContainerRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3.5 left-3.5 right-14 sm:right-auto sm:w-[340px] md:w-[380px] z-30 flex flex-col font-sans"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all overflow-hidden h-11 px-3.5 gap-2.5"
            >
              {isSearching ? (
                <Loader2 className="size-4 text-black animate-spin shrink-0" />
              ) : (
                <Search className="size-4 text-neutral-400 shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true)
                }}
                placeholder="Search area, landmark or street..."
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setShowDropdown(false)
                  }}
                  className="size-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Live Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="mt-1.5 w-full bg-white/98 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.14)] overflow-hidden py-1 max-h-56 overflow-y-auto z-40">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-neutral-100/80 transition-colors flex items-start gap-2.5 cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    <MapPin className="size-3.5 text-neutral-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black truncate">
                        {item.primaryText || item.description.split(',')[0]}
                      </p>
                      {item.secondaryText && (
                        <p className="text-[11px] text-neutral-500 truncate">{item.secondaryText}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floating Controls (Top Right) */}
          <div className="absolute top-3.5 right-3.5 z-30 flex flex-col gap-2">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-xl bg-white hover:bg-neutral-100 text-black flex items-center justify-center border border-gray-200 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>

            {/* Locate Current GPS Position */}
            <button
              type="button"
              onClick={acquireUserLocation}
              disabled={isLocating}
              className={`size-9 rounded-xl border border-gray-200 shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                gpsActive
                  ? 'bg-[#276EF1] text-white border-[#276EF1]'
                  : 'bg-white hover:bg-neutral-100 text-black'
              }`}
              title="Locate my position"
            >
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
            </button>

            {/* Zoom Controls */}
            <div className="flex flex-col gap-1.5">
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
          </div>

          {/* Location Warning Alert Banner */}
          {locationError && (
            <div className="absolute top-16 left-3.5 right-3.5 sm:left-4 sm:right-auto sm:w-[380px] z-30 px-3.5 py-2 bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-xl shadow-lg flex items-center gap-2 text-xs text-amber-900 animate-in fade-in">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <span className="text-[11px] font-medium leading-tight flex-1">{locationError}</span>
              <button
                type="button"
                onClick={acquireUserLocation}
                className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Center Precision Blue Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center select-none">
            <div
              className={`transition-transform duration-150 ease-out ${
                isDragging ? '-translate-y-2.5 scale-105' : 'translate-y-0 scale-100'
              }`}
            >
              <div className="w-5 h-7 relative flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                <svg width="20" height="28" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 0C6.26801 0 0 6.26801 0 14C0 23.8 12.3 35.7 12.9 36.3C13.5 36.9 14.5 36.9 15.1 36.3C15.7 35.7 28 23.8 28 14C28 6.26801 21.732 0 14 0Z"
                    fill="#276EF1"
                  />
                  <circle cx="14" cy="13.5" r="5.5" fill="#FFFFFF" />
                  <circle cx="14" cy="13.5" r="2.8" fill="#1B4FB8" />
                </svg>
              </div>
            </div>
            {/* Ground Target Shadow */}
            <div
              className={`bg-black/35 rounded-full filter blur-[0.8px] -mt-0.5 transition-all duration-150 ${
                isDragging ? 'w-1.5 h-0.5 opacity-25 scale-75' : 'w-2 h-0.5 opacity-60 scale-100'
              }`}
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl px-4 py-2 shadow-lg hidden sm:flex items-center gap-2">
              <MapPin size={15} className="text-[#276EF1]" />
              <span className="text-xs font-semibold text-gray-800">
                {isDragging ? 'Adjusting Pin...' : 'Drag map or search to place pin over your shop'}
              </span>
            </div>
            <div className="pointer-events-auto ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/90 hover:bg-gray-100 text-gray-700 text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-[#18191B] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Location…</span>
                  </>
                ) : (
                  <>
                    <Check size={14} className="stroke-[2.5]" />
                    <span>Confirm Workshop Location</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UberMapModal
