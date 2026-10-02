'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isAdminRoute = Boolean(pathname?.startsWith('/admin'))

  const [isChecking, setIsChecking] = useState(!isAdminRoute)
  const [isCustomerBlocked, setIsCustomerBlocked] = useState(false)
  const hasRedirectedRef = useRef(false)

  // 0. Super Admin route is completely independent and has its own auth gate
  if (isAdminRoute) {
    return <>{children}</>
  }

  const handleCustomerRedirect = (identifier?: string) => {
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true
    setIsCustomerBlocked(true)
    setIsChecking(false)

    if (typeof window !== 'undefined') {
      window.location.replace(CUSTOMER_SITE_URL)
    }
  }

  const verifyRoleGate = async () => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        // 0. Always allow access to /admin portal routes or /auth/callback
        if (path.startsWith('/admin') || path.startsWith('/auth/callback')) {
          setIsChecking(false)
          setIsCustomerBlocked(false)
          return
        }

        // If URL has authorization code or token, forward immediately to callback
        const params = new URLSearchParams(window.location.search)
        if (params.has('code') || params.has('token')) {
          window.location.replace('/auth/callback' + window.location.search)
          return
        }
      }

      const storedRole = getAuthRole()
      const storedUser = getAuthUser<User>()

      if (storedRole === 'ADMIN' || storedUser?.role === 'ADMIN') {
        setIsChecking(false)
        setIsCustomerBlocked(false)
        return
      }

      // 1. Fast-path check from stored cookies
      if (storedRole === 'CUSTOMER' || storedUser?.role === 'CUSTOMER') {
        handleCustomerRedirect(storedUser?.email || storedUser?.phone || 'Customer')
        return
      }

      // 2. Server-side token validation
      const remoteUser = await getCurrentUser()
      if (remoteUser && remoteUser.role === 'ADMIN') {
        setIsChecking(false)
        setIsCustomerBlocked(false)
        return
      }
      if (remoteUser && remoteUser.role === 'STUDIO') {
        setIsChecking(false)
        setIsCustomerBlocked(false)
        return
      }

      // If user is not authenticated or not STUDIO, redirect to main portal
      handleCustomerRedirect(remoteUser?.email || remoteUser?.phone || 'Unauthenticated')
    } catch (err) {
      console.warn('[StudioProxy] Verification note:', err)
      handleCustomerRedirect('Unauthenticated')
    }
  }

  useEffect(() => {
    verifyRoleGate()

    // Suppress third-party Chrome Extension unhandled promise rejections from noise-polluting console
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason
      const reasonStr = String(reason || '')
      const stack = reason?.stack || ''
      if (
        reasonStr.includes('chrome-extension://') ||
        stack.includes('chrome-extension://') ||
        reasonStr.includes("reading 'M_ID'") ||
        stack.includes('eppiocemhmnlbhjplcgkofciiegomcon')
      ) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    const handleStorageChange = () => {
      verifyRoleGate()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('storage', handleStorageChange)
    }
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
