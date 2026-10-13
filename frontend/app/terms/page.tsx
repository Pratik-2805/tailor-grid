'use client'

import { TermsView } from '@/components/terms-view'
import { useApp } from '@/components/app-provider'

export default function TermsPage() {
  const { navigate } = useApp()
  return <TermsView go={navigate} />
}
