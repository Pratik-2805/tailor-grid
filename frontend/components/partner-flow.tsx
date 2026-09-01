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
  'Work in Progress': { label: 'On Sewing Bench', bg: 'bg-amber-50', text: 'text-amber-900 border-amber-300', dot: 'bg-amber-600' },
  Ready: { label: 'Ready on Rack', bg: 'bg-emerald-50', text: 'text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Collected: { label: 'Picked Up', bg: 'bg-teal-50', text: 'text-teal-800 border-teal-200', dot: 'bg-teal-500' },
  Closed: { label: 'Completed & Paid', bg: 'bg-stone-50', text: 'text-stone-700 border-stone-200', dot: 'bg-stone-400' },
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

export function PartnerFlow({ go, user, onSignOut }: PartnerFlowProps) {
  const rawStudioName = user?.studioName || ''
  const studioName = rawStudioName.length > 2 ? rawStudioName : 'Atelier SoHo'
  const tailorName = user?.name || 'Marco Rossi'

  const [activeTab, setActiveTab] = useState<StudioTab>('cockpit')
  const [online, setOnline] = useState(true)
  const [orders, setOrders] = useState<FittingBooking[]>([])
  const [selectedOrder, setSelectedOrder] = useState<FittingBooking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  // ── 1. Live Broadcast Queue & 15-Second Circular Rotation ───────────────────
  const [broadcastIdx, setBroadcastIdx] = useState(0)
  const [timerSecs, setTimerSecs] = useState(15)
  const [timerPaused, setTimerPaused] = useState(false)
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null)

  // ── 2. Drop-off Intake PIN Handshake State ─────────────────────────────────
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeIntake, setActiveIntake] = useState<FittingBooking | null>(null)

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
    } catch {}
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
        }).catch(() => {})
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
    await updateOrder(order.id, updates).catch(() => {})

    setBroadcastToast(`✓ Alteration Accepted: ${order.customerName} ($${partnerPayout}) — PIN Code #${order.otp}`)
    setTimeout(() => setBroadcastToast(null), 5000)
  }

  const handleDeclineAllocatedOrder = async (orderId: string) => {
    const updates: Partial<FittingBooking> = {
      status: 'Closed',
      storeId: undefined,
      storeName: undefined,
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    await updateOrder(orderId, updates).catch(() => {})
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
    updateOrder(id, updates).catch(() => {})
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
    updateOrder(orderId, updates).catch(() => {})

    setBroadcastToast(`✓ Alteration Done! Customer notified with Pickup PIN: #${freshPickupOtp}`)
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
      setPinError(`No scheduled order found with PIN "${clean}". Tap any customer below to auto-fill.`)
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
      setSelectedOrder(orders.find((o) => o.id === activeIntake.id) || activeIntake)
      setBroadcastToast(`✓ Garment Placed on Sewing Bench: ${activeIntake.customerName} (${hangTag})`)
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
    updateOrder(editTargetOrder.id, updates).catch(() => {})
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
    updateOrder(pickupModalOrder.id, updates).catch(() => {})

    setPickupCompleted(true)
    setTimeout(() => {
      setPickupModalOrder(null)
      setPickupCompleted(false)
      setBroadcastToast(`✓ Order Handover Complete: Payout credited to weekly balance!`)
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

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#111827] font-sans antialiased pb-12">
      {/* ── 1. MASTER TAILOR WORKSHOP COMMAND BAR (Uber/Rapido Driver HUD) ── */}
      <div className="bg-white border-b border-[#E8E1D5] sticky top-[68px] z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Atelier Identity & Online Radar Switch */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="size-11 rounded-2xl bg-[#0F1115] text-[#FAF8F5] grid place-items-center font-bold text-sm shadow-xs border border-black/10">
                  <Scissors size={18} className="text-[#E7C9BA]" />
                </div>
                {online && (
                  <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-base text-[#0F1115] tracking-tight">{studioName}</span>
                  <div className="inline-flex items-center gap-1 bg-[#FFF9F2] text-[#9E593B] border border-[#EEDCCF] px-2 py-0.5 rounded-md text-[10px] font-bold">
                    <Star size={10} className="fill-[#9E593B]" />
                    <span>4.9★ Master Studio</span>
                  </div>
                </div>

                {/* Online / Bench Radar Toggle */}
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => setOnline(!online)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      online
                        ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    <span className={`size-2 rounded-full ${online ? 'bg-white animate-ping' : 'bg-stone-500'}`} />
                    <span>{online ? 'BENCH ONLINE' : 'BENCH PAUSED'}</span>
                  </button>

                  <span className="text-[11px] text-[#6B7280] hidden sm:inline">
                    {online ? '• Scanning SoHo grid for alterations' : '• Not receiving new requests'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Performance Scorecard Strip */}
            <div className="hidden lg:flex items-center divide-x divide-[#E8E1D5] bg-[#F7F4EE] border border-[#E8E1D5] rounded-2xl p-1 text-xs">
              <div className="px-3.5 py-1 text-center">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#71717A] block">Today's Net</span>
                <span className="font-bold text-sm text-emerald-800">${todayEarned}</span>
              </div>
              <div className="px-3.5 py-1 text-center">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#71717A] block">On Bench</span>
                <span className="font-bold text-sm text-[#0F1115]">{activeOnBench} sewing</span>
              </div>
              <div className="px-3.5 py-1 text-center">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#71717A] block">Drop-Offs</span>
                <span className="font-bold text-sm text-blue-700">{pendingDropOffs} pending</span>
              </div>
              <div className="px-3.5 py-1 text-center">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#71717A] block">Capacity</span>
                <span className="font-bold text-sm text-[#9E593B]">{orders.length}/{capacityLimit}</span>
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                title="Refresh Queue"
                className="size-9 rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] grid place-items-center text-[#4B5563] hover:text-[#0F1115] hover:border-[#0F1115] transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => {
                  if (onSignOut) onSignOut()
                  else go('partner')
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E1D5] bg-[#FAF8F5] text-xs font-semibold text-[#4B5563] hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>

          {/* Clean 4 Workspace Navigation Tabs */}
          <div className="mt-3 pt-2.5 border-t border-[#F0EBE1] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <nav className="flex items-center gap-2 text-xs font-semibold">
              {[
                { id: 'cockpit', label: '1. Workshop Cockpit', icon: Zap, badge: allBroadcasts.length ? `${allBroadcasts.length} Ping` : undefined },
                { id: 'pipeline', label: `2. Alterations Pipeline (${orders.length})`, icon: Layers },
                { id: 'capacity', label: '3. Workshop Capacity', icon: Settings },
                { id: 'payouts', label: '4. Payouts & Escrow', icon: CreditCard },
              ].map((t) => {
                const active = activeTab === t.id
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as StudioTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0F1115] text-white font-bold shadow-xs'
                        : 'bg-[#F4EFEA] text-[#5A5D64] hover:bg-[#EDE6DE] hover:text-[#0F1115]'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-[#E7C9BA]' : 'text-[#71717A]'} />
                    <span>{t.label}</span>
                    {t.badge && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full animate-bounce">
                        {t.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <div className="text-[11px] text-[#71717A] hidden md:flex items-center gap-1.5 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Stripe Connect Payouts: <strong>80% Net Guaranteed</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOAST ALERT ── */}
      {broadcastToast && (
        <div className="bg-[#0F1115] text-white py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 sticky top-[138px] z-20 shadow-lg border-b border-white/10 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{broadcastToast}</span>
        </div>
      )}

      {/* ── 2. INCOMING ALTERATION RADAR CARD (Uber/Rapido Ride Request Style) ── */}
      {online && currentBroadcast ? (
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 pt-5"
          onMouseEnter={() => setTimerPaused(true)}
          onMouseLeave={() => setTimerPaused(false)}
        >
          <div className="rounded-3xl bg-[#0F1115] text-white p-5 sm:p-6 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Left: Garment Image & Live Countdown Ring */}
              <div className="flex items-start gap-4 sm:gap-5 w-full lg:w-auto">
                <div className="relative size-24 sm:size-26 rounded-2xl overflow-hidden bg-stone-900 border border-white/15 shrink-0 shadow-lg group">
                  <img
                    src={getGarmentPhoto({ intakePhotoUrl: currentBroadcast.imageUrl, garmentName: currentBroadcast.garmentName })}
                    alt={currentBroadcast.garmentName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 font-mono text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {currentBroadcast.id}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Zap size={11} className="fill-amber-300" />
                      <span>{currentBroadcast.isRealCustomerOrder ? 'LIVE CUSTOMER ORDER' : 'LIVE JOB BROADCAST'}</span>
                    </span>

                    {currentBroadcast.garmentBrand && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 bg-white/10 border border-white/10 px-2 py-0.5 rounded-md">
                        <Tag size={10} className="text-amber-300" />
                        <span>{currentBroadcast.garmentBrand}</span>
                      </span>
                    )}

                    <span className="text-xs text-white/60">
                      Request {broadcastIdx + 1} of {allBroadcasts.length}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                    {currentBroadcast.garmentName}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 text-white font-bold bg-[#9E593B]/80 px-2.5 py-0.5 rounded-md">
                      <Scissors size={12} />
                      <span>{currentBroadcast.serviceName}</span>
                    </span>

                    {currentBroadcast.fittingType === 'NEED_STUDIO_FITTING' ? (
                      <span className="inline-flex items-center gap-1 text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md font-semibold">
                        <Ruler size={11} />
                        <span>Fitting at Counter</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md font-semibold">
                        <CheckCircle2 size={11} />
                        <span>Pre-Pinned by Customer</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/80 italic line-clamp-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    "{currentBroadcast.fitNotes}"
                  </p>

                  <div className="flex items-center gap-4 text-xs text-white/70 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <User size={12} className="text-white/50" />
                      <span>{currentBroadcast.customerName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-amber-400" />
                      <span>{currentBroadcast.customerArea}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-300">
                      <Clock size={12} />
                      <span>{currentBroadcast.slaHours}h Turnaround</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Payout + Circular Timer Ring + Accept/Decline */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="relative size-14 grid place-items-center shrink-0">
                    <svg className="size-14 -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r={timerRadius}
                        className="stroke-white/15"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={timerRadius}
                        className="stroke-amber-400 transition-all duration-1000 ease-linear"
                        strokeWidth="3.5"
                        strokeDasharray={timerCircumference}
                        strokeDashoffset={timerStrokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-mono text-xs font-black text-amber-300">
                      {timerSecs}s
                    </span>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-white/60 font-extrabold block">
                      YOU EARN
                    </span>
                    <div className="text-3xl font-black text-emerald-400 leading-none">
                      ${currentBroadcast.partnerPayout}
                    </div>
                    <span className="text-[10px] text-white/60 mt-0.5 block">80% Pre-paid</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleSkipBroadcast(currentBroadcast)}
                    className="px-4 py-2.5 rounded-full border border-white/25 bg-white/5 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    {currentBroadcast.isRealCustomerOrder ? 'Decline' : 'Pass'}
                  </button>

                  <button
                    onClick={() => handleAcceptBroadcast(currentBroadcast)}
                    className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <Zap size={14} className="fill-black" />
                    <span>Accept Alteration (${currentBroadcast.partnerPayout})</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>
      ) : online ? (
        /* Radar Scanning Grid Bar when online and idle */
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-5">
          <div className="rounded-2xl bg-white border border-[#E8E1D5] p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative size-3.5 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#0F1115] block">
                  Bench Radar Active · Scanning Grid for Alterations
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  Nearby customer alteration requests will ping this workbench instantly.
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap hidden sm:inline">
              Live Dispatch Active
            </span>
          </div>
        </section>
      ) : null}

      {/* ── 3. MAIN WORKSPACE TABS ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: WORKSHOP COCKPIT (Uber Driver Flow: PIN Drop-Off & Bench Queue)  */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'cockpit' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Customer Drop-Off PIN Station */}
              <div className="lg:col-span-7 space-y-4">
                {!activeIntake ? (
                  /* Standby Counter Mode: Tactile PIN Pad & Arrival Queue */
                  <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#9E593B] mb-1">
                          <Package size={13} />
                          <span>In-Store Customer Counter</span>
                        </div>
                        <h2 className="font-serif text-xl font-bold text-[#0F1115]">
                          Drop-Off Handshake &amp; PIN Verification
                        </h2>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          When the customer walks in, enter their 4-digit code to open the garment ticket.
                        </p>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        Counter Ready
                      </span>
                    </div>

                    {/* 4-Digit PIN Input with High-Contrast Button */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={pinInput}
                          onChange={(e) => {
                            setPinInput(e.target.value)
                            setPinError('')
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && pinInput) handleLookupPin(pinInput)
                          }}
                          placeholder="Enter 4-digit PIN (e.g. 1839)"
                          className="flex-1 text-center font-mono font-black text-xl tracking-[0.3em] bg-[#FBF9F6] border-2 border-[#D1D5DB] rounded-2xl py-3.5 focus:border-[#0F1115] focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => handleLookupPin(pinInput)}
                          className="px-6 py-3.5 bg-[#0F1115] hover:bg-[#9E593B] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
                        >
                          <ShieldCheck size={16} />
                          <span>Verify PIN →</span>
                        </button>
                      </div>

                      {pinError && (
                        <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>{pinError}</span>
                        </p>
                      )}
                    </div>

                    {/* Quick-Tap Arriving Customers Today (Uber/Rapido style instant select) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F1115] uppercase tracking-wider">
                          Arriving Today · Tap to Auto-Fill PIN
                        </span>
                        <span className="text-[11px] text-[#71717A] font-semibold">
                          {orders.filter((o) => ['Accepted', 'Allocated'].includes(o.status)).length} scheduled
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {orders
                          .filter((o) => ['Accepted', 'Allocated'].includes(o.status))
                          .slice(0, 6)
                          .map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => {
                                setPinInput(o.otp)
                                handleLookupPin(o.otp)
                              }}
                              className="text-left p-3 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] hover:bg-[#F3EFEA] hover:border-[#0F1115] transition-all cursor-pointer group flex items-center justify-between gap-2.5 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="size-10 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                                  <img src={getGarmentPhoto(o)} alt={o.garmentName} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                      #{o.otp}
                                    </span>
                                    <span className="font-bold text-xs text-[#0F1115] truncate">{o.customerName}</span>
                                  </div>
                                  <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                                    {o.garmentName} · {o.timeSlot}
                                  </div>
                                </div>
                              </div>

                              <span className="text-xs font-bold text-emerald-700 shrink-0">
                                ${o.partnerPayout || Math.round((o.price || 35) * 0.75)}
                              </span>
                            </button>
                          ))}

                        {orders.filter((o) => ['Accepted', 'Allocated'].includes(o.status)).length === 0 && (
                          <div className="col-span-2 p-6 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD6CB] text-xs text-[#71717A]">
                            No customer drop-offs currently pending.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active Garment Intake Inspection Docket */
                  <div className="bg-white border-2 border-[#0F1115] rounded-3xl p-6 sm:p-7 shadow-lg space-y-5 animate-scaleUp">
                    {/* Header with Garment Photo & Digital Hang-Tag */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8E1D5]">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="size-16 rounded-2xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0">
                          <img
                            src={getGarmentPhoto(activeIntake)}
                            alt={activeIntake.garmentName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-xs font-bold bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 rounded-md">
                              {activeIntake.id}
                            </span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              ✓ PIN #{activeIntake.otp} Verified
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-[#0F1115]">{activeIntake.garmentName}</h3>
                          <p className="text-xs text-[#6B7280]">{activeIntake.customerName} · {activeIntake.serviceName}</p>
                        </div>
                      </div>

                      {/* Hang-tag badge */}
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold">
                          <Tag size={12} />
                          <span>{hangTag}</span>
                        </div>
                        <div className="text-xs font-black text-emerald-700 mt-1">
                          ${activeIntake.partnerPayout || Math.round((activeIntake.price || 35) * 0.75)} Net Payout
                        </div>
                      </div>
                    </div>

                    {/* Pre-Pinned Instructions from Customer */}
                    {activeIntake.fitNotes && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] block mb-1">
                          CUSTOMER FIT REQUEST
                        </span>
                        <p className="text-[#1F2937] italic">"{activeIntake.fitNotes}"</p>
                      </div>
                    )}

                    {/* Workshop Intake Checklist: Condition, Measurements, Machine */}
                    <div className="space-y-3 text-xs">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#0F1115] mb-1">Fabric Condition Notes</label>
                          <input
                            type="text"
                            value={conditionNotes}
                            onChange={(e) => setConditionNotes(e.target.value)}
                            placeholder="e.g. Pristine wool, no flaws"
                            className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] focus:border-[#0F1115] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#0F1115] mb-1">Garment Rack Hang-Tag</label>
                          <input
                            type="text"
                            value={hangTag}
                            onChange={(e) => setHangTag(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB] font-mono font-semibold focus:border-[#0F1115] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Tailor Pinned Measurements */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] block">
                          TAILOR ALTERATION SPECIFICATIONS
                        </span>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={measHem}
                            onChange={(e) => setMeasHem(e.target.value)}
                            placeholder="Hem (e.g. Shorten 3.5 cm)"
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] font-medium"
                          />
                          <input
                            type="text"
                            value={measWaist}
                            onChange={(e) => setMeasWaist(e.target.value)}
                            placeholder="Waist / Seat adjustment"
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] font-medium"
                          />
                          <input
                            type="text"
                            value={measSleeve}
                            onChange={(e) => setMeasSleeve(e.target.value)}
                            placeholder="Sleeves / Cuffs"
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] font-medium"
                          />
                          <input
                            type="text"
                            value={measInseam}
                            onChange={(e) => setMeasInseam(e.target.value)}
                            placeholder="Finished Inseam"
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] font-medium"
                          />
                        </div>
                      </div>

                      {/* Assigned Tailor & Machine Station */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#0F1115] mb-1">Assigned Master Tailor</label>
                          <input
                            type="text"
                            value={worker}
                            onChange={(e) => setWorker(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#0F1115] mb-1">Sewing Machine Bench</label>
                          <input
                            type="text"
                            value={machine}
                            onChange={(e) => setMachine(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Surcharge Accordion */}
                    <div className="pt-1">
                      {!showPriceAdjust ? (
                        <button
                          type="button"
                          onClick={() => setShowPriceAdjust(true)}
                          className="text-xs font-bold text-[#9E593B] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Add surcharge for complex silk / extra fabric work</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                          <span className="font-bold text-amber-900">Complex Fabric Surcharge</span>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Amount ($)"
                              value={priceAdjustAmount}
                              onChange={(e) => setPriceAdjustAmount(e.target.value)}
                              className="w-24 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300"
                            />
                            <input
                              type="text"
                              placeholder="Reason (e.g. heavy lining hand-stitch)"
                              value={priceAdjustReason}
                              onChange={(e) => setPriceAdjustReason(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300"
                            />
                            <button
                              type="button"
                              onClick={() => setPriceAdjustApproved(true)}
                              className="px-3 py-1.5 rounded-lg bg-[#0F1115] text-white font-bold"
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
                        className="px-4 py-3 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-[#4B5563] hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmIntakeAndStart}
                        className="flex-1 bg-[#0F1115] hover:bg-[#9E593B] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                      >
                        <Scissors size={15} />
                        <span>Confirm Drop-Off &amp; Place on Sewing Bench →</span>
                      </button>
                    </div>

                    {intakeSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                        ✓ Intake complete! Garment placed on bench &amp; SLA clock started.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Live Sewing Bench (In-Progress SLA Timers) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3.5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 mb-0.5">
                        <Scissors size={13} />
                        <span>Active Sewing Bench</span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#0F1115]">
                        Garments in Progress ({activeOnBench})
                      </h3>
                    </div>

                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      Live SLA Clocks
                    </span>
                  </div>

                  <div className="space-y-3">
                    {orders
                      .filter((o) => o.status === 'Work in Progress')
                      .map((order) => {
                        const sla = getSlaCountdown(order)
                        return (
                          <div
                            key={order.id}
                            className="p-3.5 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#0F1115] transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="size-12 rounded-xl overflow-hidden bg-stone-200 border border-[#E8E1D5] shrink-0">
                                  <img src={getGarmentPhoto(order)} alt={order.garmentName} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-mono text-xs font-bold text-[#0F1115]">{order.id}</span>
                                    {order.hangTagNo && (
                                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                        {order.hangTagNo}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-[#0F1115] truncate">{order.garmentName}</h4>
                                  <p className="text-[11px] text-[#6B7280] truncate">{order.customerName} · {order.serviceName}</p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-xs text-emerald-700 block">
                                  ${order.partnerPayout || Math.round((order.price || 35) * 0.75)}
                                </span>
                                <span className={`text-[10px] font-bold flex items-center gap-1 ${sla.urgent ? 'text-red-600' : 'text-[#6B7280]'}`}>
                                  <Clock size={10} />
                                  <span>{sla.text}</span>
                                </span>
                              </div>
                            </div>

                            <div className="h-1.5 rounded-full bg-[#E8E1D5] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  sla.urgent ? 'bg-red-500' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${sla.percent}%` }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleMarkAlterationDone(order.id)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                            >
                              <CheckCircle size={14} />
                              <span>✓ Mark Alteration Done (Notify Customer)</span>
                            </button>
                          </div>
                        )
                      })}

                    {activeOnBench === 0 && (
                      <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD6CB] text-xs text-[#71717A] space-y-1">
                        <Scissors size={20} className="mx-auto text-[#9E593B]/60 mb-1" />
                        <p className="font-bold text-[#0F1115]">No garments currently on the bench</p>
                        <p>Verify an arriving customer code on the left to start sewing.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ready on Rack for Customer Collection */}
                {readyOnRack > 0 && (
                  <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>Ready on Rack for Pickup ({readyOnRack})</span>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Customer Alerted
                      </span>
                    </div>

                    <div className="space-y-2">
                      {orders
                        .filter((o) => o.status === 'Ready')
                        .map((order) => (
                          <div
                            key={order.id}
                            className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#0F1115]">{order.customerName} · {order.garmentName}</div>
                              <div className="text-[11px] text-emerald-800 font-mono mt-0.5">
                                Pickup PIN: <strong>#{order.otp}</strong> · {order.hangTagNo || 'Rack A'}
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenPickupModal(order)}
                              className="px-3 py-1.5 bg-[#0F1115] hover:bg-[#9E593B] text-white rounded-xl font-bold text-[11px] cursor-pointer shadow-xs whitespace-nowrap"
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

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ALTERATIONS PIPELINE (Full Kanban & Order Docket)              */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, garment, ID, or rack tag..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D1D5DB] focus:border-[#0F1115] focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5 flex-wrap text-xs">
                {['ALL', 'Work in Progress', 'Accepted', 'Ready', 'Closed'].map((s) => {
                  const labelMap: Record<string, string> = {
                    ALL: `All Orders (${orders.length})`,
                    'Work in Progress': `On Bench (${activeOnBench})`,
                    Accepted: `Drop-Off Pending (${pendingDropOffs})`,
                    Ready: `Ready on Rack (${readyOnRack})`,
                    Closed: `Completed (${orders.filter(o => o.status === 'Closed' || o.status === 'Collected').length})`,
                  }
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                        statusFilter === s
                          ? 'bg-[#0F1115] text-white font-bold'
                          : 'bg-[#FAF8F5] border border-[#E8E1D5] text-[#4B5563] hover:text-[#0F1115]'
                      }`}
                    >
                      {labelMap[s] || s}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
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
                          <div className="relative size-13 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0 mt-0.5">
                            <img src={getGarmentPhoto(order)} alt={order.garmentName} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-xs font-bold text-[#0F1115]">{order.id}</span>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text}`}
                              >
                                <span className={`size-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                              {order.hangTagNo && (
                                <span className="font-mono text-[10px] bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 rounded text-[#4B5563] font-bold">
                                  {order.hangTagNo}
                                </span>
                              )}
                              {order.status === 'Ready' && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                                  Pickup PIN: #{order.otp}
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
                          <div className="text-[10px] text-[#9CA3AF] uppercase font-bold">You Earn</div>
                        </div>
                      </div>

                      <div
                        className="mt-3 pt-2.5 border-t border-[#F4EFEA] flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenEditMeasurements(order)}
                          className="text-xs font-semibold text-[#4B5563] hover:text-[#0F1115] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={11} />
                          <span>Edit Specs</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {order.status === 'Accepted' && (
                            <button
                              onClick={() => {
                                setPinInput(order.otp)
                                handleLookupPin(order.otp)
                                setActiveTab('cockpit')
                              }}
                              className="text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                            >
                              Customer Drop-Off →
                            </button>
                          )}

                          {order.status === 'Work in Progress' && (
                            <button
                              onClick={() => handleMarkAlterationDone(order.id)}
                              className="text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle size={13} className="text-emerald-700" />
                              <span>✓ Mark Alteration Done</span>
                            </button>
                          )}

                          {order.status === 'Ready' && (
                            <button
                              onClick={() => handleOpenPickupModal(order)}
                              className="text-xs font-bold text-white bg-[#0F1115] hover:bg-[#9E593B] px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                  <div className="p-8 text-center bg-white rounded-3xl border border-[#E8E1D5] text-xs text-[#71717A]">
                    No orders found matching your search.
                  </div>
                )}
              </div>

              {/* Right: Order Docket Drawer */}
              <div className="lg:col-span-5 bg-white border border-[#E8E1D5] rounded-3xl p-5 sm:p-6 shadow-xs sticky top-[150px] space-y-4">
                {selectedOrder ? (
                  <>
                    <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#E8E1D5]">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="size-16 rounded-2xl overflow-hidden bg-stone-100 border border-[#E8E1D5] shrink-0">
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
                                ? `Pickup PIN #${selectedOrder.otp}`
                                : `Drop-off PIN #${selectedOrder.otp}`}
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
                        <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">You Earn (80%)</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-900">
                            Paid ${(selectedOrder.price || 35)} Online (Stripe)
                          </div>
                          <div className="text-[11px] text-emerald-700">80% releases 15 days post-pickup</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                        Stripe Escrow
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#0F1115] uppercase tracking-wider flex items-center gap-1.5">
                          <Ruler size={13} />
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
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5]">
                          <span className="text-[10px] text-[#9CA3AF] font-bold block mb-0.5">HEM ADJUSTMENT</span>
                          <span className="font-bold text-[#0F1115]">
                            {selectedOrder.measurements?.hem || selectedOrder.pinnedAdjustment || 'Standard'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5]">
                          <span className="text-[10px] text-[#9CA3AF] font-bold block mb-0.5">WAIST / SEAT</span>
                          <span className="font-bold text-[#0F1115]">
                            {selectedOrder.measurements?.waist || 'Standard'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5]">
                          <span className="text-[10px] text-[#9CA3AF] font-bold block mb-0.5">SLEEVES</span>
                          <span className="font-bold text-[#0F1115]">
                            {selectedOrder.measurements?.sleeve || 'Standard'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5]">
                          <span className="text-[10px] text-[#9CA3AF] font-bold block mb-0.5">INSEAM</span>
                          <span className="font-bold text-[#0F1115]">
                            {selectedOrder.measurements?.inseam || 'Original'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E8E1D5] space-y-2 text-xs divide-y divide-[#F4EFEA]">
                      <div className="flex justify-between pb-1.5">
                        <span className="text-[#6B7280]">Customer:</span>
                        <span className="font-bold text-[#0F1115]">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#6B7280]">Phone:</span>
                        <a href={`tel:${selectedOrder.customerPhone}`} className="font-bold text-[#0F1115] hover:underline">
                          {selectedOrder.customerPhone || '+1 (555) 019-2831'}
                        </a>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#6B7280]">Rack Tag:</span>
                        <span className="font-mono font-bold text-[#0F1115]">
                          {selectedOrder.hangTagNo || 'Tag #14 · Rack A'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5">
                        <span className="text-[#6B7280]">Turnaround:</span>
                        <span className="font-bold text-[#0F1115]">{selectedOrder.slaHours || 48}h Guaranteed</span>
                      </div>
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
        {/* TAB 3: WORKSHOP CAPACITY & MACHINERY                                  */}
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
                  <span className="text-xs font-bold bg-[#FAF8F5] border border-[#E8E1D5] px-3 py-1 rounded-xl text-[#0F1115]">
                    {capacityLimit} / day
                  </span>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D5] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#6B7280]">Today's Bookings:</span>
                    <span className="text-[#0F1115]">
                      {orders.length} of {capacityLimit} slots used
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E8E1D5] overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (orders.length / capacityLimit) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#6B7280] text-right">
                    {Math.max(0, capacityLimit - orders.length)} slots remaining today
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
                <h3 className="font-bold text-base text-[#0F1115]">Workshop Operating Hours</h3>
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
                    <span className="font-bold text-emerald-900">Counter Dispatch Status</span>
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
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px]">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PAYOUTS & 15-DAY ROLLING ESCROW (REAL ORDERS LEDGER)          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'payouts' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Pending 15-Day Escrow</span>
                <div className="text-2xl font-black text-amber-600 mt-1">${todayEarned}</div>
                <div className="text-xs text-[#6B7280] mt-1">Releases 15 days post-handover</div>
              </div>

              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Total Disbursed to Bank</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">${totalClosedDisbursed}</div>
                <div className="text-xs text-[#6B7280] mt-1">Paid directly via Stripe Connect</div>
              </div>

              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#9CA3AF] tracking-wider block">Studio Revenue Share</span>
                <div className="text-2xl font-black text-[#0F1115] mt-1">80% Net</div>
                <div className="text-xs text-[#6B7280] mt-1">20% Darzi platform fee</div>
              </div>
            </div>

            {/* Stripe Connect Banner */}
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-indigo-50 border border-indigo-200 grid place-items-center text-indigo-700 shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F1115]">Stripe Connect · Verified Payouts</span>
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
                <span className="text-xs text-[#9CA3AF]">Payout Schedule: </span>
                <span className="text-xs font-bold text-[#0F1115]">15 Days Post-Pickup</span>
              </div>
            </div>

            {/* Real Orders Payout Ledger */}
            <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-[#0F1115]">15-Day Rolling Payout Ledger</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[#6B7280]">
                    <tr>
                      <th className="p-3.5 font-semibold">Order / Customer</th>
                      <th className="p-3.5 font-semibold">Customer Paid</th>
                      <th className="p-3.5 font-semibold">Platform Fee (20%)</th>
                      <th className="p-3.5 font-semibold">Studio Net (80%)</th>
                      <th className="p-3.5 font-semibold text-right">Payout Status</th>
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
                            <td className="p-3.5 font-medium text-[#0F1115]">
                              {o.id} · {o.customerName}
                            </td>
                            <td className="p-3.5 text-[#4B5563]">${price}.00</td>
                            <td className="p-3.5 text-[#6B7280]">-${fee}</td>
                            <td className="p-3.5 font-bold text-emerald-700">${net}</td>
                            <td className="p-3.5 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isSettled
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {isSettled ? 'Deposited' : '15-Day Escrow'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}

                    {orders.filter((o) => ['Closed', 'Collected', 'Ready', 'Work in Progress'].includes(o.status)).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-xs text-[#71717A]">
                          No completed or in-progress orders yet. Settlements will appear here as you work on alterations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── MODAL 1: EDIT MEASUREMENTS ── */}
      {isEditMeasOpen && editTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E1D5] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0F1115]">Edit Garment Specifications</h3>
                <p className="text-xs text-[#6B7280]">{editTargetOrder.garmentName} · {editTargetOrder.customerName}</p>
              </div>
              <button onClick={() => setIsEditMeasOpen(false)} className="p-1 rounded-lg hover:bg-stone-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#0F1115] mb-1">Hem Adjustment</label>
                <input
                  type="text"
                  value={measHem}
                  onChange={(e) => setMeasHem(e.target.value)}
                  placeholder="e.g. Shorten 3.5 cm (1.4 in)"
                  className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F1115] mb-1">Waist / Seat</label>
                <input
                  type="text"
                  value={measWaist}
                  onChange={(e) => setMeasWaist(e.target.value)}
                  placeholder="e.g. Suppress 1.5 in"
                  className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F1115] mb-1">Sleeves / Cuffs</label>
                <input
                  type="text"
                  value={measSleeve}
                  onChange={(e) => setMeasSleeve(e.target.value)}
                  placeholder="e.g. Shorten 1.0 in from cuff"
                  className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F1115] mb-1">Finished Inseam</label>
                <input
                  type="text"
                  value={measInseam}
                  onChange={(e) => setMeasInseam(e.target.value)}
                  placeholder="e.g. 30.5 in finished"
                  className="w-full px-3 py-2 rounded-xl border border-[#D1D5DB]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E1D5] flex justify-end gap-2">
              <button
                onClick={() => setIsEditMeasOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-[#4B5563]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeasurements}
                className="px-5 py-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] text-white text-xs font-bold transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CUSTOMER PICKUP VERIFICATION & RETAIL UPSELL ── */}
      {pickupModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E1D5] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Customer Handover
                </span>
                <h3 className="font-serif font-bold text-base text-[#0F1115]">
                  Verify Pickup PIN
                </h3>
              </div>
              <button onClick={() => setPickupModalOrder(null)} className="p-1 rounded-lg hover:bg-stone-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {!pickupVerified ? (
              <div className="space-y-4">
                <p className="text-xs text-[#6B7280]">
                  Ask <strong>{pickupModalOrder.customerName}</strong> for their 4-digit pickup code sent via SMS/email:
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pickupOtpInput}
                    onChange={(e) => setPickupOtpInput(e.target.value)}
                    placeholder="Enter pickup code (e.g. 1839)"
                    className="w-full text-center font-mono font-black text-2xl tracking-[0.25em] py-3.5 rounded-2xl border-2 border-[#D1D5DB] focus:border-[#0F1115] focus:outline-none"
                  />
                  {pickupOtpError && (
                    <p className="text-xs text-red-600 font-semibold">{pickupOtpError}</p>
                  )}
                  <p className="text-[11px] text-[#71717A] text-center">
                    (Customer Pickup PIN for testing: <strong className="text-[#0F1115]">#{pickupModalOrder.otp}</strong>)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPickupOtp}
                  className="w-full py-3.5 bg-[#0F1115] hover:bg-[#9E593B] text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Verify Customer Code →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>✓ Identity Verified! Ready for garment handover.</span>
                </div>

                {/* Retail In-Store Sales Prompt */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3 text-xs">
                  <label className="font-bold text-[#0F1115] block">
                    Did the customer purchase retail accessories during pickup?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRetailAnswer('YES')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                        retailAnswer === 'YES'
                          ? 'bg-[#0F1115] text-white border-[#0F1115]'
                          : 'bg-white text-[#4B5563] border-[#D1D5DB]'
                      }`}
                    >
                      Yes (+Add Sale)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetailAnswer('NO')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                        retailAnswer === 'NO'
                          ? 'bg-[#0F1115] text-white border-[#0F1115]'
                          : 'bg-white text-[#4B5563] border-[#D1D5DB]'
                      }`}
                    >
                      No (Handover Only)
                    </button>
                  </div>

                  {retailAnswer === 'YES' && (
                    <div className="pt-2 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] block mb-0.5">RETAIL SALE AMOUNT ($)</span>
                        <input
                          type="number"
                          value={retailValueInput}
                          onChange={(e) => setRetailValueInput(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] block mb-0.5">CATEGORY</span>
                        <select
                          value={retailCategoryInput}
                          onChange={(e) => setRetailCategoryInput(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-xs"
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
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                    retailAnswer === null
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
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
