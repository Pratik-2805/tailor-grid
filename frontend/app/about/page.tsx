import type { Metadata } from 'next'
import { AboutClient } from './about-client'
import { SITE_CONFIG, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'About Raffu — Own Your Fit | Modern Tailoring & Atelier Network',
  description:
    'Learn how Raffu is revitalizing neighborhood craft tailoring. We connect discerning clients with verified master tailors, championing sustainable garment longevity, precision fit, and artisan livelihoods.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Raffu — Own Your Fit | Modern Tailoring & Atelier Network',
    description:
      'Reinventing clothing alterations. Verified local master tailors, sustainable clothing longevity, and bespoke fit guarantee.',
    url: '/about',
  },
}

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Raffu - Own Your Fit',
    description:
      'Learn how Raffu is revitalizing neighborhood craft tailoring. We connect discerning clients with verified master tailors.',
    url: `${SITE_CONFIG.url}/about`,
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'About Raffu', path: '/about' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <AboutClient />
    </>
  )
}
