'use client'

import { PrivacyView } from '@/components/privacy-view'
import { useApp } from '@/components/app-provider'

export function PrivacyClient() {
  const { navigate } = useApp()
  return <PrivacyView go={navigate} />
}
