'use client'

import { AboutView } from '@/components/about-view'
import { useApp } from '@/components/app-provider'

export default function AboutPage() {
  const { navigate } = useApp()
  return <AboutView go={navigate} />
}
