'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar,
  Check,
  Scissors,
  Shirt,
  Ruler,
  UploadCloud,
  X,
  Camera,
  Sparkles,
} from 'lucide-react'
import { GARMENT_CATEGORIES, type Screen } from './data'

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

const CITY_TIMEZONES: Record<string, string> = {
  'Mumbai, IN': 'Asia/Kolkata',
  'New York, NY': 'America/New_York',
  'London, UK': 'Europe/London',
  'Delhi NCR, IN': 'Asia/Kolkata',
  'Bengaluru, IN': 'Asia/Kolkata',
  'Los Angeles, CA': 'America/Los_Angeles',
}

function getCityLocalDateTime(timeZone: string) {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })

    const parts = formatter.formatToParts(now)
    let year = 0, month = 0, day = 0, hour = 0, minute = 0
    for (const p of parts) {
      if (p.type === 'year') year = parseInt(p.value, 10)
      if (p.type === 'month') month = parseInt(p.value, 10) - 1
      if (p.type === 'day') day = parseInt(p.value, 10)
      if (p.type === 'hour') hour = parseInt(p.value, 10) % 24
      if (p.type === 'minute') minute = parseInt(p.value, 10)
    }
    return { year, month, day, hour, minute }
  } catch {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    }
  }
}

function parseSlotToMinutes(slotStr: string) {
  const [timePart, period] = slotStr.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (period === 'PM' && h < 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + m
}

function isSlotPassedInCity(selectedDate: Date, slotStr: string, city: string) {
  const timeZone = CITY_TIMEZONES[city] || 'Asia/Kolkata'
  const cityNow = getCityLocalDateTime(timeZone)

  const selYear = selectedDate.getFullYear()
  const selMonth = selectedDate.getMonth()
  const selDay = selectedDate.getDate()

  if (
    selYear < cityNow.year ||
    (selYear === cityNow.year && selMonth < cityNow.month) ||
    (selYear === cityNow.year && selMonth === cityNow.month && selDay < cityNow.day)
  ) {
    return true
  }

  if (
    selYear > cityNow.year ||
    (selYear === cityNow.year && selMonth > cityNow.month) ||
    (selYear === cityNow.year && selMonth === cityNow.month && selDay > cityNow.day)
  ) {
    return false
  }

  const currentCityMinutes = cityNow.hour * 60 + cityNow.minute
  const slotMinutes = parseSlotToMinutes(slotStr)

  return slotMinutes <= currentCityMinutes
}

function CustomDarziCalendar({
  selectedDate,
  onSelectDate,
  selectedCity,
}: {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  selectedCity: string
}) {
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const timeZone = CITY_TIMEZONES[selectedCity] || 'Asia/Kolkata'
  const cityNow = getCityLocalDateTime(timeZone)
  const cityTodayDate = new Date(cityNow.year, cityNow.month, cityNow.day)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d))
  }

  return (
    <div className="bg-[#FAF8F5] border border-[#E8E1D5] rounded-2xl p-4 shadow-sm select-none">
      {/* Month & Nav Bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-black text-[#0F1115] tracking-tight">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="size-7 rounded-lg hover:bg-[#E8E1D5]/60 text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="size-7 rounded-lg hover:bg-[#E8E1D5]/60 text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
          <span key={w} className="text-[11px] font-extrabold uppercase text-gray-400">
            {w}
          </span>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dateObj, idx) => {
          if (!dateObj) return <div key={`empty-${idx}`} />

          const isPast = dateObj < cityTodayDate
          const isSelected = isSameDay(dateObj, selectedDate)

          return (
            <button
              key={dateObj.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(dateObj)}
              className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${isSelected
                  ? 'bg-black text-white shadow-xs scale-105'
                  : isPast
                    ? 'text-gray-300 pointer-events-none line-through'
                    : 'text-black hover:bg-[#E8E8E8]'
                }`}
            >
              {dateObj.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const DARZI_TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
]

interface HeroSectionProps {
  go: (s: Screen) => void
  onQuickSearch?: (postcode: string, garmentId: string) => void
}

const CITIES = [
  'Mumbai, IN',
  'New York, NY',
  'London, UK',
  'Delhi NCR, IN',
  'Bengaluru, IN',
  'Los Angeles, CA',
]

export function HeroSection({ go, onQuickSearch }: HeroSectionProps) {
  const [selectedCity, setSelectedCity] = useState('Mumbai, IN')
  const [showCityPicker, setShowCityPicker] = useState(false)

  // Pickup / Schedule time selection state
  const [pickupOption, setPickupOption] = useState<'now' | 'schedule'>('now')
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleDateObj, setScheduleDateObj] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState('03:30 PM')

  // Tailoring selection state
  const [selectedGarmentId, setSelectedGarmentId] = useState('trousers')
  const [showGarmentPicker, setShowGarmentPicker] = useState(false)

  const currentCategory = GARMENT_CATEGORIES.find((c) => c.id === selectedGarmentId) || GARMENT_CATEGORIES[0]
  const [selectedAlteration, setSelectedAlteration] = useState(currentCategory.popularServices[0]?.name || '')
  const [showAlterationPicker, setShowAlterationPicker] = useState(false)

  // Image Upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const formRef = useRef<HTMLDivElement>(null)

  // Close open popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowCityPicker(false)
        setShowTimePicker(false)
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
      setSelectedAlteration(category.popularServices[0].name)
    }
  }

  const handleAlterationSelect = (altName: string) => {
    setSelectedAlteration(altName)
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

  const handleBookNow = () => {
    onQuickSearch?.(selectedCity.includes('Los Angeles') ? '90210' : '10012', selectedGarmentId)
    go('booking')
  }

  const handleConfirmSchedule = () => {
    setPickupOption('schedule')
    setIsScheduleModalOpen(false)
    setShowTimePicker(false)
    onQuickSearch?.(selectedCity.includes('Los Angeles') ? '90210' : '10012', selectedGarmentId)
    go('booking')
  }

  const formattedDateDisplay = scheduleDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const selectedServiceObj = currentCategory.popularServices.find((s) => s.name === selectedAlteration) || currentCategory.popularServices[0]

  return (
    <section className="relative bg-white py-10 lg:py-16 border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* LEFT: Pixel-Perfect Uber 'Request an alteration' Card Form */}
          <div ref={formRef} className="lg:col-span-6 flex flex-col justify-center max-w-[480px]">

            {/* 1. Location Header */}
            <div className="relative mb-3.5 flex items-center gap-1.5 text-[15px] font-medium text-black">
              <MapPin size={17} className="text-black fill-black shrink-0" />
              <span className="font-bold">{selectedCity}</span>
              <button
                type="button"
                onClick={() => {
                  setShowCityPicker(!showCityPicker)
                  setShowTimePicker(false)
                  setShowGarmentPicker(false)
                  setShowAlterationPicker(false)
                }}
                className="underline text-black font-normal hover:text-gray-700 ml-1 transition-colors cursor-pointer"
              >
                Change city
              </button>

              {/* City Dropdown Menu Overlay */}
              {showCityPicker && (
                <div className="absolute top-7 left-0 z-50 w-64 rounded-2xl bg-white p-2 border border-gray-200 shadow-2xl space-y-1 animate-in fade-in duration-150">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${selectedCity === c
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-[#F3F3F3]'
                        }`}
                    >
                      <span>{c}</span>
                      {selectedCity === c && <Check size={16} className="text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Main Title */}
            <h1 className="text-3xl sm:text-[44px] lg:text-[48px] font-extrabold tracking-tight text-black leading-[1.08] mb-4">
              Request an alteration
            </h1>

            {/* 3. Time Pill Dropdown */}
            <div className="relative mb-5 inline-block">
              <button
                type="button"
                onClick={() => {
                  setShowTimePicker(!showTimePicker)
                  setShowCityPicker(false)
                  setShowGarmentPicker(false)
                  setShowAlterationPicker(false)
                }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F3F3F3] hover:bg-[#E8E8E8] transition-colors text-sm font-medium text-black cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                  {pickupOption === 'now' ? (
                    <Clock size={12} className="text-white" />
                  ) : (
                    <Calendar size={12} className="text-white" />
                  )}
                </div>
                <span>
                  {pickupOption === 'now'
                    ? 'Pickup now'
                    : `${formattedDateDisplay} at ${selectedTime}`}
                </span>
                <ChevronDown size={16} className="text-black ml-0.5" />
              </button>

              {/* Schedule Popover Overlay */}
              {showTimePicker && (
                <div className="absolute top-11 left-0 z-50 w-72 rounded-2xl bg-white p-3 border border-gray-200 shadow-2xl space-y-2 animate-in fade-in duration-150">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 px-2 pt-1">
                    Select Pickup Time
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPickupOption('now')
                      setShowTimePicker(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${pickupOption === 'now' ? 'bg-black text-white' : 'text-black hover:bg-[#F3F3F3]'
                      }`}
                  >
                    <Clock size={16} />
                    <span>Pickup now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowTimePicker(false)
                      setIsScheduleModalOpen(true)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${pickupOption === 'schedule' ? 'bg-black text-white' : 'text-black hover:bg-[#F3F3F3]'
                      }`}
                  >
                    <Calendar size={16} />
                    <span>Schedule</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Uber-Style Input Fields */}
            <div className="relative w-full mb-4">
              <div className="space-y-2">
                <div className="relative">
                  <div
                    onClick={() => {
                      setShowGarmentPicker(!showGarmentPicker)
                      setShowAlterationPicker(false)
                      setShowCityPicker(false)
                      setShowTimePicker(false)
                    }}
                    className={`relative z-0 flex items-center bg-[#F3F3F3] hover:bg-[#E8E8E8] rounded-[12px] px-3.5 py-3 border transition-all cursor-pointer select-none ${showGarmentPicker ? 'border-black bg-white shadow-sm' : 'border-transparent'
                      }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 mr-3 z-20 shadow-xs">
                      <GarmentCategoryIcon categoryId={selectedGarmentId} className="size-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-0.5">
                        Category of clothes
                      </span>
                      <span className="block text-[15px] font-bold text-black truncate leading-tight">
                        {currentCategory.name} <span className="font-semibold text-black">(from ${currentCategory.startingPrice})</span>
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-black shrink-0 transition-transform duration-200 ${showGarmentPicker ? 'rotate-180' : ''}`} />
                  </div>

                  {showGarmentPicker && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-2xl bg-white border border-gray-200 shadow-2xl p-2 space-y-1 max-h-80 overflow-y-auto animate-in fade-in duration-150">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                        Select Garment Category
                      </div>
                      {GARMENT_CATEGORIES.map((cat) => {
                        const isSelected = selectedGarmentId === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleGarmentChange(cat.id)}
                            className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between group ${isSelected ? 'bg-black text-white' : 'text-black hover:bg-[#F3F3F3]'
                              }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E8E8E8] text-black group-hover:bg-white'
                                }`}>
                                <GarmentCategoryIcon categoryId={cat.id} className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold truncate leading-tight">{cat.name}</div>
                                <div className={`text-xs mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                  From ${cat.startingPrice} · {cat.avgTurnaround}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check size={16} className="text-white shrink-0 ml-2" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div
                    onClick={() => {
                      setShowAlterationPicker(!showAlterationPicker)
                      setShowGarmentPicker(false)
                      setShowCityPicker(false)
                      setShowTimePicker(false)
                    }}
                    className={`relative z-0 flex items-center bg-[#F3F3F3] hover:bg-[#E8E8E8] rounded-[12px] px-3.5 py-3 border transition-all cursor-pointer select-none ${showAlterationPicker ? 'border-black bg-white shadow-sm' : 'border-transparent'
                      }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center shrink-0 mr-3 z-20 shadow-xs">
                      <Ruler className="size-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-0.5">
                        What needs to be done?
                      </span>
                      <span className="block text-[15px] font-bold text-black truncate leading-tight">
                        {selectedAlteration} {selectedServiceObj ? `($${selectedServiceObj.customerPrice})` : ''}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-black shrink-0 transition-transform duration-200 ${showAlterationPicker ? 'rotate-180' : ''}`} />
                  </div>

                  {showAlterationPicker && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-2xl bg-white border border-gray-200 shadow-2xl p-2 space-y-1 max-h-80 overflow-y-auto animate-in fade-in duration-150">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                        {currentCategory.name} Services
                      </div>
                      {currentCategory.popularServices.map((svc) => {
                        const isSelected = selectedAlteration === svc.name
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => handleAlterationSelect(svc.name)}
                            className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between group ${isSelected ? 'bg-black text-white' : 'text-black hover:bg-[#F3F3F3]'
                              }`}
                          >
                            <div className="min-w-0 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold truncate leading-tight">{svc.name}</span>
                                {svc.popular && (
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-black text-white'
                                    }`}>
                                    Popular
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {svc.description}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E8E8E8] text-black group-hover:bg-white'
                                }`}>
                                ${svc.customerPrice}
                              </span>
                              {isSelected && <Check size={16} className="text-white shrink-0" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Square Product Image Upload Box Row */}
            <div className="relative mb-5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                Garment photo / reference fit <span className="text-gray-400 font-medium">(Optional)</span>
              </label>
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                <div className="relative size-28 rounded-[16px] bg-[#F3F3F3] hover:bg-[#E8E8E8] border-2 border-dashed border-gray-400 hover:border-black flex flex-col items-center justify-center text-center p-2.5 transition-all cursor-pointer shrink-0 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Upload garment photos"
                  />
                  <div className="size-9 rounded-full bg-black flex items-center justify-center text-white mb-1 group-hover:scale-105 transition-transform shrink-0">
                    <Camera size={18} />
                  </div>
                  <span className="text-xs font-bold text-black leading-tight">Add photo</span>
                  <span className="text-[10px] text-gray-500 font-medium mt-0.5">JPG / PNG</span>
                </div>

                {uploadedImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative size-28 rounded-[16px] overflow-hidden border border-gray-300 shrink-0 group">
                    <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-sm transition-all z-20 cursor-pointer"
                      title="Remove photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Action Buttons Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                type="button"
                onClick={handleBookNow}
                className="flex-1 sm:flex-initial rounded-[12px] bg-black hover:bg-neutral-800 text-white font-semibold px-7 py-3.5 text-base transition-colors cursor-pointer shadow-xs active:scale-[0.98] text-center"
              >
                Book now
              </button>

              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="flex-1 sm:flex-initial rounded-[12px] bg-[#F3F3F3] hover:bg-[#E8E8E8] border border-gray-300 text-black font-semibold px-6 py-3.5 text-base transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 text-center"
              >
                <Calendar size={18} />
                <span>Schedule for later</span>
              </button>
            </div>

          </div>

          {/* RIGHT: Modern Clean Studio & Atelier Illustration */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[620px] aspect-[16/10] rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-[#FAF8F5]">
              <Image
                src="/images/about_hero_art.jpg"
                alt="Modern tailoring atelier salon with garments and craft tools"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Custom Darzi Theme Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 sm:p-7 max-w-md w-full border border-gray-200 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-extrabold text-black tracking-tight">
                  Schedule Atelier Visit
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Select visit date and available slot in <span className="font-bold text-black">{selectedCity}</span>
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

            {/* 1. Custom Darzi Theme Calendar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Calendar size={13} className="text-black" />
                <span>1. Select Visit Date</span>
              </label>
              <CustomDarziCalendar
                selectedDate={scheduleDateObj}
                onSelectDate={(d) => setScheduleDateObj(d)}
                selectedCity={selectedCity}
              />
            </div>

            {/* 2. Custom Darzi Theme Time Slot Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Clock size={13} className="text-black" />
                  <span>2. Select Time Slot</span>
                </label>
                <span className="text-[10px] text-gray-400 font-semibold">
                  Local time: {selectedCity.split(',')[0]}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DARZI_TIME_SLOTS.map((t) => {
                  const passed = isSlotPassedInCity(scheduleDateObj, t, selectedCity)
                  const isSelected = selectedTime === t

                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={passed}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-xl text-xs font-bold text-center transition-all border ${isSelected
                          ? 'bg-black text-white border-black shadow-xs scale-105'
                          : passed
                            ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed line-through opacity-50'
                            : 'bg-[#F3F3F3] text-black border-transparent hover:bg-[#E8E8E8] cursor-pointer'
                        }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Modal Action Buttons */}
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
    </section>
  )
}
