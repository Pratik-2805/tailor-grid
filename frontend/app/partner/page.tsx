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
    <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3 bg-[#FAF8F5]">
      <div className="size-9 border-2 border-[#9E593B] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-[#7A7E85] tracking-wider uppercase">
        Connecting to Studio Portal Node…
      </p>
    </div>
  )
}
