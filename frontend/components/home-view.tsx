'use client'

import { motion } from 'motion/react'
import { FaqAccordion } from './faq-accordion'
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
      {/* 1. Full First-Screen Section (Hero + TrustBar anchored at bottom of 1st screen on desktop) */}
      <div className="lg:min-h-[calc(100vh-68px)] lg:min-h-[calc(100dvh-68px)] flex flex-col justify-between bg-white">
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

      {/* 3. Service Option Cards (Studio Drop-off, Express, Bespoke) */}
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

      {/* 7. Frequently Asked Questions */}
      <section className="py-14 sm:py-20 bg-[#FAF8F5] border-t border-[#E8E1D5]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E593B]">
              Frequently Asked Questions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F1115] mt-2">
              Everything You Need to Know About Raffu
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-2">
              Clear answers about our partner studios, alteration services, and fit guarantee.
            </p>
          </motion.div>
          <FaqAccordion />
        </div>
      </section>
    </div>
  )
}

