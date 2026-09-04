'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  Scissors,
  Sparkles,
  Store,
} from 'lucide-react'
import { useEffect } from 'react'
import type { User } from '@/components/data'
import { signUpUser, loginWithGoogle, checkEmailExists } from '@/lib/api'

interface PartnerOnboardingProps {
  user?: User | null
  onComplete?: (user: User) => void
  onSignOut?: () => void
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

export function PartnerOnboarding({ user, onComplete, onSignOut }: PartnerOnboardingProps) {
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

  const [authTab, setAuthTab] = useState<'signin' | 'register'>('register')
  const [authLoading, setAuthLoading] = useState(false)

  const activeEmail = user?.email || pendingGoogle?.email
  const initialStep: Step = user?.email || pendingGoogle?.email ? 'location' : 'auth'
  const [currentStep, setCurrentStep] = useState<Step>(initialStep)
  
  // Step 1 fields
  const [locationCity, setLocationCity] = useState(user?.postcode ? `Area ${user.postcode}` : '')
  const [referralCode, setReferralCode] = useState('')

  // Step 2 fields
  const [language, setLanguage] = useState('English')
  const [machines, setMachines] = useState('4-6')
  const [dailyCapacity, setDailyCapacity] = useState('25')

  // Step 3 fields (Shop Info)
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

  // Submission & error
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [alreadyRegisteredUser, setAlreadyRegisteredUser] = useState<User | null>(null)
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)

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
              isSignup: authTab === 'register',
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

            // If existing user already registered in DB
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

            // New User: 5-minute cache stored on backend, defer DB saving until form completion
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

            if (profile.name && profile.name !== 'Google User') {
              setTailorName(profile.name)
              if (!shopName) setShopName(`${profile.name}'s Atelier`)
            }

            // Advance to Step 1 form
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

  // Step index helper
  const stepsList: Step[] = ['auth', 'location', 'language', 'shop-info', 'hub']
  const currentStepNum = stepsList.indexOf(currentStep)

