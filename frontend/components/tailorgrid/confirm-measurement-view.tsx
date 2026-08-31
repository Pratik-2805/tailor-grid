'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  Clock,
  MapPin,
  Calendar,
  Check,
  Scissors,
  Shirt,
  Ruler,
  X,
  Camera,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  RotateCcw,
} from 'lucide-react'
import { CityModal } from './city-modal'
import { GARMENT_CATEGORIES, type Screen } from './data'
import { TrustBar } from './trust-bar'
import { FindingStudioModal } from './finding-studio-modal'

function GarmentCategoryIcon({ categoryId, className = "size-4" }: { categoryId: string; className?: string }) {
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

const CITIES = [
  'Mumbai, IN',
  'New York, NY',
  'London, UK',
  'Delhi NCR, IN',
  'Bengaluru, IN',
  'Los Angeles, CA',
]

export interface MeasurementFieldDef {
  key: string
  label: string
  whatItMeans: string
  placeholder: string
  type?: 'text' | 'select'
  options?: string[]
}

export const CATEGORY_MEASUREMENTS: Record<string, MeasurementFieldDef[]> = {
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
      whatItMeans: 'Shortening or lengthening sleeves to allow ~0.5 inches of shirt cuff to show.',
      placeholder: 'e.g. Shorten 1.0 in with button reset',
    },
    {
      key: 'waistSuppression',
      label: 'Chest & Waist Suppression',
      whatItMeans: 'Contouring through side seams for a tapered silhouette.',
      placeholder: 'e.g. 40 in chest / Suppress waist 1 in',
    },
  ],
  suits: [
    {
      key: 'shoulderWidth',
      label: 'Shoulder Width',
      whatItMeans: 'Assessing if the jacket shoulder pads align with your natural bone structure.',
      placeholder: 'e.g. 18 in across back',
    },
    {
      key: 'sleeveLengthCuff',
      label: 'Sleeve Length at Cuff',
      whatItMeans: 'Shortening or lengthening sleeves to allow ~0.5 inches of shirt cuff to show.',
      placeholder: 'e.g. Shorten 1.0 in from cuff',
    },
    {
      key: 'trouserInseamWaist',
      label: 'Trouser Inseam & Waist',
      whatItMeans: 'Reducing or expanding waistband & setting exact leg hem break at the shoe.',
      placeholder: 'e.g. 32 in waist / 30 in inseam (Slight break)',
    },
  ],
  dresses: [
    {
      key: 'hemLine',
      label: 'Hem Line',
      whatItMeans: 'Pinning the hem based on the exact height of the shoes you plan to wear.',
      placeholder: 'e.g. Shorten 2 in / Midi length',
    },
    {
      key: 'bustWaistHips',
      label: 'Bust, Waist & Hips',
      whatItMeans: 'Taking in or letting out side seams along major body curves.',
      placeholder: 'e.g. 34 in Bust, 28 in Waist, 38 in Hips',
    },
    {
      key: 'strapsBodice',
      label: 'Straps & Bodice',
      whatItMeans: 'Lifting shoulder straps or reshaping neckline to fit bust proportions.',
      placeholder: 'e.g. Lift straps 1.0 in',
    },
  ],
  skirts: [
    {
      key: 'hemLine',
      label: 'Hem Line',
      whatItMeans: 'Pinning the hem based on the exact height of the shoes you plan to wear.',
      placeholder: 'e.g. Shorten 2.0 in (Blind hem)',
    },
    {
      key: 'waistHips',
      label: 'Bust, Waist & Hips',
      whatItMeans: 'Taking in or letting out side seams along major body curves.',
      placeholder: 'e.g. 28 in Waist, 38 in Hips',
    },
  ],
  occasion: [
    {
      key: 'blouseFit',
      label: 'Blouse / Top Fit',
      whatItMeans: 'Bust contouring, margin preservation & armhole depth adjustment.',
      placeholder: 'e.g. 36 in Bust / 14.5 in Blouse length',
    },
    {
      key: 'lehengaLength',
      label: 'Lehenga / Skirt Length',
      whatItMeans: 'Exact floor clearance based on footwear and border re-attachment.',
      placeholder: 'e.g. 40 in length to floor',
    },
    {
      key: 'waistBand',
      label: 'Waistband / Waist',
      whatItMeans: 'Waist suppression and hook closure alignment.',
      placeholder: 'e.g. 30 in waist',
    },
  ],
}

export interface ConfirmMeasurementProps {
  go: (s: Screen) => void
  initialCity?: string
  initialGarmentId?: string
  initialServiceId?: string
  initialPickupOption?: 'now' | 'schedule'
  initialScheduleDate?: Date
  initialScheduleTime?: string
  initialImages?: string[]
  onConfirmMeasurements?: (data: {
    garmentId: string
    serviceId: string
    measurements: Record<string, string>
    brand?: string
    notes?: string
    images?: string[]
    fittingMode?: string
    matchedStore?: StoreOption
  }) => void
}

