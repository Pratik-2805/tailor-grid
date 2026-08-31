'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Mail, Phone, Scissors, Sparkles, Store, X } from 'lucide-react'
import type { User as UserType } from './data'
import { loginUser, loginWithGoogle, signUpUser } from '@/lib/api'

// Customer: 'options' → 'email' | 'mobile'
// Studio login: 'studio-options' → 'studio-login' | 'studio-register'
// Studio signup: 'studio-signup-options' → 'studio-register'
type AuthMode =
  | 'customer-options'
  | 'customer-email'
  | 'customer-mobile'
  | 'studio-options'
  | 'studio-signup-options'
  | 'studio-login'
  | 'studio-register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserType) => void
  targetRole?: 'CUSTOMER' | 'STUDIO'
  authType?: 'signin' | 'signup'
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

export function AuthModal({ isOpen, onClose, onSuccess, targetRole = 'CUSTOMER', authType = 'signup' }: AuthModalProps) {
  // Determine starting mode from role + authType
  const initialMode = (): AuthMode => {
    if (targetRole === 'STUDIO') {
      // Log In → studio-options (sign-in screen)
      // Sign Up → studio-signup-options (sign-up screen, same style but different copy)
      return authType === 'signup' ? 'studio-signup-options' : 'studio-options'
    }
    // Customer always shows the options screen
    return 'customer-options'
  }
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Customer fields ───────────────────────────────────────────────────────
  const [cName, setCName] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cPostcode, setCPostcode] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cOtpSent, setCOtpSent] = useState(false)
  const [cOtp, setCOtp] = useState('')

  // ── Studio Login fields ───────────────────────────────────────────────────
  const [sLoginEmail, setSLoginEmail] = useState('')
  const [sLoginPass, setSLoginPass] = useState('')

  // ── Studio Register: Step 1 – Location ───────────────────────────────────
  const [sName, setSName] = useState('')
  const [sArea, setSArea] = useState('')
  const [sPostcode, setSPostcode] = useState('')
  const [sAddress, setSAddress] = useState('')

  // ── Studio Register: Step 2 – Contact ────────────────────────────────────
  const [sTailorName, setSTailorName] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sPhone, setSPhone] = useState('')

  // ── Studio Register: Step 3 – Operations ─────────────────────────────────
  const [sMachines, setSMachines] = useState('4-6')
  const [sCapacity, setSCapacity] = useState('25')
  const [sSpecialties, setSSpecialties] = useState<string[]>(['Suit Tailoring', 'Dress Hemming'])

  const SPECIALTIES = [
    'Suit Tailoring',
    'Dress Hemming',
    'Denim Chainstitch',
    'Silk & Gowns',
    'Leather & Outerwear',
    'Zip Replacements',
  ]

  // Reset on open / role / authType switch
  useEffect(() => {
    setMode(initialMode())
    setRegisterStep(1)
    setError('')
    setLoading(false)
  }, [isOpen, targetRole, authType])

  // ── Google OAuth token flow ───────────────────────────────────────────────
  const triggerGoogle = async (role: 'CUSTOMER' | 'STUDIO') => {
    setLoading(true)
    setError('')

    // Load GSI script if needed
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
            setLoading(false)
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
              role,
              profile: {
                name: profile.name || 'Google User',
                contact: profile.email,
                avatar: profile.picture,
                method: 'google',
                role,
                ...(role === 'STUDIO' && {
                  studioId: 'atelier-soho',
                  studioName: sName || 'Atelier SoHo Tailors',
                }),
              },
            })
            setLoading(false)
            if (result?.user) {
              // ── Role mismatch guard ───────────────────────────────────────
              // If this Google account was registered with a different role,
              // block the sign-in and show a clear error.
              const returnedRole = result.user.role
              if (returnedRole && returnedRole !== role) {
                setError(
                  returnedRole === 'STUDIO'
                    ? 'This Google account is registered as a Studio partner. Please sign in via the Studio portal, or use a different Google account.'
                    : 'This Google account is registered as a Customer. Please use a different Google account to set up your Studio.'
                )
                return
              }
              // ─────────────────────────────────────────────────────────────

              if (role === 'STUDIO' && !result.user.studioName) {
                // Google gave us the account — still need studio details
                setMode('studio-register')
                setSTailorName(result.user.name || '')
                setSEmail(result.user.email || result.user.contact || '')
              } else {
                onSuccess(result.user)
              }
            }
          } catch (err: any) {
            setLoading(false)
            setError(err.message || 'Google sign-in failed.')
          }
        },
      })
      tokenClient.requestAccessToken()
    } catch (err: any) {
      // Fallback demo user
      setLoading(false)
      const demo: UserType = {
        name: role === 'STUDIO' ? 'Marco Rossi (Demo)' : 'Google Member',
        contact: role === 'STUDIO' ? 'marco@ateliersoho.com' : 'demo@gmail.com',
        method: 'google',
        role,
        ...(role === 'STUDIO' && { studioId: 'atelier-soho', studioName: 'Atelier SoHo Tailors' }),
      }
      onSuccess(demo)
    }
  }

  // ── Customer email submit ─────────────────────────────────────────────────
  const handleCustomerEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signUpUser({
        name: cName || 'Darzi Member',
        email: cEmail,
        postcode: cPostcode,
        role: 'CUSTOMER',
      })
      setLoading(false)
      if (result?.user) onSuccess(result.user)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Sign in failed.')
    }
  }

  // ── Customer mobile (OTP) ─────────────────────────────────────────────────
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (cPhone.trim().length < 6) { setError('Enter a valid phone number.'); return }
    setCOtpSent(true)
    setError('')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signUpUser({ name: cName || 'Mobile Member', phone: cPhone, role: 'CUSTOMER' })
      setLoading(false)
      if (result?.user) onSuccess(result.user)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Verification failed.')
    }
  }

  // ── Studio login ──────────────────────────────────────────────────────────
  const handleStudioLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await loginUser({ email: sLoginEmail, role: 'STUDIO' })
      setLoading(false)
      if (result?.user) onSuccess(result.user)
    } catch (err: any) {
      setLoading(false)
      // Demo fallback so UI is testable without live backend
      const demo: UserType = {
        name: sTailorName || 'Marco Rossi (Master Tailor)',
        contact: sLoginEmail,
        method: 'email',
        role: 'STUDIO',
        studioId: 'atelier-soho',
        studioName: 'Atelier SoHo Tailors',
      }
      onSuccess(demo)
    }
  }

  // ── Studio registration final submit ─────────────────────────────────────
  const handleStudioRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signUpUser({
        name: sTailorName,
        email: sEmail,
        phone: sPhone,
        address: sAddress,
        postcode: sPostcode,
        role: 'STUDIO',
        storeName: sName,
        storeArea: sArea,
        machines: sMachines,
      })
      setLoading(false)
      if (result?.user) onSuccess(result.user)
    } catch (err: any) {
      setLoading(false)
      // Demo fallback
      const demo: UserType = {
        name: sTailorName || 'Master Tailor',
        contact: sEmail,
        method: 'email',
        role: 'STUDIO',
        studioId: 'new-studio',
        studioName: sName || 'New Atelier Studio',
      }
      onSuccess(demo)
    }
  }

  const toggleSpecialty = (s: string) =>
    setSSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const goBack = () => {
    if (mode === 'studio-register' && registerStep > 1) {
      setRegisterStep((p) => (p - 1) as 1 | 2 | 3)
    } else if (mode === 'studio-register') {
      // from register form, go back to sign-up options
      setMode('studio-signup-options')
      setRegisterStep(1)
    } else if (mode === 'studio-login') {
      setMode('studio-options')
    } else {
      setMode(targetRole === 'STUDIO' ? 'studio-options' : 'customer-options')
      setRegisterStep(1)
    }
    setError('')
  }

  if (!isOpen) return null

  // Show back button on all sub-screens except the two root options pages
  const isSubPage = mode !== 'customer-options' && mode !== 'studio-options' && mode !== 'studio-signup-options'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl border border-[#E5E7EB] max-h-[94vh] overflow-y-auto">

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            {isSubPage ? (
              <button onClick={goBack} className="size-7 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] grid place-items-center transition-colors">
                <ArrowLeft size={14} className="text-[#374151]" />
              </button>
            ) : (
              <div className="size-8 rounded-full bg-[#0F1115] grid place-items-center">
                {targetRole === 'STUDIO' ? <Store size={16} className="text-white" /> : <Scissors size={16} className="text-white" />}
              </div>
            )}
            <span className="font-serif font-bold text-[17px] text-[#0F1115] tracking-tight">Darzi</span>
          </div>
          <button onClick={onClose} className="size-7 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] grid place-items-center transition-colors">
            <X size={14} className="text-[#374151]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* ================================================================ */}
          {/* CUSTOMER – Sign Up / Sign In Options                             */}
          {/* ================================================================ */}
          {mode === 'customer-options' && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Customer Sign In</p>
                <h2 className="font-serif text-[26px] font-bold text-[#0F1115] mt-0.5 leading-tight">Sign up with Google</h2>
                <p className="text-[13px] text-[#6B7280] mt-1.5">Connect your Google account to fetch your name and email automatically.</p>
              </div>

              <div className="space-y-2.5">
                <GoogleButton label="Continue with Google" loading={loading} onClick={() => triggerGoogle('CUSTOMER')} bordered />
                <AuthButton icon={<Mail size={15} className="text-[#9E593B]" />} label="Continue with Email" onClick={() => setMode('customer-email')} />
                <AuthButton icon={<Phone size={15} className="text-[#9E593B]" />} label="Continue with Mobile" onClick={() => setMode('customer-mobile')} />
              </div>

              <Divider />
              <div className="text-center">
                <button onClick={() => { onSuccess({ name: 'Guest', contact: 'guest@tailorgrid.com', method: 'guest', role: 'CUSTOMER' }) }} className="text-[12px] text-[#9CA3AF] hover:text-[#374151] underline underline-offset-4 transition-colors">
                  Continue as guest
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* CUSTOMER – Email Form                                            */}
          {/* ================================================================ */}
          {mode === 'customer-email' && (
            <form onSubmit={handleCustomerEmail} className="space-y-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Email Sign In</p>
                <h2 className="font-serif text-2xl font-bold text-[#0F1115] mt-0.5">Continue with Email</h2>
              </div>

              <Field label="Your name" value={cName} onChange={setCName} placeholder="Sarah Jenkins" />
              <Field label="Email address" type="email" required value={cEmail} onChange={setCEmail} placeholder="name@example.com" />
              <Field label="Postcode (optional)" value={cPostcode} onChange={setCPostcode} placeholder="W8 4EP" />

              <SubmitBtn loading={loading} label="Continue" />
            </form>
          )}

          {/* ================================================================ */}
          {/* CUSTOMER – Mobile / OTP                                         */}
          {/* ================================================================ */}
          {mode === 'customer-mobile' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">SMS Sign In</p>
                <h2 className="font-serif text-2xl font-bold text-[#0F1115] mt-0.5">
                  {cOtpSent ? 'Enter Verification Code' : 'Enter Mobile Number'}
                </h2>
              </div>

              {!cOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <Field label="Your name" value={cName} onChange={setCName} placeholder="Sarah Jenkins" />
                  <Field label="Phone number" type="tel" required value={cPhone} onChange={setCPhone} placeholder="+44 7700 900077" />
                  <SubmitBtn loading={false} label="Send Code" />
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <p className="text-xs text-[#6B7280]">Code sent to {cPhone}. Enter any 4 digits to continue.</p>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={cOtp}
                    onChange={(e) => setCOtp(e.target.value)}
                    placeholder="4829"
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#D1D5DB] py-3 focus:border-[#9E593B] focus:outline-none"
                  />
                  <SubmitBtn loading={loading} label="Verify & Continue" />
                </form>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* STUDIO – Sign In / Register Options                              */}
          {/* ================================================================ */}
          {mode === 'studio-options' && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Certified Partner Portal</p>
                <h2 className="font-serif text-[26px] font-bold text-[#0F1115] mt-0.5 leading-tight">Sign in to Studio</h2>
                <p className="text-[13px] text-[#6B7280] mt-1.5">Access your live orders, capacity controls, and weekly payouts.</p>
              </div>

              <div className="space-y-2.5">
                {/* Google – Studio role */}
                <GoogleButton label="Sign in with Google (Studio)" loading={loading} onClick={() => triggerGoogle('STUDIO')} bordered />
                {/* Email login to existing studio */}
                <AuthButton icon={<Mail size={15} className="text-[#9E593B]" />} label="Sign in with Email" onClick={() => setMode('studio-login')} />
                {/* Register brand-new studio */}
                <button
                  onClick={() => setMode('studio-register')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors"
                >
                  <Store size={15} />
                  Register New Atelier Studio
                </button>
              </div>

              <Divider />
              <div className="text-center">
                <button
                  onClick={() => {
                    onSuccess({ name: 'Atelier SoHo (Demo)', contact: 'demo@ateliersoho.com', method: 'guest', role: 'STUDIO', studioId: 'atelier-soho', studioName: 'Atelier SoHo Tailors' })
                  }}
                  className="text-[12px] text-[#9CA3AF] hover:text-[#374151] underline underline-offset-4 transition-colors"
                >
                  Explore demo studio dashboard
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STUDIO – Sign Up Options                                         */}
          {/* ================================================================ */}
          {mode === 'studio-signup-options' && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Certified Partner Portal</p>
                <h2 className="font-serif text-[26px] font-bold text-[#0F1115] mt-0.5 leading-tight">Sign Up for Studio</h2>
                <p className="text-[13px] text-[#6B7280] mt-1.5">Join Darzi as a partner atelier. 3 quick steps — live in under 5 minutes.</p>
              </div>

              <div className="space-y-2.5">
                {/* Google sign-up with Studio role */}
                <GoogleButton label="Sign up with Google (Studio)" loading={loading} onClick={() => triggerGoogle('STUDIO')} bordered />
                {/* Goes straight to the 3-step form */}
                <AuthButton icon={<Mail size={15} className="text-[#9E593B]" />} label="Sign up with Email" onClick={() => setMode('studio-register')} />
                <button
                  onClick={() => setMode('studio-register')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors"
                >
                  <Store size={15} />
                  Register New Atelier Studio
                </button>
              </div>

              <Divider />
              <div className="text-center">
                <span className="text-[12px] text-[#9CA3AF]">Already have a studio? </span>
                <button
                  onClick={() => setMode('studio-options')}
                  className="text-[12px] text-[#9E593B] font-semibold hover:underline underline-offset-4 transition-colors"
                >
                  Sign in instead
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STUDIO – Email Login Form                                        */}
          {/* ================================================================ */}
          {mode === 'studio-login' && (
            <form onSubmit={handleStudioLogin} className="space-y-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Partner Login</p>
                <h2 className="font-serif text-2xl font-bold text-[#0F1115] mt-0.5">Welcome back</h2>
                <p className="text-xs text-[#6B7280] mt-1">Enter your registered partner email to access the studio dashboard.</p>
              </div>

              <Field label="Partner email address" type="email" required value={sLoginEmail} onChange={setSLoginEmail} placeholder="marco@ateliersoho.com" />
              <Field label="Studio name (optional)" value={sTailorName} onChange={setSTailorName} placeholder="Atelier SoHo Tailors" />

              <SubmitBtn loading={loading} label="Access Studio Dashboard" />
            </form>
          )}

          {/* ================================================================ */}
          {/* STUDIO – 3-Step Registration                                     */}
          {/* ================================================================ */}
          {mode === 'studio-register' && (
            <div className="space-y-5">
              {/* Header */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Partner Sign Up</p>
                <h2 className="font-serif text-[24px] font-bold text-[#0F1115] mt-0.5 leading-tight">Create your Studio Account</h2>
                <p className="text-xs text-[#6B7280] mt-1">3 quick steps — get live on Darzi in under 5 minutes.</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-[#374151]">
                    Step {registerStep} of 3
                  </p>
                  <span className="text-[11px] font-bold text-[#6B7280]">{Math.round((registerStep / 3) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5DFD5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#9E593B] transition-all duration-300"
                    style={{ width: `${(registerStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* ── Step 1: Location ─────────────────────────────────────── */}
              {registerStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#0F1115]">1. Your studio location</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">We route nearby alteration customers to your atelier.</p>
                  </div>

                  <Field label="Atelier / Shop name *" required value={sName} onChange={setSName} placeholder="Atelier SoHo Tailors" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Area / Neighborhood *" required value={sArea} onChange={setSArea} placeholder="SoHo, Kensington" />
                    <Field label="Postcode *" required value={sPostcode} onChange={setSPostcode} placeholder="W8 4EP" />
                  </div>
                  <Field label="Street address" value={sAddress} onChange={setSAddress} placeholder="18 Kensington Church St" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!sName || !sArea || !sPostcode) { setError('Please fill in studio name, area, and postcode.'); return }
                      setError('')
                      setRegisterStep(2)
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* ── Step 2: Contact ──────────────────────────────────────── */}
              {registerStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#0F1115]">2. Lead tailor contact</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Who receives bookings and payout notifications?</p>
                  </div>

                  <Field label="Lead master tailor name *" required value={sTailorName} onChange={setSTailorName} placeholder="Marco Rossi" />
                  <Field label="Partner email *" type="email" required value={sEmail} onChange={setSEmail} placeholder="marco@ateliersoho.com" />
                  <Field label="Direct phone *" type="tel" required value={sPhone} onChange={setSPhone} placeholder="+44 7700 900123" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!sTailorName || !sEmail || !sPhone) { setError('Please fill in name, email, and phone.'); return }
                      setError('')
                      setRegisterStep(3)
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* ── Step 3: Operations ───────────────────────────────────── */}
              {registerStep === 3 && (
                <form onSubmit={handleStudioRegister} className="space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#0F1115]">3. Machines & specialties</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Match you to the right alteration job types.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] mb-1">Machines</label>
                      <select
                        value={sMachines}
                        onChange={(e) => setSMachines(e.target.value)}
                        className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none"
                      >
                        <option value="2-3">2–3 machines</option>
                        <option value="4-6">4–6 machines</option>
                        <option value="8+">8+ machines</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] mb-1">Daily limit</label>
                      <select
                        value={sCapacity}
                        onChange={(e) => setSCapacity(e.target.value)}
                        className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none"
                      >
                        <option value="15">15 / day</option>
                        <option value="25">25 / day</option>
                        <option value="50">50 / day</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] mb-2">Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES.map((s) => {
                        const on = sSpecialties.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${on
                                ? 'bg-[#0F1115] text-white border-[#0F1115]'
                                : 'bg-white text-[#374151] border-[#D1D5DB] hover:border-[#9E593B]'
                              }`}
                          >
                            {on && <Check size={10} className="inline mr-1" />}
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors disabled:opacity-60"
                  >
                    <Sparkles size={15} />
                    {loading ? 'Activating studio…' : 'Open Studio Dashboard'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reusable small components ────────────────────────────────────────────────

function GoogleButton({ label, loading, onClick, bordered }: {
  label: string; loading: boolean; onClick: () => void; bordered?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 rounded-xl py-3 text-[13px] font-semibold transition-all disabled:opacity-60 ${bordered
          ? 'border-2 border-[#0F1115] bg-white text-[#0F1115] hover:bg-[#FAF8F5]'
          : 'bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]'
        }`}
    >
      <GoogleLogo />
      {loading ? 'Connecting…' : label}
    </button>
  )
}

function AuthButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#F4EFEA] hover:bg-[#EAE4DC] py-3 text-[13px] font-semibold text-[#0F1115] transition-colors"
    >
      {icon}
      {label}
    </button>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
      />
    </div>
  )
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors disabled:opacity-60"
    >
      {loading ? 'Please wait…' : label}
    </button>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#E5DFD5]" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">or</span>
      <div className="flex-1 h-px bg-[#E5DFD5]" />
    </div>
  )
}

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

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#E5DFD5]" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">or</span>
      <div className="flex-1 h-px bg-[#E5DFD5]" />
    </div>
  )
}

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
