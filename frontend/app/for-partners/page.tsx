import type { Metadata } from 'next'
import { ForPartnersClient } from './for-partners-client'
import { SITE_CONFIG, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Partner with Raffu — Grow Your Tailoring Atelier & Studio Business',
  description:
    'Join the Raffu verified tailoring network. Increase atelier footfall, receive high-value alteration orders with clear digital specifications, and boost monthly studio revenue.',
  alternates: {
    canonical: '/for-partners',
  },
  openGraph: {
    title: 'Partner with Raffu — Master Tailor Atelier Network | Raffu - Own Your Fit',
    description:
      'Fill empty bench capacity and scale your tailoring studio with verified high-ticket alteration orders.',
    url: '/for-partners',
  },
}

export default function ForPartnersPage() {
  const partnerServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Raffu Tailor Partner Network Program',
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    description:
      'Partnership program connecting skilled local tailor ateliers with customers seeking professional alterations and fittings.',
    audience: {
      '@type': 'Audience',
      audienceType: 'Tailors, Tailoring Studios, Alteration Ateliers, Fashion Designers',
    },
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Partner with Raffu', path: '/for-partners' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(partnerServiceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <ForPartnersClient />
    </>
  )
}