  const handleFinishOnboarding = async () => {
    setSubmitting(true)
    setError('')
    try {
      const emailToSubmit = user?.email || pendingGoogle?.email
      const res = await signUpUser({
        tempSignupId: pendingGoogle?.tempSignupId,
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
        email: emailToSubmit || 'partner@darzi.com',
        phone: phone.trim(),
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

  return (
    <div className="min-h-screen bg-white text-[#0F1115] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentStepNum > 1 && currentStep !== 'hub' && (
            <button
              onClick={() => setCurrentStep(stepsList[currentStepNum - 2])}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
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

        <div className="relative">
          <button
            onClick={() => setShowHelpDropdown(!showHelpDropdown)}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 text-xs font-bold text-[#0F1115] transition-colors"
          >
            <span>Help</span>
            <span className="text-[10px]">▼</span>
          </button>

          {showHelpDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-xl py-2 z-50 text-xs text-gray-800">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-bold text-[#0F1115]">{user?.name || 'Partner Account'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'google.user@darzi.com'}</p>
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
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

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
                </div>
              </div>
            </div>
          )}

          {error && !alreadyRegistered && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* STEP 0: AUTH CARD (GOOGLE FIRST, NO DB CREATION UNTIL FORM COMPLETION) */}
          {currentStep === 'auth' && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#9E593B]">
                    <Scissors size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#9E593B] block leading-tight">
                      Studio Portal
                    </span>
                    <span className="text-xs font-bold text-[#0F1115] block">
                      Workbench Node · Port 3001
                    </span>
                  </div>
                </div>

                <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAuthTab('signin')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      authTab === 'signin' ? 'bg-white shadow-xs text-[#0F1115]' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      authTab === 'register' ? 'bg-white shadow-xs text-[#0F1115]' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B] block mb-1">
                  Partner Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F1115] tracking-tight">
                  {authTab === 'register' ? 'Register Partner Atelier' : 'Sign in to Studio'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Access live alteration intake, 48h timers, and weekly settlements.
                </p>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={triggerGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#0F1115] bg-white hover:bg-gray-50 py-3.5 px-4 text-sm font-bold text-[#0F1115] shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {authLoading
                      ? 'Connecting Google...'
                      : authTab === 'register'
                        ? 'Sign up with Google'
                        : 'Sign in with Google'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('location')
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-3.5 px-4 text-sm font-semibold text-[#0F1115] transition-all cursor-pointer"
                >
                  <Phone size={16} className="text-[#9E593B]" />
                  <span>
                    {authTab === 'register' ? 'Sign up with Mobile Number' : 'Sign in with Mobile Number'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('location')
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-3.5 px-4 text-sm font-semibold text-[#0F1115] transition-all cursor-pointer"
                >
                  <Mail size={16} className="text-[#9E593B]" />
                  <span>
                    {authTab === 'register' ? 'Sign up with Email' : 'Sign in with Email'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const demoUser = {
                      id: 'usr_demo_studio',
                      name: 'Marco Rossi',
                      email: 'marco@ateliersoho.com',
                      phone: '+44 7700 900123',
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
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#F5EBE6] hover:bg-[#EBDDD5] border border-[#DFC9BD] py-3.5 px-4 text-xs font-bold text-[#8C4A2D] transition-all cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>Launch Demo Workbench Sandbox</span>
                </button>
              </div>

              <div className="pt-2 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAuthTab(authTab === 'register' ? 'signin' : 'register')}
                  className="text-xs text-gray-600 hover:text-black font-semibold transition-colors cursor-pointer"
                >
                  {authTab === 'register' ? (
                    <>Already registered? <span className="font-bold text-[#9E593B] underline">Sign in →</span></>
                  ) : (
                    <>New workshop? <span className="font-bold text-[#9E593B] underline">Register Atelier →</span></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: LOCATION & REFERRAL */}
          {currentStep === 'location' && (
            <div className="space-y-6">
              <div className="w-12 h-10 rounded-xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center font-bold">
                <Store size={22} />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                  Earn with Darzi
                </h1>
                <p className="text-sm text-gray-600 mt-1.5">
                  Decide when, where and how you want to earn.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Where would you like to earn?
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

              <p className="text-[11px] text-gray-500 leading-relaxed pt-2">
                By proceeding, I agree that Darzi or its representatives may contact me by email, phone, or text message using the email address or number I provide.
              </p>

              <button
                onClick={() => {
                  if (alreadyRegistered) {
                    const activeUser = alreadyRegisteredUser || user
                    if (activeUser && typeof window !== 'undefined') {
                      localStorage.setItem('tg_user', JSON.stringify(activeUser))
                      localStorage.setItem('tg_user_role', 'STUDIO')
                    }
                    if (onComplete && activeUser) {
                      onComplete(activeUser)
                    } else if (typeof window !== 'undefined') {
                      window.location.href = '/'
                    }
                    return
                  }
                  if (!locationCity.trim()) {
                    setError('Please specify your city or workshop location.')
                    return
                  }
                  setError('')
                  setCurrentStep('language')
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6"
              >
                <span>{alreadyRegistered ? 'Go to Studio Workbench' : 'Join now'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: LANGUAGE & CAPACITY */}
          {currentStep === 'language' && (
            <div className="space-y-6">
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 3: SHOP INFO */}
          {currentStep === 'shop-info' && (
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9E593B]">
                  Studio Location & Contact
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115] mt-1">
                  Fill Your Shop's Information
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
              </div>

              <button
                onClick={() => {
                  if (!shopName.trim() || !shopArea.trim() || !postcode.trim()) {
                    setError('Please fill in Shop Name, Area, and Postcode.')
                    return
                  }
                  setError('')
                  setCurrentStep('hub')
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6"
              >
                <span>Save & Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 4: ONBOARDING HUB STATUS DASHBOARD */}
          {currentStep === 'hub' && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                <span>Signing up for</span>
                <span className="font-bold text-[#0F1115]">{locationCity}</span>
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-lg active:scale-[0.99] transition-all mt-6"
              >
                {submitting ? (
                  <span>Activating Atelier Studio...</span>
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
      </main>
    </div>
  )
}
