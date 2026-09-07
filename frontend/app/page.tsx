'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HomeView } from '@/components/home-view'
import { useApp } from '@/components/app-provider'
import { CustomLoader } from '@/components/custom-loader'
import type { StoreOption } from '@/components/data'

export default function HomePage() {
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
    setMeasurementDraft,
  } = useApp()

  const [hasCustomerSession, setHasCustomerSession] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('tg_user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          if (parsed.role === 'CUSTOMER') return true
        } catch { }
      }
      const token = localStorage.getItem('tg_token')
      const role = localStorage.getItem('tg_user_role')
      return Boolean(token && (!role || role === 'CUSTOMER'))
    }
    return false
  })

  useEffect(() => {
    const isCustomer =
      user?.role === 'CUSTOMER' ||
      (typeof window !== 'undefined' && localStorage.getItem('tg_user_role') === 'CUSTOMER')

    if (isCustomer) {
      setHasCustomerSession(true)
      router.replace('/book')
    } else if (!isAuthLoading && !user) {
      setHasCustomerSession(false)
    }
  }, [user, isAuthLoading, router])

  // While auth is initializing or if customer session exists, smoothly render the Atelier loader
  if (isAuthLoading || hasCustomerSession || (user && user.role === 'CUSTOMER')) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text={user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Opening your Atelier studio'}
          subtext="Preparing your bespoke alteration experience"
          showProgressBar
        />
      </div>
    )
  }

  const handleQuickSearch = (postcode: string, garmentId: string) => {
    setPrefilledPostcode(postcode)
    setPrefilledGarmentId(garmentId)
  }

  const handleSelectService = (garmentId: string, serviceId: string) => {
    setPrefilledGarmentId(garmentId)
    setPrefilledServiceId(serviceId)
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
      localStorage.setItem('tg_measurement_draft', JSON.stringify(params))
    }
  }

  return (
    <HomeView
      go={navigate}
      user={user}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
      onQuickSearch={handleQuickSearch}
      onSelectService={handleSelectService}
      onSelectStore={handleSelectStore}
      onRequestMeasurement={handleRequestMeasurement}
    />
  )
}
