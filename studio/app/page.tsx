'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Scissors } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import { makeOtp, type User } from '@/components/data'
import { StudioHeader } from '@/components/studio-header'
import { PartnerFlow, type StudioTab } from '@/components/partner-flow'
import { PartnerOnboarding } from '@/components/partner-onboarding'
import { CustomLoader } from '@/components/custom-loader'
import { getCurrentUser, CUSTOMER_SITE_URL } from '@/lib/api'
import { setAuthToken, setAuthUser, setAuthRole, clearAllAuth } from '@/lib/cookies'

export default function StudioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [partnerTab, setPartnerTab] = useState<StudioTab>('cockpit')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')
  const [otp] = useState(() => makeOtp())
  const [loadingUser, setLoadingUser] = useState(true)

  const customerSiteUrl = CUSTOMER_SITE_URL

  // Token & auth action handover from main website (port 3000 -> port 3001)
  useEffect(() => {
    let authParam: string | null = null
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      authParam = params.get('auth') || params.get('action')
      if (token) {
        setAuthToken(token)
        // Clean URL query params
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    if (authParam === 'signup' || authParam === 'register') {
      setAuthType('signup')
    } else if (authParam === 'signin' || authParam === 'login') {
      setAuthType('signin')
    }

    getCurrentUser()
      .then((u) => {
        if (u && u.role === 'STUDIO') {
          setUser(u)
        } else {
          setUser(null)
          if (authParam === 'signin' || authParam === 'login') {
            setAuthType('signin')
          }
        }
      })
      .catch(() => {
        setUser(null)
        if (authParam === 'signin' || authParam === 'login') {
          setAuthType('signin')
        }
      })
      .finally(() => {
        setLoadingUser(false)
      })
  }, [])

  const handleDemoAccess = () => {
    const demoUser: User = {
      id: 'demo-studio-1',
      name: 'Mayfair Bespoke Atelier',
      contact: '+44 20 7946 0912',
      email: 'mayfair.atelier@darzi.co.uk',
      phone: '+44 20 7946 0912',
      avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop',
      method: 'email',
      role: 'STUDIO',
      studioId: 'store-mayfair',
      studioName: 'Mayfair Bespoke Atelier',
      address: '14 Savile Row, Mayfair',
      postcode: 'W1S 3JN',
    }
    setUser(demoUser)
    setAuthRole('STUDIO')
    setAuthUser(demoUser)
    toast.success('Workbench Demo Sandbox activated!', {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleOpenAuth = (type: 'signin' | 'signup' = 'signin') => {
    if (type === 'signup') {
      window.location.href = '/onboarding'
      return
    }
    setAuthType(type)
  }

  const handleAuthSuccess = (loggedUser: User) => {
    if (loggedUser.role !== 'STUDIO') {
      toast.error('Unauthorized user, access denied.', {
        position: 'top-center',
        autoClose: 4000,
      })
      return
    }
    setUser(loggedUser)
    setAuthRole('STUDIO')
    setAuthUser(loggedUser)
    toast.success(`Authenticated as ${loggedUser.name || 'Studio Partner'}!`, {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleUpdateUser = (updated: User) => {
    setUser(updated)
    setAuthUser(updated)
    toast.success('Studio profile updated successfully!', {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleSignOut = () => {
    clearAllAuth()
    setUser(null)
    setPartnerTab('cockpit')
    toast.info('Signed out of Studio Workshop.', {
      position: 'top-center',
      autoClose: 2500,
    })
  }

  if (loadingUser) {
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">

      {/* Studio Header (Port 3001) */}
      <StudioHeader
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onOpenProfile={() => setPartnerTab('profile')}
      />

      <main className="flex-1 flex flex-col">
        {user ? (
          /* Active Studio Workbench Dashboard */
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
          /* Direct Studio Login Card (No marketing landing page) */
          <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#9E593B]/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Direct Auth Card */}
              <PartnerOnboarding
                initialTab={authType}
                hideHeader={true}
                onComplete={handleAuthSuccess}
              />

              {/* Bottom Customer Site Return Link */}
              <div className="mt-6 flex items-center gap-4 text-xs font-medium text-[#7A7E85]">
                <a
                  href={customerSiteUrl}
                  className="flex items-center gap-1.5 hover:text-[#0F1115] transition-colors py-1 px-3 rounded-full hover:bg-white/80 border border-transparent hover:border-[#E8E1D5]"
                >
                  <ArrowLeft size={13} className="text-[#9E593B]" />
                  <span>Return to Customer Site</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* React Toastify Notifications Container */}
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
