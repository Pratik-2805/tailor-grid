import type { Metadata } from 'next'
import { PrivacyClient } from './privacy-client'
import { buildPageMetadata } from '@/lib/seo-schema'

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Raffu Privacy & Data Protection Policy. Read how we safeguard your fitting dimensions, account data, and payment information.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return <PrivacyClient />
}
