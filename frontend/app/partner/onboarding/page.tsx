'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getStudioUrl } from '@/lib/api'
import { getAuthRole, getAuthUser } from '@/lib/cookies'
import { CustomLoader } from '@/components/custom-loader'

export default function PartnerOnboardingPage() {
  const router = useRouter()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    const role = getAuthRole()
    const user = getAuthUser()

    // If logged in as Customer, disallow partner onboarding and redirect to user portal
    if (role === 'CUSTOMER' || user?.role === 'CUSTOMER') {
      toast.error('Unauthorized access, redirecting to user portal.', {
        position: 'top-center',
        autoClose: 2500,
        toastId: 'unauthorized-partner-onboarding',
      })

      setTimeout(() => {
        router.replace('/')
      }, 1800)
      return
    }

    setTimeout(() => {
      window.location.href = getStudioUrl('/')
    }, 800)
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
