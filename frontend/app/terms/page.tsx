import type { Metadata } from 'next'
import { TermsClient } from './terms-client'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Raffu Terms of Service, workshop craft standards, fixed pricing schedule, and 100% Fit Guarantee terms.',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return <TermsClient />
}
