'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmMeasurementView } from '@/components/confirm-measurement-view'
import { useApp } from '@/components/app-provider'
import type { StoreOption } from '@/components/data'

export default function ConfirmMeasurementPage() {
  const router = useRouter()
  const {
    user,
    navigate,
    openAuth,
    measurementDraft,
    setMeasurementDraft,
    setCreatedOrderId,
    setPrefilledStore,
    setPrefilledGarmentId,
    setPrefilledServiceId,
    setConfirmedMeasurements,
    setGarmentBrand,
    setGarmentNotes,
  } = useApp()

  // Load measurement draft from localStorage on mount if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_measurement_draft')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setMeasurementDraft((prev) => ({
            ...prev,
            ...parsed,
            scheduleDate: parsed.scheduleDate ? new Date(parsed.scheduleDate) : prev.scheduleDate,
          }))
        } catch {}
      }
    }
  }, [setMeasurementDraft])

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
    setPrefilledGarmentId(data.garmentId)
    setPrefilledServiceId(data.serviceId)
    setConfirmedMeasurements(data.measurements)
    setGarmentBrand(data.brand)
    setGarmentNotes(data.notes)
    if (data.createdOrderId) {
      setCreatedOrderId(data.createdOrderId)
    }
    if (data.matchedStore) {
      setPrefilledStore(data.matchedStore)
    }
    const orderId = data.createdOrderId || 'ORD-2654'
    router.push(`/order/${orderId}`)
  }

  return (
    <ConfirmMeasurementView
      go={navigate}
      user={user}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
      initialCity={measurementDraft.city}
      initialGarmentId={measurementDraft.garmentId}
      initialServiceId={measurementDraft.serviceId}
      initialPickupOption={measurementDraft.pickupOption}
      initialScheduleDate={measurementDraft.scheduleDate}
      initialScheduleTime={measurementDraft.scheduleTime}
      initialImages={measurementDraft.images}
      onConfirmMeasurements={handleConfirmMeasurements}
    />
  )
}
