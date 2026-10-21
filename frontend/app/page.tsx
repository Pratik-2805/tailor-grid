import type { Metadata } from 'next'
import { HomeClient } from './home-client'
import { buildFAQSchema, buildServiceCatalogSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Raffu | Clothes Alteration & Tailoring Studios',
  description:
    'Find verified tailoring and alteration studios with transparent pricing. Explore trouser and denim hemming, suit alterations, and clothing repairs with Raffu.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Raffu | Clothes Alteration & Tailoring Studios',
    description:
      'Discover local tailoring and alteration studios, transparent service pricing, and clothing repair services with Raffu.',
    url: 'https://raffu.com/',
    siteName: 'Raffu',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Raffu tailoring and alteration studio network',
      },
    ],
  },
}

export default function HomePage() {
  const serviceSchema = buildServiceCatalogSchema()
  const faqSchema = buildFAQSchema()

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
      <HomeClient />
    </>
  )
}
