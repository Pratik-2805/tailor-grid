'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import { makeOtp, type User } from '@/components/data'
import { StudioHeader } from '@/components/studio-header'
import { PartnerFlow, type StudioTab } from '@/components/partner-flow'
import { PartnerOnboarding } from '@/components/partner-onboarding'
import { CustomLoader } from '@/components/custom-loader'
import { getCurrentUser, CUSTOMER_SITE_URL, loginWithGoogle } from '@/lib/api'
import { setAuthToken, setAuthUser, setAuthRole, clearAllAuth } from '@/lib/cookies'

export default function StudioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [partnerTab, setPartnerTab] = useState<StudioTab>('cockpit')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')
  const [otp] = useState(() => makeOtp())
  const [loadingUser, setLoadingUser] = useState(true)
  const [roleSelected, setRoleSelected] = useState(true)
  // 'join' = Google-only join screen, 'signin' = full PartnerOnboarding sign in
  const [studioView, setStudioView] = useState<'join' | 'signin'>('join')
  const [googleLoading, setGoogleLoading] = useState(false)

  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

  const customerSiteUrl = CUSTOMER_SITE_URL

  // Token & auth action handover from main website (port 3000 -> port 3001)
  useEffect(() => {
    let authParam: string | null = null
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const stepParam = params.get('step')
      authParam = params.get('auth') || params.get('action')
      if (token) {
        setAuthToken(token)
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())
      }
      // If a step param is present (e.g. /?step=1), skip role select and go to onboarding
      if (stepParam) {
        setRoleSelected(true)
        setAuthType('signup')
      }
    }

    if (authParam === 'signup' || authParam === 'register') {
      setAuthType('signup')
      setRoleSelected(true)
    } else if (authParam === 'signin' || authParam === 'login') {
      setAuthType('signin')
      setRoleSelected(true)
    }

    getCurrentUser()
      .then((u) => {
        if (u && u.role === 'STUDIO' && u.status === 'ACTIVE' && u.studioName && u.phone) {
          setUser(u)
          setRoleSelected(true)
        } else {
          setUser(u && u.status === 'INACTIVE' ? u : null)
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

  const triggerGoogleJoin = () => {
    setGoogleLoading(true)
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      setGoogleLoading(false)
      toast.info('Google sign-in is initialising. Please try again in a moment.', { position: 'top-center' })
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      document.head.appendChild(s)
      return
    }
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error || !tokenResponse?.access_token) {
            setGoogleLoading(false)
            toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
            return
          }
          try {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
            const profile = await profileRes.json()
            const result = await loginWithGoogle({
              accessToken: tokenResponse.access_token,
              role: 'STUDIO',
              profile: {
                name: profile.name || 'Studio Partner',
                contact: profile.email,
                email: profile.email,
                avatar: profile.picture,
                method: 'google',
                role: 'STUDIO',
                studioId: 'atelier-soho',
                studioName: '',
              },
            })
            setGoogleLoading(false)
            if (result?.user) {
              if (result.user.role !== 'STUDIO') {
                toast.error('Unauthorized user, access denied.', { position: 'top-center' })
                return
              }
              if (result.user.studioName && result.user.phone) {
                // Existing verified studio partner — go straight to dashboard
                handleAuthSuccess(result.user)
              } else {
                // New partner — redirect to onboarding step 1
                setAuthToken(result.token || '')
                setAuthRole('STUDIO')
                setAuthUser(result.user)
                window.location.href = '/?step=1'
              }
            }
          } catch (err: any) {
            setGoogleLoading(false)
            toast.error(err.message || 'Sign-in failed. Please try again.', { position: 'top-center' })
          }
        },
        error_callback: () => {
          setGoogleLoading(false)
          toast.error('Google popup was blocked. Please allow popups for this site.', { position: 'top-center' })
        },
      })
      tokenClient.requestAccessToken()
    } catch (err: any) {
      setGoogleLoading(false)
      toast.error('Google sign-in failed.', { position: 'top-center' })
    }
  }


  const handleOpenAuth = (_type: 'signin' | 'signup' = 'signin') => {
    clearAllAuth()
    setUser(null)
    setAuthType('signin')
    setRoleSelected(false)
    setStudioView('join')
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/')
      window.location.href = '/'
    }
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
    setAuthType('signin')
    setRoleSelected(false)
    if (typeof window !== 'undefined') {
      window.location.href = customerSiteUrl || '/'
      return
    }
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
        {user && user.role === 'STUDIO' && user.status === 'ACTIVE' && user.studioName && user.phone ? (
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
        ) : !roleSelected ? (
          /* ── Role Selection Screen ── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9E593B]/6 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl border border-[#E8E1D5] shadow-xl p-8">
              <div className="flex items-center justify-center mb-6">
                <a
                  href={customerSiteUrl}
                  className="cursor-pointer hover:opacity-85 transition-transform hover:scale-105 inline-block"
                  title="Return to Darzi Home"
                >
                  <img src="/bg_logo.png" alt="Darzi" className="h-11 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </a>
              </div>

              <div className="text-center mb-6">
                <h2 className="font-serif text-[24px] font-bold text-[#0F1115] tracking-tight leading-tight">
                  How are you joining?
                </h2>
                <p className="text-xs text-[#6B7280] mt-1.5">
                  Choose your role to get started with Darzi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Customer Card */}
                <a
                  href={customerSiteUrl}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#9E593B] hover:bg-white p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left no-underline"
                >
                  {/* Customer Illustration */}
                  <div className="w-full h-[148px] rounded-2xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center relative border border-[#E8E1D5]/60 shadow-inner">
                    <img
                      src="/role-customer.jpg"
                      alt="Customer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-[14px] font-bold text-[#18191B] group-hover:text-[#9E593B] transition-colors">
                      I&apos;m a Customer
                    </p>
                    <p className="text-[11px] text-[#7A7E85] mt-0.5 leading-snug">
                      Book alterations &amp; fittings
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 size-5 rounded-full border-2 border-[#E8E1D5] group-hover:border-[#9E593B] group-hover:bg-[#9E593B] transition-all flex items-center justify-center">
                    <svg className="size-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </a>

                {/* Studio Partner Card */}
                <button
                  type="button"
                  onClick={() => setRoleSelected(true)}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#0F1115] hover:bg-white p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left cursor-pointer"
                >
                  {/* Studio Illustration */}
                  <div className="w-full h-[148px] rounded-2xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center relative border border-[#E8E1D5]/60 shadow-inner">
                    <img
                      src="/role-studio.jpg"
                      alt="Studio Partner"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-[14px] font-bold text-[#18191B] group-hover:text-[#0F1115] transition-colors">
                      Studio Partner
                    </p>
                    <p className="text-[11px] text-[#7A7E85] mt-0.5 leading-snug">
                      Manage orders &amp; earn
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 size-5 rounded-full border-2 border-[#E8E1D5] group-hover:border-[#0F1115] group-hover:bg-[#0F1115] transition-all flex items-center justify-center">
                    <svg className="size-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              </div>

              <p className="text-center text-[10px] text-[#9CA3AF] mt-5">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </p>
            </div>

            <div className="mt-5">
              <a
                href={customerSiteUrl}
                className="flex items-center gap-1.5 text-xs font-medium text-[#7A7E85] hover:text-[#0F1115] transition-colors py-1 px-3 rounded-full hover:bg-white/80 border border-transparent hover:border-[#E8E1D5]"
              >
                <ArrowLeft size={13} className="text-[#9E593B]" />
                <span>Return to Customer Site</span>
              </a>
            </div>
          </div>
        ) : (
          /* ── Full PartnerOnboarding with Google, Mobile, Email, and all ── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden my-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#9E593B]/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-[540px] flex flex-col items-center justify-center my-auto">
              <PartnerOnboarding
                user={user}
                hideHeader={true}
                onComplete={handleAuthSuccess}
                onSignOut={handleSignOut}
              />

              <div className="mt-4 flex items-center gap-3 text-xs font-medium text-[#7A7E85]">
                <button
                  type="button"
                  onClick={() => setRoleSelected(false)}
                  className="flex items-center gap-1.5 hover:text-[#0F1115] transition-colors py-1 px-3 rounded-full hover:bg-white/80 border border-transparent hover:border-[#E8E1D5] cursor-pointer"
                >
                  <ArrowLeft size={13} className="text-[#9E593B]" />
                  <span>Back to role selection</span>
                </button>
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

// ── Role-Selection Illustrations ──────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}

function CustomerRoleIllustration() {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <radialGradient id="custGlowStudio" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9E593B" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#9E593B" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#9E593B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mannequinGradStudio" x1="75" y1="36" x2="125" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9F6F0" />
          <stop offset="50%" stopColor="#EFE8DC" />
          <stop offset="100%" stopColor="#DECEBE" />
        </linearGradient>
        <linearGradient id="woodGradStudio" x1="94" y1="20" x2="106" y2="148" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8C4A2D" />
          <stop offset="50%" stopColor="#6C351D" />
          <stop offset="100%" stopColor="#4A2211" />
        </linearGradient>
        <linearGradient id="tapeGradStudio" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="goldShearsStudio" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Ambient background aura */}
      <circle cx="100" cy="75" r="70" fill="url(#custGlowStudio)" />

      {/* Tailor's measuring arc guide */}
      <path d="M30 45 C65 15, 135 15, 170 45" stroke="#9E593B" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.3" fill="none" />
      <path d="M25 115 C60 145, 140 145, 175 115" stroke="#9E593B" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.25" fill="none" />

      {/* ── Mannequin Stand ── */}
      <rect x="97.5" y="105" width="5" height="34" rx="2.5" fill="url(#woodGradStudio)" />
      <circle cx="100" cy="116" r="3.5" fill="#D4AF37" stroke="#8C4A2D" strokeWidth="0.8" />
      <path d="M91 138 C94 133, 106 133, 109 138 L114 144 H86 Z" fill="url(#woodGradStudio)" />
      <path d="M88 141 C76 142, 66 144, 55 147" stroke="url(#woodGradStudio)" strokeWidth="3" strokeLinecap="round" />
      <path d="M112 141 C124 142, 134 144, 145 147" stroke="url(#woodGradStudio)" strokeWidth="3" strokeLinecap="round" />

      {/* ── Mannequin Torso ── */}
      <ellipse cx="100" cy="21" rx="6" ry="4.5" fill="url(#woodGradStudio)" />
      <rect x="98" y="24" width="4" height="6" rx="1.5" fill="url(#woodGradStudio)" />
      <path d="M95 30 Q100 29 105 30 L106 37 Q100 39 94 37 Z" fill="#E8DDD2" stroke="#9E593B" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="94" y1="33" x2="106" y2="33" stroke="#D4AF37" strokeWidth="1" />

      <path
        d="M94 36 C84 37, 72 41, 70 48 C68 55, 74 68, 77 78 C80 87, 83 94, 76 102 C72 106, 75 108, 80 108 H120 C125 108, 128 106, 124 102 C117 94, 120 87, 123 78 C126 68, 132 55, 130 48 C128 41, 116 37, 106 36 Z"
        fill="url(#mannequinGradStudio)"
        stroke="#9E593B"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      <path d="M86 42 C82 58, 87 84, 88 108" stroke="#9E593B" strokeWidth="0.9" strokeDasharray="2.5 2" strokeOpacity="0.45" fill="none" />
      <path d="M114 42 C118 58, 113 84, 112 108" stroke="#9E593B" strokeWidth="0.9" strokeDasharray="2.5 2" strokeOpacity="0.45" fill="none" />
      <path d="M100 38 L100 108" stroke="#9E593B" strokeWidth="0.6" strokeDasharray="4 2.5" strokeOpacity="0.3" fill="none" />
      <path d="M81 82 Q100 86 119 82" stroke="#9E593B" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.35" fill="none" />

      {/* ── Draped Measuring Tape ── */}
      <path
        d="M78 44 C84 48, 92 62, 94 76 C96 88, 90 94, 84 96 C74 98, 66 104, 60 114"
        stroke="url(#tapeGradStudio)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M78 44 C84 48, 92 62, 94 76 C96 88, 90 94, 84 96 C74 98, 66 104, 60 114"
        stroke="#78350F"
        strokeWidth="3.5"
        strokeDasharray="0.8 2"
        strokeOpacity="0.75"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Silk Thread Spool ── */}
      <g transform="translate(142, 28)">
        <ellipse cx="10" cy="4" rx="8" ry="3.5" fill="url(#woodGradStudio)" />
        <rect x="3" y="4" width="14" height="15" fill="#9E593B" rx="1.5" />
        <path d="M3 6 Q10 8 17 6 M3 10 Q10 12 17 10 M3 14 Q10 16 17 14" stroke="#F9ECE3" strokeWidth="0.6" strokeOpacity="0.6" />
        <ellipse cx="10" cy="19" rx="8" ry="3.5" fill="url(#woodGradStudio)" />
        <path d="M17 16 C22 24, 20 40, 10 52 C5 58, 2 64, -12 70" stroke="#9E593B" strokeWidth="0.9" strokeDasharray="3 2" strokeOpacity="0.5" fill="none" />
      </g>

      {/* ── Tailor's Gold Shears ── */}
      <g transform="translate(24, 86) rotate(-22)">
        <path d="M16 12 L42 5 C43 5, 43 8, 22 17 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.6" />
        <path d="M16 14 L42 22 C43 22, 42 19, 22 13 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="0.6" />
        <circle cx="20" cy="14" r="2.2" fill="#F59E0B" stroke="#78350F" strokeWidth="0.6" />
        <circle cx="8" cy="8" r="6" fill="none" stroke="url(#goldShearsStudio)" strokeWidth="2.4" />
        <circle cx="8" cy="20" r="6" fill="none" stroke="url(#goldShearsStudio)" strokeWidth="2.4" />
        <path d="M13 10 L18 13 M13 18 L18 15" stroke="url(#goldShearsStudio)" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* ── Pearl-Head Pins ── */}
      <line x1="126" y1="44" x2="134" y2="34" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="135" cy="33" r="2.5" fill="#FAF5F0" stroke="#9E593B" strokeWidth="0.7" />
      <line x1="128" y1="52" x2="137" y2="46" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="138" cy="45" r="2.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.7" />

      {/* Craftsmanship sparkles */}
      <text x="38" y="32" fontSize="13" fill="#D4AF37" fillOpacity="0.75">✦</text>
      <text x="162" y="96" fontSize="9" fill="#9E593B" fillOpacity="0.6">✦</text>
      <text x="144" y="128" fontSize="11" fill="#D4AF37" fillOpacity="0.5">✦</text>
      <text x="32" y="68" fontSize="8" fill="#9E593B" fillOpacity="0.45">✦</text>
    </svg>
  )
}

