import type { Metadata } from 'next'
import { AboutClient } from './about-client'
import { SITE_CONFIG, buildBreadcrumbSchema, buildPageMetadata } from '@/lib/seo-schema'

export const metadata: Metadata = buildPageMetadata({
  title: 'About Raffu',
  description: 'Raffu connects you with verified local tailor studios. Book your alteration online, visit the studio for your fitting, and collect your clothes there.',
  path: '/about',
})

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Raffu',
    description:
      'Raffu connects you with verified local tailor studios. Book your alteration online, visit the studio for your fitting, and collect your clothes there.',
    url: `${SITE_CONFIG.url}/about`,
    about: { '@id': `${SITE_CONFIG.url}/#organization` },
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