export function ConfirmMeasurementView({
  go,
  initialCity = 'Mumbai, IN',
  initialGarmentId = 'trousers',
  initialServiceId,
  initialPickupOption = 'now',
  initialScheduleDate,
  initialScheduleTime = '03:30 PM',
  initialImages = [],
  onConfirmMeasurements,
}: ConfirmMeasurementProps) {
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [isFindingStudio, setIsFindingStudio] = useState(false)

  // Category & Alteration
  const [selectedGarmentId, setSelectedGarmentId] = useState(initialGarmentId)
  const [showGarmentPicker, setShowGarmentPicker] = useState(false)

  const currentCategory = GARMENT_CATEGORIES.find((c) => c.id === selectedGarmentId) || GARMENT_CATEGORIES[0]

  const [selectedAlterationId, setSelectedAlterationId] = useState<string>(() => {
    if (initialServiceId) return initialServiceId
    return currentCategory.popularServices[0]?.id || ''
  })
  const [showAlterationPicker, setShowAlterationPicker] = useState(false)

  const selectedService =
    currentCategory.popularServices.find((s) => s.id === selectedAlterationId) ||
    currentCategory.popularServices[0]

  // Pickup info
  const [pickupOption] = useState<'now' | 'schedule'>(initialPickupOption)
  const [scheduleDateObj] = useState<Date>(initialScheduleDate || new Date())
  const [selectedTime] = useState(initialScheduleTime)

  // Unit Toggle
  const [unit, setUnit] = useState<'in' | 'cm'>('in')

  // Edit Mode state (Default: false = read-only visible view)
  const [isEditing, setIsEditing] = useState(false)

  // Category-specific Measurement Form Values
  const [measurements, setMeasurements] = useState<Record<string, string>>({})

  const [brand, setBrand] = useState('Levi\'s / Bespoke')
  const [notes, setNotes] = useState('Shorten length with clean finish, slight shoe break')
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages)

  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowCityPicker(false)
        setShowGarmentPicker(false)
        setShowAlterationPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGarmentChange = (garmentId: string) => {
    setSelectedGarmentId(garmentId)
    setShowGarmentPicker(false)
    const category = GARMENT_CATEGORIES.find((c) => c.id === garmentId)
    if (category && category.popularServices.length > 0) {
      setSelectedAlterationId(category.popularServices[0].id)
    }
  }

  const handleAlterationSelect = (svcId: string) => {
    setSelectedAlterationId(svcId)
    setShowAlterationPicker(false)
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setShowCityPicker(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setUploadedImages((prev) => [...prev, ...newUrls])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateMeasurement = (key: string, val: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: val }))
  }

  const handleClearMeasurement = (key: string) => {
    setMeasurements((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const handleProceed = () => {
    setIsFindingStudio(true)
  }

  const handleStudioMatched = (matched: StoreOption, orderData: any) => {
    setIsFindingStudio(false)
    onConfirmMeasurements?.({
      garmentId: selectedGarmentId,
      serviceId: selectedService.id,
      measurements,
      brand,
      notes,
      images: uploadedImages,
      fittingMode: Object.keys(measurements).length > 0 ? 'custom' : 'studio',
      matchedStore: matched,
    })
    go('booking')
  }

  const formattedDateDisplay = scheduleDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  // Get measurement definitions for current category
  const currentFields = CATEGORY_MEASUREMENTS[selectedGarmentId] || CATEGORY_MEASUREMENTS['trousers']

  return (
    <div className="min-h-[calc(100vh-68px)] min-h-[calc(100dvh-68px)] flex flex-col justify-between bg-white">
      <div className="flex-1 flex flex-col justify-center">
        <section className="relative bg-white py-6 sm:py-8 lg:py-10">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

              {/* LEFT: Pixel-Perfect Uber 'Confirm Measurement' Card Form */}
              <div ref={formRef} className="lg:col-span-6 flex flex-col justify-center max-w-[480px] relative">

                {/* Top Back Button (Prominent & Absolute so it doesn't shift the layout) */}
                <div className="absolute -top-12 left-0 z-20">
                  <button
                    type="button"
                    onClick={() => go('home')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3F3F3] hover:bg-black hover:text-white border border-gray-300 text-black text-xs font-bold transition-all shadow-xs group cursor-pointer active:scale-95"
                  >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back</span>
                  </button>
                </div>

                {/* 1. Location Header */}
                <div className="relative mb-3.5 flex items-center gap-1.5 text-[15px] font-medium text-black">
                  <MapPin size={17} className="text-black fill-black shrink-0" />
                  <span className="font-bold">{selectedCity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCityPicker(true)
                      setShowGarmentPicker(false)
                      setShowAlterationPicker(false)
                    }}
                    className="underline text-[#9E593B] font-semibold hover:text-[#0F1115] ml-1 transition-colors cursor-pointer"
                  >
                    Change city
                  </button>

                  <CityModal
                    isOpen={showCityPicker}
                    onClose={() => setShowCityPicker(false)}
                    selectedCity={selectedCity}
                    onSelectCity={(c) => handleCitySelect(c)}
                  />
                </div>

                {/* 2. Main Title */}
                <h1 className="text-3xl sm:text-[44px] lg:text-[48px] font-extrabold tracking-tight text-black leading-[1.08] mb-6">
                  Measurement
                </h1>

                {/* 4. Side-by-Side Read-Only Category & Alteration Summary (Without Prices) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {/* Category Card */}
                  <div className="flex items-center bg-[#F3F3F3] rounded-[12px] px-3.5 py-3 select-none">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 mr-3 shadow-xs">
                      <GarmentCategoryIcon categoryId={selectedGarmentId} className="size-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-0.5">
                        Category of clothes
                      </span>
                      <span className="block text-[14.5px] font-bold text-black truncate leading-tight">
                        {currentCategory.name}
                      </span>
                    </div>
                  </div>

                  {/* Alteration Card */}
                  <div className="flex items-center bg-[#F3F3F3] rounded-[12px] px-3.5 py-3 select-none">
                    <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center shrink-0 mr-3 shadow-xs">
                      <Ruler className="size-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-0.5">
                        What needs to be done?
                      </span>
                      <span className="block text-[14.5px] font-bold text-black truncate leading-tight">
                        {selectedService.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Sleek, Flat Measurement List (Clean rows, no heavy boxes) */}
                <div className="mb-6">
                  <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                        Required Measurements
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">({currentCategory.name})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          {/* Unit Switcher */}
                          <div className="flex items-center rounded-full bg-[#F3F3F3] p-0.5 text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => setUnit('in')}
                              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${unit === 'in' ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
                                }`}
                            >
                              in
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnit('cm')}
                              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${unit === 'cm' ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
                                }`}
                            >
                              cm
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Done</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F3F3] hover:bg-[#E8E8E8] text-black text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Edit values</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clean Itemized Rows */}
                  <div className="divide-y divide-gray-100">
                    {currentFields.map((field) => {
                      const val = measurements[field.key]
                      const hasValue = Boolean(val && val.trim().length > 0)

                      return (
                        <div key={field.key} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0 pr-3">
                            <span className="text-[14px] font-bold text-black block leading-tight">
                              {field.label}
                            </span>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                {field.type === 'select' && field.options ? (
                                  <select
                                    value={val || ''}
                                    onChange={(e) => handleUpdateMeasurement(field.key, e.target.value)}
                                    className="px-3 py-1.5 rounded-xl bg-[#F3F3F3] border border-transparent focus:border-black focus:bg-white text-xs font-bold text-black focus:outline-none max-w-[170px]"
                                  >
                                    <option value="">To be Measured by Tailor</option>
                                    {field.options.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={val || ''}
                                    onChange={(e) => handleUpdateMeasurement(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-40 px-3 py-1.5 rounded-xl bg-[#F3F3F3] border border-transparent focus:border-black focus:bg-white text-xs font-bold text-black focus:outline-none placeholder:text-gray-400"
                                  />
                                )}

                                {hasValue && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearMeasurement(field.key)}
                                    title="Reset to 'To be Measured by Tailor'"
                                    className="p-1 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <RotateCcw size={13} />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div>
                                {hasValue ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-bold shadow-xs">
                                    <Check size={12} className="text-emerald-400" />
                                    <span>{val}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F3F3] text-xs font-medium text-gray-600">
                                    <Scissors size={11} className="text-[#9E593B]" />
                                    <span>To be Measured by Tailor</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action Buttons (Exact Hero Section button styling) */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleProceed}
                    className="flex-1 sm:flex-initial rounded-[12px] bg-black hover:bg-neutral-800 text-white font-semibold px-7 py-3.5 text-base transition-colors cursor-pointer shadow-xs active:scale-[0.98] text-center flex items-center justify-center gap-2"
                  >
                    <span>Confirm &amp; Proceed</span>
                    <CheckCircle2 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => go('home')}
                    className="flex-1 sm:flex-initial rounded-[12px] bg-[#F3F3F3] hover:bg-[#E8E8E8] border border-gray-300 text-black font-semibold px-5 py-3.5 text-base transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                </div>

              </div>

              {/* RIGHT: Modern Clean Studio & Atelier Illustration (Exact Position & Dimensions to Home) */}
              <div className="lg:col-span-6 relative flex justify-center items-start">
                <div className="relative w-full max-w-[620px] aspect-[16/10] rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-[#FAF8F5]">
                  <Image
                    src="/images/tailor_measuring.jpg"
                    alt="Master tailor measuring client with clothes rack background"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
      <TrustBar />

      {/* Live Finding Studio Radar Animation Modal */}
      <FindingStudioModal
        isOpen={isFindingStudio}
        city={selectedCity}
        garmentId={selectedGarmentId}
        garmentName={currentCategory.name}
        serviceId={selectedService.id}
        serviceName={selectedService.name}
        price={selectedService.customerPrice}
        measurements={measurements}
        brand={brand}
        notes={notes}
        scheduleDate={scheduleDateObj}
        scheduleTime={selectedTime}
        images={uploadedImages}
        onMatched={handleStudioMatched}
        onCancel={() => setIsFindingStudio(false)}
      />
    </div>
  )
}
