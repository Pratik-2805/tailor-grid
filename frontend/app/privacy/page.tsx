import type { Metadata } from 'next'
import { PrivacyClient } from './privacy-client'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Raffu Privacy & Data Protection Policy. Read how we safeguard your fitting dimensions, account data, and payment information.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
