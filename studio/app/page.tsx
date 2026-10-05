'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { makeOtp, type User } from '@/components/data'
import { StudioHeader } from '@/components/studio-header'
import { PartnerFlow, type StudioTab } from '@/components/partner-flow'
import { PartnerOnboarding } from '@/components/partner-onboarding'
import { CustomLoader } from '@/components/custom-loader'
import { getCurrentUser, CUSTOMER_SITE_URL, logoutUser } from '@/lib/api'
import { getAuthUser, setAuthUser, getAuthRole, setAuthRole, clearAllAuth } from '@/lib/cookies'

export default function StudioPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = getAuthUser<User>()
      const role = getAuthRole()
      if (cached && (cached.role === 'STUDIO' || cached.role === 'TEMP_STUDIO' || role === 'TEMP_STUDIO' || role === 'STUDIO')) {
        const roleToUse: 'STUDIO' | 'TEMP_STUDIO' = (cached.role === 'STUDIO' || role === 'STUDIO') ? 'STUDIO' : 'TEMP_STUDIO'
        return { ...cached, role: roleToUse }
      }
    }
    return null
  })
  const [partnerTab, setPartnerTab] = useState<StudioTab>('cockpit')
  const [otp] = useState(() => makeOtp())
  const [loadingUser, setLoadingUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const cached = getAuthUser<User>()
      const role = getAuthRole()
      if (cached && (cached.role === 'STUDIO' || cached.role === 'TEMP_STUDIO' || role === 'TEMP_STUDIO' || role === 'STUDIO')) {
        return false
      }
    }
    return true
  })

  const customerSiteUrl = CUSTOMER_SITE_URL

  useEffect(() => {
    // 1. If single-use auth code or token is passed in query, forward immediately to callback
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('code') || params.has('token')) {
        window.location.replace('/auth/callback' + window.location.search)
        return
      }
    }

    // 2. Fetch authenticated studio user
    getCurrentUser()
      .then((u) => {
        if (u) {
          const currentRole = getAuthRole()
          const effectiveRole: 'STUDIO' | 'TEMP_STUDIO' = (u.role === 'STUDIO' || currentRole === 'STUDIO') ? 'STUDIO' : 'TEMP_STUDIO'
          const finalUser: User = { ...u, role: effectiveRole }
          setUser(finalUser)
          setAuthRole(effectiveRole)
          setAuthUser(finalUser)
        } else {
          const cached = getAuthUser<User>()
          const currentRole = getAuthRole()
          if (cached && (cached.role === 'STUDIO' || cached.role === 'TEMP_STUDIO' || currentRole === 'TEMP_STUDIO' || currentRole === 'STUDIO')) {
            const roleToUse: 'STUDIO' | 'TEMP_STUDIO' = (cached.role === 'STUDIO' || currentRole === 'STUDIO') ? 'STUDIO' : 'TEMP_STUDIO'
            const updated: User = { ...cached, role: roleToUse }
            setUser(updated)
            setAuthRole(roleToUse)
            setAuthUser(updated)
          } else {
            setUser(null)
          }
        }
      })
      .catch(() => {
        const cached = getAuthUser<User>()
        const currentRole = getAuthRole()
        if (cached && (cached.role === 'STUDIO' || cached.role === 'TEMP_STUDIO' || currentRole === 'TEMP_STUDIO' || currentRole === 'STUDIO')) {
          const roleToUse: 'STUDIO' | 'TEMP_STUDIO' = (cached.role === 'STUDIO' || currentRole === 'STUDIO') ? 'STUDIO' : 'TEMP_STUDIO'
          const updated: User = { ...cached, role: roleToUse }
          setUser(updated)
          setAuthRole(roleToUse)
          setAuthUser(updated)
        } else {
          setUser(null)
        }
      })
      .finally(() => {
        setLoadingUser(false)
      })
  }, [])

  // 3. Strict Role-based Redirection
  useEffect(() => {
    if (!loadingUser) {
      if (!user || (user.role !== 'STUDIO' && user.role !== 'TEMP_STUDIO')) {
        // Unauthenticated or customer: redirect to main website
        if (typeof window !== 'undefined') {
          window.location.replace(customerSiteUrl)
        }
        return
      }

      // Active & complete Studio partner: redirect directly to dashboard
      if (user.role === 'STUDIO' && user.status === 'ACTIVE' && user.studioName && user.phone) {
        router.replace('/dashboard')
      }
    }
  }, [loadingUser, user, router, customerSiteUrl])

  const handleAuthSuccess = (loggedUser: User) => {
    if (loggedUser.role !== 'STUDIO') {
      toast.error('Unauthorized user, access denied.', { position: 'top-center' })
      if (typeof window !== 'undefined') {
        window.location.replace(customerSiteUrl)
      }
      return
    }
    setUser(loggedUser)
    setAuthRole('STUDIO')
    setAuthUser(loggedUser)
    toast.success(`Authenticated as ${loggedUser.name || 'Studio Partner'}!`, { position: 'top-center' })
  }

  const handleUpdateUser = (updated: User) => {
    setUser(updated)
    setAuthUser(updated)
    toast.success('Studio profile updated successfully!', { position: 'top-center' })
  }

  const handleSignOut = async () => {
    try {
      await logoutUser()
    } catch {
      clearAllAuth()
    }
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.replace(customerSiteUrl)
    }
  }

  // ── Loading state or Redirecting to Customer Portal ──
  if (loadingUser || !user || (user.role !== 'STUDIO' && user.role !== 'TEMP_STUDIO')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#18191B] p-6">
        <CustomLoader
          size="lg"
          variant="atelier"
          text={user ? 'Connecting to Workbench' : 'Redirecting to Darzi...'}
          steps={[
            'Verifying Partner Permissions',
            'Syncing Workbench Workspace',
            'Connecting to Partner Network',
          ]}
          subtext={user ? 'Loading tailor workbench telemetry…' : 'Studio access is restricted to verified partner accounts.'}
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

  const isProfileComplete = Boolean(
    user.role === 'STUDIO' &&
    user.status === 'ACTIVE' &&
    user.studioName &&
    user.phone
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {!isProfileComplete && (
        <StudioHeader
          user={user}
          onSignOut={handleSignOut}
          onOpenProfile={() => setPartnerTab('profile')}
        />
      )}

      <main className="flex-1 flex flex-col">
        {isProfileComplete ? (
          <PartnerFlow
            go={() => { }}
            otp={otp}
            user={user}
            onSignOut={handleSignOut}
            onOpenProfile={() => setPartnerTab('profile')}
            onUpdateUser={handleUpdateUser}
            activeTab={partnerTab}
            onTabChange={setPartnerTab}
          />
        ) : (
          /* Profile completion for newly approved / invited partners */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden my-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#9E593B]/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 w-full max-w-[540px] flex flex-col items-center justify-center my-auto">
              <PartnerOnboarding
                user={user}
                hideHeader={true}
                onComplete={handleAuthSuccess}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        )}
      </main>

      <ToastContainer
        position="top-center"
        autoClose={3500}
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
