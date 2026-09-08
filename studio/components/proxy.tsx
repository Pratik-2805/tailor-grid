'use client'

import React, { useEffect, useState, useRef } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCurrentUser, CUSTOMER_SITE_URL } from '@/lib/api'
import { getAuthRole, getAuthUser, clearAllAuth } from '@/lib/cookies'
import type { User } from '@/components/data'
import { CustomLoader } from '@/components/custom-loader'

interface StudioProxyProps {
  children: React.ReactNode
}

/**
 * StudioProxy Gate
 * 
 * Intercepts access to the Studio Portal. If a user is registered as a CUSTOMER,
 * it immediately triggers an unauthorized access toast, clears the studio session,
 * and automatically redirects them to the customer site (port 3000).
 */
export function StudioProxy({ children }: StudioProxyProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isCustomerBlocked, setIsCustomerBlocked] = useState(false)
  const hasRedirectedRef = useRef(false)

  const handleCustomerRedirect = (identifier?: string) => {
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true
    setIsCustomerBlocked(true)
    setIsChecking(false)

    toast.error('Unauthorized access, redirecting to user portal.', {
      position: 'top-center',
      autoClose: 2500,
      toastId: 'unauthorized-customer-redirect',
    })

    // Smooth redirect after toast notification
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = CUSTOMER_SITE_URL
      }
    }, 1800)
  }

  const verifyRoleGate = async () => {
    try {
      const storedRole = getAuthRole()
      const storedUser = getAuthUser<User>()

      // 1. Fast-path check from stored cookies
      if (storedRole === 'CUSTOMER' || storedUser?.role === 'CUSTOMER') {
        handleCustomerRedirect(storedUser?.email || storedUser?.phone || 'Customer')
        return
      }

      // 2. Server-side token validation
      const remoteUser = await getCurrentUser()
      if (remoteUser && remoteUser.role === 'CUSTOMER') {
        handleCustomerRedirect(remoteUser.email || remoteUser.phone || 'Customer')
        return
      }

      setIsCustomerBlocked(false)
    } catch (err) {
      console.warn('[StudioProxy] Verification note:', err)
      setIsCustomerBlocked(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    verifyRoleGate()

    const handleStorageChange = () => {
      verifyRoleGate()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // ── 1. Checking Role Gate / Redirecting State ──
  if (isChecking || isCustomerBlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#18191B] p-6 relative">
        <CustomLoader
          size="lg"
          variant="atelier"
          text={isCustomerBlocked ? 'Unauthorized Access Detected' : 'Verifying Partner Atelier Gate'}
          subtext={
            isCustomerBlocked
              ? 'Customer account detected. Redirecting to User Portal…'
              : 'Validating workshop credentials and role permissions…'
          }
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

  // ── 2. Authorized Studio Partner / Guest Passage ──
  return <>{children}</>
}

export default StudioProxy
