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
  Phone,
  Ruler,
  Scissors,
  Share2,
  Shirt,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Lock,
  LogIn,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { createOrder, fetchOrderById, getCurrentUser, updateOrder } from '@/lib/api'
import { getAuthUser, getStorageCookie, setStorageCookie } from '@/lib/cookies'
import { PARTNER_STORES, getClosestStoreForLocation, getGarmentPhoto, getAllGarmentPhotos, type User } from './data'
import CleanGoogleMap, { openCarNavigation } from './CleanGoogleMap'
import { TrustBar } from './trust-bar'
import { SewingLoader } from './sewing-loader'
import { AuthModal } from './auth-modal'
import { useApp } from './app-provider'

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

function calculateHaversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function OrderDetailsView({ slugId = 'ORD-6154', onGoHome, onGoOrders }: OrderDetailsViewProps) {
  const { stopBookingTransition } = useApp()
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      return getAuthUser<User>()
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
  const [distanceBadge, setDistanceBadge] = useState<string>('0.3 mi • ~5 mins walk')

  // Auto-detect location non-blocking if permission granted
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserCoords({ lat: latitude, lng: longitude })
        },
        () => { },
        { timeout: 6000, maximumAge: 60000 }
      )
    }
  }, [])

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

    async function loadOrderData(isInitial = false) {
      if (isInitial) setIsLoading(true)

      // 1. Check backend API first
      try {
        const fetched = await fetchOrderById(slugId)
        if (isMounted && fetched) {
          setOrder(fetched)
          if (isInitial) {
            setIsLoading(false)
            stopBookingTransition()
          }
          return
        }
      } catch (err) {
        console.warn('Backend order fetch failed:', err)
      }

      // 2. Fallback to storage saved order or latest draft
      if (typeof window !== 'undefined') {
        const saved = getStorageCookie(`tg_order_${slugId}`) || getStorageCookie('tg_latest_order')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (isMounted) {
              setOrder((prev: any) => prev || {
                ...parsed,
                id: slugId || parsed.id || 'ORD-6154',
              })
              if (isInitial) {
                setIsLoading(false)
                stopBookingTransition()
              }
              return
            }
          } catch { }
        }
      }

      // 3. Complete loading
      if (isMounted && isInitial) {
        setIsLoading(false)
        stopBookingTransition()
      }
    }

    loadOrderData(true)

    const interval = setInterval(() => {
      loadOrderData(false)
    }, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
      stopBookingTransition()
    }
  }, [slugId])

  const closestStore = getClosestStoreForLocation(order?.city || order?.storeAddress || order?.postcode)
  const rawOtp = order?.otp || (order?.id ? order.id.replace(/[^0-9]/g, '') : '0000')
  const formattedOtp = rawOtp.slice(0, 4).padEnd(4, '0')
  const storeNameDisplay =
    order?.store?.name ||
    (order?.storeName && order.storeName !== 'Atelier SoHo' && order.storeName !== 'Local Partner Atelier' ? order.storeName : null) ||
    order?.storeName ||
    closestStore?.name ||
    'Local Partner Atelier'

  const storeAddressDisplay =
    order?.store?.address
      ? (order.store.address + (order.store.area && order.store.area !== order.store.address ? `, ${order.store.area}` : ''))
      : (order?.storeAddress || (closestStore ? (closestStore.address + (closestStore.area ? `, ${closestStore.area}` : '')) : 'Local Partner Studio'))

  const storePhoneDisplay = order?.storePhone || order?.store?.phone || closestStore?.phone || '+44 20 7946 0912'
  const storeHoursDisplay = order?.store?.openingHours || closestStore?.openingHours || 'Mon–Sat: 09:00 – 19:00'
  const storeTailorDisplay = order?.store?.leadTailor || closestStore?.leadTailor || 'Master Tailor'
  const cleanStudioBadgeName = storeNameDisplay
  const garmentDisplay = order?.garmentName || order?.garmentId || 'Garment Alteration'
  const serviceDisplay = order?.serviceName || 'Custom Fit & Alteration'

  const destinationCoords =
    (order?.store?.lat && order?.store?.lng)
      ? { lat: Number(order.store.lat), lng: Number(order.store.lng) }
      : (closestStore?.coords || { lat: 19.3705, lng: 72.8228 })
  const storeQuery = encodeURIComponent(`${storeNameDisplay}, ${storeAddressDisplay}`)
  const cleanMapUrl = `https://maps.google.com/maps?q=${storeQuery}&t=m&z=15&ie=UTF8&iwloc=near&output=embed`

  // Calculate real accurate distance and walking/driving ETA
  useEffect(() => {
    let distanceMiles = closestStore?.distanceMiles || 0.3
    if (userCoords && destinationCoords) {
      const computed = calculateHaversineDistanceMiles(
        userCoords.lat,
        userCoords.lng,
        destinationCoords.lat,
        destinationCoords.lng
      )
      if (!isNaN(computed) && computed > 0) {
        distanceMiles = computed
      }
    }

    // Calculate walking time at average speed of ~3.1 mph (19.3 mins per mile)
    const walkMins = Math.max(1, Math.round(distanceMiles * 19.3))
    const walkLabel = walkMins === 1 ? '1 min walk' : `${walkMins} mins walk`
    setDistanceBadge(`${distanceMiles.toFixed(1)} mi • ~${walkLabel}`)
  }, [userCoords, destinationCoords, closestStore])

  const handleCopyPin = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(formattedOtp)
      setPinCopied(true)
      toast.success(`4-Digit PIN (${formattedOtp}) copied to clipboard!`, { position: 'top-center', autoClose: 2000 })
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
        toast.info('Studio location link copied to clipboard!', { position: 'top-center', autoClose: 2500 })
        setTimeout(() => setCopiedToast(false), 2500)
      }
    }
  }

  const handleOpenAppMap = () => {
    openCarNavigation({
      destName: storeNameDisplay,
      destAddress: storeAddressDisplay,
      destCoords: destinationCoords,
      origin: order?.customerAddress || order?.address || order?.city,
      userCoords,
    })
  }

  const handleFetchCurrentLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserCoords({ lat: latitude, lng: longitude })
          const store = getClosestStoreForLocation(`${latitude},${longitude}`)
          if (store) {
            setOrder((prev: any) => ({
              ...prev,
              storeName: store.name,
              storeAddress: store.address + (store.area ? `, ${store.area}` : ''),
              city: store.area || 'Current Spot',
            }))
          }
          setIsLocating(false)
        },
        (err) => {
          console.warn('Geolocation failed:', err)
          setIsLocating(false)
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    }
  }

  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isRebooking, setIsRebooking] = useState(false)

  const handleRebookSameRequest = async () => {
    if (!order) return
    setIsRebooking(true)
    try {
      const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString()

      // Preserve all garment reference photos
      const rawPhotos = order.intakePhotoUrl || order.imageUrl || order.images
      let resolvedImageUrl: string | null = null
      let resolvedImagesArray: string[] = []

      if (rawPhotos) {
        if (Array.isArray(rawPhotos)) {
          resolvedImagesArray = rawPhotos
          resolvedImageUrl = rawPhotos.length > 1 ? JSON.stringify(rawPhotos) : (rawPhotos[0] || null)
        } else if (typeof rawPhotos === 'string') {
          if (rawPhotos.startsWith('[')) {
            try {
              resolvedImagesArray = JSON.parse(rawPhotos)
              resolvedImageUrl = rawPhotos
            } catch {
              resolvedImagesArray = [rawPhotos]
              resolvedImageUrl = rawPhotos
            }
          } else {
            resolvedImagesArray = [rawPhotos]
            resolvedImageUrl = rawPhotos
          }
        }
      }

      const newOrderPayload = {
        id: newOrderId,
        otp: newOtp,
        userId: order.userId || currentUser?.id,
        customerName: order.customerName || currentUser?.name || 'Customer',
        customerEmail: order.customerEmail || currentUser?.email || '',
        customerPhone: order.customerPhone || currentUser?.phone || '',
        postcode: order.postcode || 'W8 4EP',
        garmentId: order.garmentId || 'trousers',
        garmentName: order.garmentName || 'Garment Alteration',
        serviceId: order.serviceId || 'hem',
        serviceName: order.serviceName || 'Custom Fit & Alteration',
        storeId: null,
        storeName: 'Awaiting Studio Acceptance',
        price: order.price || 25,
        date: order.date || 'Scheduled',
        timeSlot: order.timeSlot || 'Fitting Slot',
        measurements: order.measurements || {},
        imageUrl: resolvedImageUrl,
        intakePhotoUrl: resolvedImageUrl,
        images: resolvedImagesArray,
        status: 'Allocated',
        brand: order.brand || 'Levi\'s / Bespoke',
        notes: 'Re-booked fitting request from Atelier Portal',
      }

      if (typeof window !== 'undefined') {
        setStorageCookie(`tg_order_${newOrderId}`, JSON.stringify(newOrderPayload))
        setStorageCookie('tg_latest_order', JSON.stringify(newOrderPayload))
      }

      await createOrder(newOrderPayload)

      toast.success(`Re-submitted fitting request #${newOrderId} to nearby studios!`, { position: 'top-center' })

      if (typeof window !== 'undefined') {
        window.location.href = `/order/${newOrderId}`
      }
    } catch (err) {
      console.error('Rebook failed:', err)
      toast.error('Unable to re-book request. Please try again.')
    } finally {
      setIsRebooking(false)
    }
  }

  const handleCancelCurrentOrder = async () => {
    if (!order?.id) return
    setIsCancelling(true)
    try {
      // 1. Update order status to 'Cancelled' in PostgreSQL database
      await updateOrder(order.id, { status: 'Cancelled' })

      // 2. Update local state & storage records
      setOrder((prev: any) => ({ ...prev, status: 'Cancelled' }))
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`tg_order_${order.id}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            parsed.status = 'Cancelled'
            localStorage.setItem(`tg_order_${order.id}`, JSON.stringify(parsed))
          } catch { }
        }
      }

      toast.success(`Order #${order.id} status updated to Cancelled`, { position: 'top-center' })
    } catch (err) {
      toast.error('Failed to cancel order. Please try again.', { position: 'top-center' })
    } finally {
      setIsCancelling(false)
      setShowCancelModal(false)
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
  }  // Dynamic status mappings
  const currentStatus = (order?.status || 'Accepted').toUpperCase()

  const isCancelled = currentStatus === 'CANCELLED'
  const isAllocated = currentStatus === 'ALLOCATED'
  const isAccepted = currentStatus === 'ACCEPTED'
  const isInProgress = currentStatus === 'WORK IN PROGRESS' || currentStatus === 'IN_PROGRESS' || currentStatus === 'TAILORING'
  const isReady = currentStatus === 'READY' || currentStatus === 'READY_FOR_PICKUP'
  const isCompleted = currentStatus === 'CLOSED' || currentStatus === 'COLLECTED' || currentStatus === 'COMPLETED'

  // Stepper index: 1 = Matched, 2 = Give PIN, 3 = Tailoring, 4 = Pickup/Completed
  let stepIndex = 2
  if (isAllocated) stepIndex = 1
  else if (isAccepted) stepIndex = 2
  else if (isInProgress) stepIndex = 3
  else if (isReady || isCompleted) stepIndex = 4

  // Dynamic Header Text
  let headerTitle = 'Order Accepted'
  let headerSubtitle = `${storeNameDisplay ? `Accepted by ${storeNameDisplay}` : 'Studio accepted'} • Order #${order?.id || slugId}`

  if (isCancelled) {
    headerTitle = 'Order Cancelled'
    headerSubtitle = `This alteration request was cancelled • Order #${order?.id || slugId}`
  } else if (isAllocated) {
    headerTitle = 'Request Broadcast'
    headerSubtitle = `Broadcasting request to nearby studios • Order #${order?.id || slugId}`
  } else if (isInProgress) {
    headerTitle = 'Tailoring in Progress'
    headerSubtitle = `${storeNameDisplay} is crafting your garment • Order #${order?.id || slugId}`
  } else if (isReady) {
    headerTitle = 'Ready for Pickup'
    headerSubtitle = `Alteration completed! Ready for collection at ${storeNameDisplay} • Order #${order?.id || slugId}`
  } else if (isCompleted) {
    headerTitle = 'Order Completed'
    headerSubtitle = `Garment collected from ${storeNameDisplay} • Order #${order?.id || slugId}`
  }

  // Dynamic PIN Box Label
  let pinBoxTitle = 'GIVE PIN TO TAILOR'
  if (pinCopied) {
    pinBoxTitle = 'COPIED!'
  } else if (isInProgress) {
    pinBoxTitle = 'VERIFIED AT BENCH'
  } else if (isReady) {
    pinBoxTitle = 'SHOW PICKUP PIN'
  } else if (isCompleted) {
    pinBoxTitle = 'ORDER COMPLETED'
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
                    {headerTitle}
                  </h1>
                  <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                    {headerSubtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCancelled ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-red-700">
                      Cancelled
                    </span>
                  </div>
                ) : isAllocated ? (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      Awaiting Studio Acceptance
                    </span>
                  </div>
                ) : isInProgress ? (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                    </span>
                    <span className="text-xs font-bold text-blue-900">
                      In Tailoring &bull; Atelier Active
                    </span>
                  </div>
                ) : isReady ? (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
                    </span>
                    <span className="text-xs font-bold text-purple-900">
                      Ready for Pickup
                    </span>
                  </div>
                ) : isCompleted ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    <span className="size-2 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800">
                      ✓ Completed &amp; Collected
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      Accepted &bull; Ready for Drop-off
                    </span>
                  </div>
                )}

                {!isCancelled && !isCompleted && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer active:scale-95 ml-2"
                  >
                    <XCircle size={14} />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>

            {/* Uber-Style Step Tracker */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
              {/* Step 1 */}
              <div className="flex flex-col gap-1.5">
                <div className={`h-1.5 w-full rounded-full ${stepIndex >= 1 ? 'bg-black' : 'bg-gray-200'}`} />
                <span className={`text-[10px] uppercase tracking-wider ${stepIndex >= 1 ? 'font-extrabold text-black' : 'font-semibold text-gray-400'}`}>
                  1. Matched
                </span>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col gap-1.5">
                <div className={`h-1.5 w-full rounded-full ${stepIndex === 2 ? 'bg-black animate-pulse' : stepIndex > 2 ? 'bg-black' : 'bg-gray-200'}`} />
                <span className={`text-[10px] uppercase tracking-wider ${stepIndex >= 2 ? 'font-extrabold text-black' : 'font-semibold text-gray-400'}`}>
                  2. Give PIN
                </span>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col gap-1.5">
                <div className={`h-1.5 w-full rounded-full ${stepIndex === 3 ? 'bg-black animate-pulse' : stepIndex > 3 ? 'bg-black' : 'bg-gray-200'}`} />
                <span className={`text-[10px] uppercase tracking-wider ${stepIndex >= 3 ? 'font-extrabold text-black' : 'font-semibold text-gray-400'}`}>
                  3. Tailoring
                </span>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col gap-1.5">
                <div className={`h-1.5 w-full rounded-full ${stepIndex === 4 ? 'bg-black animate-pulse' : 'bg-gray-200'}`} />
                <span className={`text-[10px] uppercase tracking-wider ${stepIndex >= 4 ? 'font-extrabold text-black' : 'font-semibold text-gray-400'}`}>
                  4. Pickup
                </span>
              </div>
            </div>          </div>

          {/* Notification Alert if Request Not Accepted / Cancelled */}
          {isCancelled && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <XCircle size={22} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-extrabold text-base text-red-950">Fitting Request Not Accepted</h3>
                  <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                    No nearby studio was able to accept your fitting request at this time. Your request has been cancelled and no charges were incurred.
                  </p>
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isRebooking}
                      onClick={handleRebookSameRequest}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0F1115] hover:bg-[#9E593B] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw size={14} className={isRebooking ? 'animate-spin' : ''} />
                      <span>{isRebooking ? 'Re-submitting Request...' : 'Try Booking Again'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { window.location.href = '/book' }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-red-200 px-4 py-2.5 text-xs font-bold text-red-800 hover:bg-red-100 transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Book Different Fitting</span> &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
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

                    {/* Studio Direct Contact Phone & Details */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <a
                        href={`tel:${storePhoneDisplay.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-bold cursor-pointer"
                        title="Click to call studio"
                      >
                        <Phone size={13} className="text-emerald-600" />
                        <span>{storePhoneDisplay}</span>
                      </a>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200/80">
                        🕒 {storeHoursDisplay}
                      </span>
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
                      {pinBoxTitle}
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

                  {(() => {
                    const photos = getAllGarmentPhotos(order)
                    return (
                      <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-200/70">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                          Reference Garment Photo:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {photos.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`${order?.garmentName || 'Garment'} Reference`}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-2xs hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getGarmentPhoto({ ...order, intakePhotoUrl: undefined })
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })()}
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
                    {distanceBadge}
                  </span>
                </div>

                {/* Tailor Studio Map Canvas (Google Maps JS API / Clean Styled) */}
                <div
                  onClick={handleOpenAppMap}
                  className="flex-1 min-h-[280px] rounded-2xl border border-gray-200/90 relative overflow-hidden bg-[#EBE7E0] shadow-inner select-none flex flex-col justify-between group cursor-pointer"
                  title="Click map to start car navigation in your map app"
                >
                  <CleanGoogleMap
                    lat={destinationCoords.lat}
                    lng={destinationCoords.lng}
                    storeName={storeNameDisplay}
                    storeAddress={storeAddressDisplay}
                    origin={order?.customerAddress || order?.address || order?.city}
                    userCoords={userCoords}
                    onMapClick={handleOpenAppMap}
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
              <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-gray-100 mt-auto">
                <a
                  href={`tel:${storePhoneDisplay.replace(/\s+/g, '')}`}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold py-3 px-1.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95 text-center truncate"
                  title="Call Partner Studio"
                >
                  <Phone size={14} />
                  <span className="truncate">Call Studio</span>
                </a>

                <button
                  type="button"
                  onClick={handleShareMap}
                  className="w-full rounded-xl bg-[#F3F3F3] hover:bg-[#E8E8E8] active:bg-[#E0E0E0] border border-gray-300 text-black text-xs font-bold py-3 px-1.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95 truncate"
                >
                  <Share2 size={14} />
                  <span className="truncate">Share Map</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAppMap}
                  className="w-full rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white text-xs font-bold py-3 px-1.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md active:scale-95 truncate"
                  title="Open in Map app"
                >
                  <Navigation size={14} className="fill-white" />
                  <span className="truncate">Open App</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[440px] rounded-3xl border border-red-200 bg-white p-6 shadow-2xl text-center space-y-4 font-sans">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
              <XCircle size={28} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0F1115]">Cancel Alteration Request?</h3>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                Are you sure you want to cancel order <strong className="text-[#0F1115]">#{order?.id || slugId}</strong>?
                This action will remove the request from partner studio fitting queues.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 rounded-full border border-gray-300 text-xs font-bold text-[#0F1115] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelCurrentOrder}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Trust Strip */}
      <TrustBar />
    </div>
  )
}
