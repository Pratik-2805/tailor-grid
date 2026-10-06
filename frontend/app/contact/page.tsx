'use client'

import { ContactView } from '@/components/contact-view'
import { useApp } from '@/components/app-provider'

export default function ContactPage() {
  const { navigate } = useApp()
  return <ContactView go={navigate} />
}
