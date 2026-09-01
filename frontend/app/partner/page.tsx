'use client'

import { PartnerFlow } from '@/components/partner-flow'
import { useApp } from '@/components/app-provider'

export default function PartnerPage() {
  const { user, navigate, handleSignOut } = useApp()
  return (
    <PartnerFlow
      go={navigate}
      user={user}
      onSignOut={handleSignOut}
    />
  )
}
