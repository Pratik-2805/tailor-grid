'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ForPartnersView } from '@/components/for-partners-view'
import { useApp } from '@/components/app-provider'
import { getAuthRole } from '@/lib/cookies'

export default function ForPartnersPage() {
  const router = useRouter()
  const { navigate, openAuth, handleAuthSuccess, user, isAuthLoading } = useApp()

  useEffect(() => {
    if (isAuthLoading) return
    if (user && user.role === 'CUSTOMER') {
      router.replace('/book')
    }
  }, [user, isAuthLoading, router])

  if (user && user.role === 'CUSTOMER') {
    return null
  }

  return (
    <ForPartnersView
      go={navigate}
      onOpenAuth={openAuth}
      onPartnerRegistered={handleAuthSuccess}
    />
  )
}
