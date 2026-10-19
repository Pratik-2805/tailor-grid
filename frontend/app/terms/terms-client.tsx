'use client'

import { TermsView } from '@/components/terms-view'
import { useApp } from '@/components/app-provider'

export function TermsClient() {
  const { navigate } = useApp()
  return <TermsView go={navigate} />
}
