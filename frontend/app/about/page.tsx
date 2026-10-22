import type { Metadata } from 'next'
import { AboutClient } from './about-client'
import { SITE_CONFIG, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'About Raffu',
  description:
    'Learn how Raffu connects you with local tailoring studios for simple, reliable clothing alterations and repairs.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Raffu | Clothing Alterations & Repairs',
    description:
      'Learn how Raffu connects you with local tailoring studios for simple, reliable clothing alterations and repairs.',
    url: '/about',
  },
}

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Raffu',
    description:
      'Learn how Raffu connects you with local tailoring studios for simple, reliable clothing alterations and repairs.',
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
