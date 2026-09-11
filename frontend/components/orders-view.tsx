'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lock,
  LogIn,
  MapPin,
  Package,
  Phone,
  QrCode,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { type Screen, type User, type FittingBooking } from './data'
import { fetchOrders, updateOrder, deleteOrder } from '@/lib/api'
import { OrderDetailsView } from './order-details-view'

interface OrdersViewProps {
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: () => void
}

export function OrdersView({ go, user, onOpenAuth }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'fit-profile'>('orders')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null)
  const [selectedDetailOrderId, setSelectedDetailOrderId] = useState<string | null>(null)
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)
  const [backendOrders, setBackendOrders] = useState<FittingBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      fetchOrders(user.email || user.contact || '', user.id)
        .then((fetched) => {
          const ordersFromBackend = Array.isArray(fetched) ? fetched : []

          // Purge stale dummy/mock orders from localStorage that do not exist in the database
          if (typeof window !== 'undefined') {
            try {
              const localKeys = Object.keys(localStorage).filter((k) => k.startsWith('tg_order_'))
              for (const key of localKeys) {
                const raw = localStorage.getItem(key)
                if (raw) {
                  try {
                    const parsed = JSON.parse(raw)
                    if (parsed?.id && !ordersFromBackend.some((o) => o.id === parsed.id)) {
                      localStorage.removeItem(key)
                    }
                  } catch {
                    localStorage.removeItem(key)
                  }
                }
              }
              localStorage.removeItem('tg_latest_order')
            } catch {}
          }

          setBackendOrders(ordersFromBackend)
        })
        .catch((err) => {
          console.error('Failed to load orders:', err)
          setBackendOrders([])
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setBackendOrders([])
    }
  }, [user])

  // Dynamically compute real measurements for the Digital Fit Passport from real orders and profile
  const passportItems = useMemo(() => {
    const items: { k: string; v: string; sourceGarment?: string }[] = []
    const seenKeys = new Set<string>()

    // 1. Extract from backend orders
    backendOrders.forEach((bo) => {
      // Check pinnedAdjustment
      if (bo.pinnedAdjustment) {
        try {
          const parsed = typeof bo.pinnedAdjustment === 'string' ? JSON.parse(bo.pinnedAdjustment) : bo.pinnedAdjustment
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([k, val]) => {
              if (val && typeof val === 'string' && val.trim() && val !== 'To be Measured by Tailor') {
                const formattedKey = k
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/_/g, ' ')
                  .replace(/^\w/, (c) => c.toUpperCase())
                const dedupeKey = formattedKey.toLowerCase()
                if (!seenKeys.has(dedupeKey)) {
                  seenKeys.add(dedupeKey)
                  items.push({
                    k: formattedKey,
                    v: val,
                    sourceGarment: bo.garmentBrand || bo.garmentName,
                  })
                }
              }
            })
          }
        } catch {}
      }

      // Check measurements
      if (bo.measurements) {
        try {
          const parsed = typeof bo.measurements === 'string' ? JSON.parse(bo.measurements) : bo.measurements
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([k, val]) => {
              if (val && typeof val === 'string' && val.trim() && val !== 'To be Measured by Tailor') {
                const formattedKey = k
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/_/g, ' ')
                  .replace(/^\w/, (c) => c.toUpperCase())
                const dedupeKey = formattedKey.toLowerCase()
                if (!seenKeys.has(dedupeKey)) {
                  seenKeys.add(dedupeKey)
                  items.push({
                    k: formattedKey,
                    v: val,
                    sourceGarment: bo.garmentBrand || bo.garmentName,
                  })
                }
              }
            })
          }
        } catch {}
      }

      // Check fitNotes
      if (bo.fitNotes && bo.fitNotes.trim() && !seenKeys.has(`fit-${bo.id}`)) {
        seenKeys.add(`fit-${bo.id}`)
        items.push({
          k: `${bo.garmentName || 'Garment'} Fit Spec`,
          v: bo.fitNotes,
          sourceGarment: bo.garmentBrand || bo.garmentName,
        })
      }
    })

    // 2. Also check user's saved profile measurements
    if (typeof window !== 'undefined' && user) {
      try {
        const profileKey = `tg_measurements_${user.id || user.email}`
        const raw = localStorage.getItem(profileKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([k, val]) => {
              if (val && typeof val === 'string' && val.trim() && val !== 'To be Measured by Tailor') {
                const formattedKey = k
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/_/g, ' ')
                  .replace(/^\w/, (c) => c.toUpperCase())
                const dedupeKey = formattedKey.toLowerCase()
                if (!seenKeys.has(dedupeKey)) {
                  seenKeys.add(dedupeKey)
                  items.push({
                    k: formattedKey,
                    v: val,
                  })
                }
              }
            })
          }
        }
      } catch {}
    }

    return items
  }, [backendOrders, user])

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return
    setIsSubmittingCancel(true)
    try {
      // Mark order as Cancelled in PostgreSQL database
      await updateOrder(cancellingOrder.id, { status: 'Cancelled' })
      
      // Update order status in local state so it remains in user's order history as Cancelled
      setBackendOrders((prev) => prev.map((o) => (o.id === cancellingOrder.id ? { ...o, status: 'Cancelled' } : o)))
      
      // Clean up local storage cached order status
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`tg_order_${cancellingOrder.id}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            parsed.status = 'Cancelled'
            localStorage.setItem(`tg_order_${cancellingOrder.id}`, JSON.stringify(parsed))
          } catch { }
        }
      }
      toast.success(`Order #${cancellingOrder.id} status updated to Cancelled`, { position: 'top-center' })
    } catch (err) {
      toast.error('Failed to cancel order. Please try again.', { position: 'top-center' })
    } finally {
      setIsSubmittingCancel(false)
      setCancellingOrder(null)
    }
  }

  // If user is NOT signed in, display the auth protection view
  if (!user) {
    return (
      <div className="py-14 lg:py-20 bg-[#FAF8F5] min-h-[calc(100vh-68px)] flex items-center justify-center">
        <div className="mx-auto max-w-[560px] px-5 text-center">
          {/* Back button */}
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => go('home')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          </div>

          {/* Locked Card */}
          <div className="rounded-3xl border border-[#DDD6CB] bg-white p-8 sm:p-12 shadow-md">
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#F4EFEA] text-[#9E593B] border border-[#E8E1D5]">
              <Lock size={28} />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E593B]">
              Customer Wardrobe Hub
            </span>

            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-[#18191B]">
              Sign in to track your order.
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
              Your active studio fittings, QR admission passes, live workshop tailoring status, and Digital Fit Passport are stored securely in your account.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] shadow-sm transition-all active:scale-95"
              >
                <LogIn size={15} />
                <span>Sign In / Register</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F0EBE3] flex items-center justify-center gap-2 text-xs text-[#7A7E85]">
              <ShieldCheck size={14} className="text-[#10B981]" />
              <span>Encrypted member data &amp; 100% Fit Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayOrders = backendOrders.map((bo, idx) => ({
    id: bo.id,
    garment: bo.garmentBrand ? `${bo.garmentBrand} (${bo.garmentName || 'Garment'})` : (bo.garmentName || 'Custom Garment'),
    service: bo.serviceName || 'Alteration Service',
    studio: bo.store?.name || (bo.storeName && bo.storeName !== 'Atelier SoHo' ? bo.storeName : null) || bo.storeName || 'Partner Atelier',
    address: bo.postcode ? `Postcode: ${bo.postcode}` : (bo.store?.postcode ? `Postcode: ${bo.store.postcode}` : 'Partner Studio'),
    phone: bo.storePhone || bo.store?.phone || null,
    status: bo.status || 'Allocated',
    price: typeof bo.price === 'number' ? `$${bo.price.toFixed(2)}` : (bo.price ? `$${bo.price}` : '$25.00'),
    slot: bo.date && bo.timeSlot ? `${bo.date} @ ${bo.timeSlot}` : (bo.date || 'Fitting Slot Scheduled'),
    otp: bo.otp || '',
    isCurrent: idx === 0,
  }))

  return (
    <div className="py-10 lg:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-[1040px] px-5 lg:px-8">

        {/* Navigation */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Overview
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#DDD6CB]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Customer Wardrobe Hub
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#18191B]">
              My Orders &amp; Fittings.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              Welcome back, <strong className="text-[#18191B]">{user.name}</strong>. Manage your active orders, track alteration progress, and download passes.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex gap-3 border-b border-[#DDD6CB] pb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full transition-all ${activeTab === 'orders'
                ? 'bg-[#18191B] text-white shadow-xs'
                : 'text-[#5A5D64] hover:bg-[#F4EFEA]'
              }`}
          >
            Active &amp; Past Orders ({displayOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('fit-profile')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${activeTab === 'fit-profile'
                ? 'bg-[#18191B] text-white shadow-xs'
                : 'text-[#5A5D64] hover:bg-[#F4EFEA]'
              }`}
          >
            <Sparkles size={13} className="text-[#E7C9BA]" />
            <span>Digital Fit Passport ({passportItems.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="mt-8 space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-[#7A7E85] text-sm">
                Loading your orders...
              </div>
            ) : displayOrders.length === 0 ? (
              <div className="rounded-2xl border border-[#DDD6CB] bg-white p-12 text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#FAF8F5] text-[#9E593B] border border-[#DDD6CB]">
                  <Package size={22} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#18191B]">No active orders yet</h3>
                <p className="mt-2 text-xs sm:text-sm text-[#5A5D64] max-w-[360px] mx-auto">
                  You don&apos;t have any orders yet under <span className="font-mono text-[#9E593B]">{user.email || user.contact}</span>.
                </p>
              </div>
            ) : (
              displayOrders.map((o) => {
                const isCompleted = ['Closed', 'Collected', 'Completed', 'CLOSED', 'COLLECTED', 'COMPLETED'].includes(o.status)
                const isCancelled = ['Cancelled', 'CANCELLED'].includes(o.status)
                const isReady = o.status.includes('Ready') || o.status.includes('READY')

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedDetailOrderId(o.id)}
                    className="rounded-2xl border border-[#DDD6CB] bg-white p-6 shadow-xs hover:border-[#9E593B] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#9E593B] bg-[#F4EFEA] px-2 py-0.5 rounded">
                          {o.id}
                        </span>
                        <span className="text-xs font-semibold text-[#18191B]">{o.slot}</span>
                      </div>

                      <h3 className="mt-3 font-serif text-xl font-semibold text-[#18191B] group-hover:text-[#9E593B] transition-colors">{o.garment}</h3>
                      <p className="text-xs text-[#5A5D64] mt-0.5">{o.service}</p>

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-[#7A7E85] flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#9E593B]" />
                          <span>{o.studio} ({o.address})</span>
                        </span>
                        {o.phone && (
                          <a
                            href={`tel:${o.phone.replace(/\s+/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                            title="Call partner studio"
                          >
                            <Phone size={11} className="text-emerald-600" />
                            <span>{o.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#F0EBE3]">
                      <div className="sm:text-right">
                        <span className="font-serif text-lg font-bold text-[#18191B]">{o.price}</span>
                        {isCompleted ? (
                          <span className="block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full mt-1">
                            ✓ Completed
                          </span>
                        ) : isCancelled ? (
                          <span className="block text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mt-1">
                            Not Accepted / Cancelled
                          </span>
                        ) : isReady ? (
                          <span className="block text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full mt-1">
                            Ready for Pickup
                          </span>
                        ) : (
                          <span className="block text-[11px] font-semibold text-[#9E593B] mt-0.5">
                            {o.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDetailOrderId(o.id)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0F1115] hover:bg-[#9E593B] px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>Track &amp; Details</span>
                          <ChevronRight size={13} />
                        </button>

                        {!isCancelled && !isCompleted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCancellingOrder(o)
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-full transition-colors cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <XCircle size={13} />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 2: DIGITAL FIT PASSPORT */}
        {activeTab === 'fit-profile' && (
          <div className="mt-8 rounded-2xl border border-[#DDD6CB] bg-white p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE4DC] pb-5">
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5]">
                  <UserIcon size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#18191B]">{user.name}</h3>
                  <p className="font-mono text-xs text-[#9E593B]">
                    PASSPORT ID: #{user.id ? user.id.slice(0, 8).toUpperCase() : 'TG-MEMBER'} · VERIFIED MEMBER
                  </p>
                </div>
              </div>
              <span className="text-xs bg-[#F4EFEA] text-[#9E593B] font-semibold px-3 py-1.5 rounded-full border border-[#DDD6CB] self-start sm:self-auto">
                Auto-Synced Across Partner Studios
              </span>
            </div>

            {passportItems.length === 0 ? (
              <div className="mt-8 py-12 px-6 text-center rounded-xl border border-dashed border-[#DDD6CB] bg-[#FAF8F5]">
                <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-white text-[#9E593B] border border-[#DDD6CB]">
                  <Ruler size={18} />
                </div>
                <h4 className="font-serif text-base font-bold text-[#18191B]">No Recorded Fit Specifications Yet</h4>
                <p className="mt-1.5 text-xs text-[#5A5D64] max-w-[420px] mx-auto">
                  Your Digital Fit Passport will automatically calibrate and record verified measurements, inseam breaks, and seam specifications from your studio fittings and alterations.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {passportItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] p-4 flex flex-col justify-between hover:border-[#9E593B] transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-[#7A7E85] tracking-wider">{item.k}</span>
                        {item.sourceGarment && (
                          <span className="text-[9px] font-mono text-[#9E593B] bg-[#F4EFEA] px-1.5 py-0.5 rounded truncate max-w-[120px]">
                            {item.sourceGarment}
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-sm font-semibold text-[#18191B] mt-1.5 leading-snug">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-6 text-xs text-[#7A7E85] text-center border-t border-[#F0EBE3] pt-4">
              Your fit passport accumulates measurements automatically during studio fittings.
            </p>
          </div>
        )}

        {/* Pass Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[480px] rounded-3xl border border-[#DDD6CB] bg-white p-7 shadow-2xl text-center">
              <div className="flex items-center justify-between border-b border-[#DDD6CB] pb-4">
                <span className="font-mono text-xs font-bold text-[#9E593B]">FITTING PASS #{selectedOrder.id}</span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-[#7A7E85] hover:text-[#18191B]"
                >
                  Close ✕
                </button>
              </div>

              <div className="my-6 grid size-36 place-items-center bg-[#FAF8F5] border border-[#DDD6CB] rounded-2xl mx-auto">
                <QrCode size={100} className="text-[#18191B]" />
              </div>

              <span className="text-xs text-[#7A7E85]">Fitting Counter Code</span>
              <p className="font-mono text-3xl font-bold tracking-[0.3em] text-[#18191B] mt-1">{selectedOrder.otp || 'PENDING'}</p>

              <p className="mt-4 text-xs text-[#5A5D64]">
                Show this QR or 4-digit code upon arrival at <strong>{selectedOrder.studio}</strong>.
              </p>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-6 w-full rounded-full bg-[#18191B] py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[440px] rounded-3xl border border-red-200 bg-white p-6 shadow-2xl text-center space-y-4">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <XCircle size={28} />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#18191B]">Cancel Alteration Request?</h3>
                <p className="mt-1.5 text-xs text-[#5A5D64] leading-relaxed">
                  Are you sure you want to cancel order <strong className="text-[#18191B]">#{cancellingOrder.id}</strong> ({cancellingOrder.garment})?
                  This action will remove the request from partner studio fitting queues.
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  disabled={isSubmittingCancel}
                  className="flex-1 py-3 px-4 rounded-full border border-[#DDD6CB] text-xs font-bold text-[#18191B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel}
                  className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full-Screen Live Order Details Tracker Modal */}
        {selectedDetailOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative min-h-screen">
              <div className="sticky top-4 right-4 sm:right-8 z-50 flex justify-end px-4 pt-2">
                <button
                  onClick={() => setSelectedDetailOrderId(null)}
                  className="flex items-center gap-2 bg-[#0F1115] hover:bg-[#9E593B] text-white px-4 py-2 rounded-full font-extrabold text-xs shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/20"
                >
                  <span>Close Tracker</span>
                  <span className="font-mono text-sm">✕</span>
                </button>
              </div>
              <OrderDetailsView
                slugId={selectedDetailOrderId}
                onGoHome={() => setSelectedDetailOrderId(null)}
                onGoOrders={() => setSelectedDetailOrderId(null)}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
