'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getStudioUrl } from '@/lib/api'
import { getAuthRole, getAuthUser, getAuthToken } from '@/lib/cookies'
import { CustomLoader } from '@/components/custom-loader'

export default function PartnerOnboardingPage() {
  const router = useRouter()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    const role = getAuthRole()
    const token = getAuthToken()

    setTimeout(() => {
      if (role === 'STUDIO') {
        window.location.href = getStudioUrl('/', token)
      } else {
        window.location.href = getStudioUrl('/?step=1')
      }
    }, 600)
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
