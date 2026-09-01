'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  Filter,
  Lock,
  MapPin,
  QrCode,
  Ruler,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  User,
  X,
} from 'lucide-react'
import {
  GARMENT_CATEGORIES,
  PARTNER_STORES,
  getClosestStoreForLocation,
  type AlterationService,
  type GarmentCategory,
  type OrderStatus,
  type Screen,
  type StoreOption,
  type User as UserType,
} from './data'
import { createOrder, fetchStores, getCurrentUser, updateUserProfile } from '@/lib/api'

type BookingStep =
  | 'studio'
  | 'payment'
  | 'pass'
  | 'tracking'

const DEFAULT_STUDIO: StoreOption = {
  id: 'partner-atelier',
  name: 'Local Certified Atelier',
  area: 'Local Area',
  address: 'Partner Atelier Studio',
  postcode: 'Local Area',
  distance: '0.4 mi away',
  distanceMiles: 0.4,
  rating: 4.95,
  reviewCount: 150,
  openingHours: 'Mon–Sat: 09:00 – 19:00',
  dailyCapacity: 25,
  machines: 6,
  workers: 4,
  leadTailor: 'Master Tailor',
  specialties: ['Custom Alterations', 'Precision Hemming'],
  retailSold: true,
  coords: { lat: 51.5033, lng: -0.1925 },
}

interface CustomerFlowProps {
  go: (s: Screen) => void
  otp: string
  user?: UserType | null
  initialPostcode?: string
  initialGarmentId?: string
  initialServiceId?: string
  initialStore?: StoreOption
  initialMeasurements?: Record<string, string>
  initialBrand?: string
  initialNotes?: string
  initialDate?: string
  initialTimeSlot?: string
  initialFittingType?: 'in-person' | 'pre-pinned'
}

