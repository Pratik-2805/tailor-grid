import type { Metadata } from 'next'
import { HomeClient } from './home-client'
import { SITE_CONFIG, buildFAQSchema, buildPageMetadata, buildServiceCatalogSchema, buildSpeakableSchema } from '@/lib/seo-schema'

export const metadata: Metadata = buildPageMetadata({
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  path: '/',
  absoluteTitle: true,
})

export default function HomePage() {
  const serviceSchema = buildServiceCatalogSchema()
  const faqSchema = buildFAQSchema()
  const speakableSchema = buildSpeakableSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(speakableSchema),
        }}
      />
      <HomeClient />
    </>
  )
}
