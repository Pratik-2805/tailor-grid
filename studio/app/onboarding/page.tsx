'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudioOnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const params = new URLSearchParams(search)
    if (!params.has('step') && !params.has('auth')) {
      params.set('step', '1')
    }
    router.replace(`/?${params.toString()}`)
  }, [router])

  return null
}
