'use client'

import { AboutView } from '@/components/about-view'
import { useApp } from '@/components/app-provider'

export function AboutClient() {
  const { navigate } = useApp()
  return <AboutView go={navigate} />
}
