'use client'

import { SupportView } from '@/components/support-view'
import { useApp } from '@/components/app-provider'

export default function SupportPage() {
  const { navigate } = useApp()
  return <SupportView go={navigate} />
}
