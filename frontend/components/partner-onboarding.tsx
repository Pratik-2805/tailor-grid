'use client'

import { useState, useEffect } from 'react'
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
import type { User } from '@/components/data'
import { signUpUser, loginWithGoogle, checkEmailExists } from '@/lib/api'

const CUSTOMER_SITE_URL = '/'

interface PartnerOnboardingProps {
  user?: User | null
  onComplete?: (user: User) => void
  onSignOut?: () => void
}

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
      } catch { }
    }
    return null
  })

  const [authLoading, setAuthLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [alreadyRegisteredUser, setAlreadyRegisteredUser] = useState<User | null>(null)

  // Registration Form Fields
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
  const [language, setLanguage] = useState('English')
  const [machines, setMachines] = useState('4-6')
  const [dailyCapacity, setDailyCapacity] = useState('25')

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

  // Google OAuth quick auto-fill
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
              isSignup: true,
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

            // If existing registered studio user
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

            // New Studio User: autofill form fields
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F1115] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <a
            href="/?auth=signin"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#0F1115] text-xs font-bold text-[#0F1115] transition-colors cursor-pointer"
          >
            <span>Sign In</span>
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

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[620px]">
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

          {/* ── ENROLL STUDIO REGISTRATION FORM PROPER ── */}
          <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Card Top Branding */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F3EFEA]">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#9E593B]">
                  <Scissors size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#9E593B] block leading-tight">
                    Partner Atelier Enrollment
                  </span>
                  <span className="text-xs font-bold text-[#0F1115] block">
                    Workbench Node · Port 3001
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#6B7280]">Registered atelier?</span>
                <a
                  href="/?auth=signin"
                  className="font-bold text-[#9E593B] hover:underline"
                >
                  Sign In →
                </a>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B] block mb-1">
                Studio Sign Up
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#0F1115] tracking-tight">
                Register Partner Atelier
              </h1>
              <p className="text-xs text-[#6B7280] mt-1">
                Join Darzi&apos;s network of certified master tailors to receive alteration jobs, 48h timers, and guaranteed weekly payouts.
              </p>
            </div>

            {/* Quick Fill with Google */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={authLoading}
                onClick={triggerGoogleAuth}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#D5CDC2] hover:border-[#0F1115] bg-white hover:bg-[#FAF8F5] py-3.5 px-4 text-xs font-bold text-[#0F1115] shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>
                  {authLoading ? 'Connecting Google…' : pendingGoogle?.email ? `Google Connected (${pendingGoogle.email})` : 'Quick Autofill with Google'}
                </span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E1D5]" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-[#8C9199] uppercase tracking-wider">
                  Or enter workshop details
                </span>
              </div>
            </div>

            {/* The Registration Form Proper */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!shopName.trim() || !shopArea.trim() || !postcode.trim() || !tailorName.trim() || !phone.trim() || !emailVal.trim()) {
                  setError('Please fill in Shop Name, Area, Postcode, Lead Tailor, Phone, and Email.')
                  return
                }
                handleFinishOnboarding()
              }}
              className="space-y-5"
            >
              {/* Section 1: Studio Location & Identity */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E593B]">
                  <Store size={14} />
                  <span>1. Studio Location & Identity</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Atelier / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Atelier SoHo Tailors"
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Area / Neighborhood *
                    </label>
                    <input
                      type="text"
                      required
                      value={shopArea}
                      onChange={(e) => setShopArea(e.target.value)}
                      placeholder="e.g. SoHo or Mayfair"
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Postcode / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="e.g. W8 4EP"
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Street Address (Drop-off & Fitting) *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. 18 Kensington Church St"
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Section 2: Master Tailor Contact */}
              <div className="space-y-3.5 pt-3 border-t border-[#F3EFEA]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E593B]">
                  <Scissors size={14} />
                  <span>2. Master Tailor & Contact</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Lead Master Tailor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tailorName}
                    onChange={(e) => setTailorName(e.target.value)}
                    placeholder="e.g. Marco Rossi"
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Partner Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={emailVal}
                      onChange={(e) => setEmailVal(e.target.value)}
                      placeholder="marco@ateliersoho.com"
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Direct Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900123"
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Capacity & Machines */}
              <div className="space-y-3.5 pt-3 border-t border-[#F3EFEA]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E593B]">
                  <CheckCircle2 size={14} />
                  <span>3. Machinery & Capacity</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Sewing Machines
                    </label>
                    <select
                      value={machines}
                      onChange={(e) => setMachines(e.target.value)}
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-3.5 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all cursor-pointer"
                    >
                      <option value="2-3">2–3 machines</option>
                      <option value="4-6">4–6 machines</option>
                      <option value="8+">8+ machines</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1">
                      Daily Order Limit
                    </label>
                    <select
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(e.target.value)}
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-3.5 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all cursor-pointer"
                    >
                      <option value="15">15 orders / day</option>
                      <option value="25">25 orders / day</option>
                      <option value="50">50 orders / day</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Primary Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-4 py-3 text-sm font-medium text-[#0F1115] focus:bg-white focus:border-[#9E593B] outline-none transition-all cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0F1115] hover:bg-[#9E593B] py-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Registering Atelier…</span>
                  ) : (
                    <>
                      <span>Register Atelier & Enter Workbench</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const demoUser = {
                      id: 'usr_demo_studio',
                      name: 'Marco Rossi',
                      email: 'marco@ateliersoho.com',
                      phone: '+44 7700 900123',
                      role: 'STUDIO' as const,
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
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#9E593B]/10 hover:bg-[#9E593B]/20 border border-[#9E593B]/30 py-3 text-xs font-bold text-[#9E593B] transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Launch Demo Workbench Sandbox</span>
                </button>
              </div>
            </form>

            <div className="pt-2 text-center border-t border-[#F3EFEA]">
              <span className="text-xs text-[#6B7280]">Already have a registered studio? </span>
              <a
                href="/?auth=signin"
                className="text-xs text-[#9E593B] font-bold hover:underline ml-1"
              >
                Sign in to Studio →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
