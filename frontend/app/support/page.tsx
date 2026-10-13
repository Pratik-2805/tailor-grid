'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SupportPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/contact')
  }, [router])
  return null
}
