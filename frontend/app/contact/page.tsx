import type { Metadata } from 'next'
import { ContactClient } from './contact-client'
import { SITE_CONFIG, buildBreadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Contact Concierge Support — Tailoring & Fitting Assistance',
  description:
    'Need help with your garment fitting, order status, or tailoring consultation? Contact the Raffu concierge support team via email, phone, or live inquiry.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Raffu Concierge Support | Raffu - Own Your Fit',
    description:
      'Dedicated concierge support for tailoring consultations, fitting inquiries, and order assistance.',
    url: '/contact',
  },
}

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Raffu Concierge Support',
    description: 'Get in touch with Raffu for tailoring consultations and fitting inquiries.',
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
