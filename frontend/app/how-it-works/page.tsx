'use client'

import { HowItWorksView } from '@/components/how-it-works-view'
import { useApp } from '@/components/app-provider'

export default function HowItWorksPage() {
  const { navigate, setPrefilledPostcode, setPrefilledGarmentId, setPrefilledServiceId } = useApp()

  const handleQuickSearch = (postcode: string, garmentId: string) => {
    setPrefilledPostcode(postcode)
    setPrefilledGarmentId(garmentId)
  }

  const handleSelectService = (garmentId: string, serviceId: string) => {
    setPrefilledGarmentId(garmentId)
    setPrefilledServiceId(serviceId)
  }

  return (
    <HowItWorksView
      go={navigate}
      onQuickSearch={handleQuickSearch}
      onSelectService={handleSelectService}
    />
  )
}
