'use client'

import { useEffect, useState } from 'react'
import { StudioContactView } from '@/components/studio-contact-view'
import { getCurrentUser } from '@/lib/api'
import { getAuthUser } from '@/lib/cookies'

export default function StudioContactPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const cached = getAuthUser<any>()
    if (cached) setUser(cached)
    getCurrentUser().then((u) => {
      if (u) setUser(u)
    }).catch(() => {})
  }, [])

  return <StudioContactView user={user} />
}
