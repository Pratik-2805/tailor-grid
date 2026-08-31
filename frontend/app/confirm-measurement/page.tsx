'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConfirmMeasurementView } from '@/components/confirm-measurement-view'
import { type Screen, type StoreOption } from '@/components/data'

export default function ConfirmMeasurementPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<{
    city: string
    garmentId: string
    serviceId: string
    pickupOption: 'now' | 'schedule'
    scheduleDate: Date
    scheduleTime: string
    images: string[]
    measurements?: Record<string, string>
    brand?: string
    notes?: string
  }>({
    city: 'Vasai, IN-MH',
    garmentId: 'trousers',
    serviceId: 'trouser-hem-plain',
    pickupOption: 'now',
    scheduleDate: new Date(),
    scheduleTime: '03:30 PM',
    images: [],
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_measurement_draft')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDraft((prev) => ({
            ...prev,
            ...parsed,
            scheduleDate: parsed.scheduleDate ? new Date(parsed.scheduleDate) : prev.scheduleDate,
          }))
        } catch {}
      }
    }
  }, [])

  const handleGo = (s: Screen) => {
    if (s === 'home') router.push('/')
    else if (s === 'confirm-measurement') router.push('/confirm-measurement')
    else if (s === 'order') {
      const latest = typeof window !== 'undefined' ? localStorage.getItem('tg_latest_order') : null
      let orderId = 'ORD-6812'
      if (latest) {
        try {
          const parsed = JSON.parse(latest)
          if (parsed.id) orderId = parsed.id
        } catch {}
      }
      router.push(`/order/${orderId}`)
    }
    else router.push(`/?page=${s}`)
  }

  const handleConfirmMeasurements = (data: {
    garmentId: string
    serviceId: string
    measurements: Record<string, string>
    brand?: string
    notes?: string
    images?: string[]
    fittingMode?: string
    matchedStore?: StoreOption
    createdOrderId?: string
  }) => {
    const orderId = data.createdOrderId || 'ORD-6812'
    router.push(`/order/${orderId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header currentScreen="confirm-measurement" go={handleGo} />
      <main className="flex-1">
        <ConfirmMeasurementView
          go={handleGo}
          initialCity={draft.city}
          initialGarmentId={draft.garmentId}
          initialServiceId={draft.serviceId}
          initialPickupOption={draft.pickupOption}
          initialScheduleDate={draft.scheduleDate}
          initialScheduleTime={draft.scheduleTime}
          initialImages={draft.images}
          onConfirmMeasurements={handleConfirmMeasurements}
        />
      </main>
      <Footer go={handleGo} />
    </div>
  )
}