export function CustomerFlow({
  go,
  otp,
  user,
  initialPostcode = 'W8 4EP',
  initialGarmentId = 'trousers',
  initialServiceId,
  initialStore,
  initialMeasurements,
  initialBrand,
  initialNotes,
  initialDate,
  initialTimeSlot,
  initialFittingType,
}: CustomerFlowProps) {
  const [step, setStep] = useState<BookingStep>('studio')
  const [postcode] = useState(initialPostcode)
  const [categoryId] = useState(initialGarmentId)
  const [selectedServiceId] = useState<string>(
    initialServiceId || GARMENT_CATEGORIES[0].popularServices[0].id
  )
  const [timeSlot] = useState(initialTimeSlot || '11:30 AM')
  const [fittingDate] = useState(initialDate || 'Tomorrow')
  const [brand] = useState(initialBrand || '')
  const [notes] = useState(initialNotes || '')
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || (user?.contact && !user.contact.includes('@') ? user.contact : ''))
  const [customerEmail, setCustomerEmail] = useState(user?.email || (user?.contact && user.contact.includes('@') ? user.contact : ''))

  // Auto-populate from logged-in user profile
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) {
        if (u.name && u.name !== 'Darzi Member' && u.name !== 'Google User' && u.name !== 'Mobile Member') {
          setCustomerName(u.name)
        }
        if (u.email) setCustomerEmail(u.email)
        if (u.phone) setCustomerPhone(u.phone)
      }
    })
  }, [])

  // All registered & partner studios list
  const [allStores, setAllStores] = useState<StoreOption[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<'all' | 'hemming' | 'suiting' | 'dresses' | 'express' | 'top'>('all')

  // Selected studio
  const [allocatedStore, setAllocatedStore] = useState<StoreOption>(
    initialStore || getClosestStoreForLocation(initialPostcode) || DEFAULT_STUDIO
  )

  // Fetch all registered studios from backend
  useEffect(() => {
    let mounted = true
    fetchStores()
      .then((stores) => {
        if (mounted && stores && stores.length > 0) {
          setAllStores(stores)
          if (initialStore) {
            const found = stores.find((s) => s.id === initialStore.id || s.name.toLowerCase() === initialStore.name.toLowerCase())
            if (found) setAllocatedStore(found)
          } else if (!allocatedStore) {
            setAllocatedStore(getClosestStoreForLocation(initialPostcode, stores) || stores[0])
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic stores:', err)
      })
      .finally(() => {
        if (mounted) setLoadingStores(false)
      })

    return () => {
      mounted = false
    }
  }, [initialStore, initialPostcode])

  // Filtered stores based on search query and category tags
  const filteredStores = useMemo(() => {
    let list = allStores
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.postcode.toLowerCase().includes(q) ||
          s.leadTailor.toLowerCase().includes(q) ||
          s.specialties.some((spec) => spec.toLowerCase().includes(q))
      )
    }

    if (selectedTag === 'hemming') {
      list = list.filter((s) => s.specialties.some((spec) => spec.toLowerCase().includes('hem') || spec.toLowerCase().includes('denim') || spec.toLowerCase().includes('trouser')))
    } else if (selectedTag === 'suiting') {
      list = list.filter((s) => s.specialties.some((spec) => spec.toLowerCase().includes('suit') || spec.toLowerCase().includes('blazer') || spec.toLowerCase().includes('savile')))
    } else if (selectedTag === 'dresses') {
      list = list.filter((s) => s.specialties.some((spec) => spec.toLowerCase().includes('dress') || spec.toLowerCase().includes('silk') || spec.toLowerCase().includes('gown') || spec.toLowerCase().includes('evening')))
    } else if (selectedTag === 'express') {
      list = list.filter((s) => s.specialties.some((spec) => spec.toLowerCase().includes('24h') || spec.toLowerCase().includes('express') || spec.toLowerCase().includes('fast')))
    } else if (selectedTag === 'top') {
      list = list.filter((s) => s.rating >= 4.95)
    }

    return list
  }, [allStores, searchQuery, selectedTag])

  // Live order status simulation
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Accepted')
  const [userRating, setUserRating] = useState<number>(5)
  const [feedbackDone, setFeedbackDone] = useState(false)

  const selectedCategory =
    GARMENT_CATEGORIES.find((c) => c.id === categoryId) || GARMENT_CATEGORIES[0]
  const selectedService =
    selectedCategory.popularServices.find((s) => s.id === selectedServiceId) ||
    selectedCategory.popularServices[0]

  const totalPrice = selectedService.customerPrice

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const u = await getCurrentUser()
      await createOrder({
        userId: u?.id,
        customerName,
        customerEmail,
        customerPhone,
        postcode,
        garmentId: selectedCategory.id,
        garmentName: selectedCategory.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        storeId: allocatedStore.id,
        storeName: allocatedStore.name,
        date: fittingDate,
        timeSlot,
        garmentBrand: brand,
        fitNotes: notes,
        price: selectedService.customerPrice,
        otp
      })
      if (u && (!u.phone || u.phone !== customerPhone || u.email !== customerEmail)) {
        await updateUserProfile({ phone: customerPhone, name: customerName, email: customerEmail })
      }
    } catch (err) {
      console.warn('Backend order recording notice:', err)
    }
    setStep('pass')
  }

  const stepsList: { key: BookingStep; label: string }[] = [
    { key: 'studio', label: '1. Atelier Studio' },
    { key: 'payment', label: '2. Review & Pay' },
  ]

  const currentStepIndex = stepsList.findIndex((s) => s.key === step)

  return (
    <div className="py-10 lg:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 lg:px-8">

        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-[#DDD6CB]">
          <button
            onClick={() => {
              if (step === 'studio') go('confirm-measurement')
              else if (step === 'payment') setStep('studio')
              else if (step === 'pass' || step === 'tracking') go('home')
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <span className="font-mono text-xs text-[#9E593B] font-semibold">
            {step === 'pass' || step === 'tracking'
              ? 'PASS #TG-1048'
              : `STEP ${Math.max(1, currentStepIndex + 1)} OF ${stepsList.length}`}
          </span>
        </div>

        {/* Progress Bar (during booking stages) */}
        {currentStepIndex >= 0 && (
          <div className="mt-4 flex gap-1.5">
            {stepsList.map((s, idx) => (
              <div
                key={s.key}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx <= currentStepIndex ? 'bg-[#18191B]' : 'bg-[#DDD6CB]'
                  }`}
              />
            ))}
          </div>
        )}

        {/* ========================================================
            STEP 1: ALLOCATED & REGISTERED PARTNER STUDIOS
        ======================================================== */}
        {step === 'studio' && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
                  Step 01 · Select Atelier Studio
                </span>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.03em] text-[#18191B]">
                  Choose your alteration studio.
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#5A5D64] max-w-2xl">
                  Showing all certified and signed-up atelier studios. Select your preferred studio for your fitting session and garment alteration.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  {allStores.length} Registered Studios
                </span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7E85]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search registered studios by name, area, postcode, or master tailor..."
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#18191B] placeholder-[#9CA3AF] focus:border-[#9E593B] focus:outline-none shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7E85] hover:text-[#18191B]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Quick Filter Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Studios' },
                  { id: 'hemming', label: 'Hemming & Denim' },
                  { id: 'suiting', label: 'Suits & Tailoring' },
                  { id: 'dresses', label: 'Dresses & Silk' },
                  { id: 'express', label: 'Express 24h' },
                  { id: 'top', label: 'Top Rated (4.95+)' },
                ].map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id as any)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      selectedTag === tag.id
                        ? 'bg-[#18191B] text-white shadow-xs'
                        : 'bg-white text-[#5A5D64] border border-[#DDD6CB] hover:border-[#9E593B] hover:text-[#18191B]'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currently Selected Studio Highlight Banner */}
            <div className="mt-6 rounded-2xl border-2 border-[#9E593B] bg-[#FAF4ED] p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#9E593B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                      <Check size={11} /> Selected Atelier
                    </span>
                    <span className="text-xs text-[#7A7E85]">
                      {allocatedStore.area} &middot; {allocatedStore.distance}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#18191B]">
                    {allocatedStore.name}
                  </h3>
                  <p className="text-xs text-[#5A5D64]">
                    {allocatedStore.address}, {allocatedStore.postcode} &middot; Lead: <strong className="text-[#18191B]">{allocatedStore.leadTailor}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  <div className="bg-white/90 border border-[#E8DFC8] rounded-xl px-3 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#18191B]">
                      <Star size={13} className="fill-[#9E593B] text-[#9E593B]" />
                      <span>{allocatedStore.rating}</span>
                    </div>
                    <span className="text-[10px] text-[#7A7E85]">{allocatedStore.reviewCount} reviews</span>
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18191B] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#9E593B] shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <span>Proceed with this Atelier</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of All Registered Studios */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-[#18191B]">
                  All Registered &amp; Certified Studios ({filteredStores.length})
                </h3>
                <span className="text-xs text-[#7A7E85]">Click any studio card to select it for your booking</span>
              </div>

              {filteredStores.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-white border border-[#DDD6CB]">
                  <Store size={36} className="text-[#9CA3AF] mx-auto mb-2" />
                  <h4 className="font-serif text-base font-semibold text-[#18191B]">No studios match your filter</h4>
                  <p className="text-xs text-[#7A7E85] mt-1">Try clearing your search query or selecting "All Studios"</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedTag('all')
                    }}
                    className="mt-3 rounded-full bg-[#18191B] text-white text-xs font-semibold px-4 py-2"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStores.map((store) => {
                    const isSelected = allocatedStore.id === store.id

                    return (
                      <div
                        key={store.id}
                        onClick={() => setAllocatedStore(store)}
                        className={`group relative flex flex-col justify-between rounded-2xl p-5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#9E593B] bg-[#FAF4ED] ring-2 ring-[#9E593B]/20 shadow-md'
                            : 'border-[#E5E7EB] bg-white hover:border-[#DDD6CB] hover:shadow-sm'
                        }`}
                      >
                        {/* Top Meta Row */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9E593B]">
                              <MapPin size={12} />
                              <span>{store.distance || 'Nearby'}</span>
                            </span>

                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#9E593B] text-white text-[10px] font-bold px-2 py-0.5">
                                <Check size={10} /> Active Choice
                              </span>
                            ) : (
                              <div className="flex items-center gap-1 text-xs font-bold text-[#18191B]">
                                <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                                <span>{store.rating}</span>
                                <span className="text-[10px] text-[#7A7E85]">({store.reviewCount})</span>
                              </div>
                            )}
                          </div>

                          <h4 className="font-serif text-lg font-bold text-[#18191B] leading-snug group-hover:text-[#9E593B] transition-colors">
                            {store.name}
                          </h4>
                          <p className="text-xs text-[#5A5D64] mt-0.5">
                            {store.area} &middot; {store.postcode}
                          </p>
                          <p className="text-[11px] text-[#7A7E85] mt-0.5 truncate">
                            {store.address}
                          </p>

                          {/* Lead tailor & machinery */}
                          <div className="mt-3 pt-3 border-t border-[#EAE4DC] grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-[#7A7E85] block text-[10px] uppercase font-semibold">Lead Artisan</span>
                              <span className="font-medium text-[#18191B] truncate block">{store.leadTailor}</span>
                            </div>
                            <div>
                              <span className="text-[#7A7E85] block text-[10px] uppercase font-semibold">Machinery</span>
                              <span className="font-medium text-[#18191B]">{store.machines} Industrial Units</span>
                            </div>
                          </div>

                          {/* Specialties Tags */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {store.specialties.map((spec) => (
                              <span
                                key={spec}
                                className="rounded-md bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 text-[10px] font-medium text-[#5A5D64]"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom action button */}
                        <div className="mt-5 pt-3 border-t border-[#EAE4DC]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setAllocatedStore(store)
                            }}
                            className={`w-full rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                              isSelected
                                ? 'bg-[#18191B] text-white shadow-xs'
                                : 'bg-[#FAF8F5] text-[#18191B] border border-[#DDD6CB] hover:bg-[#18191B] hover:text-white'
                            }`}
                          >
                            {isSelected ? 'Selected Atelier ✓' : 'Select This Studio'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Directions & Service Access Preview */}
            <div className="mt-8 rounded-2xl bg-white p-5 sm:p-6 border border-[#DDD6CB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] shrink-0">
                  <Compass size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#18191B]">Studio Access &amp; Fitting Room Priority</p>
                  <p className="text-[11px] text-[#7A7E85]">
                    Selected Atelier: <strong>{allocatedStore.name}</strong> ({allocatedStore.address}, {allocatedStore.postcode})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-mono font-bold text-[#9E593B] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E8E1D5]">
                  SLOT: {fittingDate} @ {timeSlot}
                </span>
                <button
                  onClick={() => setStep('payment')}
                  className="rounded-full bg-[#18191B] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#9E593B] transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: SECURE ONLINE PAYMENT
        ======================================================== */}
        {step === 'payment' && (
          <div className="mt-10 max-w-[720px]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 02 · Checkout &amp; Payment
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#18191B]">
              Confirm your alteration booking.
            </h1>
            <p className="mt-3 text-sm text-[#5A5D64]">
              Pre-paying secures your fitting time and priority turnaround at <strong>{allocatedStore.name}</strong>.
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Checkout Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-[#DDD6CB] bg-white px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#18191B] mb-1">Mobile (For Status SMS)</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD6CB] bg-white px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#18191B] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD6CB] bg-white px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#18191B] mb-1">Card Details (Demo Mode)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7E85]">
                      <CreditCard size={18} />
                    </span>
                    <input
                      type="text"
                      readOnly
                      value="•••• •••• •••• 4242 · 12/28 · CVC 888"
                      className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] py-3.5 pl-12 pr-4 text-xs font-mono text-[#18191B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#7A7E85]">
                  <Lock size={13} className="text-[#9E593B]" />
                  <span>256-Bit Encrypted Payment &middot; 100% Fit Guarantee Protected</span>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-[#18191B] py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Lock size={14} />
                  <span>Pay ${totalPrice}.00 &amp; Generate Fitting Pass</span>
                </button>
              </form>

              {/* Order Summary Sidebar */}
              <div className="rounded-2xl border border-[#DDD6CB] bg-[#F4EFEA] p-6 text-xs h-fit space-y-4">
                <h4 className="font-serif text-base font-semibold text-[#18191B]">Order Breakdown</h4>

                <div className="space-y-2 border-b border-[#DDD6CB] pb-4">
                  <div className="flex justify-between">
                    <span className="text-[#5A5D64]">{selectedCategory.name}</span>
                    <span className="font-semibold text-[#18191B]">${selectedService.customerPrice}.00</span>
                  </div>
                  <div className="text-[11px] text-[#7A7E85]">{selectedService.name}</div>
                  <div className="flex justify-between text-[11px] text-[#7A7E85]">
                    <span>Studio Fitting Session</span>
                    <span className="text-emerald-600 font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#7A7E85]">
                    <span>100% Fit Guarantee</span>
                    <span className="text-emerald-600 font-semibold">Included</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#18191B]">
                  <span>Total Amount</span>
                  <span className="font-serif text-lg text-[#9E593B]">${totalPrice}.00</span>
                </div>

                <div className="pt-2 text-[11px] text-[#7A7E85] space-y-1">
                  <p>• Studio: {allocatedStore.name}</p>
                  <p>• Slot: {fittingDate} @ {timeSlot}</p>
                  <p>• Turnaround: {selectedService.turnaroundDays} Business Days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 7: DIGITAL FITTING PASS (CONFIRMATION)
        ======================================================== */}
        {step === 'pass' && (
          <div className="mt-10 max-w-[640px] mx-auto text-center">
            <div className="grid size-16 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] mx-auto shadow-md">
              <CheckCircle2 size={32} className="text-[#9E593B]" />
            </div>

            <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Order Confirmed &amp; Pass Active
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#18191B]">
              Your Studio Fitting Pass.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              Present this pass when you visit <strong>{allocatedStore.name}</strong> for your fitting.
            </p>

            {/* Luxury Pass Card */}
            <div className="mt-8 rounded-3xl border-2 border-[#18191B] bg-white p-6 sm:p-8 shadow-lg text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#DDD6CB] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9E593B] tracking-wider">Darzi Verified Pass</span>
                  <h3 className="font-serif text-xl font-bold text-[#18191B]">Order #TG-1048</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#7A7E85] block">Fitting Code</span>
                  <span className="font-mono text-xl font-bold text-[#18191B] tracking-widest">{otp}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-[#7A7E85] block">Customer</span>
                  <span className="font-semibold text-[#18191B] text-sm">{customerName}</span>
                </div>
                <div>
                  <span className="text-[#7A7E85] block">Allocated Studio</span>
                  <span className="font-semibold text-[#18191B] text-sm">{allocatedStore.name}</span>
                  <span className="text-[11px] text-[#5A5D64] block">{allocatedStore.address}</span>
                </div>
                <div>
                  <span className="text-[#7A7E85] block">Garment &amp; Service</span>
                  <span className="font-semibold text-[#18191B]">{selectedCategory.name}</span>
                  <span className="text-[11px] text-[#5A5D64] block">{selectedService.name}</span>
                </div>
                <div>
                  <span className="text-[#7A7E85] block">Scheduled Window</span>
                  <span className="font-semibold text-[#18191B]">{fittingDate} · {timeSlot}</span>
                </div>
              </div>

              {/* QR Mock */}
              <div className="mt-6 pt-5 border-t border-[#EAE4DC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-14 place-items-center rounded-xl bg-[#FAF8F5] border border-[#DDD6CB]">
                    <QrCode size={36} className="text-[#18191B]" />
                  </div>
                  <div className="text-xs text-[#5A5D64]">
                    <p className="font-semibold text-[#18191B]">Scan at Studio Counter</p>
                    <p className="text-[11px] text-[#7A7E85]">Instantly loads your tailor instructions</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] px-3 py-1">
                  PAID ${totalPrice}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStep('tracking')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18191B] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-all"
              >
                <span>Track Live Order Status</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => go('orders')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DDD6CB] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#18191B] hover:bg-white"
              >
                <span>Go to My Fittings Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 8: LIVE ORDER TRACKING & RATING (TECH BRIEF LIFECYCLE)
        ======================================================== */}
        {step === 'tracking' && (
          <div className="mt-10 max-w-[760px] mx-auto">
            <div className="flex items-center justify-between border-b border-[#DDD6CB] pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
                  Live Lifecycle Tracker
                </span>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-[#18191B]">
                  Order #TG-1048
                </h1>
                <p className="text-xs text-[#5A5D64]">
                  {selectedCategory.name} · {selectedService.name} @ {allocatedStore.name}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-[#7A7E85]">Current Status</span>
                <span className="block font-serif text-lg font-bold text-[#9E593B]">{orderStatus}</span>
              </div>
            </div>

            {/* Status Pipeline Step Indicator */}
            <div className="mt-8 rounded-2xl border border-[#DDD6CB] bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-lg font-semibold text-[#18191B] mb-6">
                Alteration Lifecycle
              </h3>

              <div className="space-y-6">
                {[
                  { key: 'Accepted', label: '1. Studio Matched & Booking Accepted', desc: 'Atelier North confirmed your fitting slot.' },
                  { key: 'Customer Arrived', label: '2. Customer Arrived at Studio', desc: 'Checked in with fitting code OTP ' + otp },
                  { key: 'Fitting Completed', label: '3. Fitting Completed & Pinned', desc: 'Master tailor marked exact break and waist adjustments.' },
                  { key: 'Work in Progress', label: '4. Tailoring Work in Progress', desc: 'Industrial machine stitch & original finish in work.' },
                  { key: 'Ready', label: '5. Garment Ready for Pick-Up', desc: 'Quality inspected and pressed. Ready for collection.' },
                  { key: 'Collected', label: '6. Collected & 100% Fit Confirmed', desc: 'Tried on in fitting room and collected.' },
                ].map((st, i) => {
                  const statusOrder = [
                    'Accepted',
                    'Customer Arrived',
                    'Fitting Completed',
                    'Work in Progress',
                    'Ready',
                    'Collected',
                  ]
                  const currIdx = statusOrder.indexOf(orderStatus)
                  const thisIdx = statusOrder.indexOf(st.key)
                  const isDone = thisIdx <= currIdx
                  const isCurrent = st.key === orderStatus

                  return (
                    <div key={st.key} className="flex items-start gap-4">
                      <div className={`grid size-7 place-items-center rounded-full mt-0.5 font-mono text-xs font-bold ${isDone ? 'bg-[#18191B] text-[#FAF8F5]' : 'bg-[#FAF8F5] border border-[#DDD6CB] text-[#7A7E85]'
                        }`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-semibold ${isCurrent ? 'text-[#9E593B]' : isDone ? 'text-[#18191B]' : 'text-[#7A7E85]'}`}>
                            {st.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold bg-[#F4EFEA] text-[#9E593B] px-2 py-0.5 rounded animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#666970] mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Status Simulation Controls */}
              <div className="mt-8 pt-6 border-t border-[#EAE4DC] flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#7A7E85]">Simulate next studio stage:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOrderStatus('Customer Arrived')}
                    className="rounded bg-[#FAF8F5] border border-[#DDD6CB] px-3 py-1.5 text-xs text-[#18191B] hover:bg-[#F4EFEA]"
                  >
                    Arrive
                  </button>
                  <button
                    onClick={() => setOrderStatus('Fitting Completed')}
                    className="rounded bg-[#FAF8F5] border border-[#DDD6CB] px-3 py-1.5 text-xs text-[#18191B] hover:bg-[#F4EFEA]"
                  >
                    Fitting Done
                  </button>
                  <button
                    onClick={() => setOrderStatus('Work in Progress')}
                    className="rounded bg-[#FAF8F5] border border-[#DDD6CB] px-3 py-1.5 text-xs text-[#18191B] hover:bg-[#F4EFEA]"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setOrderStatus('Ready')}
                    className="rounded bg-[#FAF8F5] border border-[#DDD6CB] px-3 py-1.5 text-xs text-[#18191B] hover:bg-[#F4EFEA]"
                  >
                    Ready
                  </button>
                  <button
                    onClick={() => setOrderStatus('Collected')}
                    className="rounded bg-[#18191B] text-white px-3 py-1.5 text-xs hover:bg-[#9E593B]"
                  >
                    Collect
                  </button>
                </div>
              </div>
            </div>

            {/* Step 14 from Tech Brief: Rate Experience */}
            {orderStatus === 'Collected' && (
              <div className="mt-8 rounded-2xl border border-[#9E593B] bg-[#F4EFEA] p-6 sm:p-8">
                {feedbackDone ? (
                  <div className="text-center">
                    <CheckCircle2 size={32} className="text-[#9E593B] mx-auto" />
                    <h4 className="font-serif text-xl font-bold text-[#18191B] mt-2">Thank you for rating!</h4>
                    <p className="text-xs text-[#5A5D64] mt-1">Your 5-star review helps support {allocatedStore?.name || 'the studio'} and independent tailors.</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E593B]">Step 14 · Rate Experience</span>
                    <h4 className="font-serif text-2xl font-semibold text-[#18191B] mt-1">How was your alteration fit?</h4>
                    <p className="text-xs text-[#5A5D64] mt-1">Rate your experience with {allocatedStore?.leadTailor || 'Master Tailor'} at {allocatedStore?.name || 'the partner studio'}.</p>

                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={star <= userRating ? 'fill-[#9E593B] text-[#9E593B]' : 'text-[#DDD6CB]'}
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setFeedbackDone(true)}
                      className="mt-5 rounded-full bg-[#18191B] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B]"
                    >
                      Submit Rating &amp; Save to Fit Passport
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => go('home')}
                className="text-xs font-semibold text-[#7A7E85] hover:text-[#18191B] underline underline-offset-4"
              >
                Return to Darzi Overview
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
