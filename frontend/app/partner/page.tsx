'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getStudioUrl, getCurrentUser } from '@/lib/api'
import { getAuthToken, getRefreshToken } from '@/lib/cookies'
import { NormalLoader } from '@/components/normal-loader'

export default function PartnerPage() {
  const router = useRouter()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    getCurrentUser()
      .then((user) => {
        if (user?.role === 'STUDIO' || user?.role === 'TEMP_STUDIO') {
          const rt = getRefreshToken() || getAuthToken()
          window.location.href = getStudioUrl('/auth/callback', rt)
        } else if (user?.role === 'CUSTOMER') {
          router.replace('/book')
        } else {
          router.replace('/for-partners')
        }
      })
      .catch(() => {
        router.replace('/for-partners')
      })
  }, [router])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
      <NormalLoader />
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}
