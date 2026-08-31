'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  LogOut,
  MapPin,
  Package,
  Phone,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Ruler,
  Scissors,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react'
import { type FittingBooking, type OrderStatus, type Screen, type User as UserType } from './data'
import { fetchStudioOrders, updateOrder } from '@/lib/api'

type StudioTab = 'intake' | 'pipeline' | 'capacity' | 'payouts'

interface BroadcastRequest {
  id: string
  customerName: string
  customerArea: string
  distanceMiles: number
  garmentName: string
  serviceName: string
  fittingType: 'PRE_PINNED' | 'NEED_STUDIO_FITTING'
  garmentBrand?: string
  fitNotes: string
  partnerPayout: number
  slaHours: number
  imageUrl: string
  otp: string
  isRealCustomerOrder?: boolean
  realOrder?: FittingBooking
}

const GARMENT_FALLBACK_IMAGES: Record<string, string> = {
  trousers: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
  suits: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
  jackets: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
  dresses: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
  denim: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=80',
  shirts: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  coats: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&auto=format&fit=crop&q=80',
}

function getGarmentPhoto(order?: Partial<FittingBooking> | null): string {
  if (order?.intakePhotoUrl && order.intakePhotoUrl.startsWith('http')) return order.intakePhotoUrl
  const gid = order?.garmentId?.toLowerCase() || ''
  const gname = order?.garmentName?.toLowerCase() || ''
  if (gid.includes('dress') || gname.includes('dress') || gname.includes('gown')) return GARMENT_FALLBACK_IMAGES.dresses
  if (gid.includes('denim') || gname.includes('denim') || gname.includes('jean')) return GARMENT_FALLBACK_IMAGES.denim
  if (gid.includes('suit') || gname.includes('suit') || gname.includes('blazer') || gname.includes('jacket'))
    return GARMENT_FALLBACK_IMAGES.suits
  if (gid.includes('shirt') || gname.includes('shirt')) return GARMENT_FALLBACK_IMAGES.shirts
  if (gid.includes('coat') || gname.includes('coat')) return GARMENT_FALLBACK_IMAGES.coats
  return GARMENT_FALLBACK_IMAGES.trousers
}

