'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HomeView } from '@/components/home-view'
import { useApp } from '@/components/app-provider'
import type { StoreOption } from '@/components/data'
import { getAuthRole } from '@/lib/cookies'
import { NormalLoader } from '@/components/normal-loader'

export function HomeClient() {
  const router = useRouter()
  const {
    user,
    isAuthLoading,
    navigate,
    openAuth,
    setPrefilledPostcode,
    setPrefilledGarmentId,
    setPrefilledServiceId,
    setPrefilledStore,
  } = useApp()

  const role = user?.role || getAuthRole()
  const isCustomer = role === 'CUSTOMER'

  useEffect(() => {
    if (!isAuthLoading && isCustomer) {
      router.replace('/book')
    }
  }, [isAuthLoading, isCustomer, router])

  if (isCustomer) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
        <NormalLoader />
      </div>
    )
  }

  const handleQuickSearch = (postcode: string, garmentId: string) => {
    setPrefilledPostcode(postcode)
    setPrefilledGarmentId(garmentId)
  }

  const handleSelectStore = (store: StoreOption) => {
    setPrefilledStore(store)
  }

  const handleStartBooking = (params: {
    city: string
    garmentId: string
    serviceId: string
    pickupOption: 'now' | 'schedule'
    scheduleDate: Date
    scheduleTime: string
    images: string[]
  }) => {
    setPrefilledGarmentId(params.garmentId)
    setPrefilledServiceId(params.serviceId)
    setPrefilledPostcode(
      params.city.includes('Los Angeles')
        ? '90210'
        : params.city.includes('London')
          ? 'W8 4EP'
          : '10012'
    )
  }

  return (
    <HomeView
      go={navigate}
      user={user}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
      onQuickSearch={handleQuickSearch}
      onSelectStore={handleSelectStore}
      onStartBooking={handleStartBooking}
    />
  )
}
