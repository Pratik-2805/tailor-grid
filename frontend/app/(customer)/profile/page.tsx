'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileView } from '@/components/profile-view'
import { useApp } from '@/components/app-provider'
import { NormalLoader } from '@/components/normal-loader'

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, isAuthLoading, navigate, openAuth, handleSignOut } = useApp()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuth('CUSTOMER', 'signin')
      router.replace('/')
    }
  }, [isAuthLoading, user, openAuth, router])

  if (isAuthLoading || !user) {
    return (
      <div className="flex-1 min-h-[60vh] flex items-center justify-center py-20 p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <NormalLoader />
      </div>
    )
  }

  return (
    <ProfileView
      go={navigate}
      user={user}
      onUpdateUser={(updated) => setUser(updated)}
      onOpenAuth={(authType = 'signin') => openAuth('CUSTOMER', authType)}
      onSignOut={handleSignOut}
    />
  )
}
