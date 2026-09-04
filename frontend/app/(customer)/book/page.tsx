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
  ShieldCheck,
} from 'lucide-react'
import { CityModal } from '@/components/city-modal'
import { useCityLocation, getCityCoordinates } from '@/components/use-city-location'
import CleanGoogleMap from '@/components/CleanGoogleMap'
import { SewingLoader } from '@/components/sewing-loader'
import { useApp } from '@/components/app-provider'
import { createOrder } from '@/lib/api'
import { GARMENT_CATEGORIES, getStoresForLocation, getClosestStoreForLocation, type StoreOption } from '@/components/data'

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

export interface MeasurementFieldDef {
  key: string
  label: string
  whatItMeans: string
  placeholder: string
  type?: 'text' | 'select'
  options?: string[]
}

const CATEGORY_MEASUREMENTS: Record<string, MeasurementFieldDef[]> = {
  trousers: [
    {
      key: 'inseam',
      label: 'Inseam (Hem)',
      whatItMeans: 'Length from the crotch seam to the bottom of the ankle/shoe.',
      placeholder: 'e.g. 30 in / Shorten 1.5 in',
    },
    {
      key: 'waist',
      label: 'Waist Take-in / Let-out',
      whatItMeans: 'Reducing or expanding the waistband circumference.',
      placeholder: 'e.g. 32 in / Take in 1.0 in',
    },
    {
      key: 'tapering',
      label: 'Tapering',
      whatItMeans: 'Narrowing the leg width from the thigh down through the calf and leg opening.',
      placeholder: 'e.g. Slim from knee to ankle',
      type: 'select',
      options: ['Original Factory Taper', 'Slim Knee-to-Ankle', 'Straight Leg', 'Relaxed Fit'],
    },
    {
      key: 'riseSeat',
      label: 'Rise / Seat',
      whatItMeans: 'Adjusting tightness around the crotch and rear area.',
      placeholder: 'e.g. Standard rise / Reduce seat fullness',
    },
  ],
  shirts: [
    {
      key: 'sleeveLength',
      label: 'Sleeve Length',
      whatItMeans: 'Distance from the shoulder seam down to the wrist cuff.',
      placeholder: 'e.g. 33 in / Shorten 1.25 in',
    },
    {
      key: 'chestWaist',
      label: 'Chest & Waist (Slimming)',
      whatItMeans: 'Taking in the side seams or adding back darts to contour the torso.',
      placeholder: 'e.g. 40 in Chest / Add back darts',
      type: 'select',
      options: ['Tailored Fit (Side Seams)', 'Slim with Back Darts', 'Classic Regular Fit'],
    },
    {
      key: 'shirtLength',
      label: 'Shirt Length',
      whatItMeans: 'Shortening the bottom hem of the shirt.',
      placeholder: 'e.g. Shorten by 1.5 in (Untucked look)',
    },
  ],
  jackets: [
    {
      key: 'shoulderWidth',
      label: 'Shoulder Width',
      whatItMeans: 'Assessing if the jacket shoulder pads align with your natural bone structure.',
      placeholder: 'e.g. 18 in across back',
    },
    {
      key: 'sleeveLengthCuff',
      label: 'Sleeve Length at Cuff',
      whatItMeans: 'Adjusting sleeve length from the bottom cuff or shoulder crown.',
      placeholder: 'e.g. Shorten 1.0 in / Show 0.5 in shirt cuff',
    },
    {
      key: 'waistSuppression',
      label: 'Jacket Waist Suppression',
      whatItMeans: 'Tapering the torso through side and center back seams.',
      placeholder: 'e.g. Take in 1.5 in through side seams',
    },
  ],
  dresses: [
    {
      key: 'hemLength',
      label: 'Dress Hem Length',
      whatItMeans: 'Adjusting overall hem length to knee, midi, or floor height.',
      placeholder: 'e.g. Shorten 2.0 in (Midi height)',
    },
    {
      key: 'bodiceFit',
      label: 'Bodice & Bust Contouring',
      whatItMeans: 'Adjusting side darts or zipper line for contoured bust and waist fit.',
      placeholder: 'e.g. Take in 1.0 in at bust darts',
    },
    {
      key: 'strapAdjustment',
      label: 'Straps & Shoulder Fit',
      whatItMeans: 'Shortening straps to eliminate gaping.',
      placeholder: 'e.g. Shorten shoulder straps 0.75 in',
    },
  ],
  skirts: [
    {
      key: 'skirtHem',
      label: 'Skirt Hem Length',
      whatItMeans: 'Adjusting hem height with original border or clean blind stitch.',
      placeholder: 'e.g. Shorten 2.5 in',
    },
    {
      key: 'skirtWaist',
      label: 'Waistband Adjustment',
      whatItMeans: 'Taking in the waistband circumference.',
      placeholder: 'e.g. Take in 1.0 in',
    },
  ],
  suits: [
    {
      key: 'jacketTorso',
      label: 'Jacket Chest & Torso Fit',
      whatItMeans: 'Contouring jacket silhouette through side and back seams.',
      placeholder: 'e.g. Classic European Slim taper',
    },
    {
      key: 'trouserInseam',
      label: 'Trouser Inseam & Break',
      whatItMeans: 'Determining exact break (No Break, Quarter Break, Medium Break).',
      placeholder: 'e.g. No break / 30 in inseam',
      type: 'select',
      options: ['No Break (Modern Cropped)', 'Quarter Break (Clean Classic)', 'Medium Break (Traditional)'],
    },
  ],
  occasion: [
    {
      key: 'blouseFit',
      label: 'Blouse / Kurti Fit & Darts',
      whatItMeans: 'Custom contouring with margin preservation.',
      placeholder: 'e.g. Tighten bust darts by 0.75 in',
    },
    {
      key: 'lehengaHem',
      label: 'Lehenga / Gown Hem Length',
      whatItMeans: 'Hem shortening with embroidered border reset.',
      placeholder: 'e.g. Shorten 2 in preserving border',
    },
  ],
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

function MeasurementOptionDropdown({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string
  options: string[]
  placeholder: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-48 sm:w-52 h-9 px-3 rounded-xl border border-gray-200 bg-[#F9F9F9] hover:bg-neutral-100 focus:bg-white focus:border-black text-left flex items-center justify-between transition-colors cursor-pointer"
      >
        <span className="text-xs font-bold text-black truncate">
          {value || placeholder || 'Select option'}
        </span>
        <ChevronDown size={14} className={`text-neutral-500 shrink-0 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${isSelected ? 'bg-black text-white font-bold' : 'hover:bg-neutral-100 text-neutral-800 font-semibold'
                  }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check size={13} className="shrink-0 ml-1.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BookPage() {
  const router = useRouter()
  const {
    user,
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
    setMeasurementDraft,
    setConfirmedMeasurements,
    setCreatedOrderId,
  } = useApp()

  const [selectedCity, setSelectedCity] = useCityLocation('Vasai, IN-MH')
  const [isCityModalOpen, setIsCityModalOpen] = useState(false)

  // Selection states initialized from prefilled context
  const [selectedGarmentId, setSelectedGarmentId] = useState(prefilledGarmentId || 'trousers')
  const [selectedServiceId, setSelectedServiceId] = useState(prefilledServiceId || 'trouser-hem-plain')
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)

  // Image Upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Measurement collapsible dropdown & custom edit state
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false)
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false)
  const [customMeasurements, setCustomMeasurements] = useState<Record<string, string>>({})
  const [isTailorMeasuredMap, setIsTailorMeasuredMap] = useState<Record<string, boolean>>({})

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleDateObj, setScheduleDateObj] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('03:30 PM')

  // Full-screen sewing tools animation loader state
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingPending, setBookingPending] = useState<any>(null)

  // Nearby partner stores for selected city / location
  const nearbyStores = useMemo(() => {
    return getStoresForLocation(selectedCity)
  }, [selectedCity])

  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(() => {
    return prefilledStore || getClosestStoreForLocation(selectedCity)
  })

  // Update selectedStore when city changes
  useEffect(() => {
    if (prefilledStore) {
      setSelectedStore(prefilledStore)
    } else {
      const closest = getClosestStoreForLocation(selectedCity)
      setSelectedStore(closest)
    }
  }, [selectedCity, prefilledStore])

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
      if (measurementDraft.measurements) setCustomMeasurements(measurementDraft.measurements)
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

  // Get measurement definitions for active category
  const activeMeasurementFields = useMemo(() => {
    return CATEGORY_MEASUREMENTS[selectedGarmentId] || CATEGORY_MEASUREMENTS.trousers
  }, [selectedGarmentId])

  // Map coordinates dynamically based on selected city
  const mapCoordinates = useMemo(() => {
    return getCityCoordinates(selectedCity)
  }, [selectedCity])

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

  // Handle Photo Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle Measurements modification
  const handleMeasurementChange = (key: string, val: string) => {
    setCustomMeasurements((prev) => ({ ...prev, [key]: val }))
    setIsTailorMeasuredMap((prev) => ({ ...prev, [key]: false }))
  }

  const toggleTailorMeasured = (key: string) => {
    setIsTailorMeasuredMap((prev) => {
      const current = prev[key] !== false // default is true
      return { ...prev, [key]: !current }
    })
  }

  // Complete Booking flow execution
  const executeBooking = (pickupOption: 'now' | 'schedule', schedDate?: Date, schedTime?: string) => {
    if (!user || !user.phone) {
      openAuth('CUSTOMER', user ? 'signup' : 'signin')
      return
    }

    const finalMeasurements: Record<string, string> = {}
    activeMeasurementFields.forEach((field) => {
      const isTailor = isTailorMeasuredMap[field.key] !== false
      if (isTailor) {
        finalMeasurements[field.key] = 'To be Measured by Tailor'
      } else {
        finalMeasurements[field.key] = customMeasurements[field.key] || 'To be Measured by Tailor'
      }
    })

    const bookingDraft = {
      city: selectedCity,
      garmentId: selectedGarmentId,
      serviceId: selectedServiceId,
      pickupOption,
      scheduleDate: schedDate || new Date(),
      scheduleTime: schedTime || '03:30 PM',
      images: uploadedImages,
      measurements: finalMeasurements,
    }

    setBookingPending(bookingDraft)
    setIsProcessing(true)
  }

  const handleLoaderComplete = () => {
    setIsProcessing(false)
    const closestStore = selectedStore || getClosestStoreForLocation(selectedCity)
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const otp = String(Math.floor(1000 + Math.random() * 9000))

    const schedDate = bookingPending?.scheduleDate || scheduleDateObj || new Date()
    const schedTime = bookingPending?.scheduleTime || selectedTime || '03:30 PM'

    const formattedDateDisplay = schedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    const measurementsData = bookingPending?.measurements || customMeasurements

    const orderData = {
      id: newOrderId,
      otp,
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      storeId: closestStore?.id || 'studio-dispatch',
      storeName: closestStore?.name || 'Local Partner Atelier',
      storeAddress: closestStore ? (closestStore.address + (closestStore.area ? `, ${closestStore.area}` : '')) : 'Local Partner Studio',
      garmentId: selectedGarmentId,
      garmentName: currentCategory.name,
      serviceId: selectedServiceId,
      serviceName: currentService.name,
      measurements: measurementsData,
      brand: 'Levi\'s / Bespoke',
      notes: 'Requested from Atelier Booking Portal',
      images: uploadedImages,
      city: selectedCity,
      date: formattedDateDisplay,
      timeSlot: schedTime,
      price: currentService.customerPrice || currentCategory.startingPrice || 25,
      status: 'Allocated',
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`tg_order_${newOrderId}`, JSON.stringify(orderData))
      localStorage.setItem('tg_latest_order', JSON.stringify(orderData))
      localStorage.setItem('tg_measurement_draft', JSON.stringify(bookingPending || orderData))
    }

    // Persist to backend PostgreSQL database asynchronously
    createOrder({
      id: newOrderId,
      userId: user?.id,
      customerName: user?.name,
      customerEmail: user?.email,
      customerPhone: user?.phone,
      postcode: closestStore?.postcode || 'W8 4EP',
      garmentId: selectedGarmentId,
      garmentName: currentCategory.name,
      serviceId: selectedServiceId,
      serviceName: currentService.name,
      storeId: closestStore?.id,
      storeName: closestStore?.name,
      price: currentService.customerPrice || currentCategory.startingPrice || 25,
      date: formattedDateDisplay,
      timeSlot: schedTime,
      measurements: measurementsData,
      imageUrl: uploadedImages[0] || null,
      status: 'Allocated',
    }).catch((err) => {
      console.warn('Backend order sync notice:', err)
    })

    setPrefilledGarmentId(selectedGarmentId)
    setPrefilledServiceId(selectedServiceId)
    setConfirmedMeasurements(measurementsData)
    if (closestStore) {
      setPrefilledStore(closestStore)
    }
    setCreatedOrderId(newOrderId)

    toast.success('Fitting appointment & measurements confirmed!', { position: 'top-center' })
    router.push(`/order/${newOrderId}`)
  }

  const handleBookNow = () => {
    executeBooking('now')
  }

  const handleConfirmSchedule = () => {
    setIsScheduleModalOpen(false)
    executeBooking('schedule', scheduleDateObj, selectedTime)
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#FAF8F5] flex flex-col justify-start">
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
        {/* Uber Side-by-Side Placement Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* LEFT COLUMN: Single Unified Booking & Measurement Card */}
          <div className="w-full lg:w-[480px] xl:w-[500px] shrink-0">

            <div className="bg-white rounded-[28px] border border-gray-200/90 shadow-sm p-6 sm:p-7 space-y-6">

              {/* City Pill Header */}
              <div className="flex items-center gap-2 text-sm text-[#0F1115] font-medium">
                <MapPin size={16} className="text-black shrink-0" />
                <span className="font-extrabold">{selectedCity}</span>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="text-xs text-neutral-500 hover:text-black underline underline-offset-2 transition-colors cursor-pointer font-semibold ml-1"
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

              {/* 3. Garment Photo / Reference Fit (Optional) */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  GARMENT PHOTO / REFERENCE FIT (OPTIONAL)
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black bg-neutral-50/60 hover:bg-neutral-100 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group shrink-0"
                  >
                    <div className="size-7 rounded-full bg-white shadow-xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Camera size={14} className="text-black" />
                    </div>
                    <span className="text-[11px] font-extrabold text-black">Add photo</span>
                    <span className="text-[9px] text-gray-400 font-medium">JPG | PNG</span>
                  </button>

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

              {/* 4. Your Measurement Collapsible Section with Smooth Slide Transition */}
              <div className="pt-3 border-t border-gray-100">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMeasurementOpen(!isMeasurementOpen)
                      if (isMeasurementOpen) setIsEditingMeasurements(false)
                    }}
                    className="py-1 text-left text-neutral-500 hover:text-black transition-colors cursor-pointer group flex-1"
                  >
                    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 group-hover:text-black transition-colors">
                      YOUR MEASUREMENT <span className="text-gray-400 font-semibold">({currentCategory.name})</span>
                    </p>
                  </button>

                  {/* Right Side: Edit button & collapse arrow when open, or open chevron when closed */}
                  <div className="flex items-center gap-1.5">
                    {isMeasurementOpen ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                        <button
                          type="button"
                          onClick={() => setIsEditingMeasurements(!isEditingMeasurements)}
                          className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer transition-colors py-1 px-2.5 rounded-lg hover:bg-neutral-100 bg-neutral-50"
                        >
                          <Edit3 size={13} />
                          <span>{isEditingMeasurements ? 'Done editing' : 'Edit values'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMeasurementOpen(false)
                            setIsEditingMeasurements(false)
                          }}
                          className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Close measurements"
                        >
                          <ChevronDown size={18} className="rotate-180 transition-transform duration-300" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsMeasurementOpen(true)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Open measurements"
                      >
                        <ChevronDown size={18} className="rotate-0 transition-transform duration-300" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Smooth Animated Dropdown Body */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isMeasurementOpen
                    ? 'max-h-[500px] opacity-100 pt-2.5'
                    : 'max-h-0 opacity-0 pt-0 pointer-events-none'
                    }`}
                >
                  <div className="space-y-2">
                    {activeMeasurementFields.map((field) => {
                      const customVal = customMeasurements[field.key] || ''

                      return (
                        <div
                          key={field.key}
                          className="flex items-center justify-between gap-3 py-1.5 px-1 hover:bg-neutral-50/80 rounded-xl transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-bold text-[#0F1115]">{field.label}</span>

                          {/* Right: Badge or Edit input */}
                          <div className="shrink-0 flex items-center">
                            {isEditingMeasurements ? (
                              field.type === 'select' && field.options ? (
                                <MeasurementOptionDropdown
                                  value={customVal}
                                  options={field.options}
                                  placeholder={field.placeholder}
                                  onChange={(val) => handleMeasurementChange(field.key, val)}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={customVal}
                                  placeholder={field.placeholder}
                                  onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                                  className="w-48 sm:w-52 h-9 px-3 rounded-xl border border-gray-200 bg-[#F9F9F9] focus:bg-white focus:border-black text-xs font-bold text-black placeholder:text-gray-400 focus:outline-hidden transition-all"
                                />
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsEditingMeasurements(true)}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#F3F3F3] hover:bg-[#EBEBEB] text-black text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Scissors size={12} className="text-neutral-600" />
                                <span>{customVal || 'To be Measured by Tailor'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
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

          </div>

          {/* RIGHT COLUMN: Uber-Style Map Placement (Matching Image 2) */}
          <div className="flex-1 w-full min-h-[520px] lg:min-h-[calc(100vh-110px)] lg:sticky lg:top-20 h-[600px] lg:h-[calc(100vh-110px)]">
            <div className="w-full h-full rounded-[28px] overflow-hidden border border-gray-200/90 shadow-sm relative bg-[#FAF8F5]">
              <CleanGoogleMap
                lat={selectedStore?.coords?.lat || mapCoordinates.lat}
                lng={selectedStore?.coords?.lng || mapCoordinates.lng}
                storeName={selectedStore?.name || `Darzi Master Atelier — ${selectedCity.split(',')[0]}`}
                storeAddress={selectedStore?.address || `Central Workshop, ${selectedCity}`}
                origin={selectedCity}
                className="w-full h-full"
                showZoomControls={false}
                disableNavigation={true}
                stores={nearbyStores}
                selectedStoreId={selectedStore?.id}
                onSelectStore={(st) => setSelectedStore(st)}
                onStoresFound={(foundStores) => {
                  if (foundStores.length > 0 && (!selectedStore || !foundStores.some((s) => s.id === selectedStore.id))) {
                    setSelectedStore(foundStores[0])
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
        onSelectCity={(c) => setSelectedCity(c)}
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

      {/* Full-Screen Sewing Tools Animation Loader */}
      <SewingLoader
        active={isProcessing}
        durationSeconds={3}
        onComplete={handleLoaderComplete}
      />
    </div>
  )
}
