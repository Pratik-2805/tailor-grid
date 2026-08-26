'use client'

import { useState } from 'react'
import { AboutView } from '@/components/tailorgrid/about-view'
import { AdminView } from '@/components/tailorgrid/admin-view'
import { CustomerFlow } from '@/components/tailorgrid/customer-flow'
import { makeOtp, type Screen, type StoreOption } from '@/components/tailorgrid/data'
import { Footer } from '@/components/tailorgrid/footer'
import { ForPartnersView } from '@/components/tailorgrid/for-partners-view'
import { Header } from '@/components/tailorgrid/header'
import { HomeView } from '@/components/tailorgrid/home-view'
import { HowItWorksView } from '@/components/tailorgrid/how-it-works-view'
import { OrdersView } from '@/components/tailorgrid/orders-view'
import { PartnerFlow } from '@/components/tailorgrid/partner-flow'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [otp] = useState(() => makeOtp())

  // Booking pre-fill state
  const [prefilledPostcode, setPrefilledPostcode] = useState('W8 4EP')
  const [prefilledGarmentId, setPrefilledGarmentId] = useState('trousers')
  const [prefilledServiceId, setPrefilledServiceId] = useState<string | undefined>()
  const [prefilledStore, setPrefilledStore] = useState<StoreOption | undefined>()

  const handleNavigate = (nextScreen: Screen) => {
    setScreen(nextScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">
      {/* Universal Luxury Navigation Header */}
      <Header currentScreen={screen} go={handleNavigate} />

      {/* Main Page Views */}
      <main className="flex-1">
        {screen === 'home' && (
          <HomeView
            go={handleNavigate}
            onQuickSearch={handleQuickSearch}
            onSelectService={handleSelectService}
            onSelectStore={handleSelectStore}
          />
        )}

        {screen === 'how-it-works' && <HowItWorksView go={handleNavigate} />}

        {screen === 'about' && <AboutView go={handleNavigate} />}

        {screen === 'for-partners' && <ForPartnersView go={handleNavigate} />}

        {screen === 'booking' && (
          <CustomerFlow
            go={handleNavigate}
            otp={otp}
            initialPostcode={prefilledPostcode}
            initialGarmentId={prefilledGarmentId}
            initialServiceId={prefilledServiceId}
            initialStore={prefilledStore}
          />
        )}

        {screen === 'orders' && <OrdersView go={handleNavigate} />}

        {screen === 'partner' && <PartnerFlow go={handleNavigate} otp={otp} />}

        {screen === 'admin' && <AdminView go={handleNavigate} />}
      </main>

      {/* Universal Footer */}
      <Footer go={handleNavigate} />
    </div>
  )
}
