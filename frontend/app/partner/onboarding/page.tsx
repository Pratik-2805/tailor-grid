'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getStudioUrl, getCurrentUser } from '@/lib/api'
import { getAuthRole, getAuthToken, getRefreshToken } from '@/lib/cookies'
import { CustomLoader } from '@/components/custom-loader'

export default function PartnerOnboardingPage() {
  const router = useRouter()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    getCurrentUser()
      .then((user) => {
        if (user?.role === 'STUDIO' || user?.role === 'TEMP_STUDIO') {
          const at = getAuthToken()
          window.location.href = getStudioUrl('/', at)
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF8F5] relative">
      <CustomLoader
        size="lg"
        variant="atelier"
        text="Verifying Studio Access"
        subtext="Checking partner credentials and role permissions…"
      />
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
