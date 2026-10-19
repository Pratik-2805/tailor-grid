import type { Metadata } from 'next'
import { HowItWorksClient } from './how-it-works-client'
import { buildHowToSchema, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'How It Works — Effortless 4-Step Clothes Alterations & Tailoring',
  description:
    'Discover how Raffu makes perfect fitting effortless. Select your garment & service, book a master tailor fitting, get precision craftsmanship, and enjoy a 100% guaranteed fit.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works — Effortless Tailoring & Alterations | Raffu - Own Your Fit',
    description:
      '4 simple steps to flawless fit: Choose your service, book tailor fitting, artisan precision crafting, and 100% fit guaranteed collection.',
    url: '/how-it-works',
  },
}

export default function HowItWorksPage() {
  const howToSchema = buildHowToSchema()
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <HowItWorksClient />
    </>
  )
}
