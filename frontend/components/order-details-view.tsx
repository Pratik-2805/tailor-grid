'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  Navigation,
  Ruler,
  Scissors,
  Share2,
  Shirt,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Lock,
  LogIn,
} from 'lucide-react'
import { fetchOrderById, getCurrentUser } from '@/lib/api'
import { PARTNER_STORES, getClosestStoreForLocation, type User } from './data'
import CleanGoogleMap from './CleanGoogleMap'
import { TrustBar } from './trust-bar'
import { SewingLoader } from './sewing-loader'
import { AuthModal } from './auth-modal'

function GarmentCategoryIcon({ categoryId, className = "size-4" }: { categoryId?: string; className?: string }) {
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
    case 'suits':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3h16v18H4zM12 3v18M8 8l4 4 4-4" />
        </svg>
      )
    default:
      return <Sparkles className={className} />
  }
}

interface OrderDetailsViewProps {
  slugId?: string
  onGoHome?: () => void
  onGoOrders?: () => void
}

export function OrderDetailsView({ slugId = 'ORD-6154', onGoHome, onGoOrders }: OrderDetailsViewProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tg_token')
      const stored = localStorage.getItem('tg_user')
      if (token && stored) {
        try {
          return JSON.parse(stored)
        } catch {}
      }
    }
    return null
  })
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedToast, setCopiedToast] = useState(false)
  const [pinCopied, setPinCopied] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    let isMounted = true
    getCurrentUser().then((u) => {
      if (isMounted) {
        setCurrentUser(u)
        setAuthChecked(true)
        if (!u) {
          setIsAuthOpen(true)
        }
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadOrderData() {
      setIsLoading(true)

      // 1. Check backend API first
      try {
        const fetched = await fetchOrderById(slugId)
        if (isMounted && fetched) {
          setOrder(fetched)
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.warn('Backend order fetch failed:', err)
      }

      // 2. Fallback to localStorage saved order or latest draft
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`tg_order_${slugId}`) || localStorage.getItem('tg_latest_order')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (isMounted) {
              setOrder({
                ...parsed,
                id: slugId || parsed.id || 'ORD-6154',
              })
              setIsLoading(false)
              return
            }
          } catch { }
        }
      }

      // 3. Fallback mock order if not found
      if (isMounted) {
        const defaultStore = getClosestStoreForLocation()
        setOrder({
          id: slugId || 'ORD-6154',
          otp: slugId.replace(/[^0-9]/g, '') || '6154',
          customerName: 'Gaurav Rai',
          storeName: defaultStore.name,
          storeAddress: defaultStore.address + (defaultStore.area ? `, ${defaultStore.area}` : ''),
          garmentId: 'trousers',
          garmentName: 'Trousers & Jeans',
          serviceName: 'Shorten Hem (Plain)',
          measurements: {
            inseam: '30 in',
            waist: '32 in',
          },
          notes: 'Shorten length with clean finish, slight shoe break',
        })
        setIsLoading(false)
      }
    }

    loadOrderData()

    return () => {
      isMounted = false
    }
  }, [slugId])

  const closestStore = getClosestStoreForLocation(order?.city || order?.storeAddress || order?.postcode)
  const rawOtp = order?.otp || (order?.id ? order.id.replace(/[^0-9]/g, '') : '6154')
  const formattedOtp = rawOtp.slice(0, 4).padEnd(4, '0')
  const storeNameDisplay = (order?.storeName && !order.storeName.includes('Atelier SoHo') ? order.storeName : closestStore.name)
  const storeAddressDisplay = (order?.storeAddress && !order.storeAddress.includes('480 Broadway') ? order.storeAddress : closestStore.address)
  const cleanStudioBadgeName = storeNameDisplay
  const garmentDisplay = order?.garmentName || order?.garmentId || 'Trousers & Jeans'
  const serviceDisplay = order?.serviceName || 'Shorten Hem (Plain)'

  const destinationCoords = closestStore?.coords || { lat: 19.3705, lng: 72.8228 }
  const storeQuery = encodeURIComponent(`${storeNameDisplay}, ${storeAddressDisplay}`)
  const cleanMapUrl = `https://maps.google.com/maps?q=${storeQuery}&t=m&z=15&ie=UTF8&iwloc=near&output=embed`

  const handleCopyPin = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(formattedOtp)
      setPinCopied(true)
      setTimeout(() => setPinCopied(false), 2000)
    }
  }

  const handleShareMap = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href
      if (navigator.share) {
        navigator.share({
          title: `Darzi Order #${order?.id || slugId}`,
          text: `Tailor Studio Location: ${storeNameDisplay} - ${storeAddressDisplay}`,
          url: shareUrl,
        }).catch(() => { })
      } else {
        navigator.clipboard.writeText(shareUrl)
        setCopiedToast(true)
        setTimeout(() => setCopiedToast(false), 2500)
      }
    }
  }

  const handleOpenAppMap = () => {
    const query = encodeURIComponent(`${storeNameDisplay}, ${storeAddressDisplay}`)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
    if (typeof window !== 'undefined') {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleFetchCurrentLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserCoords({ lat: latitude, lng: longitude })
          const closestStore = getClosestStoreForLocation(`${latitude},${longitude}`) || PARTNER_STORES[0]

          setOrder((prev: any) => ({
            ...prev,
            storeName: closestStore.name,
            storeAddress: closestStore.address + (closestStore.area ? `, ${closestStore.area}` : ''),
            city: closestStore.area || 'Current Spot',
          }))
          setIsLocating(false)
        },
        (err) => {
          console.warn('Geolocation failed:', err)
          setIsLocating(false)
          const closestStore = getClosestStoreForLocation('vasai')
          setOrder((prev: any) => ({
            ...prev,
            storeName: closestStore.name,
            storeAddress: closestStore.address + (closestStore.area ? `, ${closestStore.area}` : ''),
          }))
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    }
  }

  if (authChecked && !currentUser) {
    return (
      <div className="bg-[#FAF8F5] min-h-[calc(100vh-68px)] flex flex-col justify-center items-center px-4 py-16 text-center max-w-lg mx-auto select-none font-sans">
        <div className="size-16 rounded-3xl bg-[#9E593B]/10 text-[#9E593B] flex items-center justify-center mb-6 shadow-sm">
          <Lock size={30} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F1115] tracking-tight">
          Authentication Required
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#5A5D64] leading-relaxed">
          Please sign in to your account to view your confirmed order pass and tracking details.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0F1115] text-white text-sm font-bold shadow-md hover:bg-[#9E593B] transition-all"
          >
            <LogIn size={16} />
            <span>Sign In to Continue</span>
          </button>
          <button
            onClick={onGoHome || (() => { window.location.href = '/' })}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D5CEB9] text-[#0F1115] text-sm font-bold hover:bg-[#F4EFEA] transition-colors"
          >
            Return to Home
          </button>
        </div>
        <AuthModal
          isOpen={isAuthOpen}
          targetRole="CUSTOMER"
          authType="signin"
          onClose={() => {
            setIsAuthOpen(false)
            if (!currentUser) {
              if (onGoHome) onGoHome()
              else window.location.href = '/'
            }
          }}
          onSuccess={(u) => {
            setCurrentUser(u)
            setIsAuthOpen(false)
          }}
        />
      </div>
    )
  }

  if (isLoading) {
    return <SewingLoader active={true} onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="bg-[#F6F6F6] min-h-[calc(100vh-68px)] flex flex-col justify-between select-none font-sans">
      <div className="flex-1 py-6 sm:py-10 px-3 sm:px-6 flex flex-col justify-center items-center">
        <div className="max-w-[1040px] w-full mx-auto">

        {/* ========================================================================= */}
        {/* 1. UBER-STYLE HEADER & PROGRESS TIMELINE */}
        {/* ========================================================================= */}
        <div className="mb-6 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">

          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onGoHome || (() => { window.location.href = '/' })}
                className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-black hover:text-white border border-gray-200 text-black flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Back to Home"
              >
                <ArrowLeft size={16} />
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1115] tracking-tight leading-none">
                  Order Confirmed
                </h1>
                <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                  Studio allocated &bull; Order #{order?.id || slugId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-800">
                Ready for Drop-off
              </span>
            </div>
          </div>

          {/* Uber-Style Step Tracker */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            {/* Step 1 */}
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full bg-black rounded-full" />
              <span className="text-[10px] font-extrabold text-black uppercase tracking-wider">
                1. Matched
              </span>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full bg-black rounded-full animate-pulse" />
              <span className="text-[10px] font-extrabold text-black uppercase tracking-wider">
                2. Give PIN
              </span>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full bg-gray-200 rounded-full" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                3. Tailoring
              </span>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full bg-gray-200 rounded-full" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                4. Pickup
              </span>
            </div>
          </div>

        </div>        {/* ========================================================================= */}
        {/* 2. UBER-STYLE 2-COLUMN MAIN CONTENT GRID */}
        {/* ========================================================================= */}
        <div className="grid lg:grid-cols-12 gap-5 items-stretch">

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: Atelier Info, High-Visibility PIN Badge, Work & Measurements */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between h-full">

            <div>
              {/* Top Row: Store Name & Location vs Uber-Style Black PIN Box */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">

                {/* Store Info */}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block mb-1">
                    Matched Studio
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F1115] truncate leading-tight">
                    {storeNameDisplay}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-gray-600">
                    <MapPin size={14} className="text-[#9E593B] shrink-0" />
                    <span className="truncate">{storeAddressDisplay}</span>
                  </div>
                </div>

                {/* Uber-Style Black High-Visibility PIN Badge */}
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="shrink-0 bg-black text-white hover:bg-neutral-900 border border-black rounded-2xl px-4 py-2.5 text-center shadow-md transition-transform active:scale-95 cursor-pointer group"
                  title="Click to copy PIN"
                >
                  <span className="block text-[9px] font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                    {pinCopied ? 'COPIED!' : 'GIVE PIN TO TAILOR'}
                  </span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-[0.25em] leading-none mt-1 block">
                    {formattedOtp}
                  </span>
                </button>

              </div>

              {/* Middle Row: Itemized Work & Garment Cards (Uber Clean) */}
              <div className="grid grid-cols-2 gap-3 py-4 border-b border-gray-100">

                {/* Cloth Type */}
                <div className="bg-[#F8F8F8] rounded-xl p-3.5 border border-gray-200/80">
                  <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    Garment / Cloth Type
                  </span>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#0F1115]">
                    <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center shrink-0">
                      <GarmentCategoryIcon categoryId={order?.garmentId} className="size-3.5 text-white" />
                    </div>
                    <span className="truncate">{garmentDisplay}</span>
                  </div>
                </div>

                {/* Your Work */}
                <div className="bg-[#F8F8F8] rounded-xl p-3.5 border border-gray-200/80">
                  <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    Requested Alteration
                  </span>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#0F1115]">
                    <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center shrink-0">
                      <Ruler size={13} className="text-white" />
                    </div>
                    <span className="truncate">{serviceDisplay}</span>
                  </div>
                </div>

              </div>

              {/* Lower Section: Measurements Spec */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Scissors size={14} className="text-[#9E593B]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F1115]">
                      Your Measurements:
                    </span>
                  </div>
                </div>

                {order?.measurements && Object.keys(order.measurements).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(order.measurements).map(([key, val]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F8F8] border border-gray-200/90 text-xs font-bold text-black"
                      >
                        <span className="capitalize text-gray-500 font-semibold">{key}:</span>
                        <span>{String(val)}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 flex items-center gap-2.5">
                    <Scissors size={14} className="text-amber-700 shrink-0" />
                    <p className="text-xs text-amber-900 font-medium">
                      In-Studio Precision Pinning &bull; Tailor will measure your fit upon drop-off.
                    </p>
                  </div>
                )}

                {order?.notes && (
                  <p className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200/70 font-medium">
                    <span className="font-bold text-black">Tailoring Notes:</span> {order.notes}
                  </p>
                )}
              </div>

            </div>

            {/* Quality Guarantee Strip */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Perfect Fit Guarantee &bull; Insured Work</span>
              </span>
              <span className="font-bold text-black">Darzi</span>
            </div>

          </div>

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: Real Interactive Google Map & Action Buttons */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between h-full">

            <div className="flex-1 flex flex-col">
              {/* Map Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Navigation size={15} className="text-black fill-black" />
                  <span className="text-xs font-extrabold text-[#0F1115] uppercase tracking-wider">
                    Studio Map &amp; Route
                  </span>
                </div>
                <span className="text-[11px] font-extrabold bg-[#F3F3F3] text-black px-2.5 py-1 rounded-full border border-gray-200">
                  0.8 mi &bull; ~5 mins walk
                </span>
              </div>

              {/* Tailor Studio Map Canvas (Google Maps JS API / Clean Styled) */}
              <div
                onClick={handleOpenAppMap}
                className="flex-1 min-h-[280px] rounded-2xl border border-gray-200/90 relative overflow-hidden bg-[#EBE7E0] shadow-inner select-none flex flex-col justify-between group cursor-pointer"
                title="Click map to open in Google Maps"
              >
                <CleanGoogleMap
                  lat={destinationCoords.lat}
                  lng={destinationCoords.lng}
                  storeName={storeNameDisplay}
                  storeAddress={storeAddressDisplay}
                />

                {/* Floating Blue GPS Target Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFetchCurrentLocation()
                  }}
                  disabled={isLocating}
                  className="absolute bottom-4 right-4 z-30 size-11 rounded-2xl bg-[#0066FF] hover:bg-[#0052CC] active:scale-90 text-white shadow-xl flex items-center justify-center transition-all border border-white/30 cursor-pointer group/btn"
                  title="Find nearest studio to my location"
                >
                  <Navigation size={18} className={`fill-white ${isLocating ? 'animate-spin text-amber-300' : 'group-hover/btn:scale-110'} transition-transform`} />
                </button>

                {/* Copy Toast Alert */}
                {copiedToast && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 animate-in fade-in zoom-in pointer-events-none">
                    <Check size={13} className="text-emerald-400" />
                    <span>Tracking link copied to clipboard!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Uber-Style Action Buttons Row */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-3 border-t border-gray-100 mt-auto">
              <button
                type="button"
                onClick={handleShareMap}
                className="w-full rounded-xl bg-[#F3F3F3] hover:bg-[#E8E8E8] active:bg-[#E0E0E0] border border-gray-300 text-black text-xs font-bold py-3 px-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
              >
                <Share2 size={15} />
                <span>Share Map</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAppMap}
                className="w-full rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white text-xs font-bold py-3 px-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Navigation size={15} className="fill-white" />
                <span>Open in App</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    {/* Fixed Bottom Trust Strip */}
    <TrustBar />
  </div>
)
}
