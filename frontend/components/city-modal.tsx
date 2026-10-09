'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Navigation, Loader2, Building2, MapPin, X, Home, Store, Compass, Briefcase } from 'lucide-react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { setStoredCity, getCityCoordinates, getSessionCoordinates, formatLocationDisplay } from './use-city-location'
import {
  getCachedPlaceDetails,
  setCachedPlaceDetails,
  getOrCreatePlacesSessionToken,
  resetPlacesSessionToken,
} from '@/lib/geocode-cache'
import {
  getSavedAddresses,
  removeSavedAddress,
  type SavedAddressItem,
} from '@/lib/saved-addresses'

export interface PlaceResult {
  id: string
  title: string
  subtitle: string
  fullName: string
  lat?: number
  lng?: number
  placeId?: string
  type?: 'apartment' | 'building' | 'street' | 'city' | 'poi'
}

export interface CityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCity: string
  onSelectCity: (
    formattedCity: string,
    coords?: { lat: number; lng: number },
    isLiveGps?: boolean,
    placeInfo?: {
      title?: string
      fullName?: string
      subtitle?: string
      placeId?: string
      isSavedAddress?: boolean
      savedAddressItem?: SavedAddressItem
    }
  ) => void
}

export function CityModal({ isOpen, onClose, selectedCity, onSelectCity }: CityModalProps) {
  const [search, setSearch] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([])
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([])
  const googlePlacesServiceRef = useRef<any>(null)
  const googlePlacesDetailsRef = useRef<any>(null)
  const googleGeocoderRef = useRef<any>(null)

  // Load saved addresses when modal opens
  useEffect(() => {
    if (isOpen) {
      setSavedAddresses(getSavedAddresses())
    }
  }, [isOpen])

  // Listen to saved address updates
  useEffect(() => {
    const handleSync = () => {
      setSavedAddresses(getSavedAddresses())
    }
    window.addEventListener('tg_saved_addresses_changed', handleSync)
    return () => window.removeEventListener('tg_saved_addresses_changed', handleSync)
  }, [])

  const currentDisplayName = useMemo(() => {
    if (!selectedCity) return 'Your Location'
    return formatLocationDisplay(selectedCity) || selectedCity.split(',')[0]
  }, [selectedCity])

  // Lazy initialize full Google Maps Places & Geocoding Services
  useEffect(() => {
    if (!isOpen) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!apiKey) return

    async function loadGoogleServices() {
      try {
        if (typeof window !== 'undefined') {
          const w = window as any
          if (!w.__googleMapsOptionsConfigured) {
            try {
              setOptions({ key: apiKey, v: 'weekly' })
              w.__googleMapsOptionsConfigured = true
            } catch {}
          }
        }

        // 1. Geocoder Library
        if (!googleGeocoderRef.current) {
          const { Geocoder } = (await importLibrary('geocoding')) as any
          googleGeocoderRef.current = new Geocoder()
        }

        // 2. Places Library (AutocompleteService & PlacesService Details)
        await importLibrary('places')
        if (typeof google !== 'undefined' && google.maps?.places) {
          if (!googlePlacesServiceRef.current && google.maps.places.AutocompleteService) {
            googlePlacesServiceRef.current = new google.maps.places.AutocompleteService()
          }
          if (!googlePlacesDetailsRef.current && google.maps.places.PlacesService) {
            googlePlacesDetailsRef.current = new google.maps.places.PlacesService(document.createElement('div'))
          }
        }
      } catch (err) {
        console.warn('Google Places library load error:', err)
      }
    }

    loadGoogleServices()
  }, [isOpen])

  // Comprehensive Google Maps Places Autocomplete search
  useEffect(() => {
    const trimmed = search.trim()
    if (trimmed.length < 2) {
      setPlaceResults([])
      setIsSearchingPlaces(false)
      return
    }

    setIsSearchingPlaces(true)

    const centerCoords = getSessionCoordinates() || getCityCoordinates(selectedCity)
    const timeoutId = setTimeout(async () => {
      const sessionToken = getOrCreatePlacesSessionToken()

      // 1. Check Google Maps Places AutocompleteService
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
          }
          if (centerCoords && centerCoords.lat && centerCoords.lng) {
            req.locationBias = new google.maps.Circle({
              center: new google.maps.LatLng(centerCoords.lat, centerCoords.lng),
              radius: 40000,
            })
          }
          if (sessionToken) req.sessionToken = sessionToken

          const predictions: google.maps.places.AutocompletePrediction[] = await new Promise((resolve) => {
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
            const mapped: PlaceResult[] = predictions.map((p, idx) => {
              const types = p.types || []
              let category: 'apartment' | 'building' | 'street' | 'city' | 'poi' = 'building'

              if (types.some(t => ['locality', 'sublocality', 'sublocality_level_1', 'sublocality_level_2', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'postal_code'].includes(t))) {
                category = 'city'
              } else if (types.some(t => ['route', 'street_address', 'intersection', 'transit_station'].includes(t))) {
                category = 'street'
              } else if (types.some(t => ['store', 'shopping_mall', 'restaurant', 'cafe', 'point_of_interest', 'establishment', 'food'].includes(t))) {
                category = 'poi'
              } else if (types.some(t => ['apartment', 'residential', 'subpremise', 'premise', 'housing_complex'].includes(t))) {
                category = 'apartment'
              }

              return {
                id: `gplace-${p.place_id || idx}`,
                title: p.structured_formatting?.main_text || p.description.split(',')[0],
                subtitle: p.structured_formatting?.secondary_text || p.description,
                fullName: p.description,
                placeId: p.place_id,
                type: category,
              }
            })

            setPlaceResults(mapped)
            setIsSearchingPlaces(false)
            return
          }
        } catch (err) {
          console.warn('Google Places Autocomplete error:', err)
        }
      }

      // 2. Modern Google Maps Places AutocompleteSuggestion API fallback
      if (typeof google !== 'undefined' && (google.maps as any)?.places?.AutocompleteSuggestion) {
        try {
          const req: any = {
            input: trimmed,
            locationBias: {
              center: { lat: centerCoords.lat, lng: centerCoords.lng },
              radius: 50000,
            },
          }
          if (sessionToken) req.sessionToken = sessionToken

          const { suggestions } = await (google.maps as any).places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)

          if (suggestions && suggestions.length > 0) {
            const mapped: PlaceResult[] = suggestions.map((s: any, idx: number) => {
              const p = s.placePrediction
              const mainText = p.mainText?.text || p.text?.text?.split(',')[0] || ''
              const secondaryText = p.secondaryText?.text || p.text?.text || ''
              const fullName = p.text?.text || `${mainText}, ${secondaryText}`
              const types = p.types || []

              let category: 'apartment' | 'building' | 'street' | 'city' | 'poi' = 'building'
              if (types.some((t: string) => ['locality', 'sublocality', 'administrative_area_level_1', 'administrative_area_level_2', 'country'].includes(t))) {
                category = 'city'
              } else if (types.some((t: string) => ['route', 'street_address'].includes(t))) {
                category = 'street'
              } else if (types.some((t: string) => ['store', 'restaurant', 'point_of_interest'].includes(t))) {
                category = 'poi'
              }

              return {
                id: `gplace-sugg-${p.placeId || idx}`,
                title: mainText,
                subtitle: secondaryText,
                fullName: fullName,
                placeId: p.placeId,
                type: category,
              }
            })

            setPlaceResults(mapped)
            setIsSearchingPlaces(false)
            return
          }
        } catch (err) {
          console.warn('Google AutocompleteSuggestion API fallback:', err)
        }
      }

      // 3. Google Maps Geocoder as full global resolver
      const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
      if (geocoder && typeof google !== 'undefined' && google.maps) {
        try {
          const geoResults: google.maps.GeocoderResult[] = await new Promise((resolve) => {
            geocoder.geocode(
              { address: trimmed },
              (results: any, status: any) => {
                if (status === 'OK' && Array.isArray(results)) {
                  resolve(results)
                } else {
                  resolve([])
                }
              }
            )
          })

          if (geoResults && geoResults.length > 0) {
            const mapped: PlaceResult[] = geoResults.slice(0, 10).map((gr, idx) => {
              const loc = gr.geometry.location
              const types = gr.types || []
              let category: 'apartment' | 'building' | 'street' | 'city' | 'poi' = 'building'
              if (types.some(t => ['locality', 'sublocality', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'postal_code'].includes(t))) {
                category = 'city'
              } else if (types.some(t => ['route', 'street_address'].includes(t))) {
                category = 'street'
              }

              return {
                id: `geocoder-${gr.place_id || idx}`,
                title: gr.formatted_address.split(',')[0],
                subtitle: gr.formatted_address,
                fullName: gr.formatted_address,
                lat: loc.lat(),
                lng: loc.lng(),
                placeId: gr.place_id,
                type: category,
              }
            })
            setPlaceResults(mapped)
            setIsSearchingPlaces(false)
            return
          }
        } catch (err) {
          console.warn('Google Geocoder search fallback error:', err)
        }
      }

      setIsSearchingPlaces(false)
    }, 180)

    return () => clearTimeout(timeoutId)
  }, [search, selectedCity])

  // Clear search input whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setPlaceResults([])
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectPlace = async (place: PlaceResult) => {
    let coords = place.lat && place.lng ? { lat: place.lat, lng: place.lng } : null

    // 1. Check cached details
    if (!coords && place.placeId) {
      const cached = getCachedPlaceDetails(place.placeId)
      if (cached) {
        coords = { lat: cached.lat, lng: cached.lng }
      }
    }

    // 2. Fetch full place details via PlacesService
    const placesDetails = googlePlacesDetailsRef.current
    if (!coords && place.placeId && placesDetails) {
      try {
        const detailsRes: any = await new Promise((resolve) => {
          placesDetails.getDetails(
            {
              placeId: place.placeId,
              fields: ['geometry', 'formatted_address', 'name', 'address_components'],
            },
            (result: any, status: any) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
                resolve(result)
              } else {
                resolve(null)
              }
            }
          )
        })

        if (detailsRes?.geometry?.location) {
          const loc = detailsRes.geometry.location
          coords = {
            lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
            lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
          }
          if (place.placeId) {
            setCachedPlaceDetails(place.placeId, {
              lat: coords.lat,
              lng: coords.lng,
              formattedAddress: detailsRes.formatted_address || place.fullName,
            })
          }
        }
      } catch (err) {
        console.warn('Google Places getDetails resolution failed:', err)
      }
    }

    // 3. Fallback: Resolve via Google Geocoder
    const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)
    if (!coords && (place.placeId || place.fullName) && geocoder) {
      try {
        const geoRes = await new Promise<any[]>((resolve) => {
          const query = place.placeId ? { placeId: place.placeId } : { address: place.fullName }
          geocoder.geocode(query, (results: any, status: any) => {
            if (status === 'OK' && Array.isArray(results) && results[0]?.geometry?.location) {
              resolve(results)
            } else {
              resolve([])
            }
          })
        })
        if (geoRes && geoRes.length > 0 && geoRes[0]?.geometry?.location) {
          const loc = geoRes[0].geometry.location
          coords = {
            lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
            lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
          }
          if (place.placeId) {
            setCachedPlaceDetails(place.placeId, { lat: coords.lat, lng: coords.lng, formattedAddress: place.fullName })
          }
        }
      } catch (err) {
        console.warn('Error resolving Google Place coordinates via geocoder:', err)
      }
    }

    resetPlacesSessionToken()

    if (coords && (coords.lat !== 0 || coords.lng !== 0)) {
      setStoredCity(place.fullName, coords)
      onSelectCity(place.fullName, coords, false, {
        title: place.title,
        fullName: place.fullName,
        subtitle: place.subtitle,
        placeId: place.placeId,
      })
    } else {
      setStoredCity(place.fullName)
      onSelectCity(place.fullName, undefined, false, {
        title: place.title,
        fullName: place.fullName,
        subtitle: place.subtitle,
        placeId: place.placeId,
      })
    }

    setSearch('')
    setPlaceResults([])
    onClose()
  }

  const handleSelectSavedAddress = (saved: SavedAddressItem) => {
    const targetCity = saved.city || saved.details?.city || saved.address.split(',').slice(-2)[0]?.trim() || selectedCity
    const coords = { lat: saved.lat, lng: saved.lng }
    setStoredCity(targetCity, coords)
    onSelectCity(targetCity, coords, false, {
      title: saved.title || saved.locality || saved.address.split(',')[0],
      fullName: saved.address,
      subtitle: saved.locality,
      placeId: saved.id,
      isSavedAddress: true,
      savedAddressItem: saved,
    })
    setSearch('')
    setPlaceResults([])
    onClose()
  }

  const handleDeleteSavedAddress = (id: string) => {
    const updated = removeSavedAddress(id)
    setSavedAddresses(updated)
  }

  const handleDetectLocation = () => {
    setIsLocating(true)

    if (!navigator.geolocation) {
      setIsLocating(false)
      onClose()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const liveCoords = { lat: latitude, lng: longitude }

        const geocoder = googleGeocoderRef.current || (typeof google !== 'undefined' && google.maps?.Geocoder ? new google.maps.Geocoder() : null)

        if (geocoder) {
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any, status: any) => {
              let resolvedCity = selectedCity || 'Current Location'
              if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                const comps = results[0]?.address_components || []
                const locality = comps.find((c: any) => c.types.includes('locality'))
                const sublocality = comps.find((c: any) => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'))
                const admin2 = comps.find((c: any) => c.types.includes('administrative_area_level_2'))
                const state = comps.find((c: any) => c.types.includes('administrative_area_level_1'))
                const country = comps.find((c: any) => c.types.includes('country'))

                const cityName = locality?.long_name || sublocality?.long_name || admin2?.long_name || state?.long_name || 'Current Location'
                const stateCode = state?.short_name || country?.short_name || ''
                resolvedCity = stateCode ? `${cityName}, ${stateCode}` : cityName
              }

              setStoredCity(resolvedCity, liveCoords)
              onSelectCity(resolvedCity, liveCoords, true, {
                title: 'Current Location',
                fullName: resolvedCity,
              })
              setSearch('')
              setPlaceResults([])
              setIsLocating(false)
              onClose()
            }
          )
        } else {
          setStoredCity('Current Location', liveCoords)
          onSelectCity(selectedCity || 'Current Location', liveCoords, true, {
            title: 'Current Location',
            fullName: selectedCity || 'Current Location',
          })
          setSearch('')
          setPlaceResults([])
          setIsLocating(false)
          onClose()
        }
      },
      (err) => {
        console.warn('Geolocation failed or permission denied:', err)
        setIsLocating(false)
        onClose()
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  return (
    <div
      tabIndex={-1}
      aria-modal="true"
      aria-label="dialog"
      role="dialog"
      data-testid="city-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
    >
      {/* Modal Card Container with exact size */}
      <div className="relative w-full max-w-[480px] h-[670px] max-h-[90vh] rounded-[24px] bg-white p-6 sm:p-7 shadow-[0_12px_48px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col font-sans">

        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div data-testid="city-selector-headline" className="text-[26px] sm:text-[30px] font-bold tracking-tight text-black leading-[1.12]">
            You are currently in {currentDisplayName}
          </div>
          <button
            data-testid="city-selector-close"
            onClick={onClose}
            className="w-11 h-11 rounded-[12px] border border-[#276EF1] text-[#276EF1] hover:bg-[#F3F7FE] flex items-center justify-center transition-colors shrink-0 cursor-pointer mt-0.5"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="m20.71 4.71-1.42-1.42-7.29 7.3-7.29-7.3-1.42 1.42 7.3 7.29-7.3 7.29 1.42 1.42 7.29-7.3 7.29 7.3 1.42-1.42-7.3-7.29 7.3-7.29Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>

        {/* Search Bar Input */}
        <div data-testid="city-search-input" className="relative mb-4">
          <div className="w-full h-[56px] rounded-full bg-[#F3F3F3] flex items-center px-5 text-black">
            <div className="shrink-0 text-black flex items-center">
              {isSearchingPlaces ? (
                <Loader2 size={20} className="animate-spin text-black" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="m22.355 20.935-4.68-4.68a8.963 8.963 0 0 0 1.97-5.61 9 9 0 1 0-9 9c2.12 0 4.07-.74 5.61-1.97l4.68 4.68 1.42-1.42Zm-11.71-3.29c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7Z" fill="currentColor"></path>
                </svg>
              )}
            </div>
            <input
              aria-label="Search for a city or apartment"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apartment, street, or city"
              className="w-full bg-transparent pl-3 pr-2 text-[16px] font-medium text-black placeholder:text-[#757575] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="size-6 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center transition-colors text-[#4B5563] shrink-0 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 flex flex-col space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {/* If user is actively typing a search query */}
          {search.trim().length >= 2 ? (
            <div>
              <div className="text-[14px] font-bold text-[#5E5E5E] mb-2 py-1 flex items-center justify-between">
                <span>Search Results</span>
                {isSearchingPlaces && <span className="text-xs font-normal text-gray-500">Searching…</span>}
              </div>

              {placeResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {placeResults.map((place, idx) => (
                    <button
                      key={`${place.id}-${idx}`}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="w-full text-left py-3.5 px-2 transition-colors flex items-start gap-3.5 group cursor-pointer hover:bg-[#F9FAFB] rounded-xl"
                    >
                      <div className="size-8 rounded-full bg-[#F3F3F3] text-black flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#276EF1]/10 group-hover:text-[#276EF1] transition-colors">
                        {place.type === 'city' ? (
                          <MapPin size={16} />
                        ) : place.type === 'street' ? (
                          <Compass size={16} />
                        ) : place.type === 'poi' ? (
                          <Store size={16} />
                        ) : place.type === 'apartment' ? (
                          <Home size={16} />
                        ) : (
                          <Building2 size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-black group-hover:text-[#276EF1] transition-colors truncate">
                          {place.title}
                        </p>
                        {place.subtitle && (
                          <p className="text-[13px] text-[#5E5E5E] truncate mt-0.5">
                            {place.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Google Maps Attribution */}
                  <div className="pt-3 pb-1 text-right text-[11px] font-medium text-gray-400 select-none">
                    powered by <span className="font-bold text-gray-500">Google</span>
                  </div>
                </div>
              ) : !isSearchingPlaces ? (
                <div className="py-8 text-center text-[#5E5E5E] text-[15px]">
                  No places found matching "{search}".
                </div>
              ) : null}
            </div>
          ) : (
            <>
              {/* Option 1: Use Current Location Row */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="w-full text-left h-[54px] px-2 transition-colors flex items-center justify-between group cursor-pointer hover:bg-[#F9FAFB] rounded-xl shrink-0"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#F3F7FE] text-[#276EF1] flex items-center justify-center shrink-0">
                    {isLocating ? (
                      <Loader2 size={16} className="animate-spin text-[#276EF1]" />
                    ) : (
                      <Navigation size={16} className="text-[#276EF1]" />
                    )}
                  </div>
                  <span className="text-[16px] font-bold text-[#276EF1]">
                    {isLocating ? 'Detecting your location…' : 'Use current location'}
                  </span>
                </div>
              </button>

              {/* Divider with OR */}
              <div className="relative my-2 flex items-center justify-center shrink-0">
                <div className="w-full border-t border-gray-200" />
                <span className="absolute bg-white px-3 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  or
                </span>
              </div>

              {/* Option 2: Saved Addresses Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="text-[13px] font-black uppercase tracking-wider text-gray-500 mb-2 px-1 shrink-0">
                  Saved Addresses
                </div>

                {savedAddresses.length > 0 ? (
                  <div className="divide-y divide-gray-100 overflow-y-auto">
                    {savedAddresses.map((saved) => (
                      <div
                        key={saved.id}
                        className="w-full flex items-center justify-between py-3 px-2 hover:bg-[#F9FAFB] rounded-xl transition-colors group cursor-pointer"
                        onClick={() => handleSelectSavedAddress(saved)}
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1 pr-2">
                          <div className="size-8 rounded-full bg-[#F3F3F3] text-black flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#276EF1]/10 group-hover:text-[#276EF1] transition-colors">
                            {saved.title?.toLowerCase() === 'home' ? (
                              <Home size={16} />
                            ) : saved.title?.toLowerCase() === 'work' ? (
                              <Briefcase size={16} />
                            ) : (
                              <MapPin size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-bold text-black truncate group-hover:text-[#276EF1] transition-colors">
                              {saved.title || saved.locality || saved.address.split(',')[0]}
                            </p>
                            <p className="text-[12px] text-gray-500 truncate mt-0.5">
                              {saved.address}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSavedAddress(saved.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 size-7 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                          title="Delete saved address"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
                    <MapPin className="size-8 text-gray-300 mb-2.5" />
                    <p className="text-[15px] font-semibold text-neutral-800">No saved addresses found</p>
                    <p className="text-[13px] text-gray-400 mt-1 max-w-[280px]">
                      Search a place above or pin an address on the map to save it to your profile.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  )
}
