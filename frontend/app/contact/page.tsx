import type { Metadata } from 'next'
import { ContactClient } from './contact-client'
import { SITE_CONFIG, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Have a question about your fitting or order? Contact the Raffu customer team by email or phone.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Raffu',
    description:
      'Have a question about your fitting or order? Contact the Raffu customer team by email or phone.',
    url: '/contact',
  },
}

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Raffu',
    description: 'Get in touch with Raffu for tailoring and fitting questions.',
    url: `${SITE_CONFIG.url}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      email: SITE_CONFIG.supportEmail,
      telephone: SITE_CONFIG.supportPhone,
    },
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact Us', path: '/contact' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <ContactClient />
    </>
  )
}
