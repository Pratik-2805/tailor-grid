'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  ChevronDown,
  MapPin,
  Calendar,
  Clock,
  X,
  Camera,
  Scissors,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Shirt,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { CityModal } from '@/components/city-modal'
import { useCityLocation, getCityCoordinates, setStoredCity, formatLocationDisplay } from '@/components/use-city-location'
import CleanGoogleMap from '@/components/CleanGoogleMap'
import { CustomLoader } from '@/components/custom-loader'
import { SewingLoader } from '@/components/sewing-loader'
import { createOrder, startOrderDispatch, fetchDispatchStatus, cancelOrderDispatch, retryOrderDispatch, fetchNearbyTailors, updateUserProfile } from '@/lib/api'
import { getStorageCookie, setStorageCookie, getCookie, deleteCookie } from '@/lib/cookies'
import { useApp } from '@/components/app-provider'
import { GARMENT_CATEGORIES, getStoresForLocation, getClosestStoreForLocation, type StoreOption } from '@/components/data'
import { getCachedReverseGeocode, setCachedReverseGeocode } from '@/lib/geocode-cache'

const SESSION_BOOKING_KEY = 'tg_book_session'

function getSessionBookingData(): any | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_BOOKING_KEY) || getCookie(SESSION_BOOKING_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function setSessionBookingData(data: any): void {
  if (typeof window === 'undefined') return
  try {
    const json = JSON.stringify(data)
    sessionStorage.setItem(SESSION_BOOKING_KEY, json)
    if (typeof document !== 'undefined') {
      document.cookie = `${encodeURIComponent(SESSION_BOOKING_KEY)}=${encodeURIComponent(json)}; path=/; SameSite=Lax`
    }
  } catch {}
}

function clearSessionBookingData(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_BOOKING_KEY)
    } catch {}
    deleteCookie(SESSION_BOOKING_KEY, '/')
  }
}

function GarmentCategoryIcon({ categoryId, className = 'size-4' }: { categoryId: string; className?: string }) {
  switch (categoryId) {
    case 'trousers':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12v4l-2 14h-3.5L12 11l-0.5 10H8L6 7V3z" />
        </svg>
      )
    case 'shirts':
      return <Shirt className={className} />
    case 'dresses':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3l3 2 3-2 2 3-2 3v12H9V9L7 6l2-3z" />
        </svg>
      )
    case 'skirts':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 4h8l3 16H5L8 4z" />
        </svg>
      )
    case 'jackets':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3h16v18H4zM12 3v18M8 8l4 4 4-4" />
        </svg>
      )
    case 'suits':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l-2 6 2 12H6l2-12L6 3zM12 9v12M10 5l2 2 2-2" />
        </svg>
      )
    case 'occasion':
    default:
      return <Sparkles className={className} />
  }
}

const DARZI_TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '01:00 PM',
  '02:30 PM',
  '03:30 PM',
  '04:30 PM',
  '05:30 PM',
  '06:30 PM',
]

export interface CustomerAddressDetails {
  houseNo: string
  apartment: string
  locality: string
  city: string
  landmark?: string
}

function parseGoogleAddressComponents(results: any[]): CustomerAddressDetails {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return { houseNo: '', apartment: '', locality: '', city: '' }
  }

  const first = results[0]
  const comps = first?.address_components || []

  const streetNumber = comps.find((c: any) => c.types.includes('street_number'))?.long_name || ''
  const subpremise = comps.find((c: any) => c.types.includes('subpremise'))?.long_name || ''
  const premise = comps.find((c: any) => c.types.includes('premise'))?.long_name || ''
  const route = comps.find((c: any) => c.types.includes('route'))?.long_name || ''
  const sublocality2 = comps.find((c: any) => c.types.includes('sublocality_level_2'))?.long_name || ''
  const sublocality1 = comps.find((c: any) => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))?.long_name || ''
  const neighborhood = comps.find((c: any) => c.types.includes('neighborhood'))?.long_name || ''
  const locality = comps.find((c: any) => c.types.includes('locality'))?.long_name || ''
  const admin2 = comps.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || ''
  const admin1 = comps.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || ''
  const poi = comps.find((c: any) => c.types.includes('point_of_interest') || c.types.includes('establishment'))?.long_name || ''

  // House / Flat No.
  const houseNo = subpremise || streetNumber || ''

  // Apartment / Society / Building
  let apartment = ''
  if (premise && premise !== houseNo) {
    apartment = premise
  } else if (poi) {
    apartment = poi
  }

  // Locality / Street / Area
  const localityParts = [route, sublocality2, sublocality1 || neighborhood].filter(Boolean)
  const localityStr = localityParts.length > 0 ? Array.from(new Set(localityParts)).join(', ') : (neighborhood || sublocality1 || '')

  // City / State
  const cityPart = locality || admin2 || ''
  const cityStr = cityPart && admin1 ? `${cityPart}, ${admin1}` : (cityPart || admin1 || '')

  return {
    houseNo,
    apartment,
    locality: localityStr,
    city: cityStr,
  }
}

