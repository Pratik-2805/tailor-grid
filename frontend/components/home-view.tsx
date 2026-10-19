'use client'

import { HeroSection } from './hero-section'
import { HowItWorksPreview } from './how-it-works-preview'
import { PartnerBanner } from './partner-banner'
import { ServiceGrid } from './service-grid'
import { TestimonialsSection } from './testimonials-section'
import { TrustBar } from './trust-bar'
import { type Screen, type StoreOption, type User } from './data'

interface HomeViewProps {
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: () => void
  onQuickSearch?: (postcode: string, garmentId: string) => void
  onSelectStore?: (store: StoreOption) => void
  onStartBooking?: (params: {
    city: string
    garmentId: string
    serviceId: string
    pickupOption: 'now' | 'schedule'
    scheduleDate: Date
    scheduleTime: string
    images: string[]
  }) => void
}

export function HomeView({
  go,
  user,
  onOpenAuth,
  onQuickSearch,
  onSelectStore,
  onStartBooking,
}: HomeViewProps) {
  return (
    <div className="flex flex-col">
      {/* 1. Full First-Screen Section (Hero + TrustBar anchored at bottom of 1st screen) */}
      <div className="min-h-[calc(100vh-68px)] min-h-[calc(100dvh-68px)] flex flex-col justify-between bg-white">
        <div className="flex-1 flex flex-col justify-center">
          <HeroSection
            go={go}
            user={user}
            onOpenAuth={onOpenAuth}
            onQuickSearch={onQuickSearch}
            onStartBooking={onStartBooking}
          />
        </div>
        <TrustBar />
      </div>

      {/* 3. Uber/Rapido Ride & Service Option Cards (Doorstep, Express, Bespoke) */}
      <ServiceGrid
        go={go}
        onSelectGarment={(garmentId) => onQuickSearch?.('W8 4EP', garmentId)}
      />

      {/* 4. Simple 4-Step Journey */}
      <HowItWorksPreview go={go} />

      {/* 5. Partner Acquisition Banner for Tailors & Studios */}
      {user?.role !== 'CUSTOMER' && <PartnerBanner go={go} />}

      {/* 6. Client Stories & Craftsmanship Standards */}
      <TestimonialsSection />
    </div>
  )
}

