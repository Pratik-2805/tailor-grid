'use client'

import { CatalogSection } from './catalog-section'
import { FitProfileSection } from './fit-profile-section'
import { HeroSection } from './hero-section'
import { HowItWorksPreview } from './how-it-works-preview'
import { PartnerBanner } from './partner-banner'
import { ServiceGrid } from './service-grid'
import { StudiosPreview } from './studios-preview'
import { TestimonialsSection } from './testimonials-section'
import { TrustBar } from './trust-bar'
import { type Screen, type StoreOption } from './data'

interface HomeViewProps {
  go: (s: Screen) => void
  onQuickSearch?: (postcode: string, garmentId: string) => void
  onSelectService?: (garmentId: string, serviceId: string) => void
  onSelectStore?: (store: StoreOption) => void
  onRequestMeasurement?: (params: {
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
  onQuickSearch,
  onSelectService,
  onSelectStore,
  onRequestMeasurement,
}: HomeViewProps) {
  return (
    <div className="flex flex-col">
      {/* 1. Full First-Screen Section (Hero + TrustBar anchored at bottom of 1st screen) */}
      <div className="min-h-[calc(100vh-68px)] min-h-[calc(100dvh-68px)] flex flex-col justify-between bg-white">
        <div className="flex-1 flex flex-col justify-center">
          <HeroSection
            go={go}
            onQuickSearch={onQuickSearch}
            onRequestMeasurement={onRequestMeasurement}
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

      {/* 5. Complete Garment Catalog & Upfront Pricing Matrix */}
      <CatalogSection go={go} onSelectService={onSelectService} />

      {/* 6. Verified Local Studios & Ateliers Network */}
      <StudiosPreview go={go} onSelectStore={onSelectStore} />

      {/* 7. Digital Fit Passport Spotlight */}
      <FitProfileSection go={go} />

      {/* 8. Partner Banner for Master Tailors (Rapido Captain / Uber Driver style) */}
      <PartnerBanner go={go} />

      {/* 9. Client Stories & Craftsmanship Standards */}
      <TestimonialsSection />
    </div>
  )
}

