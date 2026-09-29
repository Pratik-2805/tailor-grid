'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  Ruler,
  Scissors,
  Share2,
  Shirt,
  Sparkles,
  Lock,
  LogIn,
  RotateCcw,
  XCircle,
  Edit3,
  Plus,
  Loader2,
  FileText,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { createOrder, fetchOrderById, getCurrentUser, updateOrder } from '@/lib/api'
import { getAuthUser, getStorageCookie, setStorageCookie } from '@/lib/cookies'
import { getClosestStoreForLocation, getGarmentPhoto, getAllGarmentPhotos, type User, type StoreOption } from './data'
import CleanGoogleMap, { openCarNavigation, calculateDistanceInMiles } from './CleanGoogleMap'
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

function formatMeasurementKey(key: string): string {
  const map: Record<string, string> = {
    waistHips: 'Waist & Hips',
    hemLine: 'Hem Line',
    hemLength: 'Dress Hem',
    delicateHem: 'Delicate Hem',
    hem: 'Hem',
    waist: 'Waist',
    waistSuppression: 'Waist & Sides Slimming',
    inseam: 'Inseam',
    sleeve: 'Sleeves',
    sleeveLength: 'Sleeves',
    chest: 'Chest',
    chestWaist: 'Chest & Waist',
    shirtLength: 'Shirt Length',
    jacketTorso: 'Jacket Torso',
    trouserInseamWaist: 'Trouser Inseam & Waist',
    riseSeat: 'Rise & Seat',
    bodiceFit: 'Top & Bust Fit',
    strapsShoulders: 'Straps & Shoulders',
    bustBodice: 'Bust & Bodice',
    collarRoll: 'Collar Roll',
    tapering: 'Slim Leg Fit',
    shoulder: 'Shoulder',
    custom: 'Notes & Specs',
    fit: 'Fit Style',
  }
  if (map[key]) return map[key]
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

function parseOrderMeasurements(order?: any): Record<string, string> {
  if (!order) return {}
  const result: Record<string, string> = {}

  if (order.measurements) {
    if (typeof order.measurements === 'object' && !Array.isArray(order.measurements)) {
      Object.entries(order.measurements).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim()) {
          result[k] = String(v).trim()
        }
      })
    } else if (typeof order.measurements === 'string') {
      try {
        const parsed = JSON.parse(order.measurements)
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            if (v !== undefined && v !== null && String(v).trim()) {
              result[k] = String(v).trim()
            }
          })
        }
      } catch { }
    }
  }

  if (Object.keys(result).length === 0 && order.pinnedAdjustment) {
    const raw = String(order.pinnedAdjustment).trim()
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            if (v !== undefined && v !== null && String(v).trim()) {
              result[k] = String(v).trim()
            }
          })
        }
      } catch { }
    } else if (raw.includes('·') || raw.includes(':')) {
      const parts = raw.split('·').map((s: string) => s.trim()).filter(Boolean)
      parts.forEach((p: string) => {
        const colonIdx = p.indexOf(':')
        if (colonIdx !== -1) {
          const k = p.slice(0, colonIdx).trim()
          const v = p.slice(colonIdx + 1).trim()
          if (k && v) result[k] = v
        }
      })
    }
  }

  return result
}

function loadProfileMeasurements(user: any): Record<string, string> | null {
  if (user?.measurements) {
    if (typeof user.measurements === 'object' && !Array.isArray(user.measurements)) {
      return user.measurements
    }
    if (typeof user.measurements === 'string') {
      try {
        const parsed = JSON.parse(user.measurements)
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed
        }
      } catch { }
    }
  }

  if (typeof window === 'undefined') return null
  const candidateKeys = [
    user?.id ? `tg_measurements_${user.id}` : null,
    user?.email ? `tg_measurements_${user.email}` : null,
    user ? `tg_measurements_${user.id || user.email || 'guest'}` : null,
    'tg_measurements_guest',
  ].filter(Boolean) as string[]

  for (const k of candidateKeys) {
    const saved = getStorageCookie(k) || (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed
        }
      } catch { }
    }
  }
  return null
}

