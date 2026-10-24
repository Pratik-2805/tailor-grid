import type { Metadata } from 'next'
import { ForPartnersClient } from './for-partners-client'
import { SITE_CONFIG, buildBreadcrumbSchema, buildPageMetadata } from '@/lib/seo-schema'

export const metadata: Metadata = buildPageMetadata({
  title: 'Partner with Raffu',
  description:
    'Join the Raffu network of tailoring studios. Receive new local alteration orders, clear order details, and guaranteed payouts for your studio.',
  path: '/for-partners',
})

export default function ForPartnersPage() {
  const partnerServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Raffu Partner Studio Program',
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
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
