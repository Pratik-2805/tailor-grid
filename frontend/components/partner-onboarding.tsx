'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Scissors,
  Sparkles,
  Store,
} from 'lucide-react'
import type { User } from '@/components/data'
import {
  signUpUser,
  loginUser,
  loginWithGoogle,
  sendOtp,
  verifyOtp,
  checkEmailExists,
} from '@/lib/api'

const CUSTOMER_SITE_URL = '/'

interface PartnerOnboardingProps {
  user?: User | null
  onComplete?: (user: User) => void
  onSignOut?: () => void
  initialTab?: 'signin' | 'signup'
  hideHeader?: boolean
}

type Step = 'auth' | 'location' | 'language' | 'shop-info' | 'hub'

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

const LANGUAGES = [
  'English',
  'हिंदी (Hindi)',
  'বাংলা (Bengali)',
  'ಕನ್ನಡ (Kannada)',
  'मराठी (Marathi)',
  'தமிழ் (Tamil)',
  'తెలుగు (Telugu)',
]

export function PartnerOnboarding({
  user,
  onComplete,
  onSignOut,
  initialTab = 'signup',
  hideHeader = false,
}: PartnerOnboardingProps) {
  // Check if we have cached pending Google data from session
  const [pendingGoogle, setPendingGoogle] = useState<{
    tempSignupId?: string
    email?: string
    name?: string
    avatar?: string
  } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('tg_pending_google')
        return stored ? JSON.parse(stored) : null
      } catch {}
    }
    return null
  })

  // Auth Card State: single card with options, mobile, or email subviews
  const [signInMode, setSignInMode] = useState<'options' | 'mobile' | 'email'>('options')
  const [authLoading, setAuthLoading] = useState(false)

  // Sign In with Mobile fields
  const [sPhoneLogin, setSPhoneLogin] = useState('')
  const [sOtpSent, setSOtpSent] = useState(false)
  const [sOtp, setSOtp] = useState('')

  // Sign In with Email field
  const [sLoginEmail, setSLoginEmail] = useState('')

  // Multi-step Flow State
  const initialStep: Step = user?.email || pendingGoogle?.email ? 'location' : 'auth'
  const [currentStep, setCurrentStep] = useState<Step>(initialStep)

  // Step 1: Location & Referral (Image 2 - Earn with Darzi)
  const [locationCity, setLocationCity] = useState(user?.postcode ? `Area ${user.postcode}` : '')
  const [referralCode, setReferralCode] = useState('')

  // Step 2: Language & Capacity
  const [language, setLanguage] = useState('English')
  const [machines, setMachines] = useState('4-6')
  const [dailyCapacity, setDailyCapacity] = useState('25')

  // Step 3: Shop Info
  const [shopName, setShopName] = useState(user?.studioName || '')
  const [shopArea, setShopArea] = useState('')
  const [postcode, setPostcode] = useState(user?.postcode || '')
  const [streetAddress, setStreetAddress] = useState(user?.address || '')
  const [tailorName, setTailorName] = useState(
    user?.name && user.name !== 'Master Tailor' && user.name !== 'Google User'
      ? user.name
      : pendingGoogle?.name && pendingGoogle.name !== 'Google User'
        ? pendingGoogle.name
        : ''
  )
  const [phone, setPhone] = useState(user?.phone || '')
  const [emailVal, setEmailVal] = useState(
    user?.email || pendingGoogle?.email || ''
  )

  // Submission & Error
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [alreadyRegisteredUser, setAlreadyRegisteredUser] = useState<User | null>(null)
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)

  useEffect(() => {
    if (pendingGoogle?.email && !emailVal) {
      setEmailVal(pendingGoogle.email)
    }
    if (user?.email && !emailVal) {
      setEmailVal(user.email)
    }
    if (pendingGoogle?.name && !tailorName) {
      setTailorName(pendingGoogle.name)
    }
  }, [pendingGoogle, user])

  useEffect(() => {
    if (user?.email) {
      checkEmailExists(user.email, 'STUDIO').then((res) => {
        if (res.exists) {
          setAlreadyRegistered(true)
          if (res.user) {
            setAlreadyRegisteredUser(res.user)
          }
        }
      })
    }
  }, [user?.email])

  // Google OAuth trigger
  const triggerGoogleAuth = async () => {
    setAuthLoading(true)
    setError('')
    setNotice('')

    const loadGsi = (): Promise<void> =>
      new Promise((resolve) => {
        if ((window as any).google?.accounts?.oauth2) return resolve()
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true
        s.onload = () => resolve()
        document.head.appendChild(s)
      })

    try {
      await loadGsi()
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (!tokenResponse?.access_token) {
            setAuthLoading(false)
            setError('Google sign-in was cancelled.')
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
                name: profile.name || 'Google User',
                contact: profile.email,
                email: profile.email,
                avatar: profile.picture,
                method: 'google',
                role: 'STUDIO',
              },
            })

            setAuthLoading(false)

            // If existing registered studio user in Prisma -> sign in directly
            if (!result.isNewUser && result.user) {
              if (result.user.role && result.user.role !== 'STUDIO') {
                setError('This Google account is registered as a Customer. Please use a Studio partner account.')
                return
              }
              if (typeof window !== 'undefined') {
                localStorage.setItem('tg_user', JSON.stringify(result.user))
                localStorage.setItem('tg_user_role', 'STUDIO')
                if (result.token) localStorage.setItem('tg_token', result.token)
                window.location.href = '/'
                return
              }
              return
            }

            // Not in Prisma yet -> advance directly to registration form with prefilled Google details!
            const pending = {
              tempSignupId: result.tempSignupId,
              email: profile.email,
              name: profile.name || 'Master Tailor',
              avatar: profile.picture,
            }
            setPendingGoogle(pending)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('tg_pending_google', JSON.stringify(pending))
            }

            if (profile.email) setEmailVal(profile.email)
            if (profile.name && profile.name !== 'Google User') {
              setTailorName(profile.name)
              if (!shopName) setShopName(`${profile.name}'s Atelier`)
            }

            setCurrentStep('location')
          } catch (err: any) {
            setAuthLoading(false)
            setError(err.message || 'Google sign-in failed.')
          }
        },
      })
      tokenClient.requestAccessToken()
    } catch (err: any) {
      setAuthLoading(false)
      setError(err.message || 'Google sign-in initialization failed.')
    }
  }

  // Handle Mobile Sign In: Send OTP
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sPhoneLogin.trim().length < 6) {
      setError('Please enter a valid phone number.')
      return
    }
    setAuthLoading(true)
    setError('')
    try {
      const res = await sendOtp(sPhoneLogin.trim())
      setAuthLoading(false)
      setSOtpSent(true)
      const code = res.demoCode || '4829'
      setNotice(`Verification code sent! Test code: ${code}`)
    } catch (err: any) {
      setAuthLoading(false)
      setError(err.message || 'Failed to send verification code.')
    }
  }

  // Handle Mobile: Verify OTP (Log in if in Prisma, or open form if not)
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sOtp || sOtp.length < 4) {
      setError('Please enter 4-digit code.')
      return
    }
    setAuthLoading(true)
    setError('')
    try {
      const res = await verifyOtp({
        phone: sPhoneLogin.trim(),
        otp: sOtp.trim(),
        role: 'STUDIO',
      })
      setAuthLoading(false)
      if (res?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tg_user', JSON.stringify(res.user))
          localStorage.setItem('tg_user_role', 'STUDIO')
          if (res.token) localStorage.setItem('tg_token', res.token)
          window.location.href = '/'
        }
      }
    } catch (err: any) {
      setAuthLoading(false)
      // If code was verified but partner is not in Prisma yet, advance to registration form!
      if (err.message?.includes('Unauthorized') || err.message?.includes('not found') || err.message?.includes('access denied')) {
        setPhone(sPhoneLogin.trim())
        setCurrentStep('location')
        return
      }
      setError(err.message || 'Verification failed. Please check the code.')
    }
  }

  // Handle Email: Check Prisma & Log in, or open form if not registered
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = sLoginEmail.trim()
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }
    setAuthLoading(true)
    setError('')
    try {
      const check = await checkEmailExists(cleanEmail, 'STUDIO')
      if (check.exists && check.user) {
        const res = await loginUser({ identifier: cleanEmail, role: 'STUDIO' })
        setAuthLoading(false)
        if (res?.user) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('tg_user', JSON.stringify(res.user))
            localStorage.setItem('tg_user_role', 'STUDIO')
            if (res.token) localStorage.setItem('tg_token', res.token)
            window.location.href = '/'
          }
        }
      } else {
        // Not in Prisma yet -> open registration form with email prefilled
        setAuthLoading(false)
        setEmailVal(cleanEmail)
        setCurrentStep('location')
      }
    } catch (err: any) {
      setAuthLoading(false)
      if (err.message?.includes('not found') || err.message?.includes('Invalid') || err.message?.includes('Unauthorized')) {
        setEmailVal(cleanEmail)
        setCurrentStep('location')
        return
      }
      setError(err.message || 'Login failed. Please check your credentials.')
    }
  }

  // Demo Sandbox Access
  const handleDemoAccess = () => {
    const demoUser: User = {
      id: 'usr_demo_studio',
      name: 'Marco Rossi',
      contact: '+44 7700 900123',
      email: 'marco@ateliersoho.com',
      phone: '+44 7700 900123',
      method: 'email',
      role: 'STUDIO',
      studioId: 'atelier-soho',
      studioName: 'Atelier SoHo London',
      postcode: 'W8 4EP',
      address: '18 Kensington Church St',
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user', JSON.stringify(demoUser))
      localStorage.setItem('tg_user_role', 'STUDIO')
      window.location.href = '/'
    }
  }

  // Final submit at step 4 (Hub)
  const handleFinishOnboarding = async () => {
    setSubmitting(true)
    setError('')
    try {
      const emailToSubmit = emailVal.trim() || user?.email || pendingGoogle?.email
      const resolvedTempId =
        pendingGoogle?.tempSignupId ||
        (user?.id && String(user.id).startsWith('temp_g_') ? user.id : undefined)

      const res = await signUpUser({
        tempSignupId: resolvedTempId,
        name: tailorName.trim() || user?.name || pendingGoogle?.name || 'Master Tailor',
        email: emailToSubmit || undefined,
        phone: phone.trim() || user?.phone || undefined,
        address: streetAddress.trim(),
        postcode: postcode.trim(),
        role: 'STUDIO',
        storeName: shopName.trim(),
        storeArea: shopArea.trim(),
        machines,
      })

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('tg_pending_google')
      }

      const finalUser: User = res?.user || {
        id: user?.id || `usr_${Date.now()}`,
        name: tailorName.trim(),
        contact: phone.trim() || emailToSubmit || 'partner@darzi.com',
        email: emailToSubmit || 'partner@darzi.com',
        phone: phone.trim(),
        method: 'email',
        role: 'STUDIO',
        studioId: 'atelier-soho',
        studioName: shopName.trim(),
        postcode: postcode.trim(),
        address: streetAddress.trim(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('tg_user', JSON.stringify(finalUser))
        localStorage.setItem('tg_user_role', 'STUDIO')
        window.location.href = '/'
        return
      }

      if (onComplete) {
        onComplete(finalUser)
      }
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to complete shop registration.')
    } finally {
      setSubmitting(false)
    }
  }

  const stepsList: Step[] = ['auth', 'location', 'language', 'shop-info', 'hub']
  const currentStepNum = stepsList.indexOf(currentStep)

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F1115] flex flex-col font-sans">
      {/* Top Navbar */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStepNum > 0 && currentStep !== 'hub' && (
              <button
                onClick={() => {
                  setError('')
                  setNotice('')
                  setCurrentStep(stepsList[currentStepNum - 1])
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F1115] text-white flex items-center justify-center font-bold text-lg tracking-wider">
                D
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#0F1115]">
                Darzi <span className="text-xs font-semibold uppercase tracking-widest text-[#9E593B] ml-1">Studio Workbench</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={CUSTOMER_SITE_URL}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E1D5] bg-white text-xs font-medium text-gray-700 hover:bg-[#FAF8F5] transition-colors"
            >
              <span>← Customer Site</span>
            </a>

            <div className="relative">
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className="flex items-center gap-1.5 rounded-full bg-[#FAF8F5] hover:bg-gray-100 border border-[#E8E1D5] px-3.5 py-1.5 text-xs font-bold text-[#0F1115] transition-colors cursor-pointer"
              >
                <span>Help</span>
                <span className="text-[10px]">▼</span>
              </button>

              {showHelpDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-xl py-2 z-50 text-xs text-gray-800">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-[#0F1115]">{user?.name || 'Partner Account'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email || 'partner@darzi.com'}</p>
                  </div>
                  <a
                    href="mailto:support@darzi.com"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    Contact Support
                  </a>
                  <button
                    onClick={() => {
                      if (onSignOut) onSignOut()
                      window.location.href = '/'
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[560px]">
          {alreadyRegistered && (
            <div className="mb-6 rounded-2xl bg-[#FFF7F2] border border-[#E8D0C5] p-5 shadow-xs text-left">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-[#9E593B]/10 text-[#9E593B] flex items-center justify-center shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F1115] text-sm">
                    Studio Account Active
                  </h3>
                  <p className="text-xs text-[#5A5D64] mt-0.5 leading-relaxed">
                    An atelier account for <strong className="text-[#0F1115]">{alreadyRegisteredUser?.email || user?.email}</strong> is registered. You can enter your Studio Workbench directly.
                  </p>
                  <a
                    href="/"
                    className="inline-block mt-3 px-4 py-1.5 rounded-full bg-[#0F1115] text-white text-xs font-bold hover:bg-[#9E593B] transition-colors"
                  >
                    Open Studio Workbench →
                  </a>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {notice && !error && (
            <div className="mb-6 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] p-3 text-xs text-[#9E593B] font-medium">
              {notice}
            </div>
          )}

          {/* ================================================================ */}
          {/* ================================================================ */}
          {/* THIS CARD ONLY: UNIFIED STUDIO ONBOARDING & SIGN IN CARD         */}
          {/* Header has Port 3001 and Sign In | Sign Up toggle like customer side */}
          {/* Sign In: options as it is                                        */}
          {/* Sign Up: opens and keeps "Earn with Darzi" form (Image 2)        */}
          {/* ================================================================ */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Card Header with Port Badge (NO Sign In / Sign Up toggle) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                {currentStep !== 'auth' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setNotice('')
                      if (currentStep === 'hub') setCurrentStep('shop-info')
                      else if (currentStep === 'shop-info') setCurrentStep('language')
                      else if (currentStep === 'language') setCurrentStep('location')
                      else if (currentStep === 'location') {
                        setSignInMode('options')
                        setCurrentStep('auth')
                      }
                    }}
                    className="size-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                    title="Back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <div className="size-9 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#9E593B]">
                    <Scissors size={18} />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#9E593B] block leading-tight">
                    Studio Portal
                  </span>
                  <span className="text-xs font-bold text-[#0F1115] block">
                    Workbench Node
                  </span>
                </div>
              </div>

              {currentStep !== 'auth' && (
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Step {currentStepNum} of 4
                </span>
              )}
            </div>

            {/* ── 1. UNIFIED AUTH CARD (Single Card: Google, Mobile, Email, Sandbox) ── */}
            {currentStep === 'auth' && (
              <div className="space-y-5">
                {/* Submode: Email Login */}
                {signInMode === 'email' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSignInMode('options')}
                        className="size-7 rounded-lg bg-gray-100 hover:bg-gray-200 grid place-items-center text-gray-700 cursor-pointer text-xs"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#9E593B]">Partner Email</p>
                        <h2 className="font-serif text-2xl font-bold text-[#0F1115]">Access Atelier</h2>
                      </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-3.5 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Partner Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={sLoginEmail}
                          onChange={(e) => setSLoginEmail(e.target.value)}
                          placeholder="marco@ateliersoho.com"
                          className="w-full rounded-xl bg-gray-100 border-none px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full rounded-xl bg-[#0F1115] hover:bg-black py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        {authLoading ? 'Verifying…' : 'Continue'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Submode: Mobile SMS OTP */}
                {signInMode === 'mobile' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSignInMode('options')}
                        className="size-7 rounded-lg bg-gray-100 hover:bg-gray-200 grid place-items-center text-gray-700 cursor-pointer text-xs"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#9E593B]">SMS Authentication</p>
                        <h2 className="font-serif text-2xl font-bold text-[#0F1115]">
                          {sOtpSent ? 'Enter Partner Code' : 'Partner Mobile Number'}
                        </h2>
                      </div>
                    </div>

                    {!sOtpSent ? (
                      <form onSubmit={handleSendMobileOtp} className="space-y-3.5 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Mobile Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            autoFocus
                            value={sPhoneLogin}
                            onChange={(e) => setSPhoneLogin(e.target.value)}
                            placeholder="+44 7700 900123"
                            className="w-full rounded-xl bg-gray-100 border-none px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full rounded-xl bg-[#0F1115] hover:bg-black py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {authLoading ? 'Sending code…' : 'Send Partner Code'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyMobileOtp} className="space-y-3.5 pt-1">
                        <input
                          type="text"
                          maxLength={4}
                          required
                          autoFocus
                          value={sOtp}
                          onChange={(e) => setSOtp(e.target.value)}
                          placeholder="4829"
                          className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-gray-300 py-3 focus:border-[#9E593B] focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full rounded-xl bg-[#0F1115] hover:bg-black py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {authLoading ? 'Verifying…' : 'Verify & Continue'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Submode: Options Menu (Single unified card) */}
                {signInMode === 'options' && (
                  <>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B] block mb-1">
                        Partner Portal
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#0F1115] tracking-tight">
                        Studio Workbench Access
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Access live alteration intake, 48h timers, and atelier operations.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* 1. Google Button */}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={triggerGoogleAuth}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#0F1115] bg-white hover:bg-gray-50 py-3.5 px-4 text-sm font-bold text-[#0F1115] shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>{authLoading ? 'Connecting Google…' : 'Continue with Google'}</span>
                      </button>

                      {/* 2. Mobile Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setError('')
                          setNotice('')
                          setSignInMode('mobile')
                        }}
                        className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-3.5 px-4 text-sm font-semibold text-[#0F1115] transition-all cursor-pointer"
                      >
                        <Phone size={16} className="text-[#9E593B]" />
                        <span>Continue with Mobile Number</span>
                      </button>

                      {/* 3. Email Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setError('')
                          setNotice('')
                          setSignInMode('email')
                        }}
                        className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-3.5 px-4 text-sm font-semibold text-[#0F1115] transition-all cursor-pointer"
                      >
                        <Mail size={16} className="text-[#9E593B]" />
                        <span>Continue with Email</span>
                      </button>

                      {/* 4. Demo Sandbox Button */}
                      <button
                        type="button"
                        onClick={handleDemoAccess}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#F5EBE6] hover:bg-[#EBDDD5] border border-[#DFC9BD] py-3.5 px-4 text-xs font-bold text-[#8C4A2D] transition-all cursor-pointer"
                      >
                        <Sparkles size={15} />
                        <span>Launch Demo Workbench Sandbox</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── 2. ONBOARDING FORM (Opens when user is not yet registered in Prisma) ── */}
            {currentStep !== 'auth' && (
              <div className="space-y-6">
                {/* Step 1: Image 2 — "Earn with Darzi" */}
                {currentStep === 'location' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-10 rounded-xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center font-bold">
                        <Store size={22} />
                      </div>
                      {(pendingGoogle?.email || emailVal || phone) && (
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full truncate max-w-[220px]">
                          {pendingGoogle?.email || emailVal || phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                        Earn with Darzi
                      </h1>
                      <p className="text-sm text-gray-600 mt-1.5">
                        Decide when, where and how you want to earn.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Where would you like to earn? *
                        </label>
                        <input
                          type="text"
                          value={locationCity}
                          onChange={(e) => setLocationCity(e.target.value)}
                          placeholder="e.g. Mumbai, London W8, Delhi..."
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Referral code (optional)
                        </label>
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          placeholder="Enter referral code"
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                      By proceeding, I agree that Darzi or its representatives may contact me by email, phone, or text message using the email address or number I provide.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (!locationCity.trim()) {
                          setError('Please specify your city or workshop location.')
                          return
                        }
                        setError('')
                        setCurrentStep('language')
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-4 cursor-pointer"
                    >
                      <span>Continue to Atelier Setup →</span>
                    </button>
                  </div>
                )}

                {/* Step 2: Language & Capacity */}
                {currentStep === 'language' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115]">
                        Select your language & workshop capacity
                      </h1>
                      <p className="text-xs text-gray-500 mt-1.5">
                        You can change your language on this screen or at any time in Help.
                      </p>
                    </div>

                    <div className="space-y-5 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all cursor-pointer"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Sewing Machines
                          </label>
                          <select
                            value={machines}
                            onChange={(e) => setMachines(e.target.value)}
                            className="w-full rounded-lg bg-gray-100 border-none px-3.5 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all cursor-pointer"
                          >
                            <option value="2-3">2–3 machines</option>
                            <option value="4-6">4–6 machines</option>
                            <option value="8+">8+ machines</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Daily Order Limit
                          </label>
                          <select
                            value={dailyCapacity}
                            onChange={(e) => setDailyCapacity(e.target.value)}
                            className="w-full rounded-lg bg-gray-100 border-none px-3.5 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all cursor-pointer"
                          >
                            <option value="15">15 orders / day</option>
                            <option value="25">25 orders / day</option>
                            <option value="50">50 orders / day</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep('shop-info')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* Step 3: Shop Information */}
                {currentStep === 'shop-info' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9E593B]">
                        Studio Location & Contact
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115] mt-1">
                        Fill Your Shop&apos;s Information
                      </h1>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your atelier address so customers can drop off garments and book fittings.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Atelier / Shop Name *
                        </label>
                        <input
                          type="text"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Atelier SoHo Tailors"
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Area / Neighborhood *
                          </label>
                          <input
                            type="text"
                            value={shopArea}
                            onChange={(e) => setShopArea(e.target.value)}
                            placeholder="e.g. SoHo or Bandra"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Postcode / PIN *
                          </label>
                          <input
                            type="text"
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                            placeholder="e.g. W8 4EP"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="e.g. 18 Kensington Church St"
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Lead Master Tailor *
                          </label>
                          <input
                            type="text"
                            value={tailorName}
                            onChange={(e) => setTailorName(e.target.value)}
                            placeholder="e.g. Marco Rossi"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Direct Mobile Phone *
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. +44 7700 900123"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Partner Contact Email *
                        </label>
                        <input
                          type="email"
                          value={emailVal}
                          onChange={(e) => setEmailVal(e.target.value)}
                          placeholder="e.g. marco@ateliersoho.com"
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!shopName.trim() || !shopArea.trim() || !postcode.trim() || !tailorName.trim() || !phone.trim() || !emailVal.trim()) {
                          setError('Please fill in Shop Name, Area, Postcode, Lead Tailor, Phone, and Email.')
                          return
                        }
                        setError('')
                        setCurrentStep('hub')
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6 cursor-pointer"
                    >
                      <span>Save & Continue</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* Step 4: Hub */}
                {currentStep === 'hub' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                      <span>Signing up for</span>
                      <span className="font-bold text-[#0F1115]">{locationCity || 'Darzi Grid'}</span>
                      <span>✂️</span>
                    </div>

                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                        Welcome, {tailorName || user?.name || 'Master Tailor'}
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete 3 steps to start earning.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                        <div className="h-full bg-emerald-500 w-full transition-all duration-500" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600">
                        <span>100% Completed</span>
                        <span>Ready to Launch</span>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100 border-t border-b border-gray-100 my-4">
                      <div className="py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Studio Location & Shop Details</p>
                          <p className="text-xs text-gray-500">{shopName} · {shopArea} ({postcode})</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Language & Daily Capacity</p>
                          <p className="text-xs text-gray-500">{language} · {machines} Machines ({dailyCapacity}/day limit)</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Lead Tailor Contact & Phone</p>
                          <p className="text-xs text-gray-500">{tailorName} · {phone}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleFinishOnboarding}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-lg active:scale-[0.99] transition-all mt-6 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>Activating Atelier Studio…</span>
                      ) : (
                        <>
                          <span>Access Studio Workbench</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
