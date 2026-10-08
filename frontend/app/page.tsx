'use client'

import { HomeView } from '@/components/home-view'
import { useApp } from '@/components/app-provider'
import type { StoreOption } from '@/components/data'
import { setStorageCookie } from '@/lib/cookies'

export default function HomePage() {
  const {
    user,
    navigate,
    openAuth,
    setPrefilledPostcode,
    setPrefilledGarmentId,
    setPrefilledServiceId,
    setPrefilledStore,
    setMeasurementDraft,
  } = useApp()

  const handleQuickSearch = (postcode: string, garmentId: string) => {
    setPrefilledPostcode(postcode)
    setPrefilledGarmentId(garmentId)
  }

  const handleSelectStore = (store: StoreOption) => {
    setPrefilledStore(store)
  }

  const handleRequestMeasurement = (params: {
    city: string
    garmentId: string
    serviceId: string
    pickupOption: 'now' | 'schedule'
    scheduleDate: Date
    scheduleTime: string
    images: string[]
  }) => {
    setMeasurementDraft(params)
    setPrefilledGarmentId(params.garmentId)
    setPrefilledServiceId(params.serviceId)
    setPrefilledPostcode(
      params.city.includes('Los Angeles')
        ? '90210'
        : params.city.includes('London')
          ? 'W8 4EP'
          : '10012'
    )
    if (typeof window !== 'undefined') {
      setStorageCookie('tg_measurement_draft', JSON.stringify(params))
    }
  }

  return (
    <HomeView
      go={navigate}
      user={user}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
      onQuickSearch={handleQuickSearch}
      onSelectStore={handleSelectStore}
      onRequestMeasurement={handleRequestMeasurement}
    />
  )
}
