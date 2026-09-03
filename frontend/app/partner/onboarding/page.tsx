'use client'

import { PartnerOnboarding } from '@/components/partner-onboarding'
import { useApp } from '@/components/app-provider'

export default function PartnerOnboardingPage() {
  const { user, handleAuthSuccess, handleSignOut } = useApp()

  return (
    <PartnerOnboarding
      user={user}
      onComplete={handleAuthSuccess}
      onSignOut={handleSignOut}
    />
  )
}
