'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import { makeOtp, type User } from '@/components/data'
import { PartnerFlow } from '@/components/partner-flow'
import { CustomLoader } from '@/components/custom-loader'
import { getCurrentUser, CUSTOMER_SITE_URL, logoutUser } from '@/lib/api'
import { getAuthUser, setAuthUser, clearAllAuth } from '@/lib/cookies'

let inMemoryUser: User | null = null

export function StudioWorkbenchLayout({ children }: { children?: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(() => {
    if (inMemoryUser) return inMemoryUser
    if (typeof window !== 'undefined') {
      const cached = getAuthUser<User>()
      if (cached && (cached.role === 'STUDIO' || cached.role === 'ADMIN' || cached.role === 'TEMP_STUDIO')) {
        inMemoryUser = cached
        return cached
      }
    }
    return null
  })

  const [loadingUser, setLoadingUser] = useState<boolean>(() => {
    if (inMemoryUser) return false
    if (typeof window !== 'undefined') {
      const cached = getAuthUser<User>()
      if (cached && (cached.role === 'STUDIO' || cached.role === 'ADMIN')) {
        return false
      }
    }
    return true
  })
  const [otp] = useState(() => makeOtp())

  const customerSiteUrl = CUSTOMER_SITE_URL

  useEffect(() => {
    let isMounted = true

    getCurrentUser()
      .then((u) => {
        if (!isMounted) return
        if (u && (u.role === 'STUDIO' || u.role === 'ADMIN' || u.role === 'TEMP_STUDIO')) {
          inMemoryUser = u
          setUser(u)
        } else {
          const cached = getAuthUser<User>()
          if (cached && (cached.role === 'STUDIO' || cached.role === 'ADMIN' || cached.role === 'TEMP_STUDIO')) {
            inMemoryUser = cached
            setUser(cached)
          } else {
            inMemoryUser = null
            setUser(null)
          }
        }
      })
      .catch(() => {
        if (!isMounted) return
        const cached = getAuthUser<User>()
        if (cached && (cached.role === 'STUDIO' || cached.role === 'ADMIN' || cached.role === 'TEMP_STUDIO')) {
          inMemoryUser = cached
          setUser(cached)
        } else {
          inMemoryUser = null
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) setLoadingUser(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // If auth check completes and user is not an active studio, redirect appropriately
  useEffect(() => {
    if (!loadingUser) {
      if (user?.role === 'TEMP_STUDIO' || (user?.role === 'STUDIO' && (!user.studioName || !user.phone || user.status === 'INACTIVE'))) {
        window.location.replace('/?step=1')
        return
      }
      if (!user || (user.role !== 'STUDIO' && user.role !== 'ADMIN')) {
        window.location.replace(customerSiteUrl)
      }
    }
  }, [loadingUser, user, customerSiteUrl])

  const handleUpdateUser = (updated: User) => {
    setUser(updated)
    setAuthUser(updated)
    toast.success('Studio profile updated successfully!', {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleSignOut = async () => {
    try {
      await logoutUser()
    } catch {
      clearAllAuth()
    }
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.href = customerSiteUrl || '/'
      return
    }
    router.replace('/')
  }

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#18191B] p-6">
        <CustomLoader
          size="lg"
          variant="atelier"
          text="Accessing Master Workshop"
          steps={[
            'Accessing Master Workshop',
            'Syncing active alteration queue',
            'Connecting to Partner Network',
          ]}
          subtext="Preparing your tailor workbench controls and live telemetry"
        />
        <ToastContainer
          position="top-center"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <main className="flex-1 flex flex-col">
        <PartnerFlow
          go={() => {}}
          otp={otp}
          user={user}
          onSignOut={handleSignOut}
          onOpenProfile={() => router.push('/settings')}
          onUpdateUser={handleUpdateUser}
        />
      </main>
      {children}
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}
