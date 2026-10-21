import type { Metadata } from 'next'
import { HowItWorksClient } from './how-it-works-client'
import { buildHowToSchema, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Simple 4-step clothing alterations with Raffu: Choose your service, visit a partner studio or book courier pickup, and try on with our fit guarantee.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works | Clothing Alterations with Raffu',
    description:
      'Simple 4-step clothing alterations with Raffu: Choose your service, visit a partner studio or book courier pickup, and try on with our fit guarantee.',
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