function SewStitchDoodlePlayer() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    let animInstance: any = null

    import('lottie-web').then((lottie) => {
      if (!isMounted || !containerRef.current) return
      try {
        animInstance = lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/Sew%20Stitch%20Doodle.json',
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
          },
        })
      } catch (err) {
        console.warn('Lottie load error:', err)
      }
    })

    return () => {
      isMounted = false
      if (animInstance) {
        try {
          animInstance.destroy()
        } catch { }
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full overflow-hidden pointer-events-none" />
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
  const [isPinGenerated, setIsPinGenerated] = useState(false)
  const [isGeneratingPin, setIsGeneratingPin] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceBadge, setDistanceBadge] = useState<string>('0.3 mi • ~5 mins walk')
  const [isEditingMeas, setIsEditingMeas] = useState(false)
  const [editMeasFields, setEditMeasFields] = useState<{ key: string; label: string; value: string }[]>([])
  const [isSavingMeas, setIsSavingMeas] = useState(false)
  const [inProcessDots, setInProcessDots] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isRebooking, setIsRebooking] = useState(false)
  const [userNote, setUserNote] = useState<string>('')
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  // Status mapping derived before hooks
  const currentStatus = (order?.status || 'Allocated').toUpperCase()
  const isCancelled = currentStatus === 'CANCELLED'
  const isAllocated = currentStatus === 'ALLOCATED' || currentStatus === 'SEARCHING' || currentStatus === 'PENDING'
  const isAccepted = currentStatus === 'ACCEPTED'
  const isInProgress = currentStatus === 'WORK IN PROGRESS' || currentStatus === 'IN_PROGRESS' || currentStatus === 'TAILORING' || currentStatus === 'FITTING COMPLETED' || currentStatus === 'CUSTOMER ARRIVED'
  const isReady = currentStatus === 'READY' || currentStatus === 'READY_FOR_PICKUP'
  const isCompleted = currentStatus === 'CLOSED' || currentStatus === 'COLLECTED' || currentStatus === 'COMPLETED'
  const isValidated = Boolean(order?.otpVerified || isInProgress || isReady || isCompleted)

  useEffect(() => {
    // Sequential dots cycle: "" (0) -> "." (1) -> ".." (2) -> "..." (3) -> "" (0)
    const interval = setInterval(() => {
      setInProcessDots((prev) => (prev.length < 3 ? prev + '.' : ''))
    }, 450)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isReady) {
      setIsPinGenerated(false)
    }
  }, [isReady])

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
        if (isMounted) {
          if (fetched) {
            setOrder(fetched)
            if (isInitial) {
              setIsLoading(false)
              stopBookingTransition()
            }
            return
          } else {
            // Order does not exist or was deleted in backend database
            // Invalidate and purge any stale localStorage cache for this slug so it is never shown
            if (typeof window !== 'undefined') {
              try {
                localStorage.removeItem(`tg_order_${slugId}`)
                localStorage.removeItem('tg_latest_order')
              } catch { }
            }
            setOrder(null)
            if (isInitial) {
              setIsLoading(false)
              stopBookingTransition()
            }
            return
          }
        }
      } catch (err) {
        console.warn('Backend order fetch failed:', err)
      }

      // If backend was offline or network error, complete loading as null without showing phantom orders
      if (isMounted && isInitial) {
        setOrder(null)
        setIsLoading(false)
        stopBookingTransition()
      }
    }

    loadOrderData(true)

    const interval = setInterval(() => {
      loadOrderData(false)
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(interval)
      stopBookingTransition()
    }
  }, [slugId])

  // Resolve customer's requested notes from order properties or browser local cache
  useEffect(() => {
    let noteFound = ''

    // 1. Direct order.notes
    if (order?.notes && typeof order.notes === 'string') {
      const t = order.notes.trim()
      if (t && !t.startsWith('{') && !t.startsWith('[') && t !== 'Requested from Atelier Booking Portal') {
        noteFound = t
      }
    }

    // 2. Direct order.fitNotes
    if (!noteFound && order?.fitNotes && typeof order.fitNotes === 'string') {
      const t = order.fitNotes.trim()
      if (t && !t.startsWith('{') && !t.startsWith('[') && t !== 'Requested from Atelier Booking Portal') {
        noteFound = t
      }
    }

    // 3. Direct order.sewingNotes
    if (!noteFound && order?.sewingNotes && typeof order.sewingNotes === 'string' && order.sewingNotes.trim()) {
      noteFound = order.sewingNotes.trim()
    }

    // 4. Browser storage fallbacks
    if (typeof window !== 'undefined') {
      try {
        const idToCheck = order?.id || slugId
        const candidateKeys = [
          idToCheck ? `tg_order_notes_${idToCheck}` : null,
          idToCheck ? `tg_order_notes_${idToCheck.replace(/^#/, '')}` : null,
          slugId ? `tg_order_notes_${slugId}` : null,
          slugId ? `tg_order_notes_${slugId.replace(/^#/, '')}` : null,
          'tg_last_booking_note',
          'tg_booking_notes',
        ].filter(Boolean) as string[]

        for (const k of candidateKeys) {
          const stored = localStorage.getItem(k)
          if (stored && stored.trim() && !stored.trim().startsWith('{')) {
            if (!noteFound) {
              noteFound = stored.trim()
            }
            break
          }
        }
      } catch { }
    }

    setUserNote(noteFound)
    setEditingNoteText(noteFound)
  }, [order, slugId])

  const handleSaveNote = async () => {
    const targetId = order?.id || slugId
    if (!targetId) return
    setIsSavingNote(true)
    const newNote = editingNoteText.trim()
    try {
      await updateOrder(targetId, {
        fitNotes: newNote,
        notes: newNote,
      } as any)
      setUserNote(newNote)
      setOrder((prev: any) => (prev ? { ...prev, notes: newNote, fitNotes: newNote } : prev))
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`tg_order_notes_${targetId}`, newNote)
          localStorage.setItem(`tg_order_notes_${targetId.replace(/^#/, '')}`, newNote)
          localStorage.setItem(`tg_order_notes_${slugId}`, newNote)
          setStorageCookie(`tg_order_notes_${targetId}`, newNote)
        } catch { }
      }
      setIsEditingNote(false)
      toast.success('Fitting notes updated!', { position: 'top-center' })
    } catch (err) {
      console.error('Failed to update note:', err)
      toast.error('Could not save note. Please try again.')
    } finally {
      setIsSavingNote(false)
    }
  }

  const destinationCoords = {
    lat: order?.store?.lat ? Number(order.store.lat) : (order?.store?.coords?.lat || 19.3919),
    lng: order?.store?.lng ? Number(order.store.lng) : (order?.store?.coords?.lng || 72.8397),
  }

  // Calculate real accurate distance and walking/driving ETA to the assigned studio
  useEffect(() => {
    let distanceMiles = 0.4
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
  }, [userCoords, destinationCoords.lat, destinationCoords.lng])

  const formattedOtp = order?.otp ? String(order.otp).trim() : '----'

  const storeNameDisplay =
    order?.store?.name ||
    (order?.storeName && order.storeName !== 'Atelier SoHo' && order.storeName !== 'Local Partner Atelier' ? order.storeName : null) ||
    order?.storeName ||
    (order?.status === 'Allocated' ? 'Awaiting Studio Acceptance' : 'Assigned Partner Studio')

  const storeAddressDisplay =
    order?.store?.address
      ? (order.store.address + (order.store.area && order.store.area !== order.store.address ? `, ${order.store.area}` : ''))
      : (order?.storeAddress || (order?.city ? `Central Atelier Workshop, ${order.city}` : 'Local Partner Studio'))

  const storePhoneDisplay = order?.storePhone || order?.store?.phone || '+44 20 7946 0912'
  const storeHoursDisplay = order?.store?.openingHours || 'Mon–Sat: 09:00 – 19:00'
  const storeTailorDisplay = order?.store?.leadTailor || 'Master Tailor'
  const cleanStudioBadgeName = storeNameDisplay
  const garmentDisplay = order?.garmentName || order?.garmentId || 'Garment Alteration'
  const serviceDisplay = order?.serviceName || 'Custom Fit & Alteration'

  // 1. Customer Coordinates Snapshot (Captured once at order creation)
  const customerCoords = (order?.customerLocation && typeof order.customerLocation.lat === 'number')
    ? order.customerLocation
    : (order?.customerLat && order?.customerLng
      ? { lat: Number(order.customerLat), lng: Number(order.customerLng) }
      : userCoords || { lat: 19.3919, lng: 72.8397 })

  // 2. Tailor Coordinates Snapshot (Historical snapshot at time of assignment)
  let rawTailorCoords = (order?.tailorLocation && typeof order.tailorLocation.lat === 'number')
    ? order.tailorLocation
    : (order?.tailorLat && order?.tailorLng
      ? { lat: Number(order.tailorLat), lng: Number(order.tailorLng) }
      : (order?.store?.lat && order?.store?.lng
        ? { lat: Number(order.store.lat), lng: Number(order.store.lng) }
        : null))

  // If no separate store coordinates exist yet or identical to customer, place the partner workshop at a distinct local atelier offset (~0.35 mi)
  if (
    !rawTailorCoords ||
    (Math.abs(rawTailorCoords.lat - customerCoords.lat) < 0.0005 &&
      Math.abs(rawTailorCoords.lng - customerCoords.lng) < 0.0005)
  ) {
    rawTailorCoords = {
      lat: Number((customerCoords.lat + 0.0042).toFixed(6)),
      lng: Number((customerCoords.lng - 0.0051).toFixed(6)),
    }
  }
  const tailorCoords = rawTailorCoords

  const computedDistance = calculateDistanceInMiles(customerCoords.lat, customerCoords.lng, tailorCoords.lat, tailorCoords.lng)
  const formattedDistance = (computedDistance && !isNaN(computedDistance) && computedDistance > 0) ? computedDistance.toFixed(1) : '0.4'
  const walkMinutes = Math.max(2, Math.round(Number(formattedDistance) * 20))
  const dynamicDistanceBadge = `${formattedDistance} mi • ~${walkMinutes} mins walk`

  const assignedStoreOption: StoreOption = {
    id: order?.storeId || order?.store?.id || 'assigned-studio',
    name: storeNameDisplay,
    area: order?.store?.area || order?.city || '',
    address: storeAddressDisplay,
    postcode: order?.store?.postcode || order?.postcode || '',
    phone: storePhoneDisplay,
    distance: dynamicDistanceBadge,
    distanceMiles: Number(formattedDistance),
    rating: order?.store?.rating || 5.0,
    reviewCount: order?.store?.reviewCount || 120,
    openingHours: storeHoursDisplay,
    dailyCapacity: order?.store?.dailyCapacity || 25,
    machines: order?.store?.machines || 6,
    workers: order?.store?.workers || 4,
    leadTailor: storeTailorDisplay,
    specialties: order?.store?.specialties || ['Custom Alterations', 'Precision Hemming'],
    retailSold: true,
    coords: tailorCoords,
  }

  const handleGeneratePin = async () => {
    if (isPinGenerated) return
    setIsGeneratingPin(true)
    if (!order?.otp && (order?.id || slugId)) {
      try {
        const fresh = await fetchOrderById(order?.id || slugId)
        if (fresh && fresh.otp) {
          setOrder(fresh)
        }
      } catch { }
    }
    setTimeout(() => {
      setIsGeneratingPin(false)
      setIsPinGenerated(true)
      toast.success('4-Digit PIN revealed successfully!', { position: 'top-center', autoClose: 2000 })
    }, 450)
  }

  const handleSaveCustomerMeasurements = async () => {
    if (!order?.id) return
    setIsSavingMeas(true)
    const measurementsMap: Record<string, string> = {}
    editMeasFields.forEach((f) => {
      if (f.value && f.value.trim()) {
        measurementsMap[f.key] = f.value.trim()
      }
    })

    const combinedSpecs = Object.entries(measurementsMap)
      .map(([k, v]) => `${formatMeasurementKey(k)}: ${v}`)
      .join(' · ')

    const updates = {
      pinnedAdjustment: combinedSpecs || 'Standard customer fit',
      measurements: measurementsMap,
    }

    try {
      await updateOrder(order.id, updates)
      setOrder((prev: any) => ({ ...prev, ...updates }))
      setIsEditingMeas(false)
      toast.success('Measurements updated successfully!', { position: 'top-center', autoClose: 2000 })
    } catch {
      toast.error('Failed to update measurements.', { position: 'top-center' })
    } finally {
      setIsSavingMeas(false)
    }
  }

  const handleShareMap = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href
      if (navigator.share) {
        navigator.share({
          title: `Fitting Appointment: ${storeNameDisplay}`,
          text: isCompleted
            ? `My garment alteration at ${storeNameDisplay} is complete!`
            : `Here are my fitting drop-off details at ${storeNameDisplay} (${storeAddressDisplay}). PIN: ${formattedOtp}`,
          url: shareUrl,
        }).catch(() => { })
      } else {
        navigator.clipboard.writeText(shareUrl)
        setCopiedToast(true)
        toast.success('Live Tracking link copied!', { position: 'top-center', autoClose: 2000 })
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
          setIsLocating(false)
          toast.info('Updated distance to your assigned tailor studio', { position: 'top-center', autoClose: 2000 })
        },
        (err) => {
          console.warn('Geolocation failed:', err)
          setIsLocating(false)
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    }
  }

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
      await updateOrder(order.id, { status: 'Cancelled' })
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

  const isPickupOtpActive = Boolean(order?.otp && order.otp.trim() !== '')

  // ALL HOOKS HAVE COMPLETED. CONDITIONAL RETURNS ARE NOW 100% SAFE.
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

  if (isLoading && !order) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-6 bg-[#FAF8F5]">
        <SewingLoader
          active={true}
          persistent={true}
          title="Loading"
        />
      </div>
    )
  }

  if (!isLoading && !order) {
    return (
      <div className="bg-[#F6F6F6] min-h-[calc(100vh-68px)] flex flex-col justify-between select-none font-sans">
        <div className="flex-1 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 w-full max-w-[1280px] mx-auto flex flex-col">
          {/* Navigation Breadcrumb */}
          <div className="mb-4 sm:mb-5 lg:-ml-10 xl:-ml-16 2xl:-ml-24 transition-all">
            <button
              type="button"
              onClick={onGoOrders || onGoHome || (() => { window.location.href = '/orders' })}
              className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center text-[#18191B] group-hover:bg-[#18191B] group-hover:text-white transition-all">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-bold text-[#18191B]">Order Details</span>
            </button>
          </div>

          {/* Centered Order Not Found Card */}
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center max-w-lg mx-auto">
            <div className="size-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5 shadow-xs border border-amber-200/60">
              <XCircle size={32} />
            </div>
            <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-white border border-gray-200 text-xs font-mono font-bold text-gray-700 shadow-2xs">
              #{slugId}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1115] tracking-tight">
              Order Not Found
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5A5D64] leading-relaxed max-w-md">
              This alteration order does not exist or has been removed from the database.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onGoOrders || (() => { window.location.href = '/orders' })}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0F1115] text-white text-sm font-bold shadow-md hover:bg-[#9E593B] transition-all cursor-pointer"
              >
                <span>View All Orders</span>
              </button>
              <button
                onClick={() => { window.location.href = '/book' }}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D5CEB9] bg-white text-[#0F1115] text-sm font-bold hover:bg-[#F4EFEA] transition-colors cursor-pointer shadow-2xs"
              >
                Book New Fitting
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isInProgress && !isReady && !isCompleted && !isCancelled) {
    return (
      <div className="bg-[#F6F6F6] min-h-[calc(100vh-68px)] flex flex-col justify-between select-none font-sans">
        <div className="flex-1 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 w-full max-w-[1280px] mx-auto flex flex-col">
          {/* Navigation Breadcrumb */}
          <div className="mb-4 sm:mb-5 lg:-ml-10 xl:-ml-16 2xl:-ml-24 transition-all">
            <button
              type="button"
              onClick={onGoOrders || onGoHome || (() => { window.location.href = '/orders' })}
              className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center text-[#18191B] group-hover:bg-[#18191B] group-hover:text-white transition-all">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-bold text-[#18191B]">Order Details</span>
            </button>
          </div>

          {/* Truly Centered Content */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-8 -mt-6 sm:-mt-10 text-center animate-in zoom-in-95 duration-200">
            <div className="size-52 sm:size-64 flex items-center justify-center pointer-events-none mb-2">
              <SewStitchDoodlePlayer />
            </div>

            <div className="space-y-2 max-w-[540px]">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115]">
                <span>Your alteration is in process</span>
                <span className="inline-block w-6 text-left font-mono font-extrabold text-[#0F1115]">{inProcessDots}</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium">
                {storeNameDisplay} is crafting your {garmentDisplay.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F6F6F6] min-h-[calc(100vh-68px)] flex flex-col justify-between select-none font-sans">
      <div className="flex-1 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 w-full max-w-[1280px] mx-auto flex flex-col">
        {/* Navigation Breadcrumb / Header in left whitespace */}
        <div className="mb-4 sm:mb-5 lg:-ml-10 xl:-ml-16 2xl:-ml-24 transition-all">
          <button
            type="button"
            onClick={onGoOrders || onGoHome || (() => { window.location.href = '/orders' })}
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center text-[#18191B] group-hover:bg-[#18191B] group-hover:text-white transition-all">
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-bold text-[#18191B]">Order Details</span>
          </button>
        </div>


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
        {/* UBER-STYLE 2-COLUMN MAIN CONTENT GRID */}
        {/* ========================================================================= */}
        <div className="grid lg:grid-cols-12 gap-5 items-stretch">

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: Order Status, Atelier Info, High-Visibility PIN, Work & Meas */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between h-full">

            <div>
              {/* 1. Integrated Order ID & Cancel Button */}
              <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block mb-0.5">
                    Order ID
                  </span>
                  <span className="text-xs sm:text-[13px] font-mono font-bold text-[#0F1115] tracking-wide block">
                    #{order?.id || slugId}
                  </span>
                </div>

                {!isCancelled && !isValidated && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {/* 2. Matched Studio Info & PIN Box */}
              <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100">

                {/* Store Info */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1115] truncate leading-tight tracking-tight">
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

                {/* Top-Right Area: Completed / Cancelled / Reveal PIN / Revealed PIN */}
                {isCancelled ? (
                  <div className="shrink-0 bg-red-950/80 text-white border border-red-800/60 rounded-2xl px-4 py-2.5 text-center shadow-md min-w-[155px]">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="size-2 rounded-full bg-red-500" />
                      <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-red-400">
                        Cancelled
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-white mt-1">
                      <XCircle size={13} className="text-red-400" />
                      <span>Order Cancelled</span>
                    </div>
                    <span className="text-[10px] text-red-300/80 block mt-1 font-medium">
                      No PIN Required
                    </span>
                  </div>
                ) : isCompleted ? (
                  <div className="shrink-0 bg-[#0F1115] text-white border border-[#2D3139] rounded-2xl px-4 py-2.5 text-center shadow-md min-w-[155px]">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-emerald-400">
                        Order Completed
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-white mt-1">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Garment Collected</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1 font-medium">
                      ✓ Fulfilled &bull; Closed
                    </span>
                  </div>
                ) : !isPinGenerated ? (
                  <button
                    type="button"
                    onClick={handleGeneratePin}
                    disabled={isGeneratingPin}
                    className="shrink-0 bg-black text-white hover:bg-neutral-800 active:scale-95 border border-black rounded-2xl w-[155px] h-[58px] text-center shadow-md transition-all cursor-pointer flex items-center justify-center font-bold text-xs sm:text-sm tracking-wide group"
                  >
                    {isGeneratingPin ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={15} className="animate-spin text-white" />
                        <span>Revealing...</span>
                      </div>
                    ) : (
                      <span>Reveal PIN</span>
                    )}
                  </button>
                ) : (
                  <div
                    className="shrink-0 bg-black text-white border border-black rounded-2xl w-[155px] h-[58px] text-center shadow-md flex items-center justify-center animate-in zoom-in-95 duration-150"
                  >
                    <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-[0.25em] leading-none block">
                      {formattedOtp}
                    </span>
                  </div>
                )}

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

              {/* Lower Section: Garment Notes & Photos */}
              <div className="pt-4 space-y-3">

                {/* Fitting & Alteration Notes Card */}
                <div className="bg-[#F8F8F8] rounded-xl p-3.5 border border-gray-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0">
                        <FileText size={11} className="text-white" />
                      </div>
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-500">
                        Fitting &amp; Alteration Notes
                      </span>
                    </div>

                    {!isEditingNote && !isCompleted && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteText(userNote)
                          setIsEditingNote(true)
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 hover:text-black py-0.5 px-2 rounded-md hover:bg-neutral-200/60 transition-colors cursor-pointer"
                      >
                        <Edit3 size={11} />
                        <span>{userNote ? 'Edit' : 'Add Note'}</span>
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        placeholder="Add any specific fitting notes, style preferences, or alteration instructions for the tailor..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-black text-xs font-semibold text-black placeholder:text-gray-400 outline-none transition-all resize-none shadow-2xs"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteText(userNote)
                            setIsEditingNote(false)
                          }}
                          disabled={isSavingNote}
                          className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:text-black rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNote}
                          disabled={isSavingNote}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingNote ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Check size={12} />
                              <span>Save Note</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : userNote ? (
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-[#0F1115] leading-relaxed break-words whitespace-pre-wrap">
                      {userNote}
                    </p>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-gray-400 italic">
                        No special notes added while requesting.
                      </p>
                      {!isCompleted && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteText('')
                            setIsEditingNote(true)
                          }}
                          className="text-xs font-bold text-[#9E593B] hover:underline cursor-pointer"
                        >
                          + Add instructions
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {(() => {
                  const photos = getAllGarmentPhotos(order)
                  if (!photos || photos.length === 0) return null

                  return (
                    <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-200/70">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                        Reference Garment Photo{photos.length > 1 ? 's' : ''}:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {photos.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`${order?.garmentName || 'Garment'} Reference ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-2xs hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

            </div>

            {/* Note Strip */}
            {!isCompleted && !isCancelled && (
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-medium text-gray-500">
                <span className="text-gray-600">
                  <strong className="text-black font-bold">NOTE:</strong> {isReady ? 'Give this PIN to the tailor for collecting your completed garment.' : 'Give this PIN to the tailor for confirming the order.'}
                </span>
                <span className="font-bold text-black">Darzi</span>
              </div>
            )}

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
                  {dynamicDistanceBadge}
                </span>
              </div>

              {/* Tailor Studio Map Canvas (Google Maps JS API / Clean Styled) */}
              <div
                onClick={handleOpenAppMap}
                className="flex-1 min-h-[320px] sm:min-h-[360px] rounded-2xl border border-gray-200/90 relative overflow-hidden bg-[#EBE7E0] shadow-inner select-none flex flex-col justify-between group cursor-pointer"
                title="Click map to start car navigation in your map app"
              >
                <CleanGoogleMap
                  lat={customerCoords.lat}
                  lng={customerCoords.lng}
                  storeName={storeNameDisplay}
                  storeAddress={storeAddressDisplay}
                  origin={order?.customerAddress || order?.address || order?.city}
                  userCoords={customerCoords}
                  stores={[{
                    ...assignedStoreOption,
                    coords: tailorCoords,
                  }]}
                  selectedStoreId={assignedStoreOption.id}
                  showRadiusCircle={false}
                  showCurvedConnection={true}
                  isLocationSaved={true}
                  isLiveLocation={false}
                  showUserPin={true}
                  disableNavigation={true}
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
