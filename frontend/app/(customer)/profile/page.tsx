'use client'

import { useEffect } from 'react'
import { ProfileView } from '@/components/profile-view'
import { useApp } from '@/components/app-provider'
import { CustomLoader } from '@/components/custom-loader'

export default function ProfilePage() {
  const { user, setUser, isAuthLoading, navigate, openAuth, handleSignOut } = useApp()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuth('CUSTOMER', 'signin')
    }
  }, [isAuthLoading, user, openAuth])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text="Accessing member profile"
          subtext="Loading your personal fitting preferences and measurements"
        />
      </div>
    )
  }

  return (
    <ProfileView
      go={navigate}
      user={user}
      onUpdateUser={(updated) => setUser(updated)}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
      onSignOut={handleSignOut}
    />
  )
}
