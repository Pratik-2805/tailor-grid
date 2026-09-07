'use client'

import { useEffect } from 'react'
import { PartnerFlow } from '@/components/partner-flow'
import { useApp } from '@/components/app-provider'
import { CustomLoader } from '@/components/custom-loader'

export default function PartnerPage() {
  const { user, isAuthLoading, navigate, handleSignOut, openAuth } = useApp()

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'STUDIO')) {
      openAuth('STUDIO', 'signin')
    }
  }, [isAuthLoading, user, openAuth])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text="Connecting to Partner Network"
          subtext="Authenticating your master tailor workshop credentials"
        />
      </div>
    )
  }

  return (
    <PartnerFlow
      go={navigate}
      user={user}
      onSignOut={handleSignOut}
    />
  )
}
