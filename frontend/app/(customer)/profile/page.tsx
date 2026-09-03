'use client'

import { ProfileView } from '@/components/profile-view'
import { useApp } from '@/components/app-provider'

export default function ProfilePage() {
  const { user, setUser, navigate, openAuth, handleSignOut } = useApp()

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
