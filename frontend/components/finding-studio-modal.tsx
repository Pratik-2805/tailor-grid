'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Compass,
  Scissors,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Store,
  ExternalLink,
  X,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react'
import { createOrder, fetchOrderById, updateOrder, fetchStores, STUDIO_BASE_URL } from '@/lib/api'
import { type StoreOption, PARTNER_STORES, getClosestStoreForLocation } from './data'

interface FindingStudioModalProps {
  isOpen: boolean
  city: string
  garmentId: string
  garmentName: string
  serviceId: string
  serviceName: string
  price: number
  measurements?: Record<string, string>
  brand?: string
  notes?: string
  scheduleDate?: Date
  scheduleTime?: string
  images?: string[]
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  onMatched: (matchedStore: StoreOption, order: any) => void
  onCancel: () => void
}

export function FindingStudioModal({
  isOpen,
  city,
  garmentId,
  garmentName,
  serviceId,
  serviceName,
  price,
  measurements,
  brand,
  notes,
  scheduleDate,
  scheduleTime,
  images,
  customerName = 'Camilla Harrington',
  customerEmail = 'camilla.h@example.com',
  customerPhone = '+44 7700 900077',
  onMatched,
  onCancel,
}: FindingStudioModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [pingStage, setPingStage] = useState(0)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [matchedStore, setMatchedStore] = useState<StoreOption | null>(null)
  const [isAccepted, setIsAccepted] = useState(false)
  const [storesList, setStoresList] = useState<StoreOption[]>(PARTNER_STORES)
  const [pingedStores, setPingedStores] = useState<string[]>([])
  const orderIdRef = useRef<string | null>(null)

  // 1. Fetch real stores list on mount
  useEffect(() => {
    if (!isOpen) return
    fetchStores().then((st) => {
      if (st && st.length > 0) setStoresList(st)
    }).catch(() => {})
  }, [isOpen])

  // 2. Broadcast and create unaccepted / allocated order on backend
  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0)
      setPingStage(0)
      setCreatedOrder(null)
      setMatchedStore(null)
      setIsAccepted(false)
      orderIdRef.current = null
      return
    }

    let isMounted = true
    const newOrderId = `TG-${Math.floor(100000 + Math.random() * 900000)}`
    orderIdRef.current = newOrderId

    const postOrder = async () => {
      try {
        const res = await createOrder({
          id: newOrderId,
          customerName,
          customerEmail,
          customerPhone,
          postcode: city.includes('London') ? 'W8 4EP' : city.includes('Los Angeles') ? '90210' : '10012',
          garmentId,
          garmentName,
          serviceId,
          serviceName,
          storeId: null,
          storeName: null,
          date: scheduleDate ? scheduleDate.toISOString().split('T')[0] : 'Today',
          timeSlot: scheduleTime || '14:00 - 15:00',
          garmentBrand: brand || '',
          fitNotes: notes || '',
          measurements: measurements || undefined,
          price: price || 25,
          status: 'Allocated', // Waiting for studio acceptance
        })
        if (isMounted && res.order) {
          setCreatedOrder(res.order)
        }
      } catch (err) {
        console.warn('Order broadcast creation error:', err)
      }
    }

    postOrder()

    return () => {
      isMounted = false
    }
  }, [isOpen, city, garmentId, garmentName, serviceId, serviceName, price])

  // 3. Timer & animated ping progression
  useEffect(() => {
    if (!isOpen || isAccepted) return

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, isAccepted])

  // 4. Update ping logs based on elapsed seconds
  useEffect(() => {
    if (!isOpen || isAccepted) return

    if (elapsedSeconds === 1) {
      setPingStage(1)
      if (storesList[0]) setPingedStores([storesList[0].name])
    } else if (elapsedSeconds === 3) {
      setPingStage(2)
      if (storesList[1]) setPingedStores((prev) => [...prev, storesList[1].name])
    } else if (elapsedSeconds === 5) {
      setPingStage(3)
      if (storesList[2]) setPingedStores((prev) => [...prev, storesList[2].name])
    } else if (elapsedSeconds >= 7 && storesList.length > 3) {
      setPingStage(4)
      const remaining = storesList.slice(3).map((s) => s.name)
      setPingedStores((prev) => Array.from(new Set([...prev, ...remaining])))
    }
  }, [elapsedSeconds, isOpen, isAccepted, storesList])

  // 5. Poll backend every 1.5s to see if a Studio has accepted this order!
  useEffect(() => {
    if (!isOpen || isAccepted) return

    const pollInterval = setInterval(async () => {
      const currentId = orderIdRef.current
      if (!currentId) return

      try {
        const orderData = await fetchOrderById(currentId)
        if (orderData && orderData.status === 'Accepted') {
          // Found studio match!
          let matched = storesList.find(
            (s) => s.id === orderData.storeId || s.name.toLowerCase() === orderData.storeName?.toLowerCase()
          )
          if (!matched) {
            matched = getClosestStoreForLocation(city)
          }

          setIsAccepted(true)
          setMatchedStore(matched)
          setCreatedOrder(orderData)

          // Smooth delay to showcase celebratory animation before navigating
          setTimeout(() => {
            onMatched(matched!, orderData)
          }, 1800)
        }
      } catch (pollErr) {
        // Continue polling
      }
    }, 1500)

    return () => clearInterval(pollInterval)
  }, [isOpen, isAccepted, storesList, onMatched, city])

  // 6. Manual Simulator Trigger (for instant testing without 2nd screen)
  const handleSimulateStudioAccept = async () => {
    const chosenStore = getClosestStoreForLocation(city) || storesList[0] || PARTNER_STORES[0]
    const currentId = orderIdRef.current || (createdOrder && createdOrder.id) || `TG-DEMO`

    try {
      await updateOrder(currentId, {
        status: 'Accepted',
        storeId: chosenStore.id,
        storeName: chosenStore.name,
        storeAddress: chosenStore.address + (chosenStore.area ? `, ${chosenStore.area}` : ''),
      })
    } catch {}

    setIsAccepted(true)
    setMatchedStore(chosenStore)

    setTimeout(() => {
      onMatched(chosenStore, {
        ...createdOrder,
        status: 'Accepted',
        storeId: chosenStore.id,
        storeName: chosenStore.name,
        storeAddress: chosenStore.address + (chosenStore.area ? `, ${chosenStore.area}` : ''),
      })
    }, 1800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0B0D11]/92 backdrop-blur-xl animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-[680px] bg-[#12151B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white text-center">
        
        {/* Background Radar Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#9E593B]/15 blur-3xl pointer-events-none" />

        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D5B099]">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E593B] opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-[#9E593B]" />
            </span>
            <span>Live Dispatch Network &middot; {city}</span>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Cancel search"
          >
            <X size={18} />
          </button>
        </div>

        {/* RADAR ANIMATION / CELEBRATION */}
        <div className="py-6 relative flex flex-col items-center justify-center">
          
          {isAccepted ? (
            /* Match Celebratory State */
            <div className="animate-scaleIn flex flex-col items-center">
              <div className="relative grid size-28 place-items-center rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={56} className="animate-bounce" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping" />
              </div>

              <span className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                Match Confirmed &middot; Accepted
              </span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
                {matchedStore?.name}
              </h2>
              <p className="mt-1 text-xs text-white/70">
                Lead Master Tailor: <strong className="text-white">{matchedStore?.leadTailor}</strong> &middot; {matchedStore?.area}
              </p>
            </div>
          ) : (
            /* Radar Pinging Scanning State */
            <div className="flex flex-col items-center">
              {/* Radar Screen */}
              <div className="relative size-44 sm:size-52 rounded-full border-2 border-[#9E593B]/40 bg-[#0E1015] flex items-center justify-center overflow-hidden shadow-inner">
                {/* Concentric rings */}
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <div className="absolute inset-12 rounded-full border border-white/10" />
                <div className="absolute inset-20 rounded-full border border-white/10" />
                
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />

                {/* Rotating radar sweep beam */}
                <div className="absolute inset-0 rounded-full origin-center animate-spin [animation-duration:3s] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(158,89,59,0.45)_360deg)] pointer-events-none" />

                {/* Radar Pinging Dots (Ateliers) */}
                <div className="absolute top-10 right-12 size-3 rounded-full bg-emerald-400 animate-ping" />
                <div className="absolute top-10 right-12 size-2.5 rounded-full bg-emerald-400" />

                <div className="absolute bottom-12 left-10 size-3 rounded-full bg-[#9E593B] animate-ping [animation-delay:1s]" />
                <div className="absolute bottom-12 left-10 size-2.5 rounded-full bg-[#9E593B]" />

                <div className="absolute top-16 left-14 size-2.5 rounded-full bg-amber-400 animate-pulse" />

                {/* Center Scissors Emblem */}
                <div className="relative z-10 grid size-12 place-items-center rounded-full bg-[#181B22] border border-[#9E593B] text-[#E7C9BA] shadow-lg">
                  <Scissors size={20} className="animate-pulse" />
                </div>
              </div>

              {/* Live Dispatch Status */}
              <div className="mt-6 space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9E593B] bg-[#9E593B]/15 px-3 py-1 rounded-full border border-[#9E593B]/30">
                  {elapsedSeconds < 10 ? `00:0${elapsedSeconds}` : `00:${elapsedSeconds}`} &middot; Finding Nearby Atelier
                </span>
                
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white pt-2">
                  {pingStage === 0 && 'Connecting to Certified Atelier Network...'}
                  {pingStage === 1 && `Broadcasting Tech Brief to ${city} Studios...`}
                  {pingStage === 2 && 'Checking Workbench Capacity & Master Tailor Slots...'}
                  {pingStage === 3 && 'Awaiting Studio Counter Acceptance...'}
                  {pingStage >= 4 && 'Waiting for Atelier Partner to Accept Request...'}
                </h3>
                
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  Your alteration specifications and measurements are being transmitted in real-time to partner workbenches.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ORDER TECH BRIEF MINI SUMMARY */}
        <div className="mt-2 rounded-2xl bg-white/5 border border-white/10 p-4 text-left text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5B099]">Alteration Tech Brief</span>
            <span className="font-mono text-[11px] text-white/60">
              {createdOrder ? createdOrder.id : `TG-BROADCAST`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white/80">
            <div>
              <span className="text-[10px] text-white/40 uppercase block">Garment</span>
              <span className="font-semibold text-white truncate block">{garmentName}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase block">Alteration</span>
              <span className="font-semibold text-white truncate block">{serviceName}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase block">Pickup / Fitting</span>
              <span className="font-semibold text-white truncate block">{scheduleTime || 'Today'}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase block">Total Payout</span>
              <span className="font-semibold text-emerald-400 font-mono block">${price}.00</span>
            </div>
          </div>

          {measurements && Object.keys(measurements).length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-white/40 text-[10px] uppercase font-semibold">Measurements:</span>
              {Object.entries(measurements).map(([k, v]) => (
                <span key={k} className="rounded bg-white/10 px-2 py-0.5 text-white/90">
                  {k}: <strong>{v}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PINGED STUDIOS TICKER */}
        {!isAccepted && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-left">
              <Store size={14} className="text-[#9E593B] shrink-0" />
              <span className="text-white/70 text-[11px]">
                Broadcasted to: <strong>{pingedStores.length > 0 ? pingedStores.join(', ') : 'Nearby Ateliers'}</strong>
              </span>
            </div>

            {/* Helper CTAs: Simulate Accept & Open Studio Portal */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
              <button
                type="button"
                onClick={handleSimulateStudioAccept}
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3.5 py-1.5 transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap size={12} />
                <span>Simulate Studio Accept</span>
              </button>

              <a
                href={STUDIO_BASE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-3 py-1.5 transition-all flex items-center gap-1"
                title="Open Studio Workbench"
              >
                <span>Studio Dashboard</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
