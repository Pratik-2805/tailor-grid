import type { Metadata } from 'next'
import { TermsClient } from './terms-client'
import { buildPageMetadata } from '@/lib/seo-schema'

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service',
  description:
    'Raffu Terms of Service, workshop craft standards, fixed pricing schedule, and 100% Fit Guarantee terms.',
  path: '/terms',
})

export default function TermsPage() {
  return <TermsClient />
}