export default function BookPage() {
  const router = useRouter()
  const {
    user,
    setUser,
    isAuthLoading,
    navigate,
    openAuth,
    prefilledPostcode,
    setPrefilledPostcode,
    prefilledGarmentId,
    setPrefilledGarmentId,
    prefilledServiceId,
    setPrefilledServiceId,
    prefilledStore,
    setPrefilledStore,
    measurementDraft,
    setCreatedOrderId,
    startBookingTransition,
    stopBookingTransition,
  } = useApp()

  const [selectedCity, setSelectedCity] = useCityLocation('Vasai, IN-MH')
  const [isCityModalOpen, setIsCityModalOpen] = useState(false)
  
  // Initialize states from current session cookie/storage if present
  const [userGpsCoords, setUserGpsCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const s = getSessionBookingData()
    return s?.coords || null
  })
  const [isLiveLocation, setIsLiveLocation] = useState(() => {
    const s = getSessionBookingData()
    return typeof s?.isLiveLocation === 'boolean' ? s.isLiveLocation : false
  })
  const [isLocationSaved, setIsLocationSaved] = useState(() => {
    const s = getSessionBookingData()
    return typeof s?.isLocationSaved === 'boolean' ? s.isLocationSaved : false
  })

  // 3D Card Flip state for Address Details input
  const [isCardFlipped, setIsCardFlipped] = useState(() => {
    const s = getSessionBookingData()
    return typeof s?.isCardFlipped === 'boolean' ? s.isCardFlipped : false
  })

  // Address Details for Searched / Dropped Pin Location (House No., Apartment, Locality, City)
  const [addressDetails, setAddressDetails] = useState<CustomerAddressDetails>(() => {
    const s = getSessionBookingData()
    return s?.addressDetails || {
      houseNo: '',
      apartment: '',
      locality: '',
      city: 'Vasai, IN-MH',
      landmark: '',
    }
  })

  const handleAddressFieldChange = (field: keyof CustomerAddressDetails, value: string) => {
    setAddressDetails((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'city' && value.trim()) {
        setSelectedCity(value)
      }
      return updated
    })
  }

  // Handle Save Address & Update Radius Centers & User Profile
  const handleSaveAddress = async () => {
    const fullAddress = [
      addressDetails.houseNo,
      addressDetails.apartment,
      addressDetails.locality,
      addressDetails.city || selectedCity,
    ].filter(Boolean).join(', ') || selectedCity

    const targetCoords = userGpsCoords || getCityCoordinates(selectedCity)
    const activeCityName = addressDetails.city?.trim() || selectedCity

    // 1. Save Coordinates & City
    setSelectedCity(activeCityName)
    setStoredCity(activeCityName, targetCoords)
    setUserGpsCoords(targetCoords)
    setIsLiveLocation(false)
    setIsLocationSaved(true)

    // 2. Fetch tailors from database taking this exact saved pinned location as center of 5.0-mile radius
    try {
      const data = await fetchNearbyTailors(targetCoords.lat, targetCoords.lng, 5.0)
      if (data && Array.isArray(data.tailors)) {
        setNearbyStores(data.tailors)
        if (data.tailors.length > 0) {
          setSelectedStore(data.tailors[0])
        } else {
          setSelectedStore(null)
        }
      }
    } catch (err) {
      console.warn('Error fetching tailors for saved pinned location:', err)
    }

    // 3. Save this address to User Profile in Backend & Client session
    if (user) {
      const updatedUserPayload = {
        ...user,
        address: fullAddress,
        postcode: addressDetails.locality || addressDetails.city || selectedCity,
      }
      setUser(updatedUserPayload)

      try {
        await updateUserProfile({
          address: fullAddress,
          postcode: addressDetails.locality || addressDetails.city || selectedCity,
        })
      } catch (err) {
        console.warn('Error saving address to user profile in backend:', err)
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`tg_saved_address_${user?.id || 'guest'}`, JSON.stringify({
          address: fullAddress,
          details: addressDetails,
          coords: targetCoords,
        }))
      } catch {}
    }

    // 4. Flip card back to order request face
    setIsCardFlipped(false)
    toast.success('Address saved to profile & nearby ateliers updated!', { position: 'top-center' })
  }

  // Selection states initialized from prefilled context or session cookie
  const [selectedGarmentId, setSelectedGarmentId] = useState(() => {
    const s = getSessionBookingData()
    return s?.garmentId || prefilledGarmentId || 'trousers'
  })
  const [selectedServiceId, setSelectedServiceId] = useState(() => {
    const s = getSessionBookingData()
    return s?.serviceId || prefilledServiceId || 'trouser-hem-plain'
  })
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)

  // Image Upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>(() => {
    const s = getSessionBookingData()
    return Array.isArray(s?.images) ? s.images : []
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Live device GPS location detection on mount: Always fetch fresh location on refresh
  const liveGpsCoordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const liveCityRef = useRef<string>('Vasai, IN-MH')
  const liveAddressDetailsRef = useRef<CustomerAddressDetails>({
    houseNo: '',
    apartment: '',
    locality: '',
    city: 'Vasai, IN-MH',
    landmark: '',
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return

    const sessionData = getSessionBookingData()
    const hasPriorSession = sessionData && (sessionData.coords || sessionData.city || sessionData.garmentId)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const liveCoords = { lat: latitude, lng: longitude }
        liveGpsCoordsRef.current = liveCoords

        // Only override state with live GPS if user does not already have an active session
        if (!hasPriorSession) {
          setUserGpsCoords(liveCoords)
          setIsLiveLocation(true)
        }

        // Check cache first to avoid redundant Google Geocoder call
        const cached = getCachedReverseGeocode(liveCoords.lat, liveCoords.lng)
        if (cached) {
          const cachedDetails: CustomerAddressDetails = {
            houseNo: cached.houseNo,
            apartment: cached.apartment,
            locality: cached.locality,
            city: cached.city,
            landmark: '',
          }
          liveAddressDetailsRef.current = cachedDetails
          liveCityRef.current = cached.city
          if (!hasPriorSession) {
            setAddressDetails((prev) => ({ ...prev, ...cachedDetails }))
            setSelectedCity(cached.city)
            setStoredCity(cached.city, liveCoords)
          }
          return
        }

        // Reverse geocode via Google Geocoder if available
        if (typeof google !== 'undefined' && google.maps?.Geocoder) {
          try {
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ location: liveCoords }, (results, status) => {
              if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                const parsed = parseGoogleAddressComponents(results)
                const newDetails: CustomerAddressDetails = {
                  houseNo: parsed.houseNo || '',
                  apartment: parsed.apartment || '',
                  locality: parsed.locality || '',
                  city: parsed.city || '',
                  landmark: '',
                }
                liveAddressDetailsRef.current = newDetails

                const comps = results[0]?.address_components || []
                const locality = comps.find((c: any) => c.types.includes('locality'))
                const sublocality = comps.find((c: any) => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'))
                const admin2 = comps.find((c: any) => c.types.includes('administrative_area_level_2'))
                const state = comps.find((c: any) => c.types.includes('administrative_area_level_1'))
                const country = comps.find((c: any) => c.types.includes('country'))

                const cityName = locality?.long_name || sublocality?.long_name || admin2?.long_name || 'Vasai'
                const stateCode = state?.short_name || country?.short_name || ''
                const formatted = stateCode ? `${cityName}, ${stateCode}` : cityName
                liveCityRef.current = formatted

                setCachedReverseGeocode(liveCoords.lat, liveCoords.lng, {
                  houseNo: newDetails.houseNo,
                  apartment: newDetails.apartment,
                  locality: newDetails.locality,
                  city: formatted,
                  formattedAddress: formatted,
                })

                if (!hasPriorSession) {
                  setAddressDetails((prev) => ({
                    ...prev,
                    ...newDetails,
                  }))
                  setSelectedCity(formatted)
                  setStoredCity(formatted, liveCoords)
                }
              }
            })
          } catch {}
        }
      },
      (err) => {
        console.warn('Geolocation prompt/access skipped or denied, fallback to default city:', err)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [setSelectedCity])

  // Handle clicking "Back to Request" on the address details card
  const handleBackToRequest = () => {
    setIsCardFlipped(false)

    // If the user did not explicitly save this location, automatically revert to current live location
    if (!isLocationSaved) {
      if (liveGpsCoordsRef.current) {
        setUserGpsCoords(liveGpsCoordsRef.current)
        setIsLiveLocation(true)
        if (liveCityRef.current) {
          setSelectedCity(liveCityRef.current)
          setStoredCity(liveCityRef.current, liveGpsCoordsRef.current)
        }
        if (liveAddressDetailsRef.current) {
          setAddressDetails(liveAddressDetailsRef.current)
        }
      } else if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const live = { lat: position.coords.latitude, lng: position.coords.longitude }
            liveGpsCoordsRef.current = live
            setUserGpsCoords(live)
            setIsLiveLocation(true)
          },
          () => {},
          { enableHighAccuracy: true, timeout: 6000 }
        )
      }
    }
  }

  const [bookingNotes, setBookingNotes] = useState(() => {
    const s = getSessionBookingData()
    return s?.bookingNotes || ''
  })

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleDateObj, setScheduleDateObj] = useState<Date>(() => {
    const s = getSessionBookingData()
    return s?.scheduleDate ? new Date(s.scheduleDate) : new Date()
  })
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const s = getSessionBookingData()
    return s?.scheduleTime || '03:30 PM'
  })

  // Auto-sync form, map, and schedule state to session storage / cookie so it persists on page refresh
  useEffect(() => {
    setSessionBookingData({
      garmentId: selectedGarmentId,
      serviceId: selectedServiceId,
      city: selectedCity,
      coords: userGpsCoords,
      isLiveLocation,
      isLocationSaved,
      isCardFlipped,
      addressDetails,
      images: uploadedImages,
      scheduleDate: scheduleDateObj.toISOString(),
      scheduleTime: selectedTime,
      bookingNotes,
    })
  }, [
    selectedGarmentId,
    selectedServiceId,
    selectedCity,
    userGpsCoords,
    isLiveLocation,
    isLocationSaved,
    isCardFlipped,
    addressDetails,
    uploadedImages,
    scheduleDateObj,
    selectedTime,
    bookingNotes,
  ])

  // Live Dispatch Searching & No-Tailors alert states
  const [isSearching, setIsSearching] = useState(false)
  const [searchOrderId, setSearchOrderId] = useState<string>('')
  const searchOrderIdRef = useRef<string>('')
  const [isNoTailorsModalOpen, setIsNoTailorsModalOpen] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dispatchChannelRef = useRef<BroadcastChannel | null>(null)

  // Clean up polling interval and broadcast channel on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (dispatchChannelRef.current) {
        dispatchChannelRef.current.close()
        dispatchChannelRef.current = null
      }
    }
  }, [])

  // Nearby partner stores for selected city / location
  const [nearbyStores, setNearbyStores] = useState<StoreOption[]>([])

  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(prefilledStore || null)

  // Fetch partner studios purely by lat/lng within 5.0 miles for active location (GPS or user pinned)
  useEffect(() => {
    let isCurrent = true
    const coords = userGpsCoords || getCityCoordinates(selectedCity)
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return

    fetchNearbyTailors(coords.lat, coords.lng, 5.0)
      .then((data) => {
        if (!isCurrent) return
        if (data && Array.isArray(data.tailors)) {
          setNearbyStores(data.tailors)
          if (data.tailors.length > 0) {
            if (!prefilledStore || !data.tailors.some((s: StoreOption) => s.id === prefilledStore.id)) {
              setSelectedStore(data.tailors[0])
            }
          } else {
            setSelectedStore(null)
          }
        }
      })
      .catch((err) => {
        console.warn('Error fetching nearby stores in book page:', err)
      })

    return () => {
      isCurrent = false
    }
  }, [selectedCity, userGpsCoords?.lat, userGpsCoords?.lng, prefilledStore])

  // Sync prefilled state from App context / measurement draft
  useEffect(() => {
    if (prefilledGarmentId) {
      setSelectedGarmentId(prefilledGarmentId)
    }
    if (prefilledServiceId) {
      setSelectedServiceId(prefilledServiceId)
    }
    if (prefilledStore) {
      setSelectedStore(prefilledStore)
    }
    if (measurementDraft) {
      if (measurementDraft.garmentId) setSelectedGarmentId(measurementDraft.garmentId)
      if (measurementDraft.serviceId) setSelectedServiceId(measurementDraft.serviceId)
      if (measurementDraft.city) setSelectedCity(measurementDraft.city)
      if (measurementDraft.images && measurementDraft.images.length > 0) setUploadedImages(measurementDraft.images)
      if (measurementDraft.scheduleDate) setScheduleDateObj(new Date(measurementDraft.scheduleDate))
      if (measurementDraft.scheduleTime) setSelectedTime(measurementDraft.scheduleTime)
    }
  }, [prefilledGarmentId, prefilledServiceId, prefilledStore, measurementDraft])

  // Derive active category & service
  const currentCategory = useMemo(() => {
    return GARMENT_CATEGORIES.find((c) => c.id === selectedGarmentId) || GARMENT_CATEGORIES[0]
  }, [selectedGarmentId])

  const currentService = useMemo(() => {
    return (
      currentCategory.popularServices.find((s) => s.id === selectedServiceId) ||
      currentCategory.popularServices[0]
    )
  }, [currentCategory, selectedServiceId])

  // Map coordinates dynamically based on live GPS or selected city
  const mapCoordinates = useMemo(() => {
    if (userGpsCoords) return userGpsCoords
    return getCityCoordinates(selectedCity)
  }, [userGpsCoords, selectedCity])

  // Close dropdowns on outside click
  const categoryRef = useRef<HTMLDivElement>(null)
  const serviceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false)
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync default service when category changes
  const handleSelectCategory = (catId: string) => {
    setSelectedGarmentId(catId)
    const cat = GARMENT_CATEGORIES.find((c) => c.id === catId)
    if (cat && cat.popularServices.length > 0) {
      setSelectedServiceId(cat.popularServices[0].id)
    }
    setIsCategoryDropdownOpen(false)
  }

  // Handle Photo Upload (Max 4 photos allowed)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (uploadedImages.length >= 4) {
      toast.error('You can upload a maximum of 4 garment photos.', { position: 'top-center' })
      e.target.value = ''
      return
    }

    const availableSlots = 4 - uploadedImages.length
    const fileList = Array.from(files).slice(0, availableSlots)

    if (files.length > availableSlots) {
      toast.info(`Only ${availableSlots} more photo(s) allowed (max 4).`, { position: 'top-center' })
    }

    fileList.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => {
            if (prev.length >= 4) return prev
            return [...prev, event.target!.result as string]
          })
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCancelSearch = async () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (dispatchChannelRef.current) {
      dispatchChannelRef.current.close()
      dispatchChannelRef.current = null
    }
    const activeOrderId = searchOrderIdRef.current || searchOrderId
    if (activeOrderId) {
      // Broadcast instant cancellation to all tailor atelier tabs in 0ms
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('tg_dispatch_channel')
          bc.postMessage({ type: 'DISPATCH_CANCELLED', orderId: activeOrderId })
          bc.close()
        } catch { }
      }

      await cancelOrderDispatch(activeOrderId)
      if (typeof window !== 'undefined') {
        const { removeStorageCookie } = await import('@/lib/cookies')
        removeStorageCookie(`tg_order_${activeOrderId}`)
      }
    }
    searchOrderIdRef.current = ''
    setSearchOrderId('')
    setIsSearching(false)
    toast.info('Alteration search cancelled')
  }

  const handleTryAgainSearch = () => {
    setIsNoTailorsModalOpen(false)
    executeBooking('now')
  }

  // Complete Booking flow execution
  const executeBooking = async (pickupOption: 'now' | 'schedule', schedDate?: Date, schedTime?: string) => {
    if (!user || !user.phone) {
      openAuth('CUSTOMER', user ? 'signup' : 'signin')
      return
    }

    const closestStore = selectedStore || (nearbyStores.length > 0 ? nearbyStores[0] : null)
    const uniqueTs = Date.now().toString().slice(-6)
    const uniqueRand = Math.floor(100 + Math.random() * 900)
    const newOrderId = `TG-${uniqueTs}${uniqueRand}`
    const otp = String(Math.floor(1000 + Math.random() * 9000))

    const activeSchedDate = schedDate || scheduleDateObj || new Date()
    const activeSchedTime = schedTime || selectedTime || '03:30 PM'

    const formattedDateDisplay = activeSchedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    const coords = userGpsCoords || getCityCoordinates(selectedCity)
    const fullCustomerAddress = [
      addressDetails.houseNo,
      addressDetails.apartment,
      addressDetails.locality,
      addressDetails.city || selectedCity,
    ].filter(Boolean).join(', ') || selectedCity

    const orderData = {
      id: newOrderId,
      otp,
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      userId: user?.id || null,
      customerLat: coords.lat,
      customerLng: coords.lng,
      customerAddress: fullCustomerAddress,
      addressDetails: addressDetails,
      storeId: closestStore?.id || null,
      storeName: closestStore?.name || 'Awaiting Studio Acceptance',
      storePhone: closestStore?.phone || null,
      storeAddress: closestStore ? (closestStore.address + (closestStore.area ? `, ${closestStore.area}` : '')) : 'Local Partner Studio',
      garmentId: selectedGarmentId,
      garmentName: currentCategory.name,
      serviceId: selectedServiceId,
      serviceName: currentService.name,
      brand: 'Levi\'s / Bespoke',
      notes: bookingNotes.trim() || 'Requested from Atelier Booking Portal',
      images: uploadedImages,
      city: selectedCity,
      date: formattedDateDisplay,
      timeSlot: activeSchedTime,
      price: currentService.customerPrice || currentCategory.startingPrice || 25,
      status: 'Allocated',
    }

    // Save instant local cache (strip massive base64 image strings to stay well within browser storage limits)
    if (typeof window !== 'undefined') {
      const storagePayload = {
        ...orderData,
        images: (uploadedImages || []).filter((img: string) => !img.startsWith('data:')),
      }
      setStorageCookie(`tg_order_${newOrderId}`, JSON.stringify(storagePayload))
      setStorageCookie('tg_latest_order', JSON.stringify(storagePayload))
    }

    setPrefilledGarmentId(selectedGarmentId)
    setPrefilledServiceId(selectedServiceId)
    if (closestStore) {
      setPrefilledStore(closestStore)
    }
    setCreatedOrderId(newOrderId)

    // CASE 1: Customer explicitly scheduled a visit time -> save to DB immediately
    if (pickupOption === 'schedule') {
      startBookingTransition()
      try {
        await createOrder({
          id: newOrderId,
          userId: user?.id,
          customerName: user?.name,
          customerEmail: user?.email,
          customerPhone: user?.phone,
          postcode: closestStore?.postcode || 'W8 4EP',
          customerLat: coords.lat,
          customerLng: coords.lng,
          garmentId: selectedGarmentId,
          garmentName: currentCategory.name,
          serviceId: selectedServiceId,
          serviceName: currentService.name,
          storeId: closestStore?.id || undefined,
          storeName: closestStore?.name || 'Awaiting Studio Acceptance',
          storePhone: closestStore?.phone || undefined,
          price: currentService.customerPrice || currentCategory.startingPrice || 25,
          date: formattedDateDisplay,
          timeSlot: activeSchedTime,
          imageUrl: uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : (uploadedImages[0] || null),
          status: 'Allocated',
          notes: bookingNotes.trim() || undefined,
          fitNotes: bookingNotes.trim() || undefined,
        } as any)
        if (typeof window !== 'undefined' && bookingNotes.trim()) {
          try {
            localStorage.setItem(`tg_order_notes_${newOrderId}`, bookingNotes.trim())
            localStorage.setItem('tg_last_booking_note', bookingNotes.trim())
            localStorage.setItem('tg_booking_notes', bookingNotes.trim())
            setStorageCookie(`tg_order_notes_${newOrderId}`, bookingNotes.trim())
          } catch { }
        }
        toast.success('Scheduled atelier fitting confirmed!', { position: 'top-center' })
        router.push(`/order/${newOrderId}`)
      } catch (error) {
        console.error('Scheduled booking failed:', error)
        toast.error('Unable to create your order. Please try again.')
        stopBookingTransition()
      }
      return
    }

    // CASE 2: "Book now" Instant Dispatch Search
    // Unconfirmed order stays purely in server-side memory cache!
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    searchOrderIdRef.current = newOrderId
    setSearchOrderId(newOrderId)
    setIsSearching(true)

    try {
      const dispatchStartRes = await startOrderDispatch({
        id: newOrderId,
        userId: user?.id,
        customerName: user?.name,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        postcode: closestStore?.postcode || 'W8 4EP',
        customerLat: coords.lat,
        customerLng: coords.lng,
        garmentId: selectedGarmentId,
        garmentName: currentCategory.name,
        serviceId: selectedServiceId,
        serviceName: currentService.name,
        price: currentService.customerPrice || currentCategory.startingPrice || 25,
        date: formattedDateDisplay,
        timeSlot: activeSchedTime,
        imageUrl: uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : (uploadedImages[0] || null),
        notes: bookingNotes.trim() || undefined,
        fitNotes: bookingNotes.trim() || undefined,
      } as any)
      if (typeof window !== 'undefined' && bookingNotes.trim()) {
        try {
          localStorage.setItem(`tg_order_notes_${newOrderId}`, bookingNotes.trim())
          localStorage.setItem('tg_last_booking_note', bookingNotes.trim())
          localStorage.setItem('tg_booking_notes', bookingNotes.trim())
          setStorageCookie(`tg_order_notes_${newOrderId}`, bookingNotes.trim())
        } catch { }
      }

      // If zero tailors found initially within 5 miles
      if (dispatchStartRes.dispatch?.status === 'ZERO_TAILORS') {
        setIsSearching(false)
        setIsNoTailorsModalOpen(true)
        return
      }

      // Prefetch order route immediately so navigation is instantaneous
      try {
        router.prefetch(`/order/${newOrderId}`)
      } catch { }

      let isCompleted = false
      const completeAssignedOrder = (acceptedTailorInfo: any) => {
        if (isCompleted) return
        isCompleted = true

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        if (dispatchChannelRef.current) {
          dispatchChannelRef.current.close()
          dispatchChannelRef.current = null
        }

        // Close search popup modal immediately (0ms)
        setIsSearching(false)

        const winningStore = acceptedTailorInfo
        const updatedOrder = {
          ...orderData,
          storeId: winningStore?.id || winningStore?.storeId || 'partner-atelier',
          storeName: winningStore?.name || winningStore?.storeName || 'Partner Atelier',
          storePhone: winningStore?.phone || winningStore?.storePhone || null,
          storeAddress: winningStore?.address || winningStore?.storeAddress || 'Local Partner Studio',
          status: 'Allocated',
        }

        if (typeof window !== 'undefined') {
          const storageUpdatedOrder = {
            ...updatedOrder,
            images: (updatedOrder.images || []).filter((img: string) => typeof img === 'string' && !img.startsWith('data:')),
          }
          setStorageCookie(`tg_order_${newOrderId}`, JSON.stringify(storageUpdatedOrder))
          setStorageCookie('tg_latest_order', JSON.stringify(storageUpdatedOrder))
        }

        clearSessionBookingData()
        toast.success(`Request accepted by ${winningStore?.name || winningStore?.storeName || 'Partner Atelier'}!`, {
          position: 'top-center',
        })

        router.push(`/order/${newOrderId}`)
      }

      // 1. Instant 0ms Cross-tab BroadcastChannel listener (eliminates 1-2s delay)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('tg_dispatch_channel')
          bc.onmessage = (event) => {
            if (event.data?.type === 'DISPATCH_ACCEPTED' && event.data?.orderId === newOrderId) {
              completeAssignedOrder(event.data)
            }
          }
          dispatchChannelRef.current = bc
        } catch { }
      }

      // 2. Fast 350ms status polling loop fallback
      const interval = setInterval(async () => {
        try {
          const status = await fetchDispatchStatus(newOrderId)
          if (!status) return

          if (status.status === 'ASSIGNED') {
            completeAssignedOrder(status.acceptedTailor)
          } else if (status.status === 'EXHAUSTED' || status.status === 'ZERO_TAILORS') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            if (dispatchChannelRef.current) {
              dispatchChannelRef.current.close()
              dispatchChannelRef.current = null
            }
            setIsSearching(false)
            setIsNoTailorsModalOpen(true)
          } else if (status.status === 'CANCELLED') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            if (dispatchChannelRef.current) {
              dispatchChannelRef.current.close()
              dispatchChannelRef.current = null
            }
            setIsSearching(false)
          }
        } catch (err) {
          console.warn('Dispatch polling warning:', err)
        }
      }, 350)

      pollingIntervalRef.current = interval
    } catch (err) {
      console.error('Failed to start dispatch session:', err)
      setIsSearching(false)
      toast.error('Unable to initiate tailor search. Please try again.')
    }
  }

  const handleBookNow = () => {
    executeBooking('now')
  }

  const handleConfirmSchedule = () => {
    setIsScheduleModalOpen(false)
    executeBooking('schedule', scheduleDateObj, selectedTime)
  }

  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuth('CUSTOMER', 'signin')
      router.replace('/?auth=required')
    }
  }, [isAuthLoading, user, openAuth, router])

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text="Accessing booking portal"
          subtext="Verifying your member session..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#FAF8F5] flex flex-col justify-start">
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
        {/* Uber Side-by-Side Placement Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* LEFT COLUMN: 3D Flip Card for Unified Booking & Address Details */}
          <div className="w-full lg:w-[480px] xl:w-[500px] shrink-0 [perspective:1400px]">
            <div
              className="relative w-full"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.65s cubic-bezier(0.4, 0.0, 0.2, 1)',
                transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT FACE: Request an Alteration Form */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className={`bg-white rounded-[28px] border border-gray-200/90 shadow-sm p-6 sm:p-7 space-y-6 transition-opacity duration-300 ${
                  isCardFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
                }`}
              >

                {/* City Pill Header */}
                <div className="flex items-center gap-2 text-sm text-[#0F1115] font-medium">
                  <MapPin size={16} className="text-black shrink-0" />
                  <span className="font-extrabold truncate max-w-[320px]" title={selectedCity}>
                    {formatLocationDisplay(selectedCity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCityModalOpen(true)}
                    className="text-xs text-neutral-500 hover:text-black underline underline-offset-2 transition-colors cursor-pointer font-semibold ml-1 shrink-0"
                  >
                    Change city
                  </button>
                </div>

                {/* Heading */}
                <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-[#0F1115] leading-[1.15]">
                  Request an alteration
                </h1>

                {/* 1. Category of Clothes Dropdown */}
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                      setIsServiceDropdownOpen(false)
                    }}
                    className="w-full bg-[#F3F3F3] hover:bg-[#EBEBEB] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-left transition-all border border-transparent hover:border-gray-300 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                        <GarmentCategoryIcon categoryId={currentCategory.id} className="size-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 leading-none mb-1">
                          CATEGORY OF CLOTHES
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-black truncate">
                          {currentCategory.name} (from ${currentCategory.startingPrice})
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-neutral-600 shrink-0 ml-2 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                      {GARMENT_CATEGORIES.map((cat) => {
                        const isSelected = cat.id === selectedGarmentId
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectCategory(cat.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-100 font-bold' : 'hover:bg-neutral-50 font-medium'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                                <GarmentCategoryIcon categoryId={cat.id} className="size-3.5" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-black font-extrabold">{cat.name}</p>
                                <p className="text-[11px] text-gray-500">From ${cat.startingPrice} • {cat.avgTurnaround}</p>
                              </div>
                            </div>
                            {isSelected && <Check size={16} className="text-black shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 2. What Needs to be Done? Dropdown */}
                <div className="relative" ref={serviceRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsServiceDropdownOpen(!isServiceDropdownOpen)
                      setIsCategoryDropdownOpen(false)
                    }}
                    className="w-full bg-[#F3F3F3] hover:bg-[#EBEBEB] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-left transition-all border border-transparent hover:border-gray-300 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Scissors className="size-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 leading-none mb-1">
                          WHAT NEEDS TO BE DONE?
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-black truncate">
                          {currentService.name} (${currentService.customerPrice})
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-neutral-600 shrink-0 ml-2 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isServiceDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                      {currentCategory.popularServices.map((srv) => {
                        const isSelected = srv.id === selectedServiceId
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(srv.id)
                              setIsServiceDropdownOpen(false)
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-100 font-bold' : 'hover:bg-neutral-50 font-medium'
                              }`}
                          >
                            <div>
                              <p className="text-xs sm:text-sm text-black font-extrabold">{srv.name}</p>
                              <p className="text-[11px] text-gray-500">{srv.description}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-xs sm:text-sm font-black text-black">${srv.customerPrice}</p>
                              <p className="text-[10px] text-gray-400">{srv.turnaroundDays}d SLA</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

              {/* 3. Garment Photo / Reference Fit (Optional - Max 4) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                    <span>GARMENT PHOTO / REFERENCE FIT</span>
                    <span className="text-gray-400 font-normal">(OPTIONAL)</span>
                  </p>
                  <span className="text-[10px] font-bold text-gray-500">
                    {uploadedImages.length}/4 Photos
                  </span>
                </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />

                    {uploadedImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="size-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black bg-neutral-50/60 hover:bg-neutral-100 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group shrink-0"
                      >
                        <div className="size-7 rounded-full bg-black shadow-xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                          <Camera size={14} className="text-white" />
                        </div>
                        <span className="text-[11px] font-extrabold text-black">Add photo</span>
                        <span className="text-[9px] text-gray-400 font-medium">JPG | PNG</span>
                      </button>
                    )}

                    {/* Thumbnail List */}
                    {uploadedImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative size-24 rounded-2xl overflow-hidden border border-gray-300 shrink-0 group shadow-xs">
                        <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-sm transition-all z-20 cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              {/* 4. Fitting & Alteration Notes Section */}
              <div className="pt-3.5 border-t border-gray-100 space-y-2">
                <label htmlFor="booking-notes" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  <Edit3 size={13} className="text-[#9E593B]" />
                  <span>Fitting &amp; Alteration Notes / Instructions</span>
                </label>
                <textarea
                  id="booking-notes"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Add any specific fitting notes, style preferences, or alteration instructions for the tailor..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all resize-none shadow-2xs"
                />
              </div>

                {/* 5. Action Buttons Row */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleBookNow}
                    className="flex-1 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold px-7 py-3.5 text-base transition-all cursor-pointer shadow-sm active:scale-[0.98] text-center"
                  >
                    Book now
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex-1 sm:flex-initial rounded-2xl bg-[#F3F3F3] hover:bg-[#E8E8E8] border border-gray-200 text-black font-extrabold px-5 py-3.5 text-base transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                  >
                    <Calendar size={18} className="text-black" />
                    <span>Schedule for later</span>
                  </button>
                </div>

              </div>

              {/* BACK FACE: Address Details Form (Flips with identical font type & Uber/Atelier styling) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className={`absolute inset-0 bg-white rounded-[28px] border border-gray-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between overflow-y-auto ${
                  isCardFlipped ? 'pointer-events-auto opacity-100 z-20' : 'pointer-events-none opacity-0 z-0'
                }`}
              >
                <div className="space-y-4 sm:space-y-5">
                  {/* Top Bar: Back button */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <button
                      type="button"
                      onClick={handleBackToRequest}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-neutral-800 hover:text-black bg-[#F3F3F3] hover:bg-[#EBEBEB] px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
                    >
                      <ArrowLeft size={14} className="text-black" />
                      <span>Back to Request</span>
                    </button>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F1115] leading-[1.15]">
                      Address Details
                    </h2>
                    <p className="text-xs text-neutral-500 font-medium mt-1">
                      Specify your flat number, apartment, and landmark for precision doorstep fitting.
                    </p>
                  </div>

                  {/* Input Fields (Identical font style & spacing) */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                        House No. / Flat No. <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressDetails.houseNo}
                        onChange={(e) => handleAddressFieldChange('houseNo', e.target.value)}
                        placeholder="e.g. Flat 402, B-Wing, 4th Floor"
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                        Apartment / Society / Building Name
                      </label>
                      <input
                        type="text"
                        value={addressDetails.apartment}
                        onChange={(e) => handleAddressFieldChange('apartment', e.target.value)}
                        placeholder="e.g. Royal Palms Apartment / Green Valley"
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                        Locality / Street / Area
                      </label>
                      <input
                        type="text"
                        value={addressDetails.locality}
                        onChange={(e) => handleAddressFieldChange('locality', e.target.value)}
                        placeholder="e.g. Bandra West, Hill Road"
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                        City / Region
                      </label>
                      <input
                        type="text"
                        value={addressDetails.city}
                        onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                        placeholder="e.g. Mumbai, MH"
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                        Landmark / Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={addressDetails.landmark || ''}
                        onChange={(e) => handleAddressFieldChange('landmark', e.target.value)}
                        placeholder="e.g. Opposite Starbucks / Gate 2"
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs sm:text-sm font-bold text-black placeholder:text-gray-400 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Back Face Footer */}
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="w-full rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold px-7 py-3.5 text-base transition-all cursor-pointer shadow-sm active:scale-[0.98] text-center flex items-center justify-center gap-2"
                  >
                    <span>Save & Continue to Order</span>
                    <Check size={18} />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Uber-Style Map Placement (Matching Image 2) */}
          <div className="flex-1 w-full min-h-[520px] lg:min-h-[calc(100vh-110px)] lg:sticky lg:top-20 h-[600px] lg:h-[calc(100vh-110px)]">
            <div className="w-full h-full rounded-[28px] overflow-hidden border border-gray-200/90 shadow-sm relative bg-[#FAF8F5]">
              <CleanGoogleMap
                lat={mapCoordinates.lat}
                lng={mapCoordinates.lng}
                storeName={selectedStore?.name || `Darzi Master Atelier — ${selectedCity.split(',')[0]}`}
                storeAddress={selectedStore?.address || `Central Workshop, ${selectedCity}`}
                origin={selectedCity}
                className="w-full h-full"
                showZoomControls={false}
                disableNavigation={true}
                isFixed={isLiveLocation || isLocationSaved}
                fixedBoxMiles={5.0}
                radiusMiles={5.0}
                showUserPin={true}
                isLiveLocation={isLiveLocation}
                isLocationSaved={isLocationSaved}
                userPinLabel={isLiveLocation ? 'You' : (selectedCity.split(',')[0] || 'Pinned Location')}
                stores={nearbyStores}
                selectedStoreId={selectedStore?.id}
                onSelectStore={(st) => setSelectedStore(st)}
                onStoresFound={(foundStores) => {
                  if (foundStores.length > 0 && (!selectedStore || !foundStores.some((s) => s.id === selectedStore.id))) {
                    setSelectedStore(foundStores[0])
                  }
                }}
                onPinLocationChange={(newCoords) => {
                  setUserGpsCoords(newCoords)
                  setIsLiveLocation(false)
                  setIsLocationSaved(false)
                  setIsCardFlipped(true)

                  // Check cache first
                  const cached = getCachedReverseGeocode(newCoords.lat, newCoords.lng)
                  if (cached) {
                    setAddressDetails((prev) => ({
                      ...prev,
                      houseNo: cached.houseNo || prev.houseNo,
                      apartment: cached.apartment || prev.apartment,
                      locality: cached.locality || prev.locality,
                      city: cached.city || prev.city || selectedCity,
                    }))
                    setSelectedCity(cached.city)
                    setStoredCity(cached.city, newCoords)
                    return
                  }

                  if (typeof google !== 'undefined' && google.maps?.Geocoder) {
                    try {
                      const geocoder = new google.maps.Geocoder()
                      geocoder.geocode({ location: newCoords }, (results, status) => {
                        if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                          const parsed = parseGoogleAddressComponents(results)
                          const newDetails = {
                            houseNo: parsed.houseNo || '',
                            apartment: parsed.apartment || '',
                            locality: parsed.locality || '',
                            city: parsed.city || selectedCity,
                          }

                          setAddressDetails((prev) => ({
                            ...prev,
                            houseNo: newDetails.houseNo || prev.houseNo,
                            apartment: newDetails.apartment || prev.apartment,
                            locality: newDetails.locality || prev.locality,
                            city: newDetails.city || prev.city || selectedCity,
                          }))

                          const comps = results[0]?.address_components || []
                          const locality = comps.find((c: any) => c.types.includes('locality'))
                          const sublocality = comps.find((c: any) => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'))
                          const admin2 = comps.find((c: any) => c.types.includes('administrative_area_level_2'))
                          const state = comps.find((c: any) => c.types.includes('administrative_area_level_1'))
                          const cityName = locality?.long_name || sublocality?.long_name || admin2?.long_name || parsed.city || selectedCity
                          const stateCode = state?.short_name || ''
                          const formatted = stateCode && !cityName.includes(stateCode) ? `${cityName}, ${stateCode}` : cityName

                          setCachedReverseGeocode(newCoords.lat, newCoords.lng, {
                            houseNo: newDetails.houseNo,
                            apartment: newDetails.apartment,
                            locality: newDetails.locality,
                            city: formatted,
                            formattedAddress: formatted,
                          })

                          setSelectedCity(formatted)
                          setStoredCity(formatted, newCoords)
                        }
                      })
                    } catch {}
                  } else {
                    setStoredCity(selectedCity, newCoords)
                  }
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Global City Selector Modal */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={(c, coords, isGps) => {
          setSelectedCity(c)
          const targetCoords = coords || getCityCoordinates(c)
          setUserGpsCoords(targetCoords)
          setIsLiveLocation(isGps === true)
          setIsLocationSaved(isGps === true)
          setStoredCity(c, targetCoords)

          if (isGps === true) {
            liveGpsCoordsRef.current = targetCoords
            liveCityRef.current = c
            setIsCardFlipped(false)
          } else {
            setIsCardFlipped(true)
          }

          // Dynamically fetch tailors within 5.0 miles of the selected coordinates
          fetchNearbyTailors(targetCoords.lat, targetCoords.lng, 5.0)
            .then((data) => {
              if (data && Array.isArray(data.tailors)) {
                setNearbyStores(data.tailors)
                if (data.tailors.length > 0) {
                  setSelectedStore(data.tailors[0])
                } else {
                  setSelectedStore(null)
                }
              }
            })
            .catch((err) => console.warn('Fetch tailors error on location select:', err))

          if (isGps !== true && typeof google !== 'undefined' && google.maps?.Geocoder) {
            try {
              const geocoder = new google.maps.Geocoder()
              geocoder.geocode({ location: targetCoords }, (results, status) => {
                if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                  const parsed = parseGoogleAddressComponents(results)
                  setAddressDetails({
                    houseNo: parsed.houseNo || '',
                    apartment: parsed.apartment || '',
                    locality: parsed.locality || '',
                    city: parsed.city || c,
                  })
                } else {
                  setAddressDetails((prev) => ({
                    ...prev,
                    city: c,
                  }))
                }
              })
            } catch {
              setAddressDetails((prev) => ({
                ...prev,
                city: c,
              }))
            }
          }
        }}
      />

      {/* Schedule Atelier Visit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 sm:p-7 max-w-md w-full border border-gray-200 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-black tracking-tight">
                  Schedule Atelier Visit
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Select visit date & available slot in <span className="font-bold text-black">{selectedCity}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="size-8 rounded-full bg-[#F3F3F3] hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Calendar size={13} className="text-black" />
                <span>1. Select Visit Date</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((offset) => {
                  const d = new Date()
                  d.setDate(d.getDate() + offset)
                  const isSelected = d.toDateString() === scheduleDateObj.toDateString()
                  const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' })
                  const dateNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                  return (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => setScheduleDateObj(d)}
                      className={`p-2.5 rounded-2xl text-center transition-all border cursor-pointer ${isSelected
                        ? 'bg-black text-white border-black shadow-xs scale-105 font-bold'
                        : 'bg-[#F3F3F3] hover:bg-[#E8E8E8] text-black border-transparent font-semibold'
                        }`}
                    >
                      <p className="text-[11px] uppercase tracking-wider opacity-80">{dayName}</p>
                      <p className="text-xs font-black mt-0.5">{dateNum}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slot Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Clock size={13} className="text-black" />
                  <span>2. Select Time Slot</span>
                </label>
                <span className="text-[10px] text-gray-400 font-semibold">
                  Local time: {selectedCity.split(',')[0]}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {DARZI_TIME_SLOTS.map((t) => {
                  const isSelected = selectedTime === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-xl text-xs font-bold text-center transition-all border ${isSelected
                        ? 'bg-black text-white border-black shadow-xs scale-105'
                        : 'bg-[#F3F3F3] text-black border-transparent hover:bg-[#E8E8E8] cursor-pointer'
                        }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-1/3 py-3 rounded-xl bg-[#F3F3F3] hover:bg-gray-200 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="w-2/3 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-[0.98] text-center"
              >
                Confirm schedule
              </button>
            </div>

          </div>
        </div>
      )}

      {/* No Tailors Available Modal (When all tailors decline or 60s search exhausted) */}
      {isNoTailorsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 sm:p-7 max-w-md w-full border border-gray-200 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 text-center">

            {/* Close / Cut ('X') Button */}
            <button
              type="button"
              onClick={() => setIsNoTailorsModalOpen(false)}
              className="absolute top-4 right-4 size-9 rounded-full bg-[#F3F3F3] hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header Icon */}
            <div className="mx-auto size-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shadow-2xs">
              <Scissors size={26} className="rotate-45" />
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
                No Tailors Available Right Now
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleTryAgainSearch}
                className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNoTailorsModalOpen(false)
                  setIsScheduleModalOpen(true)
                }}
                className="w-full py-3.5 rounded-2xl bg-[#F3F3F3] hover:bg-[#E8E8E8] border border-gray-200 text-black font-extrabold text-sm transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                <span>Schedule for Later</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNoTailorsModalOpen(false)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-black font-semibold transition-colors cursor-pointer"
              >
                Modify request details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Live Sewing Animation Dispatch Loader ("Finding...") */}
      <SewingLoader
        active={isSearching}
        persistent={true}
        title="Finding"
        onCancel={handleCancelSearch}
        orderId={searchOrderId}
      />
    </div>
  )
}
