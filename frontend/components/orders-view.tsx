'use client'

import { useEffect, useState } from 'react'
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
  QrCode,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react'
import { type Screen, type User, type FittingBooking } from './data'
import { fetchOrders } from '@/lib/api'

interface OrdersViewProps {
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: () => void
}

export function OrdersView({ go, user, onOpenAuth }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'fit-profile'>('orders')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [backendOrders, setBackendOrders] = useState<FittingBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      fetchOrders(user.contact || user.email || user.id)
        .then((fetched) => {
          if (fetched && Array.isArray(fetched)) {
            setBackendOrders(fetched)
          } else {
            setBackendOrders([])
          }
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
    studio: bo.storeName || 'Partner Atelier',
    address: bo.postcode ? `Postcode: ${bo.postcode}` : '18 Kensington Church St',
    status: bo.status || 'Allocated',
    price: `$${bo.price || 25}.00`,
    slot: `${bo.date || 'Scheduled'} @ ${bo.timeSlot || 'Fitting Slot'}`,
    otp: bo.otp || '1234',
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
            className={`px-4 py-2 rounded-full transition-all ${
              activeTab === 'orders'
                ? 'bg-[#18191B] text-white shadow-xs'
                : 'text-[#5A5D64] hover:bg-[#F4EFEA]'
            }`}
          >
            Active &amp; Past Orders ({displayOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('fit-profile')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'fit-profile'
                ? 'bg-[#18191B] text-white shadow-xs'
                : 'text-[#5A5D64] hover:bg-[#F4EFEA]'
            }`}
          >
            <Sparkles size={13} className="text-[#E7C9BA]" />
            <span>Digital Fit Passport</span>
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
              displayOrders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-[#DDD6CB] bg-white p-6 shadow-xs hover:border-[#9E593B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#9E593B] bg-[#F4EFEA] px-2 py-0.5 rounded">
                        {o.id}
                      </span>
                      <span className="text-xs font-semibold text-[#18191B]">{o.slot}</span>
                    </div>

                    <h3 className="mt-3 font-serif text-xl font-semibold text-[#18191B]">{o.garment}</h3>
                    <p className="text-xs text-[#5A5D64] mt-0.5">{o.service}</p>
                    
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7A7E85]">
                      <MapPin size={12} className="text-[#9E593B]" />
                      <span>{o.studio} ({o.address})</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#F0EBE3]">
                    <div className="sm:text-right">
                      <span className="font-serif text-lg font-bold text-[#18191B]">{o.price}</span>
                      <span className={`block text-[11px] font-semibold mt-0.5 ${
                        o.status.includes('Ready') ? 'text-emerald-700' : 'text-[#9E593B]'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#18191B] bg-[#FAF8F5] px-4 py-2 rounded-full border border-[#DDD6CB] hover:bg-[#F4EFEA] transition-colors"
                    >
                      <QrCode size={13} />
                      <span>View Pass</span>
                    </button>
                  </div>
                </div>
              ))
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

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { k: 'Waist Inseam', v: '29.0 inches (Slight Break)' },
                { k: 'Waistband Stance', v: 'High-Rise (27.5 in)' },
                { k: 'Blazer Sleeve', v: '23.0 in (Wrist Bone Break)' },
                { k: 'Shoulder Pitch', v: '15.5 in Standard' },
                { k: 'Dress Hem Line', v: 'Midi (Mid-calf 42.0 in)' },
                { k: 'Preferred Denim Finish', v: 'Original Chainstitch Lock' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] p-4">
                  <span className="text-[10px] uppercase font-bold text-[#7A7E85]">{item.k}</span>
                  <p className="font-serif text-sm font-semibold text-[#18191B] mt-1">{item.v}</p>
                </div>
              ))}
            </div>

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
              <p className="font-mono text-3xl font-bold tracking-[0.3em] text-[#18191B] mt-1">{selectedOrder.otp}</p>

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

      </div>
    </div>
  )
}
