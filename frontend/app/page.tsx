import type { Metadata } from 'next'
import { HomeClient } from './home-client'
import { SITE_CONFIG, buildLocalBusinessSchema, buildFAQSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Raffu — Own Your Fit | Doorstep Alterations, Custom Tailoring & Fitting',
  description:
    'Book verified local master tailors with upfront transparent pricing. Fast doorstep pickup, precision trouser hemming, suit fitting & bespoke repairs. 100% Fit Guarantee.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Raffu — Own Your Fit | Doorstep Alterations, Custom Tailoring & Fitting',
    description:
      'Book verified local master tailors with upfront transparent pricing. Fast doorstep pickup, precision trouser hemming, suit fitting & bespoke repairs. 100% Fit Guarantee.',
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
