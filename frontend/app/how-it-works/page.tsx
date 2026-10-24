import type { Metadata } from 'next'
import { HowItWorksClient } from './how-it-works-client'
import { buildHowToSchema, buildBreadcrumbSchema, buildPageMetadata } from '@/lib/seo-schema'

export const metadata: Metadata = buildPageMetadata({
  title: 'How Raffu Works',
  description:
    'Book on raffu.com, a nearby partner studio accepts your order, you visit for your fitting, and the tailor hands over your altered garment at the studio.',
  path: '/how-it-works',
})

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
