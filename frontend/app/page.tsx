import type { Metadata } from 'next'
import { HomeClient } from './home-client'
import { SITE_CONFIG, buildLocalBusinessSchema, buildFAQSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Raffu — Own Your Fit | Certified Clothes Alterations & Tailoring Studio Network',
  description:
    'Book verified neighborhood master tailors with transparent upfront menu pricing. Precision trouser & denim hemming with original finish preservation, suit refitting, dress tapering & artisanal darning. 100% Fit Guarantee.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Raffu — Own Your Fit | Certified Clothes Alterations & Tailoring Studio Network',
    description:
      'Book verified neighborhood master tailors with transparent upfront menu pricing. Precision trouser & denim hemming with original finish preservation, suit refitting, dress tapering & artisanal darning. 100% Fit Guarantee.',
    url: '/',
  },
}

export default function HomePage() {
  const localBusinessSchema = buildLocalBusinessSchema()
  const faqSchema = buildFAQSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <HomeClient />
    </>
  )
}
