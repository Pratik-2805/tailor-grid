'use client'

import { PartnerOnboarding } from '@/components/partner-onboarding'
import { useEffect, useState } from 'react'
import type { User } from '@/components/data'
import { getCurrentUser } from '@/lib/api'

export default function StudioOnboardingPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
    })
  }, [])

  return (
    <PartnerOnboarding
      user={user}
      onComplete={(u) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tg_user', JSON.stringify(u))
          localStorage.setItem('tg_user_role', 'STUDIO')
          window.location.href = '/'
        }
      }}
      onSignOut={() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tg_token')
          localStorage.removeItem('tg_user')
          localStorage.removeItem('tg_user_role')
          window.location.href = '/'
        }
      }}
    />
  )
}