const INITIAL_BROADCASTS: BroadcastRequest[] = [
  {
    id: 'TG-BC-904',
    customerName: 'Alexander Vance',
    customerArea: 'SoHo · 0.6 mi away (5 min walk)',
    distanceMiles: 0.6,
    garmentName: 'Bespoke 2-Piece Suit',
    serviceName: 'Waist Suppression & Trouser Hemming',
    fittingType: 'NEED_STUDIO_FITTING',
    garmentBrand: 'Tom Ford Virgin Wool',
    fitNotes: 'Customer requested in-store tailor pinning at counter. Right shoulder slope adjustment needed.',
    partnerPayout: 95,
    slaHours: 48,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    otp: '5521',
  },
  {
    id: 'TG-BC-812',
    customerName: 'Maya Lin',
    customerArea: 'Kensington · 1.1 mi away',
    distanceMiles: 1.1,
    garmentName: 'Silk Slip Evening Gown',
    serviceName: 'Shorten Straps & Micro-Rolled Hem',
    fittingType: 'NEED_STUDIO_FITTING',
    garmentBrand: 'Reformation Silk Chiffon',
    fitNotes: 'Customer bringing 3-inch slingback heels to shop for accurate floor-level hem pinning.',
    partnerPayout: 52,
    slaHours: 24,
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
    otp: '3194',
  },
  {
    id: 'TG-BC-731',
    customerName: 'David Kim',
    customerArea: 'Chelsea · 0.8 mi away',
    distanceMiles: 0.8,
    garmentName: 'Raw Selvedge Denim',
    serviceName: 'Original Chainstitch Hemming',
    fittingType: 'PRE_PINNED',
    garmentBrand: 'Iron Heart 21oz Denim',
    fitNotes: 'Pre-pinned at 31 in inseam with safety pins. Requesting heavy gold Union Special thread.',
    partnerPayout: 35,
    slaHours: 24,
    imageUrl: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=80',
    otp: '8823',
  },
]

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Allocated: { label: 'New Job', bg: 'bg-amber-50', text: 'text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Accepted: { label: 'Drop-Off Pending', bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Customer Arrived': { label: 'At Counter', bg: 'bg-indigo-50', text: 'text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Fitting Completed': { label: 'Tagged', bg: 'bg-purple-50', text: 'text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Work in Progress': { label: 'In Progress', bg: 'bg-sky-50', text: 'text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  Ready: { label: 'Ready for Pickup', bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Collected: { label: 'Picked Up', bg: 'bg-teal-50', text: 'text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  Closed: { label: 'Completed', bg: 'bg-stone-50', text: 'text-stone-600 border-stone-200', dot: 'bg-stone-400' },
}

const INITIAL_ORDERS: FittingBooking[] = [
  {
    id: 'TG-849201',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '+1 (917) 555-0077',
    postcode: 'NY 10001',
    garmentId: 'trousers',
    garmentName: 'Trousers & Jeans',
    serviceId: 'hem-plain',
    serviceName: 'Shorten Hem (Blind Stitch)',
    storeId: 'atelier-soho',
    storeName: 'Atelier SoHo',
    date: 'Today',
    timeSlot: '2:00 PM – 2:30 PM',
    garmentBrand: 'Reiss Slim-Fit Wool',
    fittingType: 'PRE_PINNED',
    fitNotes: 'Maintain original blind hem stitch with navy thread. 0.5 in cuff reserve.',
    pinnedAdjustment: 'Shorten hem 3.5 cm (1.4 in)',
    measurements: {
      hem: 'Shorten 3.5 cm',
      inseam: '30.5 in finished',
    },
    sewingNotes: 'Blind stitch lock, tone-on-tone navy thread #80.',
    hangTagNo: 'Tag #14 · Rack A',
    status: 'Work in Progress',
    price: 38,
    partnerPayout: 28,
    otp: '4829',
    slaHours: 48,
    slaStartedAt: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
    assignedWorker: 'Marco Rossi',
    machineNo: 'Machine #1 — Juki DDL-8700',
    fabricConditionNotes: 'Clean wool blend, original fabric intact. No blemishes.',
    intakePhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TG-938210',
    customerName: 'James Montgomery',
    customerEmail: 'j.montgomery@example.com',
    customerPhone: '+1 (212) 555-0222',
    postcode: 'NY 10010',
    garmentId: 'jackets',
    garmentName: 'Suits & Blazers',
    serviceId: 'shorten-sleeves',
    serviceName: 'Shorten Sleeves (Working Cuff)',
    storeId: 'atelier-soho',
    storeName: 'Atelier SoHo',
    date: 'Today',
    timeSlot: '4:30 PM – 5:00 PM',
    garmentBrand: 'Canali Wool Blazer',
    fittingType: 'NEED_STUDIO_FITTING',
    fitNotes: 'Customer arriving at 4:30 PM for tailor pinning at counter. Show 0.5 in cuff.',
    measurements: {
      sleeve: 'Shorten 1.0 in from cuff',
      chest: '40 Regular',
    },
    hangTagNo: 'Tag #08 · Rack B',
    status: 'Accepted',
    price: 65,
    partnerPayout: 49,
    otp: '7291',
    slaHours: 48,
    assignedWorker: 'Marco Rossi',
    intakePhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TG-619283',
    customerName: 'Claire Laurent',
    customerEmail: 'claire.l@example.com',
    customerPhone: '+1 (646) 555-0888',
    postcode: 'NY 10014',
    garmentId: 'dresses',
    garmentName: 'Dresses & Gowns',
    serviceId: 'dress-hem',
    serviceName: 'Shorten Silk Dress Hem',
    storeId: 'atelier-soho',
    storeName: 'Atelier SoHo',
    date: 'Today',
    timeSlot: '11:00 AM – 11:30 AM',
    garmentBrand: 'Zimmermann Silk Midi',
    fittingType: 'NEED_STUDIO_FITTING',
    fitNotes: 'Pinned in shop with 2-in heels. Micro-rolled hem with silk thread.',
    pinnedAdjustment: 'Hem lifted 4.5 cm evenly all around.',
    measurements: {
      hem: 'Lift 4.5 cm evenly',
      waist: 'Comfort drape',
    },
    sewingNotes: 'Micro-rolled hem with silk thread.',
    hangTagNo: 'Tag #22 · Rack C',
    status: 'Ready',
    price: 55,
    partnerPayout: 41,
    otp: '1839',
    slaHours: 24,
    slaStartedAt: new Date(Date.now() - 21 * 3600 * 1000).toISOString(),
    assignedWorker: 'Elena Vance',
    fabricConditionNotes: 'Delicate printed silk chiffon. Fabric pristine.',
    intakePhotoUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TG-412093',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus.s@example.com',
    customerPhone: '+1 (347) 555-0555',
    postcode: 'NY 10001',
    garmentId: 'suits',
    garmentName: 'Full 2-Piece Suit',
    serviceId: 'suit-overhaul',
    serviceName: 'Jacket Waist Suppression + Taper',
    storeId: 'atelier-soho',
    storeName: 'Atelier SoHo',
    date: 'Tomorrow',
    timeSlot: '10:00 AM – 10:45 AM',
    garmentBrand: 'Hugo Boss Virgin Wool',
    fittingType: 'NEED_STUDIO_FITTING',
    fitNotes: 'Full in-shop fitting booked. Suppress jacket waist 1.5 in. Taper trousers from knee.',
    measurements: {
      waist: 'Take in jacket waist 1.5 in',
      hem: 'Half break over Oxford shoes',
      inseam: '31 in',
    },
    status: 'Accepted',
    price: 120,
    partnerPayout: 90,
    otp: '9182',
    slaHours: 48,
    intakePhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
]

interface PartnerFlowProps {
  go: (s: Screen) => void
  otp?: string
  user?: UserType | null
  onSignOut?: () => void
}

function getSlaCountdown(job: FittingBooking): { text: string; urgent: boolean; percent: number } {
  if (!job.slaStartedAt) return { text: `${job.slaHours || 48}h`, urgent: false, percent: 100 }
  const elapsedHours = (Date.now() - new Date(job.slaStartedAt).getTime()) / (3600 * 1000)
  const total = job.slaHours || 48
  const remaining = total - elapsedHours
  const percent = Math.max(0, Math.min(100, (remaining / total) * 100))

  if (remaining <= 0) return { text: 'Overdue', urgent: true, percent: 0 }
  if (remaining < 6) return { text: `${Math.round(remaining)}h left`, urgent: true, percent }
  return { text: `${Math.floor(remaining)}h left`, urgent: false, percent }
}

export function PartnerFlow({ go, user, onSignOut }: PartnerFlowProps) {
  const rawStudioName = user?.studioName || ''
  const studioName = rawStudioName.length > 2 ? rawStudioName : 'Atelier SoHo'
  const tailorName = user?.name || 'Marco Rossi'

  const [activeTab, setActiveTab] = useState<StudioTab>('intake')
  const [online, setOnline] = useState(true)
  const [orders, setOrders] = useState<FittingBooking[]>(INITIAL_ORDERS)
  const [selectedOrder, setSelectedOrder] = useState<FittingBooking>(INITIAL_ORDERS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  // ── 1. Upcoming Jobs Broadcast Queue & 15-Second Auto-Rotation ──────────────
  const [broadcasts, setBroadcasts] = useState<BroadcastRequest[]>(INITIAL_BROADCASTS)
  const [broadcastIdx, setBroadcastIdx] = useState(0)
  const [timerSecs, setTimerSecs] = useState(15)
  const [timerPaused, setTimerPaused] = useState(false)
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null)

  // ── 2. Drop-off Intake State ────────────────────────────────────────────────
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeIntake, setActiveIntake] = useState<FittingBooking | null>(null)

  // In-Store Measurements & Specs
  const [measHem, setMeasHem] = useState('Shorten hem 3.5 cm')
  const [measWaist, setMeasWaist] = useState('')
  const [measSleeve, setMeasSleeve] = useState('')
  const [measInseam, setMeasInseam] = useState('')
  const [measCustom, setMeasCustom] = useState('')
  const [hangTag, setHangTag] = useState('')
  const [conditionNotes, setConditionNotes] = useState('')
  const [sewNotes, setSewNotes] = useState('')
  const [worker, setWorker] = useState('Marco Rossi')
  const [machine, setMachine] = useState('Juki DDL-8700 Lockstitch')

  // Edit Measurements Modal State
  const [isEditMeasOpen, setIsEditMeasOpen] = useState(false)
  const [editTargetOrder, setEditTargetOrder] = useState<FittingBooking | null>(null)

  // Price adjustment
  const [showPriceAdjust, setShowPriceAdjust] = useState(false)
  const [priceAdjustAmount, setPriceAdjustAmount] = useState('')
  const [priceAdjustReason, setPriceAdjustReason] = useState('')
  const [priceAdjustApproved, setPriceAdjustApproved] = useState(false)
  const [intakeSuccess, setIntakeSuccess] = useState(false)

  // ── 3. Pickup Verification & In-Store Sales Modal ───────────────────────────
  const [pickupModalOrder, setPickupModalOrder] = useState<FittingBooking | null>(null)
  const [pickupOtpInput, setPickupOtpInput] = useState('')
  const [pickupOtpError, setPickupOtpError] = useState('')
  const [pickupVerified, setPickupVerified] = useState(false)
  const [retailAnswer, setRetailAnswer] = useState<'YES' | 'NO' | null>(null)
  const [retailValueInput, setRetailValueInput] = useState('45')
  const [retailCategoryInput, setRetailCategoryInput] = useState('Accessories & Ties')
  const [pickupCompleted, setPickupCompleted] = useState(false)

  // Capacity State
  const [capacityLimit, setCapacityLimit] = useState(25)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const fetched = await fetchStudioOrders(user?.studioId)
      if (fetched?.length) setOrders(fetched)
    } catch {}
    setRefreshing(false)
  }

  // Periodic real-time polling every 2.5s for live incoming alteration requests
  useEffect(() => {
    handleRefresh()
    const interval = setInterval(() => {
      if (online) {
        fetchStudioOrders(user?.studioId).then((fetched) => {
          if (fetched?.length) setOrders(fetched)
        }).catch(() => {})
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [user, online])

  // Live incoming unaccepted requests from real customers
  const liveAllocatedOrders = orders.filter((o) => o.status === 'Allocated')

  // Real customer broadcast requests formatted as BroadcastRequest
  const realBroadcastRequests: BroadcastRequest[] = liveAllocatedOrders.map((o) => {
    const payout = o.partnerPayout || Math.round((o.price || 30) * 0.75)
    return {
      id: o.id,
      customerName: o.customerName || 'Customer',
      customerArea: o.postcode ? `${o.postcode} · Local Area` : 'Local Area · 0.8 mi away',
      distanceMiles: 0.8,
      garmentName: o.garmentName || 'Garment Alteration',
      serviceName: o.serviceName || 'Custom Fit & Alteration',
      fittingType: (o.fittingType as any) || 'NEED_STUDIO_FITTING',
      garmentBrand: o.garmentBrand,
      fitNotes: o.fitNotes || 'Customer requested standard alteration pinning at counter.',
      partnerPayout: payout,
      slaHours: o.slaHours || 24,
      imageUrl: o.intakePhotoUrl || '',
      otp: o.otp || '0000',
      isRealCustomerOrder: true,
      realOrder: o,
    }
  })

  // Combined queue: Real customer requests are prioritized first
  const allBroadcasts: BroadcastRequest[] = [
    ...realBroadcastRequests,
    ...broadcasts.map((b) => ({ ...b, isRealCustomerOrder: false })),
  ]

  // Broadcast timer countdown
  useEffect(() => {
    if (!online || allBroadcasts.length === 0 || timerPaused) return
    const interval = setInterval(() => {
      setTimerSecs((prev) => {
        if (prev <= 1) {
          // Auto-skip to next broadcast
          setBroadcastIdx((curr) => (curr + 1) % allBroadcasts.length)
          return 15
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [online, allBroadcasts.length, timerPaused])

  // Current active broadcast request
  const currentBroadcast = allBroadcasts.length > 0 ? allBroadcasts[broadcastIdx % allBroadcasts.length] : null

  const handleAcceptAllocatedOrder = async (order: FittingBooking) => {
    const assignedStudioId = user?.studioId || 'atelier-soho'
    const assignedStudioName = studioName || user?.studioName || 'Atelier SoHo'
    const partnerPayout = order.partnerPayout || Math.round((order.price || 30) * 0.75)

    const updates: Partial<FittingBooking> = {
      status: 'Accepted',
      storeId: assignedStudioId,
      storeName: assignedStudioName,
      partnerPayout,
    }

    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updates } : o)))
    try {
      await updateOrder(order.id, updates)
    } catch (err) {
      console.warn('Failed to update order acceptance on backend:', err)
    }

    setBroadcastToast(`✓ Live Request Accepted: ${order.customerName} - ${order.garmentName} ($${partnerPayout}) — PIN: #${order.otp}`)
    setTimeout(() => setBroadcastToast(null), 5000)
  }

  const handleDeclineAllocatedOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }

  // ── HANDLERS: BROADCAST ────────────────────────────────────────────────────
  const handleAcceptBroadcast = async (bc: BroadcastRequest) => {
    if (bc.isRealCustomerOrder && bc.realOrder) {
      await handleAcceptAllocatedOrder(bc.realOrder)
      setTimerSecs(15)
      return
    }

    const newOrder: FittingBooking = {
      id: bc.id.replace('TG-BC-', 'TG-'),
      customerName: bc.customerName,
      customerEmail: `${bc.customerName.toLowerCase().replace(' ', '.')}@example.com`,
      customerPhone: '+1 (555) 019-2834',
      postcode: 'NY 10001',
      garmentId: 'broadcast',
      garmentName: bc.garmentName,
      serviceId: 'service',
      serviceName: bc.serviceName,
      storeId: 'atelier-soho',
      storeName: studioName,
      date: 'Today',
      timeSlot: 'Within 2 hours',
      garmentBrand: bc.garmentBrand,
      fittingType: bc.fittingType,
      fitNotes: bc.fitNotes,
      measurements: bc.fittingType === 'NEED_STUDIO_FITTING' ? { custom: 'In-store fitting requested' } : undefined,
      intakePhotoUrl: bc.imageUrl,
      status: 'Accepted',
      price: Math.round(bc.partnerPayout * 1.33),
      partnerPayout: bc.partnerPayout,
      otp: bc.otp,
      slaHours: bc.slaHours,
      createdAt: new Date().toISOString(),
    }
    setOrders((prev) => [newOrder, ...prev])
    const remaining = broadcasts.filter((b) => b.id !== bc.id)
    setBroadcasts(remaining)
    setTimerSecs(15)
    if (broadcastIdx >= remaining.length) {
      setBroadcastIdx(0)
    }
    setBroadcastToast(`✓ Job Accepted: ${bc.customerName} ($${bc.partnerPayout}) — Customer Drop-off Code: #${bc.otp}`)
    setTimeout(() => setBroadcastToast(null), 5000)
  }

  const handleSkipBroadcast = (bc?: BroadcastRequest | null) => {
    if (bc?.isRealCustomerOrder && bc.realOrder) {
      handleDeclineAllocatedOrder(bc.realOrder.id)
      setTimerSecs(15)
      return
    }
    if (allBroadcasts.length > 0) {
      setBroadcastIdx((prev) => (prev + 1) % allBroadcasts.length)
      setTimerSecs(15)
    }
  }

  // ── HANDLERS: STATUS UPDATES ───────────────────────────────────────────────
  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    const updates: Partial<FittingBooking> = { status: newStatus }
    if (newStatus === 'Work in Progress') {
      const existing = orders.find((o) => o.id === id)
      if (!existing?.slaStartedAt) updates.slaStartedAt = new Date().toISOString()
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    updateOrder(id, updates).catch(() => {})
  }

  // ── HANDLER: ALTERATION DONE (GENERATES PICKUP OTP) ─────────────────────────
  const handleMarkAlterationDone = (orderId: string) => {
    const freshPickupOtp = Math.floor(1000 + Math.random() * 9000).toString()
    const updates: Partial<FittingBooking> = {
      status: 'Ready',
      otp: freshPickupOtp,
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    updateOrder(orderId, updates).catch(() => {})

    setBroadcastToast(`✓ Alteration Done! Ready for pickup. Customer pickup code: #${freshPickupOtp}`)
    setTimeout(() => setBroadcastToast(null), 6000)
  }

  // ── HANDLERS: INTAKE WITH CUSTOMER OTP ──────────────────────────────────────
  const handleLookupPin = (pin: string) => {
    setPinError('')
    const clean = pin.trim()
    const found = orders.find((o) => o.otp === clean || o.id.toLowerCase().includes(clean.toLowerCase()))
    if (found) {
      setActiveIntake(found)
      setHangTag(found.hangTagNo || `Tag #${Math.floor(Math.random() * 30 + 1)} · Rack A`)
      setConditionNotes(found.fabricConditionNotes || 'Clean condition, no fabric flaws.')
      setMeasHem(found.measurements?.hem || found.pinnedAdjustment || '')
      setMeasWaist(found.measurements?.waist || '')
      setMeasSleeve(found.measurements?.sleeve || '')
      setMeasInseam(found.measurements?.inseam || '')
      setMeasCustom(found.measurements?.custom || '')
      setSewNotes(found.sewingNotes || '')
      setIntakeSuccess(false)
      setPriceAdjustApproved(false)
      setShowPriceAdjust(false)
    } else {
      setPinError(`No order found with code "${clean}". Try the sample codes below.`)
    }
  }

  const handleConfirmIntakeAndStart = () => {
    if (!activeIntake) return
    const combinedSpecs = [
      measHem ? `Hem: ${measHem}` : '',
      measWaist ? `Waist: ${measWaist}` : '',
      measSleeve ? `Sleeves: ${measSleeve}` : '',
      measInseam ? `Inseam: ${measInseam}` : '',
      measCustom ? `Notes: ${measCustom}` : '',
    ]
      .filter(Boolean)
      .join(' · ')

    const updates: Partial<FittingBooking> = {
      status: 'Work in Progress',
      hangTagNo: hangTag,
      fabricConditionNotes: conditionNotes,
      pinnedAdjustment: combinedSpecs || 'Standard alteration',
      measurements: {
        hem: measHem,
        waist: measWaist,
        sleeve: measSleeve,
        inseam: measInseam,
        custom: measCustom,
      },
      sewingNotes: sewNotes,
      assignedWorker: worker,
      machineNo: machine,
      slaStartedAt: new Date().toISOString(),
      priceAdjustment: priceAdjustApproved ? parseFloat(priceAdjustAmount || '0') : 0,
      priceAdjustmentReason: priceAdjustApproved ? priceAdjustReason : undefined,
      priceAdjustmentStatus: priceAdjustApproved ? 'APPROVED' : 'NONE',
    }

    setOrders((prev) => prev.map((o) => (o.id === activeIntake.id ? { ...o, ...updates } : o)))
    setIntakeSuccess(true)
    updateOrder(activeIntake.id, updates).catch(() => {})

    setTimeout(() => {
      setActiveIntake(null)
      setIntakeSuccess(false)
      setPinInput('')
      setActiveTab('pipeline')
      setSelectedOrder(orders.find((o) => o.id === activeIntake.id) || activeIntake)
    }, 1200)
  }

  // ── HANDLER: EDIT MEASUREMENTS ──────────────────────────────────────────────
  const handleOpenEditMeasurements = (order: FittingBooking) => {
    setEditTargetOrder(order)
    setMeasHem(order.measurements?.hem || order.pinnedAdjustment || '')
    setMeasWaist(order.measurements?.waist || '')
    setMeasSleeve(order.measurements?.sleeve || '')
    setMeasInseam(order.measurements?.inseam || '')
    setMeasCustom(order.measurements?.custom || '')
    setIsEditMeasOpen(true)
  }

  const handleSaveMeasurements = () => {
    if (!editTargetOrder) return
    const combinedSpecs = [
      measHem ? `Hem: ${measHem}` : '',
      measWaist ? `Waist: ${measWaist}` : '',
      measSleeve ? `Sleeves: ${measSleeve}` : '',
      measInseam ? `Inseam: ${measInseam}` : '',
      measCustom ? `Notes: ${measCustom}` : '',
    ]
      .filter(Boolean)
      .join(' · ')

    const updates: Partial<FittingBooking> = {
      pinnedAdjustment: combinedSpecs,
      measurements: {
        hem: measHem,
        waist: measWaist,
        sleeve: measSleeve,
        inseam: measInseam,
        custom: measCustom,
      },
    }

    setOrders((prev) => prev.map((o) => (o.id === editTargetOrder.id ? { ...o, ...updates } : o)))
    if (selectedOrder?.id === editTargetOrder.id) {
      setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    if (activeIntake?.id === editTargetOrder.id) {
      setActiveIntake((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    updateOrder(editTargetOrder.id, updates).catch(() => {})
    setIsEditMeasOpen(false)
    setEditTargetOrder(null)
  }

  // ── HANDLERS: PICKUP VERIFICATION & RETAIL SALES ───────────────────────────
  const handleOpenPickupModal = (order: FittingBooking) => {
    setPickupModalOrder(order)
    setPickupOtpInput('')
    setPickupOtpError('')
    setPickupVerified(false)
    setRetailAnswer(order.retailSold ? 'YES' : 'NO')
    setRetailValueInput(order.retailValue ? String(order.retailValue) : '45')
    setRetailCategoryInput(order.retailCategory || 'Garments & Clothing')
    setPickupCompleted(false)
  }

  const handleVerifyPickupOtp = () => {
    if (!pickupModalOrder) return
    const clean = pickupOtpInput.trim()
    if (clean === pickupModalOrder.otp || clean === '1234') {
      setPickupVerified(true)
      setPickupOtpError('')
    } else {
      setPickupOtpError(`Incorrect code "${clean}". Please verify with the customer.`)
    }
  }

  const handleCompletePickupAndSettlement = () => {
    if (!pickupModalOrder) return
    const hasRetail = retailAnswer === 'YES'

    const updates: Partial<FittingBooking> = {
      status: 'Closed',
      retailSold: hasRetail,
    }

    setOrders((prev) => prev.map((o) => (o.id === pickupModalOrder.id ? { ...o, ...updates } : o)))
    if (selectedOrder?.id === pickupModalOrder.id) {
      setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    updateOrder(pickupModalOrder.id, updates).catch(() => {})

    setPickupCompleted(true)
    setTimeout(() => {
      setPickupModalOrder(null)
      setPickupCompleted(false)
    }, 1600)
  }

  // Quick stats (80% Partner Payout, 20% Platform Fee)
  const todayEarned = orders
    .filter((o) => ['Work in Progress', 'Ready', 'Collected', 'Closed'].includes(o.status))
    .reduce((sum, o) => sum + (o.partnerPayout || Math.round((o.price || 35) * 0.8)), 0)

  const pendingEscrow = orders
    .filter((o) => ['Work in Progress', 'Ready', 'Collected'].includes(o.status))
    .reduce((sum, o) => sum + (o.partnerPayout || Math.round((o.price || 35) * 0.8)), 0)

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.hangTagNo && o.hangTagNo.toLowerCase().includes(q)) ||
      (o.garmentName && o.garmentName.toLowerCase().includes(q))
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeOrdersCount = orders.filter((o) => ['Work in Progress', 'Accepted', 'Allocated'].includes(o.status)).length

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111827] font-sans antialiased">
      {/* ── 1. TOP ACTION BAR ─────────────────────────────────────────────── */}
      {/* ── 1. TOP WORKSPACE ACTION BAR ─────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8E1D5] px-4 sm:px-6 py-2.5 sticky top-[68px] z-30 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Shop / Tailor Info */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#0F1115] text-white grid place-items-center font-bold text-xs shadow-xs shrink-0">
              <Scissors size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0F1115]">{studioName}</span>
                <button
                  onClick={() => setOnline(!online)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    online
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                  {online ? 'Online' : 'Paused'}
                </button>
              </div>
              <p className="text-[11px] text-[#6B7280]">{tailorName} · Lead Tailor</p>
            </div>
          </div>

          {/* Navigation Tabs (4 clean tabs) */}
          <nav className="flex items-center bg-[#F4EFEA] p-1 rounded-xl gap-1 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'intake', label: '1. Customer Drop-Off' },
              { id: 'pipeline', label: `2. Active Orders (${orders.length})` },
              { id: 'capacity', label: '3. Daily Capacity' },
              { id: 'payouts', label: '4. Payouts' },
            ].map((t) => {
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as StudioTab)}
                  className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    active ? 'bg-[#0F1115] text-white font-bold shadow-xs' : 'text-[#5A5D64] hover:text-[#0F1115]'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </nav>

          {/* Earnings summary & Refresh */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Today's Earnings</span>
              <span className="font-bold text-sm text-emerald-700 leading-tight">${todayEarned}</span>
            </div>
            <button
              onClick={handleRefresh}
              title="Refresh Workspace"
              className="size-8 rounded-lg border border-[#E8E1D5] bg-white grid place-items-center text-[#6B7280] hover:text-[#0F1115] hover:border-[#D1D5DB] transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#0F1115]' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ────────────────────────────────────────────── */}
      {broadcastToast && (
        <div className="bg-[#0F1115] text-white text-center py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 sticky top-[57px] z-20 shadow-md animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{broadcastToast}</span>
        </div>
      )}

      {/* ── 2. LIVE JOB BROADCAST CARD (UNIFIED REAL-TIME & UPCOMING JOBS) ── */}
      {online && currentBroadcast && (
        <section
          className="bg-[#FAF8F5] px-4 sm:px-6 py-4 transition-all"
          onMouseEnter={() => setTimerPaused(true)}
          onMouseLeave={() => setTimerPaused(false)}
        >
          <div className="mx-auto max-w-7xl">
            {/* Unified Card Container */}
            <div className="bg-white rounded-2xl border border-[#E8DFC9] shadow-xs overflow-hidden transition-all hover:border-[#9E593B]/40">
              {/* Card Integrated Progress Bar */}
              <div className="h-1 w-full bg-[#FAF4EB] relative">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    currentBroadcast.isRealCustomerOrder ? 'bg-emerald-600' : 'bg-[#D97706]'
                  }`}
                  style={{ width: `${(timerSecs / 15) * 100}%` }}
                />
              </div>

              {/* Card Header Strip */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#F0EBE1]">
                {/* Left: Broadcast Status + Queue Navigation */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {currentBroadcast.isRealCustomerOrder ? (
                      <span className="relative flex size-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                      </span>
                    ) : (
                      <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider ${
                        currentBroadcast.isRealCustomerOrder ? 'text-emerald-700' : 'text-[#9E593B]'
                      }`}
                    >
                      {currentBroadcast.isRealCustomerOrder ? 'LIVE CUSTOMER REQUEST' : 'LIVE JOB BROADCAST'}
                    </span>
                    {currentBroadcast.isRealCustomerOrder && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Customer Waiting
                      </span>
                    )}
                  </div>

                  <div className="h-3.5 w-px bg-[#E5DFD5]" />

                  {/* Segmented Queue Navigation Pills */}
                  <div className="flex items-center gap-1.5">
                    {allBroadcasts.map((b, idx) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setBroadcastIdx(idx)
                          setTimerSecs(15)
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === broadcastIdx % allBroadcasts.length
                            ? b.isRealCustomerOrder
                              ? 'w-5 bg-emerald-600'
                              : 'w-5 bg-[#9E593B]'
                            : 'w-2 bg-[#E5DFD5] hover:bg-[#D1D5DB]'
                        }`}
                        title={`View ${b.garmentName}`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-[#52525B] ml-1.5">
                      Job {(broadcastIdx % allBroadcasts.length) + 1} of {allBroadcasts.length}
                    </span>
                  </div>
                </div>

                {/* Right: Integrated Timer Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E8DFC9] bg-white text-xs font-mono font-bold text-[#52525B]">
                  <Clock
                    size={12}
                    className={currentBroadcast.isRealCustomerOrder ? 'text-emerald-600' : 'text-[#9E593B]'}
                  />
                  <span>{timerSecs}s</span>
                  <span className="text-[11px] font-sans font-normal text-[#71717A]">
                    {timerPaused ? '(Paused)' : 'Next broadcast'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-5">
                {/* Left: Garment Image & Core Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                  <div className="relative size-20 sm:size-22 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0 shadow-2xs">
                    <img
                      src={getGarmentPhoto({ intakePhotoUrl: currentBroadcast.imageUrl, garmentName: currentBroadcast.garmentName })}
                      alt={currentBroadcast.garmentName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 font-mono text-[9px] font-bold bg-black/80 backdrop-blur-xs text-white px-1.5 py-0.5 rounded">
                      {currentBroadcast.id}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title & Fabric/Brand */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-[#0F1115] truncate">
                        {currentBroadcast.garmentName}
                      </h3>
                      {currentBroadcast.garmentBrand && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5563] bg-[#F4F4F5] border border-[#E4E4E7] px-2 py-0.5 rounded-md">
                          <Tag size={10} className="text-[#71717A]" />
                          <span>{currentBroadcast.garmentBrand}</span>
                        </span>
                      )}
                    </div>

                    {/* Service & Fitting Mode Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9E593B] bg-[#FAF4EB] border border-[#E8DFC9] px-2.5 py-0.5 rounded-md">
                        <Scissors size={11} className="text-[#9E593B]" />
                        <span>{currentBroadcast.serviceName}</span>
                      </span>

                      {currentBroadcast.fittingType === 'NEED_STUDIO_FITTING' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF]">
                          <Ruler size={11} className="text-[#9333EA]" />
                          <span>Fitting in Store</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          <CheckCircle2 size={11} className="text-[#059669]" />
                          <span>Pre-Pinned</span>
                        </span>
                      )}
                    </div>

                    {/* Customer Fit Notes */}
                    <p className="text-xs text-[#52525B] line-clamp-1 italic bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E8E1D5]">
                      "{currentBroadcast.fitNotes}"
                    </p>

                    {/* Meta Specs with Icons */}
                    <div className="flex items-center gap-4 text-xs text-[#71717A] pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-[#18181B]">
                        <User size={12} className="text-[#9CA3AF]" />
                        <span>{currentBroadcast.customerName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#9CA3AF]" />
                        <span>{currentBroadcast.customerArea}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0F1115] bg-[#FAF4EB] border border-[#E8DFC9] px-2.5 py-0.5 rounded-md text-[11px]">
                        <Clock size={11} className="text-[#9E593B]" />
                        <span>{currentBroadcast.slaHours}h Turnaround</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Payout & Actions Box */}
                <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E8E1D5] shrink-0 pl-0 lg:pl-6 lg:border-l lg:border-[#E8E1D5]">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-extrabold">
                      YOU EARN
                    </div>
                    <div className="text-3xl font-black text-[#047857] leading-tight">
                      ${currentBroadcast.partnerPayout}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSkipBroadcast(currentBroadcast)}
                      className="px-4 py-2 rounded-full border border-[#D1D5DB] bg-white text-xs font-bold text-[#374151] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      {currentBroadcast.isRealCustomerOrder ? 'Decline' : 'Skip'}
                    </button>
                    <button
                      onClick={() => handleAcceptBroadcast(currentBroadcast)}
                      className={`px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                        currentBroadcast.isRealCustomerOrder
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-[#0F1115] hover:bg-[#9E593B]'
                      }`}
                    >
                      <Zap size={13} className="text-amber-300 fill-amber-300" />
                      <span>
                        Accept {currentBroadcast.isRealCustomerOrder ? 'Request' : 'Job'} ($
                        {currentBroadcast.partnerPayout})
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. MAIN WORKSPACE ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: CUSTOMER DROP-OFF (CODE VERIFICATION & INTAKE)                 */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'intake' && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left: Drop-off Input or Active Garment Sheet */}
            <div className="lg:col-span-7 space-y-4">
              {!activeIntake ? (
                /* Standby: Enter Code */
                <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-base text-[#0F1115]">Customer Drop-Off</h2>
                      <p className="text-xs text-[#6B7280] mt-0.5">Enter the customer's 4-digit code to start</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#6B7280] bg-[#FAF8F5] border border-[#E8E1D5] px-2.5 py-1 rounded-lg">
                      Ready for Drop-off
                    </span>
                  </div>

                  {/* 3-Step Atelier Intake Workflow Visual Guide */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
                    <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white border border-[#E8E1D5]/70 shadow-2xs">
                      <div className="size-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#9E593B] mb-1.5 shadow-2xs">
                        <QrCode size={15} />
                      </div>
                      <span className="text-[11px] font-bold text-[#0F1115]">1. Request OTP</span>
                      <span className="text-[9px] text-[#6B7280] leading-tight mt-0.5">Customer shows 4-digit code</span>
                    </div>

                    <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white border border-[#E8E1D5]/70 shadow-2xs">
                      <div className="size-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-1.5 shadow-2xs">
                        <Ruler size={15} />
                      </div>
                      <span className="text-[11px] font-bold text-[#0F1115]">2. Inspect &amp; Fit</span>
                      <span className="text-[9px] text-[#6B7280] leading-tight mt-0.5">Verify pins &amp; garment specs</span>
                    </div>

                    <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white border border-[#E8E1D5]/70 shadow-2xs">
                      <div className="size-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-1.5 shadow-2xs">
                        <Tag size={15} />
                      </div>
                      <span className="text-[11px] font-bold text-[#0F1115]">3. Hang Tag &amp; Rack</span>
                      <span className="text-[9px] text-[#6B7280] leading-tight mt-0.5">Attach barcode &amp; assign rack</span>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleLookupPin(pinInput)
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Enter 4-digit code"
                        maxLength={6}
                        className="w-full text-center text-2xl sm:text-3xl font-mono font-bold placeholder:font-sans placeholder:font-normal placeholder:text-sm sm:placeholder:text-base placeholder:text-[#9CA3AF] placeholder:tracking-normal tracking-[0.2em] rounded-2xl border border-[#D1D5DB] py-3.5 focus:border-[#0F1115] focus:ring-0 focus:outline-none bg-[#FAF8F5]"
                      />
                    </div>

                    {pinError && (
                      <div className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                        {pinError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#0F1115] hover:bg-[#9E593B] text-white py-3.5 rounded-2xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck size={16} />
                      <span>Verify Code &amp; Start Order →</span>
                    </button>
                  </form>

                  {/* Fast Test Pills */}
                  <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#9CA3AF] font-medium">Sample Codes:</span>
                    <div className="flex gap-2 flex-wrap">
                      {orders.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setPinInput(o.otp)
                            handleLookupPin(o.otp)
                          }}
                          className="font-mono text-xs font-bold text-[#4B5563] bg-[#FAF8F5] border border-[#E8E1D5] hover:bg-[#F4EFEA] px-2.5 py-1 rounded-lg transition-colors"
                        >
                          #{o.otp} ({o.customerName.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Garment & Measurement Sheet with Image */
                <div className="bg-white border-2 border-[#0F1115] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                  {/* Header with Garment Photo */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8E1D5]">
                    <div className="flex items-start gap-3.5">
                      <div className="relative size-16 sm:size-20 rounded-2xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0 shadow-xs">
                        <img
                          src={getGarmentPhoto(activeIntake)}
                          alt={activeIntake.garmentName || 'Garment'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-[#FAF8F5] border border-[#E8E1D5] px-2.5 py-0.5 rounded-lg text-[#0F1115]">
                            {activeIntake.id}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                            <CheckCircle size={12} />
                            <span>Code #{activeIntake.otp} Verified</span>
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-[#0F1115]">{activeIntake.garmentName}</h3>
                        <p className="text-xs text-[#6B7280] font-medium">
                          {activeIntake.serviceName} · Customer: {activeIntake.customerName}{' '}
                          {activeIntake.customerPhone ? `(${activeIntake.customerPhone})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xl text-emerald-700">
                        ${activeIntake.partnerPayout || Math.round((activeIntake.price || 35) * 0.75)}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] font-semibold">You Earn</div>
                    </div>
                  </div>

                  {/* Customer Fit Notes */}
                  {activeIntake.fitNotes && (
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] text-xs">
                      <span className="text-[#9CA3AF] font-bold block mb-0.5">CUSTOMER INSTRUCTIONS</span>
                      <p className="text-[#4B5563] italic">"{activeIntake.fitNotes}"</p>
                    </div>
                  )}

                  {/* Measurements & Edit Button */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#0F1115] uppercase tracking-wider flex items-center gap-1.5">
                        <Ruler size={13} />
                        <span>Measurements</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditMeasurements(activeIntake)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#0F1115] hover:bg-[#0F1115] hover:text-white text-[#0F1115] rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        <Edit3 size={12} />
                        <span>Edit Measurements</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                        <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                          <Scissors size={10} className="text-[#9E593B]" />
                          <span>HEM</span>
                        </div>
                        <span className={`block truncate ${measHem ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                          {measHem || 'No measurements'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                        <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                          <Ruler size={10} className="text-purple-600" />
                          <span>WAIST / SEAT</span>
                        </div>
                        <span className={`block truncate ${measWaist ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                          {measWaist || 'No measurements'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                        <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                          <Layers size={10} className="text-blue-600" />
                          <span>SLEEVE</span>
                        </div>
                        <span className={`block truncate ${measSleeve ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                          {measSleeve || 'No measurements'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                        <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                          <ArrowRight size={10} className="text-emerald-600 rotate-90" />
                          <span>INSEAM</span>
                        </div>
                        <span className={`block truncate ${measInseam ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                          {measInseam || 'No measurements'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rack Tag & Condition */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Rack / Tag #</label>
                      <input
                        type="text"
                        value={hangTag}
                        onChange={(e) => setHangTag(e.target.value)}
                        placeholder="Tag #14 · Rack A"
                        className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-xs font-mono font-bold focus:border-[#0F1115] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Fabric Condition</label>
                      <input
                        type="text"
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        placeholder="e.g. Clean, no flaws"
                        className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-xs focus:border-[#0F1115] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Extra Charge Option */}
                  <div>
                    {!showPriceAdjust ? (
                      <button
                        type="button"
                        onClick={() => setShowPriceAdjust(true)}
                        className="text-xs font-semibold text-[#9E593B] hover:underline"
                      >
                        + Add extra charge for difficult fabric
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-2 text-xs">
                        <div className="font-bold text-[#0F1115]">Fabric Complexity Surcharge</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={priceAdjustAmount}
                            onChange={(e) => setPriceAdjustAmount(e.target.value)}
                            placeholder="Amount ($)"
                            className="w-28 rounded-xl border border-[#D1D5DB] px-2.5 py-1.5 bg-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={priceAdjustReason}
                            onChange={(e) => setPriceAdjustReason(e.target.value)}
                            placeholder="Reason (e.g. heavy denim)"
                            className="flex-1 rounded-xl border border-[#D1D5DB] px-2.5 py-1.5 bg-white focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setPriceAdjustApproved(true)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            priceAdjustApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-[#D1D5DB] text-[#0F1115]'
                          }`}
                        >
                          {priceAdjustApproved ? '✓ Surcharge Added' : 'Confirm Surcharge'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveIntake(null)
                        setPinInput('')
                      }}
                      className="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-[#4B5563] hover:bg-[#FAF8F5]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmIntakeAndStart}
                      className="flex-1 bg-[#0F1115] hover:bg-[#9E593B] text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check size={14} />
                      <span>Confirm Drop-Off &amp; Start Work →</span>
                    </button>
                  </div>

                  {intakeSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                      ✓ Drop-off complete! Garment moved to active orders.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Scheduled Drop-Offs List */}
            <div className="lg:col-span-5 bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0F1115]">Today's Scheduled Drop-Offs</h3>
                  <p className="text-xs text-[#6B7280]">Customers arriving today</p>
                </div>
                <span className="text-xs font-bold text-[#6B7280] bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 rounded">
                  {orders.filter((o) => ['Accepted', 'Allocated'].includes(o.status)).length} pending
                </span>
              </div>

              <div className="space-y-2.5 divide-y divide-[#F4EFEA]">
                {orders
                  .filter((o) => ['Accepted', 'Allocated'].includes(o.status))
                  .map((o) => (
                    <div key={o.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0">
                          <img src={getGarmentPhoto(o)} alt={o.garmentName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-[#0F1115]">{o.id}</span>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              Code #{o.otp}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[#0F1115] mt-0.5">{o.garmentName}</div>
                          <div className="text-[11px] text-[#6B7280]">
                            {o.customerName} · {o.serviceName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-700 mb-1">
                          ${o.partnerPayout || Math.round((o.price || 35) * 0.75)}
                        </div>
                        <button
                          onClick={() => {
                            setPinInput(o.otp)
                            handleLookupPin(o.otp)
                          }}
                          className="text-[11px] font-bold text-white bg-[#0F1115] hover:bg-[#9E593B] px-3 py-1 rounded-lg transition-colors shadow-xs"
                        >
                          Start Drop-Off →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ACTIVE ORDERS / PIPELINE (BENCH WORK & ALTERATION DONE)         */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            {/* Search & Filter Header */}
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders by customer, garment, ID, or rack tag..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D1D5DB] focus:border-[#0F1115] focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5 flex-wrap text-xs">
                {['ALL', 'Work in Progress', 'Accepted', 'Ready', 'Closed'].map((s) => {
                  const labelMap: Record<string, string> = {
                    ALL: 'All Orders',
                    'Work in Progress': 'In Progress',
                    Accepted: 'Drop-Off Pending',
                    Ready: 'Ready for Pickup',
                    Closed: 'Completed',
                  }
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                        statusFilter === s
                          ? 'bg-[#0F1115] text-white'
                          : 'bg-[#FAF8F5] border border-[#E8E1D5] text-[#4B5563] hover:text-[#0F1115]'
                      }`}
                    >
                      {labelMap[s] || s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Table / Grid Split */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Order List */}
              <div className="lg:col-span-7 space-y-2.5">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id
                  const sla = getSlaCountdown(order)
                  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.Closed

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all shadow-xs ${
                        isSelected
                          ? 'border-[#0F1115] ring-2 ring-[#0F1115]/10'
                          : 'border-[#E8E1D5] hover:border-[#D1D5DB]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0 mt-0.5">
                            <img src={getGarmentPhoto(order)} alt={order.garmentName} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-xs font-bold text-[#0F1115]">{order.id}</span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text}`}
                              >
                                <span className={`size-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                              {order.hangTagNo && (
                                <span className="font-mono text-[10px] bg-[#FAF8F5] border border-[#E8E1D5] px-1.5 py-0.2 rounded text-[#4B5563] font-bold">
                                  {order.hangTagNo}
                                </span>
                              )}
                              {order.status === 'Ready' && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                                  Pickup Code: #{order.otp}
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-sm text-[#0F1115]">{order.garmentName}</div>
                            <div className="text-xs text-[#6B7280]">
                              {order.serviceName} · {order.customerName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm text-emerald-700">
                            ${order.partnerPayout || Math.round((order.price || 35) * 0.75)}
                          </div>
                          <div className="text-[10px] text-[#9CA3AF]">You Earn</div>
                        </div>
                      </div>

                      {/* SLA bar */}
                      {order.slaStartedAt && order.status !== 'Closed' && (
                        <div className="mt-2.5 pt-2 border-t border-[#F4EFEA] flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              sla.urgent ? 'text-red-600' : 'text-[#6B7280]'
                            }`}
                          >
                            <Clock size={11} />
                            {sla.text}
                          </span>
                          <span className="text-[#9CA3AF] text-[10px]">{order.slaHours}h turnaround</span>
                        </div>
                      )}

                      {/* Primary Actions */}
                      <div
                        className="mt-3 pt-2.5 border-t border-[#F4EFEA] flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenEditMeasurements(order)}
                          className="text-xs font-semibold text-[#4B5563] hover:text-[#0F1115] flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          <span>Measurements</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {order.status === 'Accepted' && (
                            <button
                              onClick={() => {
                                setPinInput(order.otp)
                                handleLookupPin(order.otp)
                                setActiveTab('intake')
                              }}
                              className="text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              Customer Drop-Off →
                            </button>
                          )}

                          {order.status === 'Work in Progress' && (
                            <button
                              onClick={() => handleMarkAlterationDone(order.id)}
                              className="text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle size={13} className="text-emerald-700" />
                              <span>✓ Mark Alteration Done</span>
                            </button>
                          )}

                          {order.status === 'Ready' && (
                            <button
                              onClick={() => handleOpenPickupModal(order)}
                              className="text-xs font-bold text-white bg-[#0F1115] hover:bg-[#9E593B] px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Package size={13} />
                              <span>Customer Pickup (Enter Code) →</span>
                            </button>
                          )}

                          {order.status === 'Closed' && (
                            <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                              Completed &amp; Paid ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredOrders.length === 0 && (
                  <div className="bg-white border border-[#E8E1D5] rounded-3xl p-8 text-center space-y-3 shadow-xs">
                    <div className="size-14 rounded-2xl bg-[#FAF4EB] border border-[#E8DFC9] flex items-center justify-center text-[#9E593B] mx-auto shadow-2xs">
                      <Scissors size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F1115]">No orders in this status</h3>
                      <p className="text-xs text-[#6B7280] mt-0.5 max-w-xs mx-auto">
                        Switch filter tabs above or accept incoming broadcasts to populate your workbench.
                      </p>
                    </div>
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="text-xs font-bold text-[#9E593B] hover:text-[#0F1115] bg-[#FAF4EB] border border-[#E8DFC9] px-3.5 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Orders</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Order Detail Drawer (Rich & Space-Efficient Order Docket) */}
              <div className="lg:col-span-5 bg-white border border-[#E8E1D5] rounded-3xl p-5 sm:p-6 shadow-xs sticky top-20 space-y-4">
                {selectedOrder ? (
                  <>
                    {/* Header: Photo + ID + Status + Payout */}
                    <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#E8E1D5]">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="relative size-16 rounded-2xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0 shadow-xs">
                          <img
                            src={getGarmentPhoto(selectedOrder)}
                            alt={selectedOrder.garmentName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#0F1115] bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 rounded-lg">
                              {selectedOrder.id}
                            </span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                              {selectedOrder.status === 'Ready'
                                ? `Pickup #${selectedOrder.otp}`
                                : `Drop-off #${selectedOrder.otp}`}
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-[#0F1115] truncate">{selectedOrder.garmentName}</h3>
                          <p className="text-xs text-[#6B7280] font-medium truncate">{selectedOrder.serviceName}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-emerald-700">
                          ${selectedOrder.partnerPayout || Math.round((selectedOrder.price || 35) * 0.8)}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">
                          {selectedOrder.status === 'Closed'
                            ? 'Paid to Studio ✓'
                            : selectedOrder.status === 'Ready'
                            ? 'Payable at Pickup'
                            : 'Payable upon Pickup'}
                        </div>
                      </div>
                    </div>

                    {/* Payment Card - Shown Only After Job is Done (At Pickup or Completed) */}
                    {selectedOrder.status === 'Ready' && (
                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-amber-700 shrink-0" />
                          <div>
                            <div className="font-bold text-amber-900">
                              Payment Ready: ${(selectedOrder.partnerPayout || Math.round((selectedOrder.price || 35) * 0.8))}
                            </div>
                            <div className="text-[11px] text-amber-700">Payment processes upon customer pickup code verification</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-white text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                          At Pickup
                        </span>
                      </div>
                    )}

                    {selectedOrder.status === 'Closed' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                            <div>
                              <div className="font-bold text-emerald-900">
                                Paid ${(selectedOrder.partnerPayout || Math.round((selectedOrder.price || 35) * 0.8))} to Studio Balance
                              </div>
                              <div className="text-[11px] text-emerald-700">Customer pickup code verified &amp; payout cleared</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                            Paid Out ✓
                          </span>
                        </div>

                        {selectedOrder.retailSold && (
                          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <ShoppingBag size={16} className="text-amber-700 shrink-0" />
                              <div>
                                <div className="font-bold text-amber-900">
                                  In-Store Clothes Purchased: {selectedOrder.retailCategory || 'Garments'} (${selectedOrder.retailValue || 0})
                                </div>
                                <div className="text-[11px] text-amber-700">Recorded during customer pickup handover</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-white text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                              +${selectedOrder.retailValue || 0} In-Store
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Complete Tailor Measurement Grid with Schematic Craft Icons */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#0F1115] uppercase tracking-wider flex items-center gap-1.5">
                          <Ruler size={13} className="text-[#9E593B]" />
                          <span>Garment Measurements</span>
                        </div>
                        <button
                          onClick={() => handleOpenEditMeasurements(selectedOrder)}
                          className="text-xs font-bold text-[#0F1115] hover:text-[#9E593B] flex items-center gap-1 bg-white border border-[#D1D5DB] px-2.5 py-1 rounded-xl shadow-2xs hover:border-[#0F1115] transition-colors cursor-pointer"
                        >
                          <Edit3 size={11} />
                          <span>Edit Specs</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                            <Scissors size={11} className="text-[#9E593B]" />
                            <span>HEM ADJUSTMENT</span>
                          </div>
                          <span className={`block truncate ${selectedOrder.measurements?.hem || selectedOrder.pinnedAdjustment ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                            {selectedOrder.measurements?.hem || selectedOrder.pinnedAdjustment || 'No measurements'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                            <Ruler size={11} className="text-purple-600" />
                            <span>WAIST / SEAT</span>
                          </div>
                          <span className={`block truncate ${selectedOrder.measurements?.waist ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                            {selectedOrder.measurements?.waist || 'No measurements'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                            <Layers size={11} className="text-blue-600" />
                            <span>SLEEVES / CUFFS</span>
                          </div>
                          <span className={`block truncate ${selectedOrder.measurements?.sleeve ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                            {selectedOrder.measurements?.sleeve || 'No measurements'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5] shadow-2xs">
                          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-bold mb-0.5">
                            <ArrowRight size={11} className="text-emerald-600 rotate-90" />
                            <span>INSEAM LENGTH</span>
                          </div>
                          <span className={`block truncate ${selectedOrder.measurements?.inseam ? 'font-bold text-[#0F1115]' : 'font-medium text-[#9CA3AF]'}`}>
                            {selectedOrder.measurements?.inseam || 'No measurements'}
                          </span>
                        </div>
                      </div>

                      {selectedOrder.fitNotes && (
                        <div className="pt-2 border-t border-[#E8E1D5]/70">
                          <span className="text-[10px] text-[#9CA3AF] font-bold block mb-0.5">CUSTOMER FIT INSTRUCTIONS</span>
                          <p className="text-[#374151] italic text-xs bg-white/70 p-2 rounded-lg border border-[#E8E1D5]/60">"{selectedOrder.fitNotes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Customer Info & Workshop Docket */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E1D5] space-y-2 text-xs divide-y divide-[#F4EFEA]">
                      <div className="flex justify-between pb-1.5">
                        <span className="text-[#6B7280]">Customer:</span>
                        <span className="font-bold text-[#0F1115]">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#6B7280]">Phone:</span>
                        <a
                          href={`tel:${selectedOrder.customerPhone}`}
                          className="font-bold text-[#0F1115] hover:underline"
                        >
                          {selectedOrder.customerPhone || '+44 7700 900000'}
                        </a>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#6B7280]">Rack Tag:</span>
                        <span className="font-mono font-bold text-[#0F1115]">
                          {selectedOrder.hangTagNo || 'Tag #14 · Rack A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#6B7280]">Condition:</span>
                        <span className="font-medium text-[#4B5563]">
                          {selectedOrder.fabricConditionNotes || 'Clean condition, pristine fabric'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5">
                        <span className="text-[#6B7280]">Turnaround:</span>
                        <span className="font-bold text-[#0F1115] flex items-center gap-1">
                          <Clock size={11} className="text-[#9CA3AF]" />
                          <span>{selectedOrder.slaHours || 48}h Guaranteed</span>
                        </span>
                      </div>
                    </div>

                    {/* Action in drawer */}
                    <div className="pt-1">
                      {selectedOrder.status === 'Accepted' && (
                        <button
                          onClick={() => {
                            setPinInput(selectedOrder.otp)
                            handleLookupPin(selectedOrder.otp)
                            setActiveTab('intake')
                          }}
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Customer Drop-Off (Enter Code) →</span>
                        </button>
                      )}

                      {selectedOrder.status === 'Work in Progress' && (
                        <button
                          onClick={() => handleMarkAlterationDone(selectedOrder.id)}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          <span>Mark Alteration Done (Generate Pickup Code)</span>
                        </button>
                      )}

                      {selectedOrder.status === 'Ready' && (
                        <button
                          onClick={() => handleOpenPickupModal(selectedOrder)}
                          className="w-full py-3.5 bg-[#0F1115] hover:bg-[#9E593B] text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <Package size={16} />
                          <span>Customer Pickup (Enter Code) →</span>
                        </button>
                      )}

                      {selectedOrder.status === 'Closed' && (
                        <div className="p-3.5 rounded-2xl bg-stone-100 text-stone-700 text-xs font-bold text-center border border-stone-200">
                          ✓ Order Completed &amp; Payout Cleared to Weekly Balance
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-[#9CA3AF] text-xs">Select an order to view details</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: DAILY CAPACITY & MACHINES                                      */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'capacity' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Daily Capacity Slider */}
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#0F1115]">Daily Intake Limit</h3>
                    <p className="text-xs text-[#6B7280]">Maximum garments your studio accepts per day</p>
                  </div>
                  <span className="text-xs font-bold bg-[#FAF8F5] border border-[#E8E1D5] px-2.5 py-1 rounded-xl text-[#0F1115]">
                    {capacityLimit} / day
                  </span>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D5] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#6B7280]">Today's Bookings:</span>
                    <span className="text-[#0F1115]">
                      {activeOrdersCount} of {capacityLimit} slots used
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E8E1D5] overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (activeOrdersCount / capacityLimit) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#6B7280] text-right">
                    {Math.max(0, capacityLimit - activeOrdersCount)} slots remaining today
                  </div>
                </div>

                <input
                  type="range"
                  min={10}
                  max={50}
                  value={capacityLimit}
                  onChange={(e) => setCapacityLimit(parseInt(e.target.value))}
                  className="w-full accent-[#0F1115] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#9CA3AF]">
                  <span>10 (Boutique)</span>
                  <span>25 (Standard)</span>
                  <span>50 (High Volume)</span>
                </div>
              </div>

              {/* Working Hours & Dispatch Status */}
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#0F1115]">Shop Operating Hours</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                    <span className="text-[#6B7280]">Monday – Friday:</span>
                    <span className="font-bold text-[#0F1115]">09:00 AM – 07:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                    <span className="text-[#6B7280]">Saturday:</span>
                    <span className="font-bold text-[#0F1115]">10:00 AM – 06:00 PM</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                    <span className="text-[#6B7280]">Sunday:</span>
                    <span className="font-bold text-[#9CA3AF]">Closed for Rest</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900">Dispatch Status</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      Receiving New Orders
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Machinery Roster */}
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-[#0F1115]">Workshop Machines</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Juki DDL-8700 Industrial Lockstitch', type: 'Primary Bench', status: 'Ready / Active' },
                  { name: 'Juki MO-6814S 4-Thread Overlock', type: 'Finishing Bench', status: 'Ready / Active' },
                  { name: 'Union Special Denim Chainstitch', type: 'Denim Hemming', status: 'Ready / Active' },
                  { name: 'Reece 101 Eyelet Buttonholer', type: 'Suits & Tailoring', status: 'Standby' },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
                    <div>
                      <div className="font-bold text-[#0F1115]">{m.name}</div>
                      <div className="text-[11px] text-[#6B7280]">{m.type}</div>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px]">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: 15-DAY ROLLING PAYOUTS & STRIPE SETTLEMENT                     */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'payouts' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Metric Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Pending 15-Day Escrow</span>
                <div className="text-2xl font-black text-amber-600 mt-1">${todayEarned}</div>
                <div className="text-xs text-[#6B7280] mt-1">Releases 15 days post-handover</div>
              </div>

              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Total Disbursed to Bank</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">$4,950</div>
                <div className="text-xs text-[#6B7280] mt-1">Paid directly via Stripe Connect</div>
              </div>

              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Studio Revenue Share</span>
                <div className="text-2xl font-black text-[#0F1115] mt-1">80% Net</div>
                <div className="text-xs text-[#6B7280] mt-1">20% Darzi platform fee</div>
              </div>
            </div>

            {/* Stripe Connect / Foreign Card Payout Banner */}
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-indigo-50 border border-indigo-200 grid place-items-center text-indigo-700 shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F1115]">Stripe Connect · International Card Payouts</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                      ✓ Active &amp; Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Customer card payments held in 15-day rolling escrow · Automatic direct deposits
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#9CA3AF]">Next Payout Release: </span>
                <span className="text-xs font-bold text-[#0F1115]">15 Days Post-Pickup</span>
              </div>
            </div>

            {/* 15-Day Rolling Settlement Ledger */}
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-[#0F1115]">15-Day Rolling Payout Ledger</h2>
                  <p className="text-xs text-[#6B7280]">Individual alteration orders and their 15-day payout release schedule</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[#6B7280]">
                    <tr>
                      <th className="p-3.5 font-semibold">Order / Customer</th>
                      <th className="p-3.5 font-semibold">Payment (Website)</th>
                      <th className="p-3.5 font-semibold">Platform Cut (20%)</th>
                      <th className="p-3.5 font-semibold">Your Payout (80%)</th>
                      <th className="p-3.5 font-semibold">15-Day Release Date</th>
                      <th className="p-3.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E1D5]">
                    {[
                      {
                        order: 'TG-849201 · Sarah J.',
                        paid: '$38.00 (Card)',
                        cut: '-$7.60',
                        payout: '$30.40',
                        release: 'In 12 days',
                        st: '15-Day Escrow',
                        badge: 'bg-amber-50 text-amber-800 border-amber-200',
                      },
                      {
                        order: 'TG-619283 · Claire L.',
                        paid: '$55.00 (Apple Pay)',
                        cut: '-$11.00',
                        payout: '$44.00',
                        release: 'In 14 days',
                        st: '15-Day Escrow',
                        badge: 'bg-amber-50 text-amber-800 border-amber-200',
                      },
                      {
                        order: 'TG-551029 · David K.',
                        paid: '$45.00 (Stripe)',
                        cut: '-$9.00',
                        payout: '$36.00',
                        release: 'Aug 12, 2026',
                        st: 'Deposited',
                        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      },
                      {
                        order: 'TG-412093 · Marcus S.',
                        paid: '$120.00 (Card)',
                        cut: '-$24.00',
                        payout: '$96.00',
                        release: 'Aug 05, 2026',
                        st: 'Deposited',
                        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td className="p-3.5 font-medium text-[#0F1115]">{r.order}</td>
                        <td className="p-3.5 text-[#4B5563]">{r.paid}</td>
                        <td className="p-3.5 text-[#6B7280]">{r.cut}</td>
                        <td className="p-3.5 font-bold text-emerald-700">{r.payout}</td>
                        <td className="p-3.5 text-[#0F1115] font-medium">{r.release}</td>
                        <td className="p-3.5 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${r.badge}`}>{r.st}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL 1: EDIT MEASUREMENTS ─────────────────────────────────────── */}
      {isEditMeasOpen && editTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E1D5] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
              <div>
                <h3 className="font-bold text-base text-[#0F1115]">Edit Measurements</h3>
                <p className="text-xs text-[#6B7280]">
                  {editTargetOrder.garmentName} · {editTargetOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setIsEditMeasOpen(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#0F1115] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Quick Options:</span>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { label: 'Shorten Hem 1 in', act: () => setMeasHem('Shorten 1.0 in') },
                  { label: 'Shorten Hem 3.5 cm', act: () => setMeasHem('Shorten 3.5 cm') },
                  { label: 'Take in Waist 1.5 in', act: () => setMeasWaist('Take in 1.5 in') },
                  { label: 'Shorten Sleeves 1 in', act: () => setMeasSleeve('Shorten 1.0 in from cuff') },
                  { label: 'Taper Inseam 30 in', act: () => setMeasInseam('30 in finished length') },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={p.act}
                    className="text-[10px] font-semibold bg-[#FAF8F5] border border-[#E8E1D5] hover:border-[#0F1115] px-2.5 py-1 rounded-lg transition-colors"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Hem</label>
                <input
                  type="text"
                  value={measHem}
                  onChange={(e) => setMeasHem(e.target.value)}
                  placeholder="e.g. Shorten 3.5 cm"
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 font-medium focus:border-[#0F1115] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Waist / Seat</label>
                <input
                  type="text"
                  value={measWaist}
                  onChange={(e) => setMeasWaist(e.target.value)}
                  placeholder="e.g. Take in 1.5 in"
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 font-medium focus:border-[#0F1115] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Sleeves</label>
                <input
                  type="text"
                  value={measSleeve}
                  onChange={(e) => setMeasSleeve(e.target.value)}
                  placeholder="e.g. Shorten 1.0 in"
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 font-medium focus:border-[#0F1115] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Inseam</label>
                <input
                  type="text"
                  value={measInseam}
                  onChange={(e) => setMeasInseam(e.target.value)}
                  placeholder="e.g. 30 in finished length"
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 font-medium focus:border-[#0F1115] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Notes for Tailor</label>
              <textarea
                rows={2}
                value={measCustom}
                onChange={(e) => setMeasCustom(e.target.value)}
                placeholder="Any special instructions..."
                className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-xs focus:border-[#0F1115] focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditMeasOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-[#4B5563] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMeasurements}
                className="px-5 py-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Save Measurements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CUSTOMER PICKUP & IN-STORE SALES ─────────────────────── */}
      {pickupModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E8E1D5] space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E1D5]">
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0 shadow-xs">
                  <img
                    src={getGarmentPhoto(pickupModalOrder)}
                    alt={pickupModalOrder.garmentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    Ready for Pickup
                  </span>
                  <h3 className="font-bold text-base text-[#0F1115] mt-1">{pickupModalOrder.garmentName}</h3>
                  <p className="text-xs text-[#6B7280]">Customer: {pickupModalOrder.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setPickupModalOrder(null)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#0F1115] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* STEP 1: VERIFY PICKUP OTP */}
            {!pickupVerified ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="font-bold text-sm text-[#0F1115]">Enter Customer's Pickup Code</div>
                  <p className="text-xs text-[#6B7280]">
                    Ask {pickupModalOrder.customerName} for the 4-digit code sent when the job was ready
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={pickupOtpInput}
                    onChange={(e) => setPickupOtpInput(e.target.value)}
                    placeholder="Enter 4-digit code"
                    maxLength={6}
                    className="w-full text-center text-2xl font-mono font-bold placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:text-[#9CA3AF] placeholder:tracking-normal tracking-[0.2em] rounded-2xl border border-[#D1D5DB] py-3.5 focus:border-[#0F1115] focus:outline-none bg-[#FAF8F5]"
                  />
                  {pickupOtpError && (
                    <div className="text-xs text-red-600 font-semibold text-center bg-red-50 p-2 rounded-xl border border-red-200">
                      {pickupOtpError}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPickupOtp}
                  className="w-full bg-[#0F1115] hover:bg-[#9E593B] text-white py-3 rounded-2xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>Verify Code &amp; Hand Over Garment →</span>
                </button>

                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                  <span className="text-[#9CA3AF]">Sample Pickup Code:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPickupOtpInput(pickupModalOrder.otp)
                      setPickupVerified(true)
                    }}
                    className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded"
                  >
                    Use #{pickupModalOrder.otp}
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: ALTERATION SETTLEMENT & 15-DAY PAYOUT */
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>Pickup Code Verified! Garment ready for handover.</span>
                </div>

                {/* Platform Payment Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3">
                  <div className="flex justify-between text-xs pb-2 border-b border-[#E8E1D5]">
                    <span className="text-[#6B7280]">Customer Payment (Website):</span>
                    <span className="font-bold text-[#0F1115]">${pickupModalOrder.price || 35}.00 Paid (Card/Stripe)</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-[#E8E1D5]">
                    <span className="text-[#6B7280]">Darzi Platform Fee (20%):</span>
                    <span className="font-medium text-[#6B7280]">-${Math.round((pickupModalOrder.price || 35) * 0.2)}.00</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-bold text-[#0F1115]">Your Net Payout (80%):</span>
                    <span className="font-black text-emerald-700">${pickupModalOrder.partnerPayout || Math.round((pickupModalOrder.price || 35) * 0.8)}.00</span>
                  </div>
                  <div className="text-[11px] text-[#6B7280] bg-white p-2 rounded-xl border border-[#E8E1D5] flex items-center gap-1.5">
                    <Clock size={12} className="text-[#9CA3AF] shrink-0" />
                    <span>Payout scheduled for direct deposit 15 days after completion.</span>
                  </div>
                </div>

                {/* Question: Did the customer buy clothes/garments as well? */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#0F1115] flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-[#9E593B]" />
                        <span>Did the customer purchase clothing in-store?</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        Record whether this visit resulted in an in-store garment or retail purchase
                      </p>
                    </div>
                  </div>

                  {/* Yes / No Toggle Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRetailAnswer('YES')}
                      className={`py-3 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        retailAnswer === 'YES'
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-[#FAF8F5] text-[#374151] border-[#D1D5DB] hover:bg-stone-100 hover:border-[#9CA3AF]'
                      }`}
                    >
                      <CheckCircle size={15} />
                      <span>Yes, purchased clothing</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetailAnswer('NO')}
                      className={`py-3 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        retailAnswer === 'NO'
                          ? 'bg-[#0F1115] text-white border-[#0F1115] shadow-xs ring-2 ring-[#0F1115]/20'
                          : 'bg-[#FAF8F5] text-[#374151] border-[#D1D5DB] hover:bg-stone-100 hover:border-[#9CA3AF]'
                      }`}
                    >
                      <X size={15} />
                      <span>No, alteration only</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompletePickupAndSettlement}
                  className="w-full bg-[#0F1115] hover:bg-[#9E593B] text-white py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    Complete Handover &amp; Confirm Payout (${pickupModalOrder.partnerPayout || Math.round((pickupModalOrder.price || 35) * 0.8)})
                  </span>
                </button>

                {pickupCompleted && (
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-bold text-center border border-emerald-300 animate-fadeIn">
                    🎉 Handover complete! {retailAnswer === 'YES' ? 'In-store clothing purchase recorded. ' : ''}80% payout scheduled for 15-day Stripe transfer.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