function StudioRoleIllustration() {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <radialGradient id="studioGlowRole" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9E593B" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#9E593B" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#9E593B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="machineBodyStudio" x1="40" y1="28" x2="160" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#222834" />
          <stop offset="45%" stopColor="#181D26" />
          <stop offset="100%" stopColor="#0F131A" />
        </linearGradient>
        <linearGradient id="goldAccentStudio" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="steelChromeStudio" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Atmospheric Workbench Glow */}
      <circle cx="100" cy="75" r="70" fill="url(#studioGlowRole)" />

      {/* ── Precision Workbench Bed ── */}
      <rect x="20" y="118" width="160" height="4" rx="2" fill="#000000" fillOpacity="0.5" />
      <rect x="22" y="108" width="156" height="11" rx="3.5" fill="#1A1F29" stroke="#333D4F" strokeWidth="1" />
      <line x1="28" y1="113" x2="78" y2="113" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="1.5 2.5" strokeOpacity="0.7" />
      <rect x="54" y="107.5" width="30" height="3" rx="1" fill="url(#steelChromeStudio)" />
      <line x1="62" y1="109" x2="76" y2="109" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 1.5" />

      {/* ── Cast Iron Sewing Machine Body ── */}
      <path
        d="
          M150 108
          L150 56
          C150 40, 138 32, 122 32
          L58 32
          C46 32, 40 40, 40 52
          L40 76
          C40 82, 44 85, 50 85
          L64 85
          C68 85, 72 89, 72 94
          L72 108
          Z
        "
        fill="url(#machineBodyStudio)"
        stroke="#3A4456"
        strokeWidth="1.2"
      />

      {/* Gold Atelier Filigree Pinstriping */}
      <path
        d="
          M144 104
          L144 58
          C144 46, 134 38, 120 38
          L62 38
          C52 38, 46 44, 46 54
          L46 72
        "
        stroke="url(#goldAccentStudio)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="60 3 8 3"
        fill="none"
      />

      {/* ── Handwheel / Balance Wheel (Right) ── */}
      <g transform="translate(150, 42)">
        <ellipse cx="6" cy="22" rx="7" ry="26" fill="#1F2633" stroke="url(#goldAccentStudio)" strokeWidth="1.2" />
        <ellipse cx="6" cy="22" rx="3.5" ry="16" fill="#131720" stroke="#4B5563" strokeWidth="0.8" />
        <line x1="6" y1="10" x2="6" y2="34" stroke="url(#goldAccentStudio)" strokeWidth="1" />
        <circle cx="6" cy="22" r="3.2" fill="url(#steelChromeStudio)" stroke="#78350F" strokeWidth="0.6" />
      </g>

      {/* ── Spool Pins & Twin Thread Spools (Top) ── */}
      <rect x="118" y="16" width="3" height="16" fill="url(#steelChromeStudio)" rx="1" />
      <rect x="114" y="20" width="11" height="12" rx="1.5" fill="#9E593B" stroke="#C48B6F" strokeWidth="0.6" />
      <ellipse cx="119.5" cy="20" rx="5.5" ry="1.8" fill="#F3D5C3" />
      <rect x="134" y="18" width="3" height="14" fill="url(#steelChromeStudio)" rx="1" />
      <rect x="130" y="22" width="11" height="10" rx="1.5" fill="#D97706" stroke="#FBBF24" strokeWidth="0.6" />
      <ellipse cx="135.5" cy="22" rx="5.5" ry="1.6" fill="#FEF3C7" />

      {/* ── Thread Take-Up Lever & Tension Assembly ── */}
      <path d="M116 20 C100 16, 75 18, 54 28" stroke="#FCD34D" strokeWidth="0.9" strokeDasharray="3 2" fill="none" strokeOpacity="0.8" />
      <path d="M54 36 L48 24" stroke="url(#steelChromeStudio)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="48" cy="24" r="1.6" fill="#F59E0B" />
      <circle cx="56" cy="56" r="6" fill="#1E2532" stroke="url(#goldAccentStudio)" strokeWidth="1.2" />
      <circle cx="56" cy="56" r="2.5" fill="url(#steelChromeStudio)" />

      {/* ── Needle Bar & Presser Foot Mechanism ── */}
      <rect x="47" y="52" width="3.5" height="42" rx="1.5" fill="url(#steelChromeStudio)" />
      <rect x="45.5" y="86" width="6.5" height="4.5" rx="1" fill="#475569" stroke="#94A3B8" strokeWidth="0.5" />
      <circle cx="51" cy="88.2" r="1" fill="#F59E0B" />
      <line x1="48.8" y1="90" x2="48.8" y2="108" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="54" y="60" width="3" height="40" rx="1" fill="url(#steelChromeStudio)" />
      <path d="M52 100 L58 100 L62 106 L50 106 Z" fill="url(#steelChromeStudio)" stroke="#64748B" strokeWidth="0.6" />

      {/* Active Thread running through Needle */}
      <path d="M48 24 L48 88 L48.8 106" stroke="#FCD34D" strokeWidth="0.9" fill="none" />

      {/* ── Fabric Moving Under Foot ── */}
      <path d="M26 107 C36 103, 46 104, 68 105 L96 105 C108 105, 118 106, 126 107.5 L124 112 H26 Z" fill="#9E593B" stroke="#B87150" strokeWidth="0.8" />
      <line x1="28" y1="105.5" x2="66" y2="105.5" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2.5 2" strokeLinecap="round" />

      {/* ── Body Details: Stitch Dials & Badge ── */}
      <circle cx="106" cy="62" r="8" fill="#131822" stroke="url(#goldAccentStudio)" strokeWidth="1" />
      <circle cx="106" cy="62" r="5" fill="#1E2532" />
      <line x1="106" y1="57" x2="106" y2="60" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="98" y="78" width="16" height="3" rx="1.5" fill="url(#steelChromeStudio)" />
      <rect x="80" y="44" width="18" height="8" rx="2" fill="#131822" stroke="url(#goldAccentStudio)" strokeWidth="0.8" />
      <text x="89" y="50" fontSize="5" fontWeight="bold" fill="#FCD34D" textAnchor="middle" letterSpacing="0.5">DARZI</text>

      {/* Atelier atmosphere sparkles */}
      <text x="30" y="42" fontSize="12" fill="#FCD34D" fillOpacity="0.85">✦</text>
      <text x="165" y="32" fontSize="8" fill="#FFFFFF" fillOpacity="0.5">✦</text>
      <text x="168" y="104" fontSize="10" fill="#FCD34D" fillOpacity="0.75">✦</text>
      <text x="25" y="85" fontSize="7" fill="#FCD34D" fillOpacity="0.6">✦</text>
    </svg>
  )
}
