'use client'

import { useEffect } from 'react'
import { getStudioUrl } from '@/lib/api'

export default function PartnerPage() {
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
    window.location.href = getStudioUrl('/', token)
  }, [])

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3 bg-[#FAF8F5]">
      <div className="size-9 border-2 border-[#9E593B] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-[#7A7E85] tracking-wider uppercase">
        Connecting to Studio Portal Node…
      </p>
    </div>
  )
}
