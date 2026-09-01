'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Delete,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Package,
  Pause,
  Phone,
  Play,
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

type StudioTab = 'cockpit' | 'pipeline' | 'capacity' | 'payouts'

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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Allocated: { label: 'New Request', bg: 'bg-amber-50', text: 'text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  Accepted: { label: 'Drop-Off Pending', bg: 'bg-blue-50', text: 'text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  'Customer Arrived': { label: 'At Counter', bg: 'bg-indigo-50', text: 'text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  'Fitting Completed': { label: 'Tagged & Pinned', bg: 'bg-purple-50', text: 'text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  'Work in Progress': { label: 'On Bench', bg: 'bg-amber-50', text: 'text-amber-900 border-amber-300', dot: 'bg-amber-600' },
  Ready: { label: 'Ready', bg: 'bg-emerald-50', text: 'text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Collected: { label: 'Picked Up', bg: 'bg-teal-50', text: 'text-teal-800 border-teal-200', dot: 'bg-teal-500' },
  Closed: { label: 'Completed', bg: 'bg-stone-50', text: 'text-stone-700 border-stone-200', dot: 'bg-stone-400' },
}

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

/* ═══════════════════════════════════════════════════════════════════════════ */
/* NAV ITEMS                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
const NAV_ITEMS: { id: StudioTab; label: string; icon: typeof Zap; shortLabel: string }[] = [
  { id: 'cockpit', label: 'Workshop Cockpit', icon: Zap, shortLabel: 'Workshop' },
  { id: 'pipeline', label: 'Alterations Pipeline', icon: Layers, shortLabel: 'Orders' },
  { id: 'capacity', label: 'Workshop Capacity', icon: Settings, shortLabel: 'Capacity' },
  { id: 'payouts', label: 'Payouts & Escrow', icon: CreditCard, shortLabel: 'Payouts' },
]

export function PartnerFlow({ go, user, onSignOut }: PartnerFlowProps) {
  const rawStudioName = user?.studioName || ''
  const studioName = rawStudioName.length > 2 ? rawStudioName : 'Atelier SoHo'
  const tailorName = user?.name || 'Master Tailor'

  const [activeTab, setActiveTab] = useState<StudioTab>('cockpit')
  const [online, setOnline] = useState(true)
  const [orders, setOrders] = useState<FittingBooking[]>([])
  const [selectedOrder, setSelectedOrder] = useState<FittingBooking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // desktop collapse

  // ── 1. Live Broadcast Queue & 15-Second Circular Rotation ───────────────────
  const [broadcastIdx, setBroadcastIdx] = useState(0)
  const [timerSecs, setTimerSecs] = useState(15)
  const [timerPaused, setTimerPaused] = useState(false)
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null)

  // ── 2. Drop-off Intake PIN Handshake State ─────────────────────────────────
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeIntake, setActiveIntake] = useState<FittingBooking | null>(null)
  const [showKeypad, setShowKeypad] = useState(false)

  // In-Store Measurements & Tailor Specs
  const [measHem, setMeasHem] = useState('')
  const [measWaist, setMeasWaist] = useState('')
  const [measSleeve, setMeasSleeve] = useState('')
  const [measInseam, setMeasInseam] = useState('')
  const [measCustom, setMeasCustom] = useState('')
  const [hangTag, setHangTag] = useState('')
  const [conditionNotes, setConditionNotes] = useState('')
  const [sewNotes, setSewNotes] = useState('')
  const [worker, setWorker] = useState(tailorName)
  const [machine, setMachine] = useState('Juki DDL-8700 Lockstitch')

  // Edit Measurements Modal State
  const [isEditMeasOpen, setIsEditMeasOpen] = useState(false)
  const [editTargetOrder, setEditTargetOrder] = useState<FittingBooking | null>(null)

  // Price adjustment / surcharge
  const [showPriceAdjust, setShowPriceAdjust] = useState(false)
  const [priceAdjustAmount, setPriceAdjustAmount] = useState('')
  const [priceAdjustReason, setPriceAdjustReason] = useState('')
  const [priceAdjustApproved, setPriceAdjustApproved] = useState(false)
  const [intakeSuccess, setIntakeSuccess] = useState(false)

  // ── 3. Customer Pickup Verification & Retail Modal ─────────────────────────
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
      if (fetched) {
        setOrders(fetched)
        if (fetched.length > 0 && !selectedOrder) {
          setSelectedOrder(fetched[0])
        }
      }
    } catch { }
    setRefreshing(false)
  }

  // Polling backend orders every 2.5s
  useEffect(() => {
    handleRefresh()
    const interval = setInterval(() => {
      if (online) {
        fetchStudioOrders(user?.studioId).then((fetched) => {
          if (fetched) {
            setOrders(fetched)
            if (fetched.length > 0 && !selectedOrder) {
              setSelectedOrder(fetched[0])
            }
          }
        }).catch(() => { })
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [user, online])

  // Live incoming requests from real customer bookings (Status: Allocated)
  const liveAllocatedOrders = orders.filter((o) => o.status === 'Allocated')

  const allBroadcasts: BroadcastRequest[] = liveAllocatedOrders.map((o) => {
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

  // Circular timer countdown (15s)
  useEffect(() => {
    if (!online || allBroadcasts.length === 0 || timerPaused) return
    const interval = setInterval(() => {
      setTimerSecs((prev) => {
        if (prev <= 1) {
          setBroadcastIdx((curr) => (curr + 1) % allBroadcasts.length)
          return 15
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [online, allBroadcasts.length, timerPaused])

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
    await updateOrder(order.id, updates).catch(() => { })

    setBroadcastToast(`✓ Accepted: ${order.customerName} ($${partnerPayout}) — PIN #${order.otp}`)
    setTimeout(() => setBroadcastToast(null), 5000)
  }

  const handleDeclineAllocatedOrder = async (orderId: string) => {
    const updates: Partial<FittingBooking> = {
      status: 'Closed',
      storeId: undefined,
      storeName: undefined,
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    await updateOrder(orderId, updates).catch(() => { })
  }

  const handleAcceptBroadcast = (bc: BroadcastRequest) => {
    if (bc.isRealCustomerOrder && bc.realOrder) {
      handleAcceptAllocatedOrder(bc.realOrder)
    }
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

  // Status updates
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
    updateOrder(id, updates).catch(() => { })
  }

  // Mark alteration done -> Generates pickup PIN & moves to Ready
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
    updateOrder(orderId, updates).catch(() => { })

    setBroadcastToast(`✓ Alteration Done! Pickup PIN: #${freshPickupOtp}`)
    setTimeout(() => setBroadcastToast(null), 6000)
  }

  // Intake with customer PIN
  const handleLookupPin = (pin: string) => {
    setPinError('')
    const clean = pin.trim()
    const found = orders.find((o) => o.otp === clean || o.id.toLowerCase().includes(clean.toLowerCase()))
    if (found) {
      setActiveIntake(found)
      setHangTag(found.hangTagNo || `Tag #${Math.floor(Math.random() * 30 + 1)} · Rack A`)
      setConditionNotes(found.fabricConditionNotes || 'Clean condition, pristine fabric.')
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
      setPinError(`No order found with PIN "${clean}". Tap any customer below to auto-fill.`)
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
    updateOrder(activeIntake.id, updates).catch(() => { })

    setTimeout(() => {
      setActiveIntake(null)
      setIntakeSuccess(false)
      setPinInput('')
      setSelectedOrder(orders.find((o) => o.id === activeIntake.id) || activeIntake)
      setBroadcastToast(`✓ Placed on Sewing Bench: ${activeIntake.customerName} (${hangTag})`)
      setTimeout(() => setBroadcastToast(null), 4000)
    }, 1200)
  }

  // Edit measurements
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
    updateOrder(editTargetOrder.id, updates).catch(() => { })
    setIsEditMeasOpen(false)
    setEditTargetOrder(null)
  }

  // Pickup verification & retail settlement
  const handleOpenPickupModal = (order: FittingBooking) => {
    setPickupModalOrder(order)
    setPickupOtpInput('')
    setPickupOtpError('')
    setPickupVerified(false)
    setRetailAnswer(null)
    setRetailValueInput('45')
    setRetailCategoryInput('Accessories & Ties')
    setPickupCompleted(false)
  }

  const handleVerifyPickupOtp = () => {
    if (!pickupModalOrder) return
    const clean = pickupOtpInput.trim()
    if (clean === pickupModalOrder.otp || clean === '1234') {
      setPickupVerified(true)
      setPickupOtpError('')
    } else {
      setPickupOtpError(`Incorrect PIN "${clean}". Check with customer.`)
    }
  }

  const handleCompletePickupAndSettlement = () => {
    if (!pickupModalOrder) return
    const hasRetail = retailAnswer === 'YES'
    const retailVal = hasRetail ? parseFloat(retailValueInput || '0') : null
    const retailCat = hasRetail ? retailCategoryInput : null

    const updates: Partial<FittingBooking> = {
      status: 'Closed',
      retailSold: hasRetail,
      retailValue: retailVal ?? undefined,
      retailCategory: retailCat ?? undefined,
    }

    setOrders((prev) => prev.map((o) => (o.id === pickupModalOrder.id ? { ...o, ...updates } : o)))
    if (selectedOrder?.id === pickupModalOrder.id) {
      setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : prev))
    }
    updateOrder(pickupModalOrder.id, updates).catch(() => { })

    setPickupCompleted(true)
    setTimeout(() => {
      setPickupModalOrder(null)
      setPickupCompleted(false)
      setBroadcastToast(`✓ Order Handover Complete! Earnings Credited.`)
      setTimeout(() => setBroadcastToast(null), 5000)
    }, 1500)
  }

  // Stats computed from real database orders
  const todayEarned = orders
    .filter((o) => ['Work in Progress', 'Ready', 'Collected', 'Closed'].includes(o.status))
    .reduce((sum, o) => sum + (o.partnerPayout || Math.round((o.price || 35) * 0.8)), 0)

  const totalClosedDisbursed = orders
    .filter((o) => o.status === 'Closed' || o.status === 'Collected')
    .reduce((sum, o) => sum + (o.partnerPayout || Math.round((o.price || 35) * 0.8)), 0)

  const activeOnBench = orders.filter((o) => o.status === 'Work in Progress').length
  const pendingDropOffs = orders.filter((o) => ['Accepted', 'Allocated'].includes(o.status)).length
  const readyOnRack = orders.filter((o) => o.status === 'Ready').length

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

  // Timer circumference for circular progress
  const timerRadius = 22
  const timerCircumference = 2 * Math.PI * timerRadius
  const timerStrokeDashoffset = timerCircumference - (timerSecs / 15) * timerCircumference

  // PIN keypad helper
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setPinInput('')
      setPinError('')
      return
    }
    if (val === 'BACK') {
      setPinInput((prev) => prev.slice(0, -1))
      setPinError('')
      return
    }
    if (pinInput.length < 4) {
      const nextPin = pinInput + val
      setPinInput(nextPin)
      setPinError('')
      if (nextPin.length === 4) {
        handleLookupPin(nextPin)
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* RENDER                                                                     */
  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* LUXURY ATELIER WORKBENCH — SIGNATURE WARM CREAM & TERRACOTTA PALETTE        */
  /* ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#FAF8F5] text-[#1E2229] font-sans antialiased">

      {/* ── MOBILE BACKDROP ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR — OBSIDIAN & BESPOKE TERRACOTTA ACCENTS                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-0 left-0 z-50 md:z-30
          h-full md:h-[calc(100vh-64px)]
          bg-[#0F1115] text-white
          flex flex-col border-r border-white/10
          sidebar-transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarCollapsed ? 'w-16' : 'w-[240px]'}
        `}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center gap-3 px-4 h-14 border-b border-white/10 shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="size-7 rounded-lg bg-[#9E593B] text-white grid place-items-center shrink-0 shadow-xs">
                <Scissors size={14} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-white truncate leading-tight">{studioName}</div>
                <div className="text-[10px] text-stone-400 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Workshop Node</span>
                </div>
              </div>
              {/* Collapse button — desktop only */}
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden md:grid size-6 place-items-center hover:bg-white/10 text-stone-400 hover:text-white rounded transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft size={14} />
              </button>
              {/* Close button — mobile only */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden grid size-6 place-items-center hover:bg-white/10 text-stone-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="size-7 rounded-lg bg-[#9E593B] text-white grid place-items-center cursor-pointer hover:bg-[#8A4C32] transition-colors shadow-xs"
              title="Expand sidebar"
            >
              <Scissors size={14} />
            </button>
          )}
        </div>

        {/* Online Toggle */}
        <div className={`p-2.5 border-b border-white/10 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {!sidebarCollapsed ? (
            <button
              onClick={() => setOnline(!online)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                online
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full shrink-0 ${online ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                <span>{online ? 'Grid Active' : 'Workbench Paused'}</span>
              </div>
              <span className="text-[10px] text-stone-400">{online ? 'Online' : 'Off'}</span>
            </button>
          ) : (
            <button
              onClick={() => setOnline(!online)}
              className="grid place-items-center cursor-pointer p-2 rounded hover:bg-white/10"
              title={online ? 'Online — Click to pause' : 'Paused — Click to go online'}
            >
              <span className={`size-2.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id
            const Icon = item.icon
            const badge =
              item.id === 'cockpit' && allBroadcasts.length > 0 ? allBroadcasts.length :
              item.id === 'pipeline' ? orders.length : null

            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer
                  ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}
                  ${active
                    ? 'bg-[#9E593B] text-white font-semibold shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon size={15} className={active ? 'text-white' : 'text-stone-400'} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {badge !== null && badge > 0 && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none ${
                        item.id === 'cockpit' ? 'bg-amber-400 text-stone-950' : 'bg-white/20 text-white'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-2 border-t border-white/10 space-y-0.5 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={handleRefresh}
            title="Refresh Order Feed"
            className={`flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer
              ${sidebarCollapsed ? 'size-8 justify-center' : 'w-full px-3 py-2'}`}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#9E593B]' : ''} />
            {!sidebarCollapsed && <span>Sync Feed</span>}
          </button>

          <button
            onClick={() => {
              if (onSignOut) onSignOut()
              else go('partner')
            }}
            title="Sign Out"
            className={`flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer
              ${sidebarCollapsed ? 'size-8 justify-center' : 'w-full px-3 py-2'}`}
          >
            <LogOut size={13} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA — WARM CREAM ATELIER DESK                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF8F5]">

        {/* ── TOP STATUS BAR ── */}
        <header className="h-14 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E1D5] flex items-center px-4 lg:px-8 gap-4 shrink-0 z-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden size-8 grid place-items-center rounded-lg hover:bg-[#F3EFEA] text-[#1E2229] cursor-pointer"
          >
            <Menu size={16} />
          </button>

          {/* Minimalist Summary Stats (Inline, non-boxy) */}
          <div className="hidden sm:flex items-center gap-6 text-xs text-[#6B7280] font-medium">
            <div className="flex items-center gap-2">
              <span className="text-[#9E593B] font-semibold">Net Earned:</span>
              <span className="font-bold text-[#1E2229]">${todayEarned}</span>
              <span className="text-[10px] text-[#6B7280]">(80% Escrow)</span>
            </div>
            <span className="h-3 w-px bg-[#E8E1D5]" />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Bench:</span>
              <span className="font-semibold text-[#1E2229]">{activeOnBench} active</span>
            </div>
            <span className="h-3 w-px bg-[#E8E1D5]" />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Drop-Offs:</span>
              <span className="font-semibold text-[#1E2229]">{pendingDropOffs} scheduled</span>
            </div>
            {readyOnRack > 0 && (
              <>
                <span className="h-3 w-px bg-[#E8E1D5]" />
                <div className="flex items-center gap-2">
                  <span className="text-purple-700 font-semibold">Ready on Rack:</span>
                  <span className="font-bold text-[#1E2229]">{readyOnRack}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Online Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#1E2229] border border-[#E8E1D5] shadow-2xs">
            <span className={`size-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            <span>{online ? 'Grid Active' : 'Standby'}</span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#E8E1D5]">
            <div className="size-7 rounded-full bg-[#9E593B] text-white text-xs font-semibold flex items-center justify-center shadow-2xs">
              {tailorName.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-[#1E2229] leading-tight truncate max-w-[120px]">{tailorName}</div>
              <div className="text-[10px] text-[#9E593B] font-medium">Master Tailor</div>
            </div>
          </div>
        </header>

        {/* ── TOAST ALERT ── */}
        {broadcastToast && (
          <div className="bg-[#0F1115] text-white py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-2 z-10 border-b border-[#9E593B] toast-enter">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{broadcastToast}</span>
          </div>
        )}

        {/* ── SCROLLABLE WORKSPACE ── */}
        <main className="flex-1 overflow-y-auto">

          {/* ── 1. RADAR / INCOMING BROADCAST HERO ── */}
          {online && currentBroadcast ? (
            <div
              className="m-4 lg:m-8 mb-2"
              onMouseEnter={() => setTimerPaused(true)}
              onMouseLeave={() => setTimerPaused(false)}
            >
              <div className="bg-[#0F1115] text-white rounded-2xl p-5 shadow-sm border border-[#9E593B]/40 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left: Garment Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative size-16 rounded-xl bg-stone-800 overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={getGarmentPhoto({ intakePhotoUrl: currentBroadcast.imageUrl, garmentName: currentBroadcast.garmentName })}
                        alt={currentBroadcast.garmentName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#9E593B] text-white rounded-md">
                          Incoming Dispatch
                        </span>
                        {currentBroadcast.garmentBrand && (
                          <span className="text-[11px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-md">
                            {currentBroadcast.garmentBrand}
                          </span>
                        )}
                        <span className="text-xs text-stone-400">{broadcastIdx + 1} of {allBroadcasts.length}</span>
                      </div>

                      <h3 className="text-base font-semibold text-white truncate">{currentBroadcast.garmentName}</h3>

                      <div className="flex items-center gap-3 text-xs text-stone-400 pt-0.5">
                        <span className="text-stone-300 font-medium">{currentBroadcast.serviceName}</span>
                        <span>·</span>
                        <span>{currentBroadcast.customerName}</span>
                        <span>·</span>
                        <span>{currentBroadcast.customerArea}</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">{currentBroadcast.slaHours}h Turnaround</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payout + Actions */}
                  <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-3 lg:pt-0 border-t lg:border-0 border-white/10">
                    <div className="text-left lg:text-right pr-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">Net Payout</span>
                      <div className="text-2xl font-bold text-emerald-400">${currentBroadcast.partnerPayout}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSkipBroadcast(currentBroadcast)}
                        className="px-3.5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-xs font-medium text-stone-300 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptBroadcast(currentBroadcast)}
                        className="px-4 py-2 rounded-full bg-[#9E593B] hover:bg-[#8A4C32] text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Zap size={13} className="fill-white" />
                        <span>Accept (${currentBroadcast.partnerPayout})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── 2. MAIN WORKBENCH VIEW TABS ── */}
          <div className="p-4 lg:p-8 pt-4 space-y-6 max-w-[1440px] mx-auto">

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: WORKSHOP COCKPIT                                        */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'cockpit' && (
              <div className="space-y-6">

                {/* ── INTEGRATED METRICS RIBBON (Warm Linen Palette) ── */}
                <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-2xs grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E1D5]">
                  <div className="p-3 sm:p-4 sm:first:pl-2">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">Today's Payout</span>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1E2229] mt-1">${todayEarned}</div>
                    <span className="text-xs text-[#9E593B] font-semibold mt-0.5 block">80% Net · Rolling Escrow</span>
                  </div>

                  <div className="p-3 sm:p-4">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">On Sewing Bench</span>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1E2229] mt-1">{activeOnBench} <span className="text-sm font-normal text-[#6B7280]">garments</span></div>
                    <span className="text-xs text-[#6B7280] font-medium mt-0.5 block">{activeOnBench > 0 ? 'SLA Timers Running' : 'All Workstations Ready'}</span>
                  </div>

                  <div className="p-3 sm:p-4">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">Drop-Off Queue</span>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1E2229] mt-1">{pendingDropOffs} <span className="text-sm font-normal text-[#6B7280]">scheduled</span></div>
                    <span className="text-xs text-[#6B7280] font-medium mt-0.5 block">Awaiting PIN Ingress</span>
                  </div>

                  <div className="p-3 sm:p-4 sm:last:pr-2">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">Ready on Rack</span>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1E2229] mt-1">{readyOnRack} <span className="text-sm font-normal text-[#6B7280]">finished</span></div>
                    <span className="text-xs text-purple-700 font-semibold mt-0.5 block">{readyOnRack > 0 ? 'Pickup Alerts Sent' : 'Rack Clear'}</span>
                  </div>
                </div>

                {/* ── 2 Main Functional Areas: Customer Intake & Sewing Bench ── */}
                <div className="grid lg:grid-cols-12 gap-6 items-start">

                  {/* ── LEFT: IN-STORE COUNTER INGRESS TERMINAL ── */}
                  <div className="lg:col-span-7 space-y-4">
                    {!activeIntake ? (
                      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-[#E8E1D5] pb-4">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9E593B] mb-0.5">
                              <Package size={13} className="text-[#9E593B]" />
                              <span>Counter Ingress</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#1E2229]">
                              Drop-Off Verification &amp; Intake
                            </h2>
                            <p className="text-xs text-[#6B7280] mt-1">
                              Enter customer's 4-digit drop-off PIN to retrieve specs and place garment on sewing bench.
                            </p>
                          </div>

                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                            Counter Ready
                          </span>
                        </div>

                        {/* Interactive Unified 4-Digit PIN Terminal */}
                        <div className="p-6 rounded-2xl bg-[#F3EFEA]/80 border border-[#E8E1D5] space-y-5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1E2229] uppercase tracking-wide">
                              Customer 4-Digit Drop-Off PIN
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowKeypad(!showKeypad)}
                              className="text-xs font-medium text-[#9E593B] hover:underline cursor-pointer"
                            >
                              {showKeypad ? 'Hide Keypad' : 'Tactile Keypad'}
                            </button>
                          </div>

                          {/* Seamless Single PIN Entry Experience */}
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <div className="relative flex items-center justify-center gap-2.5 sm:gap-3">
                              {/* Invisible input overlaying the slots */}
                              <input
                                type="text"
                                maxLength={4}
                                value={pinInput}
                                autoFocus
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '')
                                  setPinInput(val)
                                  setPinError('')
                                  if (val.length === 4) {
                                    handleLookupPin(val)
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && pinInput) handleLookupPin(pinInput)
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full text-transparent"
                                aria-label="Enter 4-digit PIN"
                              />

                              {[0, 1, 2, 3].map((idx) => {
                                const digit = pinInput[idx] || ''
                                const isFocused = pinInput.length === idx
                                return (
                                  <div
                                    key={idx}
                                    className={`size-14 sm:size-16 rounded-xl bg-white border flex items-center justify-center font-mono font-bold text-2xl sm:text-3xl transition-all shadow-2xs ${
                                      digit
                                        ? 'border-[#1E2229] text-[#1E2229] bg-white'
                                        : isFocused
                                        ? 'border-[#9E593B] ring-3 ring-[#9E593B]/20 bg-white'
                                        : 'border-[#E8E1D5] text-[#D1D5DB]'
                                    }`}
                                  >
                                    {digit || (isFocused ? <span className="animate-pulse text-[#9E593B]">|</span> : '—')}
                                  </div>
                                )
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleLookupPin(pinInput)}
                              disabled={pinInput.length === 0}
                              className={`w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                                pinInput.length === 4
                                  ? 'bg-[#0F1115] hover:bg-[#9E593B] text-white active:scale-95'
                                  : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                              }`}
                            >
                              <ShieldCheck size={15} />
                              <span>Verify &amp; Intake →</span>
                            </button>
                          </div>

                          {pinError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{pinError}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPinInput('')}
                                className="text-xs underline text-red-800 cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          )}

                          {/* Tactile Keypad (on demand) */}
                          {showKeypad && (
                            <div className="pt-3 border-t border-[#E8E1D5]">
                              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleKeypadPress(key)}
                                    className={`py-3 rounded-xl font-mono text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                                      key === 'CLEAR' || key === 'BACK'
                                        ? 'bg-[#E8E1D5] text-[#1E2229] hover:bg-[#DDD6CB] text-xs'
                                        : 'bg-white hover:bg-[#0F1115] hover:text-white text-[#1E2229] border border-[#E8E1D5] shadow-2xs'
                                    }`}
                                  >
                                    {key}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Scheduled Drop-Offs Today Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1E2229] flex items-center gap-1.5">
                              <Clock size={13} className="text-[#9E593B]" />
                              <span>Scheduled Customer Appointments</span>
                            </span>
                            <span className="text-xs text-[#6B7280] font-medium">
                              {orders.filter((o) => ['Accepted', 'Allocated'].includes(o.status)).length} in queue
                            </span>
                          </div>

                          {orders.filter((o) => ['Accepted', 'Allocated'].includes(o.status)).length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-3">
                              {orders
                                .filter((o) => ['Accepted', 'Allocated'].includes(o.status))
                                .map((o) => (
                                  <div
                                    key={o.id}
                                    className="p-3.5 rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white hover:border-[#9E593B] transition-all flex items-center justify-between gap-3 shadow-2xs"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="size-11 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-[#E8E1D5]">
                                        <img src={getGarmentPhoto(o)} alt={o.garmentName} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="font-mono text-xs font-bold text-[#1E2229] bg-white border border-[#E8E1D5] px-1.5 py-0.2 rounded">
                                            #{o.otp}
                                          </span>
                                          <span className="font-semibold text-xs text-[#1E2229] truncate">{o.customerName}</span>
                                        </div>
                                        <div className="text-[11px] text-[#6B7280] truncate">
                                          {o.garmentName} · {o.serviceName}
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPinInput(o.otp)
                                        handleLookupPin(o.otp)
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-[#0F1115] hover:bg-[#9E593B] text-white text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0 whitespace-nowrap active:scale-95"
                                    >
                                      Intake #{o.otp} →
                                    </button>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            /* Elegant Ready-to-Test Ingress State */
                            <div className="p-4 rounded-xl bg-[#F3EFEA]/60 border border-[#E8E1D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                              <div className="space-y-0.5">
                                <div className="font-semibold text-[#1E2229] flex items-center gap-1.5">
                                  <Sparkles size={13} className="text-[#9E593B]" />
                                  <span>Test Ingress with Active Orders:</span>
                                </div>
                                <p className="text-[#6B7280] text-[11px]">
                                  Tap any active customer ticket to auto-fill their 4-digit PIN code.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                {orders.slice(0, 2).map((sample) => (
                                  <button
                                    key={sample.id}
                                    type="button"
                                    onClick={() => {
                                      if (sample?.otp) {
                                        setPinInput(sample.otp)
                                        handleLookupPin(sample.otp)
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E1D5] text-[#1E2229] hover:text-black hover:border-[#9E593B] font-mono text-xs font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1.5"
                                  >
                                    <span>#{sample.otp} ({sample.customerName.split(' ')[0]})</span>
                                    <ArrowRight size={11} className="text-[#9E593B]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      /* Active Garment Intake Inspection Docket */
                      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5 animate-scaleUp">
                        {/* Header with Photo & Tag */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8E1D5]">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="size-16 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E8E1D5] shrink-0">
                              <img
                                src={getGarmentPhoto(activeIntake)}
                                alt={activeIntake.garmentName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono text-xs font-semibold bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 rounded text-[#1E2229]">
                                  #{activeIntake.id}
                                </span>
                                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  ✓ PIN #{activeIntake.otp} Verified
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-[#1E2229]">{activeIntake.garmentName}</h3>
                              <p className="text-xs text-[#6B7280]">{activeIntake.customerName} · {activeIntake.serviceName}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF7F2] text-[#9E593B] border border-[#9E593B]/20 font-mono text-xs font-semibold">
                              <Tag size={12} />
                              <span>{hangTag || 'Tag Pending'}</span>
                            </div>
                            <div className="text-xs font-bold text-emerald-800 mt-1">
                              ${activeIntake.partnerPayout || Math.round((activeIntake.price || 35) * 0.75)} Net Payout
                            </div>
                          </div>
                        </div>

                        {/* Customer Fit Notes */}
                        {activeIntake.fitNotes && (
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] text-xs">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E593B] block mb-1">
                              Customer Fit Instructions
                            </span>
                            <p className="text-[#1E2229] italic">"{activeIntake.fitNotes}"</p>
                          </div>
                        )}

                        {/* Inspection Checklist */}
                        <div className="space-y-3 text-xs">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-semibold text-[#1E2229] mb-1">Fabric Condition Notes</label>
                              <input
                                type="text"
                                value={conditionNotes}
                                onChange={(e) => setConditionNotes(e.target.value)}
                                placeholder="e.g. Clean wool, pristine fabric"
                                className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] focus:border-[#9E593B] focus:outline-none bg-white transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1E2229] mb-1">Garment Rack Hang-Tag</label>
                              <input
                                type="text"
                                value={hangTag}
                                onChange={(e) => setHangTag(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] font-mono font-semibold focus:border-[#9E593B] focus:outline-none bg-white transition-colors"
                              />
                            </div>
                          </div>

                          {/* Measurements */}
                          <div className="p-4 rounded-xl bg-[#F3EFEA]/80 border border-[#E8E1D5] space-y-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E593B] block">
                              Tailor Specifications &amp; Measurements
                            </span>
                            <div className="grid sm:grid-cols-2 gap-2 font-mono">
                              <input
                                type="text"
                                value={measHem}
                                onChange={(e) => setMeasHem(e.target.value)}
                                placeholder="Hem (e.g. -3.5 cm)"
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E1D5] text-xs font-semibold"
                              />
                              <input
                                type="text"
                                value={measWaist}
                                onChange={(e) => setMeasWaist(e.target.value)}
                                placeholder="Waist / Seat"
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E1D5] text-xs font-semibold"
                              />
                              <input
                                type="text"
                                value={measSleeve}
                                onChange={(e) => setMeasSleeve(e.target.value)}
                                placeholder="Sleeves / Cuffs"
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E1D5] text-xs font-semibold"
                              />
                              <input
                                type="text"
                                value={measInseam}
                                onChange={(e) => setMeasInseam(e.target.value)}
                                placeholder="Finished Inseam"
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E1D5] text-xs font-semibold"
                              />
                            </div>
                          </div>

                          {/* Tailor & Machine */}
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-semibold text-[#1E2229] mb-1">Assigned Master Tailor</label>
                              <input
                                type="text"
                                value={worker}
                                onChange={(e) => setWorker(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] bg-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#1E2229] mb-1">Sewing Machine Bench</label>
                              <input
                                type="text"
                                value={machine}
                                onChange={(e) => setMachine(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Surcharge Option */}
                        <div className="pt-1">
                          {!showPriceAdjust ? (
                            <button
                              type="button"
                              onClick={() => setShowPriceAdjust(true)}
                              className="text-xs font-medium text-[#9E593B] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus size={12} />
                              <span>Add surcharge for complex silk / extra fabric work</span>
                            </button>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                              <span className="font-bold text-amber-950">Complex Fabric Surcharge</span>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Amount ($)"
                                  value={priceAdjustAmount}
                                  onChange={(e) => setPriceAdjustAmount(e.target.value)}
                                  className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
                                />
                                <input
                                  type="text"
                                  placeholder="Reason (e.g. heavy hand-stitch lining)"
                                  value={priceAdjustReason}
                                  onChange={(e) => setPriceAdjustReason(e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPriceAdjustApproved(true)}
                                  className="px-3 py-1.5 rounded-lg bg-[#0F1115] hover:bg-[#9E593B] text-white font-semibold cursor-pointer transition-colors"
                                >
                                  {priceAdjustApproved ? '✓ Added' : 'Apply'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirmation Buttons */}
                        <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIntake(null)
                              setPinInput('')
                            }}
                            className="px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs font-medium text-[#6B7280] hover:bg-[#F3EFEA] cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={handleConfirmIntakeAndStart}
                            className="flex-1 bg-[#0F1115] hover:bg-[#9E593B] text-white py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
                          >
                            <Scissors size={14} />
                            <span>Confirm Intake &amp; Start SLA Clock →</span>
                          </button>
                        </div>

                        {intakeSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200">
                            ✓ Intake complete! Garment placed on bench &amp; SLA clock started.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── RIGHT: LIVE SEWING BENCH & WORKSTATIONS FLOOR ── */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 shadow-2xs space-y-5">
                      
                      {/* Bench Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E1D5]">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9E593B] block mb-0.5">
                            Atelier Workstations
                          </span>
                          <h3 className="text-base font-bold text-[#1E2229]">
                            Garments in Progress ({activeOnBench})
                          </h3>
                        </div>

                        <span className="text-xs font-semibold text-[#9E593B] bg-[#FFF7F2] border border-[#9E593B]/20 px-2.5 py-0.5 rounded-full">
                          Live SLA
                        </span>
                      </div>

                      {/* Active Garments List */}
                      <div className="space-y-3">
                        {orders
                          .filter((o) => o.status === 'Work in Progress')
                          .map((order) => {
                            const sla = getSlaCountdown(order)
                            return (
                              <div
                                key={order.id}
                                className="p-4 rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] space-y-3 shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div className="size-12 rounded-lg overflow-hidden bg-stone-200 border border-[#E8E1D5] shrink-0">
                                      <img src={getGarmentPhoto(order)} alt={order.garmentName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="font-mono text-xs font-bold text-[#1E2229]">#{order.id}</span>
                                        {order.hangTagNo && (
                                          <span className="text-[10px] font-mono font-semibold bg-[#FFF7F2] text-[#9E593B] border border-[#9E593B]/20 px-1.5 py-0.2 rounded">
                                            {order.hangTagNo}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-bold text-xs text-[#1E2229] truncate">{order.garmentName}</h4>
                                      <p className="text-[11px] text-[#6B7280] truncate">{order.customerName} · {order.serviceName}</p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="font-bold text-xs text-emerald-800 block">
                                      ${order.partnerPayout || Math.round((order.price || 35) * 0.75)}
                                    </span>
                                    <span className={`text-[10px] font-medium flex items-center justify-end gap-1 ${sla.urgent ? 'text-red-600 font-bold' : 'text-[#6B7280]'}`}>
                                      <Clock size={10} />
                                      <span>{sla.text}</span>
                                    </span>
                                  </div>
                                </div>

                                {order.pinnedAdjustment && (
                                  <div className="text-[11px] text-[#1E2229] bg-white px-2.5 py-1 rounded-lg border border-[#E8E1D5] truncate font-mono">
                                    {order.pinnedAdjustment}
                                  </div>
                                )}

                                {/* SLA Countdown Progress */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-[#6B7280] font-medium">
                                    <span>Turnaround SLA</span>
                                    <span>{Math.round(sla.percent)}% remaining</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-[#E8E1D5] overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        sla.urgent ? 'bg-red-500' : 'bg-[#9E593B]'
                                      }`}
                                      style={{ width: `${sla.percent}%` }}
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleMarkAlterationDone(order.id)}
                                  className="w-full py-2 bg-[#0F1115] hover:bg-[#9E593B] text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                                >
                                  <CheckCircle size={13} />
                                  <span>Mark Alteration Done (Alert Customer) →</span>
                                </button>
                              </div>
                            )
                          })}

                        {activeOnBench === 0 && (
                          /* Workstation Readiness Board */
                          <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-[#F3EFEA]/70 border border-[#E8E1D5] text-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E593B] block mb-2">
                                Atelier Workstations Ready
                              </span>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E1D5]">
                                  <div className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-xs text-[#1E2229]">Bench 1: Juki DDL-8700 Lockstitch</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Ready</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E1D5]">
                                  <div className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-xs text-[#1E2229]">Bench 2: Juki MO-6814S Overlock</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Ready</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E1D5]">
                                  <div className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-stone-400" />
                                    <span className="font-semibold text-xs text-[#1E2229]">Bench 3: Union Special Denim</span>
                                  </div>
                                  <span className="text-[10px] font-medium text-[#6B7280] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E1D5]">Standby</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-center text-[11px] text-[#6B7280]">
                              Verify an incoming customer drop-off code to allocate garments to these workstations.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ready on Rack Shelf */}
                    {readyOnRack > 0 && (
                      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#1E2229]">
                            <CheckCircle2 size={15} className="text-emerald-700" />
                            <span>Ready on Rack for Pickup ({readyOnRack})</span>
                          </div>
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Alerted
                          </span>
                        </div>

                        <div className="space-y-2">
                          {orders
                            .filter((o) => o.status === 'Ready')
                            .map((order) => (
                              <div
                                key={order.id}
                                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-between gap-3 text-xs"
                              >
                                <div>
                                  <div className="font-semibold text-[#1E2229]">{order.customerName} · {order.garmentName}</div>
                                  <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                                    Pickup PIN: <strong className="text-[#1E2229]">#{order.otp}</strong> · {order.hangTagNo || 'Rack A'}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleOpenPickupModal(order)}
                                  className="px-3 py-1.5 bg-[#0F1115] hover:bg-[#9E593B] text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                                >
                                  Verify Pickup →
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: ORDERS PIPELINE                                         */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                {/* Search + Filters */}
                <div className="bg-white border border-[#E8E1D5] rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E593B]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search customer, garment, ID, rack tag..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E8E1D5] focus:border-[#9E593B] focus:outline-none transition-colors bg-[#FAF8F5]"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap text-xs">
                    {['ALL', 'Work in Progress', 'Accepted', 'Ready', 'Closed'].map((s) => {
                      const labelMap: Record<string, string> = {
                        ALL: `All (${orders.length})`,
                        'Work in Progress': `On Bench (${activeOnBench})`,
                        Accepted: `Drop-Offs (${pendingDropOffs})`,
                        Ready: `Ready (${readyOnRack})`,
                        Closed: `Completed (${orders.filter(o => o.status === 'Closed' || o.status === 'Collected').length})`,
                      }
                      return (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${statusFilter === s
                            ? 'bg-[#0F1115] text-white shadow-xs'
                            : 'bg-white border border-[#E8E1D5] text-[#1E2229] hover:border-[#9E593B] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          {labelMap[s] || s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-5 items-start">
                  {/* Order List */}
                  <div className="lg:col-span-7 space-y-2.5">
                    {filteredOrders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id
                      const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.Closed
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${isSelected
                            ? 'border-[#9E593B] shadow-xs ring-2 ring-[#9E593B]/20'
                            : 'border-[#E8E1D5] hover:border-[#9E593B]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="size-12 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E8E1D5] shrink-0">
                                <img src={getGarmentPhoto(order)} alt={order.garmentName} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className="font-mono text-xs font-bold text-[#1E2229]">#{order.id}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${st.bg} ${st.text}`}>
                                    {order.status}
                                  </span>
                                  {order.hangTagNo && (
                                    <span className="font-mono text-[10px] bg-[#FFF7F2] border border-[#9E593B]/20 text-[#9E593B] px-1.5 py-0.5 rounded font-semibold">
                                      {order.hangTagNo}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-xs text-[#1E2229] truncate">{order.garmentName}</div>
                                <div className="text-[11px] text-[#6B7280]">{order.serviceName} · {order.customerName}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-sm text-emerald-800">${order.partnerPayout || Math.round((order.price || 35) * 0.75)}</div>
                              <div className="text-[10px] text-[#9E593B] font-semibold">Net Payout</div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[#E8E1D5] flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleOpenEditMeasurements(order)} className="text-xs font-semibold text-[#9E593B] hover:underline flex items-center gap-1 cursor-pointer">
                              <Edit3 size={11} /> Edit Specs
                            </button>
                            <div className="flex items-center gap-2">
                              {order.status === 'Accepted' && (
                                <button onClick={() => { setPinInput(order.otp); handleLookupPin(order.otp); setActiveTab('cockpit') }} className="text-xs font-semibold text-[#1E2229] bg-[#F3EFEA] hover:bg-[#E8E1D5] px-3 py-1 rounded-xl cursor-pointer border border-[#E8E1D5]">Intake Drop-Off →</button>
                              )}
                              {order.status === 'Work in Progress' && (
                                <button onClick={() => handleMarkAlterationDone(order.id)} className="text-xs font-semibold text-white bg-[#0F1115] hover:bg-[#9E593B] px-3 py-1 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs">
                                  <CheckCircle size={12} /> Mark Done
                                </button>
                              )}
                              {order.status === 'Ready' && (
                                <button onClick={() => handleOpenPickupModal(order)} className="text-xs font-semibold text-white bg-[#0F1115] hover:bg-[#9E593B] px-3 py-1 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs">
                                  <Package size={12} /> Pickup →
                                </button>
                              )}
                              {order.status === 'Closed' && (
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Completed ✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {filteredOrders.length === 0 && (
                      <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E1D5] text-xs text-[#6B7280]">No orders found matching your search.</div>
                    )}
                  </div>

                  {/* Order Detail */}
                  <div className="lg:col-span-5 bg-white border border-[#E8E1D5] rounded-2xl p-5 sm:p-6 shadow-2xs sticky top-4 space-y-4">
                    {selectedOrder ? (
                      <>
                        <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#E8E1D5]">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="size-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E8E1D5] shrink-0">
                              <img src={getGarmentPhoto(selectedOrder)} alt={selectedOrder.garmentName} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#1E2229] bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 rounded">#{selectedOrder.id}</span>
                                <span className="text-xs font-semibold text-[#9E593B] bg-[#FFF7F2] border border-[#9E593B]/20 px-2 py-0.5 rounded">
                                  PIN #{selectedOrder.otp}
                                </span>
                              </div>
                              <h3 className="font-bold text-sm text-[#1E2229] truncate">{selectedOrder.garmentName}</h3>
                              <p className="text-xs text-[#6B7280]">{selectedOrder.serviceName}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xl font-bold text-emerald-800">${selectedOrder.partnerPayout || Math.round((selectedOrder.price || 35) * 0.8)}</div>
                            <div className="text-[10px] text-[#9E593B] font-semibold">Net (80%)</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={15} className="text-[#9E593B] shrink-0" />
                            <div>
                              <div className="font-semibold text-[#1E2229]">Paid ${(selectedOrder.price || 35)} Online</div>
                              <div className="text-[11px] text-[#6B7280]">80% releases 15 days post-handover</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold bg-white text-[#1E2229] border border-[#E8E1D5] px-2.5 py-0.5 rounded-full shrink-0">Stripe Escrow</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F3EFEA]/80 border border-[#E8E1D5] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1E2229] flex items-center gap-1.5"><Ruler size={13} className="text-[#9E593B]" /> Measurements</span>
                            <button onClick={() => handleOpenEditMeasurements(selectedOrder)} className="text-xs font-semibold text-[#9E593B] hover:underline flex items-center gap-1 cursor-pointer bg-white border border-[#E8E1D5] px-2.5 py-0.5 rounded-lg">
                              <Edit3 size={11} /> Edit
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              { label: 'Hem', val: selectedOrder.measurements?.hem || selectedOrder.pinnedAdjustment || 'Standard' },
                              { label: 'Waist', val: selectedOrder.measurements?.waist || 'Standard' },
                              { label: 'Sleeves', val: selectedOrder.measurements?.sleeve || 'Standard' },
                              { label: 'Inseam', val: selectedOrder.measurements?.inseam || 'Original' },
                            ].map(m => (
                              <div key={m.label} className="bg-white p-2 rounded-xl border border-[#E8E1D5]">
                                <span className="text-[10px] text-[#9E593B] font-bold block mb-0.5 uppercase">{m.label}</span>
                                <span className="font-semibold text-[#1E2229]">{m.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-[#E8E1D5] space-y-2 text-xs divide-y divide-[#E8E1D5]">
                          <div className="flex justify-between pb-1.5"><span className="text-[#6B7280]">Customer:</span><span className="font-semibold text-[#1E2229]">{selectedOrder.customerName}</span></div>
                          <div className="flex justify-between py-1.5"><span className="text-[#6B7280]">Phone:</span><a href={`tel:${selectedOrder.customerPhone}`} className="font-semibold text-[#9E593B] hover:underline">{selectedOrder.customerPhone || 'N/A'}</a></div>
                          <div className="flex justify-between py-1.5"><span className="text-[#6B7280]">Rack Tag:</span><span className="font-mono font-bold text-[#1E2229]">{selectedOrder.hangTagNo || 'N/A'}</span></div>
                          <div className="flex justify-between pt-1.5"><span className="text-[#6B7280]">Turnaround:</span><span className="font-semibold text-[#1E2229]">{selectedOrder.slaHours || 48}h Guaranteed</span></div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-[#6B7280] text-xs">Select an order to inspect docket</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: CAPACITY                                                */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'capacity' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Daily Capacity */}
                  <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-[#1E2229]">Daily Intake Limit</h3>
                        <p className="text-xs text-[#6B7280]">Max garments workshop accepts daily</p>
                      </div>
                      <span className="text-xs font-bold bg-[#FAF8F5] border border-[#E8E1D5] px-3 py-1 rounded-full text-[#1E2229]">
                        {capacityLimit} / day
                      </span>
                    </div>

                    <div className="p-4 bg-[#F3EFEA]/80 rounded-2xl border border-[#E8E1D5] space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#6B7280]">Active Bookings:</span>
                        <span className="text-[#1E2229]">{orders.length} of {capacityLimit} slots</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#E8E1D5] overflow-hidden">
                        <div className="h-full bg-[#9E593B] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (orders.length / capacityLimit) * 100)}%` }} />
                      </div>
                      <div className="text-[11px] text-[#6B7280] text-right">{Math.max(0, capacityLimit - orders.length)} slots remaining today</div>
                    </div>

                    <input type="range" min={10} max={50} value={capacityLimit} onChange={(e) => setCapacityLimit(parseInt(e.target.value))} className="w-full accent-[#9E593B] cursor-pointer" />
                    <div className="flex justify-between text-xs text-[#6B7280]">
                      <span>10 (Boutique)</span><span>25 (Standard)</span><span>50 (High Volume)</span>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 shadow-2xs space-y-4">
                    <h3 className="font-bold text-base text-[#1E2229]">Workshop Operating Hours</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        { day: 'Monday – Friday:', time: '09:00 AM – 07:00 PM' },
                        { day: 'Saturday:', time: '10:00 AM – 06:00 PM' },
                        { day: 'Sunday:', time: 'Closed for Rest' },
                      ].map((h) => (
                        <div key={h.day} className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                          <span className="text-[#6B7280]">{h.day}</span>
                          <span className={`font-semibold ${h.time.includes('Closed') ? 'text-[#6B7280]' : 'text-[#1E2229]'}`}>{h.time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <span className="font-semibold text-emerald-900">Counter Dispatch Status</span>
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Receiving Orders
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Machines */}
                <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 shadow-2xs space-y-3">
                  <h3 className="font-bold text-base text-[#1E2229]">Workshop Machines</h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { name: 'Juki DDL-8700 Lockstitch', type: 'Primary Bench', status: 'Ready / Active' },
                      { name: 'Juki MO-6814S Overlock', type: 'Finishing Bench', status: 'Ready / Active' },
                      { name: 'Union Special Denim Chainstitch', type: 'Denim Hemming', status: 'Ready / Active' },
                      { name: 'Reece 101 Eyelet Buttonholer', type: 'Suits & Tailoring', status: 'Standby' },
                    ].map((m, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                        <div>
                          <div className="font-bold text-[#1E2229]">{m.name}</div>
                          <div className="text-[11px] text-[#6B7280]">{m.type}</div>
                        </div>
                        <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 4: PAYOUTS                                                 */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'payouts' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">Pending 15-Day Escrow</span>
                    <div className="text-2xl font-bold text-[#1E2229] mt-1">${todayEarned}</div>
                    <div className="text-xs text-[#9E593B] font-medium mt-1">Releases 15 days post-handover</div>
                  </div>
                  <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">Disbursed to Bank</span>
                    <div className="text-2xl font-bold text-emerald-800 mt-1">${totalClosedDisbursed}</div>
                    <div className="text-xs text-[#6B7280] mt-1">Stripe Connect Direct Deposit</div>
                  </div>
                  <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">Studio Revenue Share</span>
                    <div className="text-2xl font-bold text-[#1E2229] mt-1">80% Net</div>
                    <div className="text-xs text-[#6B7280] mt-1">20% Platform Fee</div>
                  </div>
                </div>

                {/* Stripe Connect */}
                <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="size-10 rounded-xl bg-[#FFF7F2] text-[#9E593B] border border-[#9E593B]/20 grid place-items-center shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1E2229]">Stripe Connect · Verified Payouts</span>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">✓ Active</span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">Customer payments held in 15-day rolling escrow · Automatic direct deposits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#6B7280]">Schedule: </span>
                    <span className="text-xs font-bold text-[#1E2229]">15 Days Post-Pickup</span>
                  </div>
                </div>

                {/* Ledger */}
                <div className="bg-white border border-[#E8E1D5] rounded-2xl p-6 shadow-2xs space-y-4">
                  <h2 className="font-bold text-base text-[#1E2229]">15-Day Rolling Payout Ledger</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[#6B7280]">
                        <tr>
                          <th className="p-3.5 font-bold">Order / Customer</th>
                          <th className="p-3.5 font-bold">Paid</th>
                          <th className="p-3.5 font-bold">Fee (20%)</th>
                          <th className="p-3.5 font-bold">Studio Net (80%)</th>
                          <th className="p-3.5 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E1D5]">
                        {orders
                          .filter((o) => ['Closed', 'Collected', 'Ready', 'Work in Progress'].includes(o.status))
                          .map((o) => {
                            const price = o.price || 30
                            const fee = Math.round(price * 0.2 * 100) / 100
                            const net = o.partnerPayout || Math.round(price * 0.8 * 100) / 100
                            const isSettled = o.status === 'Closed' || o.status === 'Collected'
                            return (
                              <tr key={o.id}>
                                <td className="p-3.5 font-semibold text-[#1E2229]">#{o.id} · {o.customerName}</td>
                                <td className="p-3.5 text-[#1E2229]">${price}.00</td>
                                <td className="p-3.5 text-[#6B7280]">-${fee}</td>
                                <td className="p-3.5 font-bold text-emerald-800">${net}</td>
                                <td className="p-3.5 text-right">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${isSettled ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                    {isSettled ? 'Deposited' : '15-Day Escrow'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        {orders.filter((o) => ['Closed', 'Collected', 'Ready', 'Work in Progress'].includes(o.status)).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-xs text-[#6B7280]">No settlements yet. Working orders will appear here.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* ── MOBILE BOTTOM TAB BAR ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E8E1D5] flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id
            const Icon = item.icon
            const badge = item.id === 'cockpit' && allBroadcasts.length > 0 ? allBroadcasts.length : null
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors cursor-pointer relative ${
                  active ? 'text-[#9E593B] font-bold' : 'text-[#6B7280] font-medium'
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px]">{item.shortLabel}</span>
                {badge && (
                  <span className="absolute -top-0.5 right-0.5 size-4 bg-amber-400 text-stone-950 text-[9px] font-bold rounded-full grid place-items-center">{badge}</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS — CLEAN MINIMALIST DIALOGS                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {/* Edit Measurements */}
      {isEditMeasOpen && editTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-[#E8E1D5] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1E2229]">Edit Garment Specifications</h3>
                <p className="text-xs text-[#6B7280]">{editTargetOrder.garmentName} · {editTargetOrder.customerName}</p>
              </div>
              <button onClick={() => setIsEditMeasOpen(false)} className="p-1 text-[#6B7280] hover:text-[#1E2229] rounded-lg hover:bg-[#FAF8F5] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Hem Adjustment', val: measHem, set: setMeasHem, ph: 'e.g. -3.5 cm' },
                { label: 'Waist / Seat', val: measWaist, set: setMeasWaist, ph: 'e.g. Suppress 1.5 in' },
                { label: 'Sleeves / Cuffs', val: measSleeve, set: setMeasSleeve, ph: 'e.g. -1.0 in from cuff' },
                { label: 'Finished Inseam', val: measInseam, set: setMeasInseam, ph: 'e.g. 30.5 in' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block font-semibold text-[#1E2229] mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] bg-white focus:border-[#9E593B] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E1D5] flex justify-end gap-2">
              <button
                onClick={() => setIsEditMeasOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E1D5] text-xs font-semibold text-[#6B7280] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeasurements}
                className="px-4 py-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Save Specs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Verification Modal */}
      {pickupModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-[#E8E1D5] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E593B] block">
                  Customer Handover
                </span>
                <h3 className="font-bold text-base text-[#1E2229]">
                  Verify Pickup PIN
                </h3>
              </div>
              <button onClick={() => setPickupModalOrder(null)} className="p-1 text-[#6B7280] hover:text-[#1E2229] rounded-lg hover:bg-[#FAF8F5] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {!pickupVerified ? (
              <div className="space-y-4">
                <p className="text-xs text-[#6B7280]">
                  Ask <strong>{pickupModalOrder.customerName}</strong> for their 4-digit pickup code:
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pickupOtpInput}
                    onChange={(e) => setPickupOtpInput(e.target.value)}
                    placeholder="Enter code (e.g. 1839)"
                    className="w-full text-center font-mono font-bold text-2xl tracking-[0.25em] py-3.5 rounded-xl border border-[#E8E1D5] focus:border-[#9E593B] focus:outline-none"
                  />
                  {pickupOtpError && (
                    <p className="text-xs text-red-600 font-medium">{pickupOtpError}</p>
                  )}
                  <p className="text-xs text-[#6B7280] text-center">
                    (Customer Pickup PIN: <strong className="text-[#1E2229]">#{pickupModalOrder.otp}</strong>)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPickupOtp}
                  className="w-full py-3 bg-[#0F1115] hover:bg-[#9E593B] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Verify Customer Code →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>✓ Identity Verified! Ready for garment handover.</span>
                </div>

                {/* Retail In-Store Sales Prompt */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3 text-xs">
                  <label className="font-semibold text-[#1E2229] block">
                    Did the customer purchase retail accessories during pickup?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRetailAnswer('YES')}
                      className={`flex-1 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                        retailAnswer === 'YES'
                          ? 'bg-[#0F1115] text-white border-[#0F1115]'
                          : 'bg-white text-[#1E2229] border-[#E8E1D5] hover:bg-[#F3EFEA]'
                      }`}
                    >
                      Yes (+Add Sale)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetailAnswer('NO')}
                      className={`flex-1 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                        retailAnswer === 'NO'
                          ? 'bg-[#0F1115] text-white border-[#0F1115]'
                          : 'bg-white text-[#1E2229] border-[#E8E1D5] hover:bg-[#F3EFEA]'
                      }`}
                    >
                      No (Handover Only)
                    </button>
                  </div>

                  {retailAnswer === 'YES' && (
                    <div className="pt-2 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#9E593B] block mb-0.5">RETAIL SALE AMOUNT ($)</span>
                        <input
                          type="number"
                          value={retailValueInput}
                          onChange={(e) => setRetailValueInput(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#E8E1D5] bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#9E593B] block mb-0.5">CATEGORY</span>
                        <select
                          value={retailCategoryInput}
                          onChange={(e) => setRetailCategoryInput(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#E8E1D5] bg-white text-xs font-medium"
                        >
                          <option>Accessories &amp; Ties</option>
                          <option>Custom Garment Bag &amp; Hanger</option>
                          <option>Shoe Care &amp; Brushes</option>
                          <option>Bespoke Cufflinks</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCompletePickupAndSettlement}
                  disabled={retailAnswer === null}
                  className={`w-full py-3 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                    retailAnswer === null
                      ? 'bg-[#E8E1D5] text-[#9CA3AF] cursor-not-allowed'
                      : 'bg-[#9E593B] hover:bg-[#8A4C32] text-white cursor-pointer active:scale-95'
                  }`}
                >
                  {pickupCompleted ? '✓ Order Settled!' : 'Complete Handover & Lock Earnings →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
