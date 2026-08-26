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
}

export function HomeView({ go, onQuickSearch, onSelectService, onSelectStore }: HomeViewProps) {
  return (
    <div className="flex flex-col">
      {/* 1. Uber/Rapido-Style Interactive Hero with Instant Booking Widget */}
      <HeroSection go={go} onQuickSearch={onQuickSearch} />

      {/* 2. Key Trust & Metric Value Pillars */}
      <TrustBar />

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

