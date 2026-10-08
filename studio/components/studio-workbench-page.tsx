'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import { makeOtp, type User } from '@/components/data'
import { PartnerFlow, type StudioTab } from '@/components/partner-flow'
import { CustomLoader } from '@/components/custom-loader'
import { getCurrentUser, CUSTOMER_SITE_URL, logoutUser } from '@/lib/api'
import { getAuthUser, setAuthUser, clearAllAuth } from '@/lib/cookies'

let inMemoryUser: User | null = null

interface StudioWorkbenchPageProps {
  initialTab: StudioTab
}

export function StudioWorkbenchPage({ initialTab }: StudioWorkbenchPageProps) {
  const router = useRouter()
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
          inMemoryUser = null
          setUser(null)
          clearAllAuth()
          if (typeof window !== 'undefined') {
            window.location.replace(CUSTOMER_SITE_URL)
          }
        }
      })
      .catch(() => {
        if (!isMounted) return
        inMemoryUser = null
        setUser(null)
        clearAllAuth()
        if (typeof window !== 'undefined') {
          window.location.replace(CUSTOMER_SITE_URL)
        }
      })
      .finally(() => {
        if (isMounted) setLoadingUser(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // If auth check completes and user is TEMP_STUDIO, redirect to onboarding
  useEffect(() => {
    if (!loadingUser && user) {
      if (user.role === 'TEMP_STUDIO') {
        window.location.replace('/?step=1')
        return
      }
      if (user.role !== 'STUDIO' && user.role !== 'ADMIN') {
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
      window.location.href = '/'
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
          go={() => { }}
          otp={otp}
          user={user}
          onSignOut={handleSignOut}
          onOpenProfile={() => router.push('/settings')}
          onUpdateUser={handleUpdateUser}
          activeTab={initialTab}
        />
      </main>
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
