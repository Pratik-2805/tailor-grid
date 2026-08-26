'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  Lock,
  MapPin,
  QrCode,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from 'lucide-react'
import {
  GARMENT_CATEGORIES,
  PARTNER_STORES,
  type AlterationService,
  type GarmentCategory,
  type OrderStatus,
  type Screen,
  type StoreOption,
} from './data'
import { createOrder } from '@/lib/api'

type BookingStep =
  | 'location'
  | 'garment'
  | 'service'
  | 'schedule'
  | 'studio'
  | 'payment'
  | 'pass'
  | 'tracking'

interface CustomerFlowProps {
  go: (s: Screen) => void
  otp: string
  initialPostcode?: string
  initialGarmentId?: string
  initialServiceId?: string
  initialStore?: StoreOption
}

export function CustomerFlow({
  go,
  otp,
  initialPostcode = 'W8 4EP',
  initialGarmentId = 'trousers',
  initialServiceId,
  initialStore,
}: CustomerFlowProps) {
  const [step, setStep] = useState<BookingStep>('location')
  const [postcode, setPostcode] = useState(initialPostcode)
  const [categoryId, setCategoryId] = useState(initialGarmentId)
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || GARMENT_CATEGORIES[0].popularServices[0].id
  )
  const [fittingType, setFittingType] = useState<'in-person' | 'pre-pinned'>('in-person')
  const [fittingDate, setFittingDate] = useState('Tomorrow')
  const [timeSlot, setTimeSlot] = useState('11:30 AM')
  const [brand, setBrand] = useState('Levi\'s / Bespoke')
  const [notes, setNotes] = useState('Shorten length with original hem finish, slight shoe break')
  const [customerName, setCustomerName] = useState('Camilla Harrington')
  const [customerPhone, setCustomerPhone] = useState('+44 7700 900077')
  const [customerEmail, setCustomerEmail] = useState('camilla.h@example.com')

  // Matched store
  const [allocatedStore, setAllocatedStore] = useState<StoreOption>(
    initialStore || PARTNER_STORES[0]
  )

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

  const handleNextFromLocation = (e: React.FormEvent) => {
    e.preventDefault()
    // Allocate closest store based on postcode
    if (postcode.toUpperCase().includes('W1') || postcode.toUpperCase().includes('WC')) {
      setAllocatedStore(PARTNER_STORES[3]) // Soho
    } else if (postcode.toUpperCase().includes('W2')) {
      setAllocatedStore(PARTNER_STORES[1]) // Notting Hill
    } else if (postcode.toUpperCase().includes('W1U')) {
      setAllocatedStore(PARTNER_STORES[2]) // Marylebone
    } else {
      setAllocatedStore(PARTNER_STORES[0]) // Kensington
    }
    setStep('garment')
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createOrder({
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
    } catch (err) {
      console.warn('Backend order recording notice:', err)
    }
    setStep('pass')
  }

  const stepsList: { key: BookingStep; label: string }[] = [
    { key: 'location', label: 'Area' },
    { key: 'garment', label: 'Garment' },
    { key: 'service', label: 'Alteration' },
    { key: 'schedule', label: 'Fitting Slot' },
    { key: 'studio', label: 'Matched Studio' },
    { key: 'payment', label: 'Pay' },
  ]

  const currentStepIndex = stepsList.findIndex((s) => s.key === step)

  return (
    <div className="py-10 lg:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-[1040px] px-5 lg:px-8">

        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-[#DDD6CB]">
          <button
            onClick={() => {
              if (step === 'location') go('home')
              else if (step === 'garment') setStep('location')
              else if (step === 'service') setStep('garment')
              else if (step === 'schedule') setStep('service')
              else if (step === 'studio') setStep('schedule')
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
            STEP 1: LOCATION / ZIP CODE
        ======================================================== */}
        {step === 'location' && (
          <div className="mt-10 max-w-[620px]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 01 · Neighborhood Studio Search
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#18191B]">
              Where is your wardrobe located?
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#5A5D64] leading-relaxed">
              We&apos;ll match your garment with the highest-rated certified master alteration studio within your neighborhood.
            </p>

            <form onSubmit={handleNextFromLocation} className="mt-8">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7E85]">
                  <MapPin size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Enter Postcode / ZIP (e.g. W8 4EP, SW3, 10001)"
                  className="w-full rounded-2xl border border-[#DDD6CB] bg-white py-4 pl-12 pr-4 text-sm sm:text-base font-medium text-[#18191B] placeholder:text-[#8E8A82] focus:border-[#9E593B] focus:outline-none shadow-xs"
                />
              </div>

              {/* Quick Area Chips */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="text-[#7A7E85] self-center">Popular hubs:</span>
                {['W8 (Kensington)', 'W2 (Notting Hill)', 'W1U (Marylebone)', 'W1F (Soho)'].map((hub) => (
                  <button
                    type="button"
                    key={hub}
                    onClick={() => setPostcode(hub.split(' ')[0])}
                    className="rounded-full bg-[#F4EFEA] px-3 py-1 text-xs text-[#5A5D64] hover:bg-[#ECE6DD] hover:text-[#18191B] transition-colors"
                  >
                    {hub}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
              >
                <span>Select Garment Type</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            STEP 2: SELECT GARMENT CATEGORY
        ======================================================== */}
        {step === 'garment' && (
          <div className="mt-10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 02 · Garment Category
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#18191B]">
              What item are we altering?
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5A5D64]">
              Select the garment category. Prices and specialist machines will be tailored to this item.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GARMENT_CATEGORIES.map((cat) => {
                const isSelected = cat.id === categoryId
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id)
                      setSelectedServiceId(cat.popularServices[0].id)
                    }}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all duration-200 ${isSelected
                        ? 'border-[#9E593B] bg-[#F4EFEA] shadow-sm ring-1 ring-[#9E593B]'
                        : 'border-[#DDD6CB] bg-white hover:border-[#B1ACA4]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-semibold text-[#18191B]">{cat.name}</h3>
                      <span className="font-mono text-xs font-bold text-[#9E593B]">From ${cat.startingPrice}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#5A5D64] leading-relaxed">{cat.tagline}</p>
                    <div className="mt-4 pt-3 border-t border-[#EAE4DC] flex items-center justify-between text-[11px] text-[#7A7E85]">
                      <span>Avg. {cat.avgTurnaround}</span>
                      <span className="text-[#18191B] font-semibold">{cat.popularServices.length} services</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep('service')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
            >
              <span>Choose Alteration Service</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ========================================================
            STEP 3: SELECT ALTERATION SERVICE
        ======================================================== */}
        {step === 'service' && (
          <div className="mt-10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 03 · Alteration &amp; Pricing
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#18191B]">
              Select the exact tailoring required.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5A5D64]">
              Itemized alterations for <strong>{selectedCategory.name}</strong> with transparent fixed pricing.
            </p>

            <div className="mt-8 space-y-3">
              {selectedCategory.popularServices.map((svc) => {
                const isChosen = svc.id === selectedServiceId
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isChosen
                        ? 'border-[#9E593B] bg-[#F4EFEA] shadow-sm ring-1 ring-[#9E593B]'
                        : 'border-[#DDD6CB] bg-white hover:border-[#B1ACA4]'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`grid size-6 place-items-center rounded-full mt-0.5 ${isChosen ? 'bg-[#9E593B] text-white' : 'border border-[#DDD6CB]'}`}>
                        {isChosen && <CheckCircle2 size={14} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-semibold text-[#18191B]">{svc.name}</h4>
                          {svc.popular && (
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#9E593B] uppercase border border-[#DDD6CB]">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#5A5D64] max-w-[500px]">{svc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right pl-10 sm:pl-0">
                      <div>
                        <span className="font-serif text-xl font-bold text-[#18191B]">${svc.customerPrice}</span>
                        <span className="block text-[10px] text-[#7A7E85]">{svc.turnaroundDays} days SLA</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep('schedule')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
            >
              <span>Schedule Fitting &amp; Drop-off</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ========================================================
            STEP 4: SCHEDULE FITTING & GARMENT DETAILS
        ======================================================== */}
        {step === 'schedule' && (
          <div className="mt-10 max-w-[720px]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 04 · Studio Fitting &amp; Garment Details
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#18191B]">
              Fitting preference &amp; time slot.
            </h1>
            <p className="mt-3 text-sm text-[#5A5D64]">
              Choose how you would like to drop off your garment at the partner studio.
            </p>

            {/* Fitting Type Toggle */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div
                onClick={() => setFittingType('in-person')}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${fittingType === 'in-person'
                    ? 'border-[#9E593B] bg-[#F4EFEA] ring-1 ring-[#9E593B]'
                    : 'border-[#DDD6CB] bg-white'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#9E593B]" />
                  <h4 className="font-serif text-sm font-semibold text-[#18191B]">In-Studio Pin &amp; Measure</h4>
                </div>
                <p className="mt-2 text-xs text-[#5A5D64]">
                  Spend 5 minutes in a private fitting room. Master tailor personally pins your garment.
                </p>
                <span className="mt-3 inline-block text-[10px] font-bold uppercase text-[#9E593B]">Recommended</span>
              </div>

              <div
                onClick={() => setFittingType('pre-pinned')}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${fittingType === 'pre-pinned'
                    ? 'border-[#9E593B] bg-[#F4EFEA] ring-1 ring-[#9E593B]'
                    : 'border-[#DDD6CB] bg-white'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Ruler size={16} className="text-[#9E593B]" />
                  <h4 className="font-serif text-sm font-semibold text-[#18191B]">Pre-Pinned Quick Drop-off</h4>
                </div>
                <p className="mt-2 text-xs text-[#5A5D64]">
                  Already pinned at home or sending a sample fit garment. 60-second counter drop-off.
                </p>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#18191B] mb-2">Preferred Drop-Off Date</label>
                <select
                  value={fittingDate}
                  onChange={(e) => setFittingDate(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white px-4 py-3 text-xs sm:text-sm font-medium focus:border-[#9E593B] focus:outline-none"
                >
                  <option>Today (Immediate slot)</option>
                  <option>Tomorrow (Morning / Afternoon)</option>
                  <option>In 2 Days</option>
                  <option>This Saturday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18191B] mb-2">Fitting Window</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white px-4 py-3 text-xs sm:text-sm font-medium focus:border-[#9E593B] focus:outline-none"
                >
                  <option>10:00 AM – 11:30 AM</option>
                  <option>11:30 AM – 01:00 PM</option>
                  <option>02:00 PM – 04:00 PM</option>
                  <option>04:00 PM – 06:30 PM</option>
                </select>
              </div>
            </div>

            {/* Garment Details & Notes */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Garment Brand &amp; Tag Size</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Levi's 501 / Size 32"
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Fit Preference &amp; Special Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Shorten by 3.5cm, keep original chainstitch hem, slight shoe break"
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white p-3 text-xs sm:text-sm focus:border-[#9E593B] focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setStep('studio')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
            >
              <span>Allocate Nearby Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ========================================================
            STEP 5: ALLOCATED PARTNER STUDIO
        ======================================================== */}
        {step === 'studio' && (
          <div className="mt-10 max-w-[780px]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 05 · Studio Allocation
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-normal tracking-[-0.04em] text-[#18191B]">
              Your allocated partner studio.
            </h1>
            <p className="mt-3 text-sm text-[#5A5D64]">
              Based on your area (<strong>{postcode}</strong>) and <strong>{selectedCategory.name}</strong> requirements, we matched you with:
            </p>

            {/* Studio Highlight Card */}
            <div className="mt-8 rounded-2xl border border-[#9E593B] bg-[#F4EFEA] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9E593B] border border-[#DDD6CB]">
                    <MapPin size={13} /> {allocatedStore.distance} ({allocatedStore.area})
                  </span>
                  <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-[#18191B]">
                    {allocatedStore.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#5A5D64]">
                    {allocatedStore.address}, {allocatedStore.postcode}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 rounded-xl border border-[#DDD6CB] self-start">
                  <Star size={15} className="fill-[#9E593B] text-[#9E593B]" />
                  <span>{allocatedStore.rating}</span>
                  <span className="text-xs font-normal text-[#7A7E85]">({allocatedStore.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3 pt-6 border-t border-[#DDD6CB] text-xs">
                <div>
                  <span className="text-[#7A7E85] block">Lead Master Tailor</span>
                  <span className="font-semibold text-[#18191B] mt-0.5 block">{allocatedStore.leadTailor}</span>
                </div>
                <div>
                  <span className="text-[#7A7E85] block">Opening Hours</span>
                  <span className="font-semibold text-[#18191B] mt-0.5 block">{allocatedStore.openingHours}</span>
                </div>
                <div>
                  <span className="text-[#7A7E85] block">Specialist Machines</span>
                  <span className="font-semibold text-[#18191B] mt-0.5 block">{allocatedStore.machines} Industrial Units</span>
                </div>
              </div>

              {/* Interactive Directions Preview */}
              <div className="mt-6 rounded-xl bg-white p-4 border border-[#DDD6CB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5]">
                    <Compass size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#18191B]">Directions &amp; Studio Access Guide</p>
                    <p className="text-[11px] text-[#7A7E85]">3 min walk from Kensington High St tube station</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#9E593B]">SLOT: {timeSlot}</span>
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
            >
              <span>Proceed to Secure Payment</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ========================================================
            STEP 6: SECURE ONLINE PAYMENT
        ======================================================== */}
        {step === 'payment' && (
          <div className="mt-10 max-w-[720px]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 06 · Transparent Checkout
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
                  <span className="text-[10px] uppercase font-bold text-[#9E593B] tracking-wider">TailorGrid Verified Pass</span>
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
                    <p className="text-xs text-[#5A5D64] mt-1">Your 5-star review helps support {allocatedStore.name} and independent tailors.</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E593B]">Step 14 · Rate Experience</span>
                    <h4 className="font-serif text-2xl font-semibold text-[#18191B] mt-1">How was your alteration fit?</h4>
                    <p className="text-xs text-[#5A5D64] mt-1">Rate your experience with {allocatedStore.leadTailor} at {allocatedStore.name}.</p>

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
                Return to TailorGrid Overview
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
