'use client'

import { ForPartnersView } from '@/components/for-partners-view'
import { useApp } from '@/components/app-provider'

export default function ForPartnersPage() {
  const { navigate, openAuth, handleAuthSuccess } = useApp()
  return (
    <ForPartnersView
      go={navigate}
      onOpenAuth={openAuth}
      onPartnerRegistered={handleAuthSuccess}
    />
  )
}
