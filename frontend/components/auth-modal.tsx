'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, Lock, LogOut, Mail, Phone, Sparkles, Store, X } from 'lucide-react'
import type { User as UserType } from './data'
import { linkPhone, loginUser, loginWithGoogle, sendOtp, signUpUser, verifyOtp } from '@/lib/api'

type AuthMode =
  | 'customer-options'
  | 'customer-email'
  | 'customer-mobile'
  | 'link-phone-step'
  | 'studio-options'
  | 'studio-signup-options'
  | 'studio-login'
  | 'studio-register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserType) => void
  onSignOut?: () => void
  targetRole?: 'CUSTOMER' | 'STUDIO'
  authType?: 'signin' | 'signup'
  currentUser?: UserType | null
  mandatoryPhoneRequired?: boolean
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  onSignOut,
  targetRole = 'CUSTOMER',
  authType = 'signup',
  currentUser,
  mandatoryPhoneRequired = false,
}: AuthModalProps) {
  const isMissingPhone = Boolean(mandatoryPhoneRequired || (currentUser && !currentUser.phone))

  const initialMode = (): AuthMode => {
    if (isMissingPhone) return 'link-phone-step'
    if (targetRole === 'STUDIO') {
      return authType === 'signup' ? 'studio-signup-options' : 'studio-options'
    }
    return 'customer-options'
  }

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // ── Pending User awaiting Mobile Number linking ───────────────────────────
  const [pendingUser, setPendingUser] = useState<UserType | null>(currentUser || null)
  const [avatarError, setAvatarError] = useState(false)

  // ── Customer fields ───────────────────────────────────────────────────────
  const [cName, setCName] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cPostcode, setCPostcode] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cOtpSent, setCOtpSent] = useState(false)
  const [cOtp, setCOtp] = useState('')
  const [cDemoCode, setCDemoCode] = useState('4829')

  // ── Mandatory Mobile Link fields ──────────────────────────────────────────
  const [linkPhoneVal, setLinkPhoneVal] = useState('')
  const [linkOtpSent, setLinkOtpSent] = useState(false)
  const [linkOtp, setLinkOtp] = useState('')
  const [linkDemoCode, setLinkDemoCode] = useState('4829')

  // ── Studio Login fields ───────────────────────────────────────────────────
  const [sLoginEmail, setSLoginEmail] = useState('')

  // ── Studio Register fields ────────────────────────────────────────────────
  const [sName, setSName] = useState('')
  const [sArea, setSArea] = useState('')
  const [sPostcode, setSPostcode] = useState('')
  const [sAddress, setSAddress] = useState('')
  const [sTailorName, setSTailorName] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sPhone, setSPhone] = useState('')
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

  // Reset on open / role / authType / currentUser switch
  useEffect(() => {
    const missing = Boolean(mandatoryPhoneRequired || (currentUser && !currentUser.phone))
    if (missing) {
      setMode('link-phone-step')
      setPendingUser(currentUser || null)
    } else {
      setMode(initialMode())
      setPendingUser(null)
    }
    setRegisterStep(1)
    setError('')
    setNotice('')
    setLoading(false)
    setAvatarError(false)
    setCOtpSent(false)
    setCOtp('')
    setLinkOtpSent(false)
    setLinkOtp('')
  }, [isOpen, targetRole, authType, currentUser, mandatoryPhoneRequired])

  const finalizeAuth = (user: UserType, role: 'CUSTOMER' | 'STUDIO') => {
    if (!user.phone) {
      setPendingUser(user)
      setMode('link-phone-step')
      setError('')
      setNotice('')
      return
    }
    onSuccess(user)
  }

  // ── Google OAuth token flow ───────────────────────────────────────────────
  const triggerGoogle = async (role: 'CUSTOMER' | 'STUDIO') => {
    setLoading(true)
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
                email: profile.email,
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
              const returnedRole = result.user.role
              if (returnedRole && returnedRole !== role) {
                setError(
                  returnedRole === 'STUDIO'
                    ? 'This Google account is registered as a Studio partner. Please sign in via the Studio portal.'
                    : 'This Google account is registered as a Customer. Please use a different Google account for Studio.'
                )
                return
              }

              if (role === 'STUDIO' && !result.user.studioName) {
                setMode('studio-register')
                setSTailorName(result.user.name || '')
                setSEmail(result.user.email || result.user.contact || '')
              } else {
                finalizeAuth(result.user, role)
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
      setLoading(false)
      setError(err.message || 'Google sign-in initialization failed.')
    }
  }

  // ── Customer Mobile (SMS OTP) Flow ────────────────────────────────────────
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cPhone.trim().length < 6) {
      setError('Please enter a valid mobile number.')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await sendOtp(cPhone.trim())
      setLoading(false)
      setCOtpSent(true)
      const code = res.demoCode || '4829'
      setCDemoCode(code)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Failed to send verification code.')
    }
  }

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cOtp || cOtp.length < 4) {
      setError('Please enter the 4-digit verification code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await verifyOtp({
        phone: cPhone.trim(),
        otp: cOtp.trim(),
        name: cName || undefined,
        email: cEmail || undefined,
        role: targetRole || 'CUSTOMER',
      })
      setLoading(false)
      if (res?.user) {
        onSuccess(res.user)
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Invalid code.')
    }
  }

  // ── Customer Email Sign-in Flow (with mandatory Mobile) ────────────────────
  const handleCustomerEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cEmail || !cEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (!cPhone || cPhone.trim().length < 6) {
      setError('Mobile number is required for fitting passes.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await signUpUser({
        name: cName || 'Darzi Member',
        email: cEmail.trim(),
        phone: cPhone.trim(),
        postcode: cPostcode.trim(),
        role: 'CUSTOMER',
      })
      setLoading(false)
      if (result?.user) {
        onSuccess(result.user)
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Sign up failed.')
    }
  }

  // ── Mandatory Mobile Link Step ────────────────────────────────────────────
  const handleSendLinkOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (linkPhoneVal.trim().length < 6) {
      setError('Please enter a valid phone number.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await sendOtp(linkPhoneVal.trim())
      setLoading(false)
      setLinkOtpSent(true)
      const code = res.demoCode || '4829'
      setLinkDemoCode(code)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Failed to send verification code.')
    }
  }

  const handleVerifyLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkOtp || linkOtp.length < 4) {
      setError('Please enter the 4-digit code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await linkPhone({
        phone: linkPhoneVal.trim(),
        otp: linkOtp.trim(),
        userId: pendingUser?.id || currentUser?.id,
      })
      setLoading(false)
      if (res?.user) {
        onSuccess(res.user)
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Failed to verify code.')
    }
  }

  // ── Studio Login ──────────────────────────────────────────────────────────
  const handleStudioLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await loginUser({ identifier: sLoginEmail.trim(), role: 'STUDIO' })
      setLoading(false)
      if (result?.user) finalizeAuth(result.user, 'STUDIO')
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Login failed. Please check your credentials.')
    }
  }

  // ── Studio Registration Final Submit ─────────────────────────────────────
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
      setError(err.message || 'Registration failed. Please check your details.')
    }
  }

  const toggleSpecialty = (s: string) =>
    setSSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const goBack = () => {
    if (mode === 'studio-register' && registerStep > 1) {
      setRegisterStep((p) => (p - 1) as 1 | 2 | 3)
    } else if (mode === 'studio-register') {
      setMode('studio-signup-options')
      setRegisterStep(1)
    } else if (mode === 'studio-login') {
      setMode('studio-options')
    } else if (mode === 'link-phone-step') {
      setMode(targetRole === 'STUDIO' ? 'studio-options' : 'customer-options')
      setPendingUser(null)
    } else {
      setMode(targetRole === 'STUDIO' ? 'studio-options' : 'customer-options')
      setRegisterStep(1)
    }
    setError('')
    setNotice('')
  }

  if (!isOpen) return null

  const isSubPage =
    mode !== 'customer-options' &&
    mode !== 'studio-options' &&
    mode !== 'studio-signup-options'

  const activeUser = pendingUser || currentUser
  const userInitial = (activeUser?.name || 'U')[0].toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-[390px] rounded-3xl bg-white shadow-2xl border border-[#E8E1D5] overflow-hidden">

        {/* Minimal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {isSubPage ? (
              <button
                onClick={goBack}
                className="size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#18191B] transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Image src="/bg_logo.png" alt="Darzi" width={100} height={28} priority className="h-7 w-auto object-contain" />
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#7A7E85] hover:text-[#18191B] transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-1 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3.5 text-[15px] sm:text-base text-red-700 font-bold leading-snug flex items-center gap-2.5 shadow-sm animate-in fade-in">
              <span className="text-lg shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Subtle Notice Banner */}
          {notice && !error && (
            <div className="rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-3.5 py-2.5 text-xs text-[#9E593B] font-medium flex items-center justify-between animate-in fade-in">
              <span>{notice}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* MINIMALIST MANDATORY MOBILE LINK STEP                            */}
          {/* ================================================================ */}
          {mode === 'link-phone-step' && (
            <div className="space-y-4">
              {!linkOtpSent ? (
                <>
                  <div>
                    <h2 className="font-serif text-[23px] font-bold text-[#18191B] tracking-tight leading-tight">
                      Link your mobile number
                    </h2>
                    <p className="text-xs text-[#7A7E85] mt-1 leading-relaxed">
                      Required for studio admission passes and live alteration status.
                    </p>
                  </div>

                  {/* Minimal Account Pill */}
                  {activeUser && (
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-full overflow-hidden shrink-0 bg-[#18191B] text-white text-xs font-bold grid place-items-center border border-[#E8E1D5] relative">
                          {activeUser.avatar && !avatarError ? (
                            <Image
                              src={activeUser.avatar}
                              alt={activeUser.name || 'User avatar'}
                              width={32}
                              height={32}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              className="size-full object-cover"
                              onError={() => setAvatarError(true)}
                            />
                          ) : (
                            <span>{userInitial}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#18191B] truncate">{activeUser.name}</p>
                          <p className="text-[11px] text-[#7A7E85] truncate">{activeUser.email || activeUser.contact}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-emerald-200/50">
                        Connected
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSendLinkOtp} className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        autoFocus
                        value={linkPhoneVal}
                        onChange={(e) => setLinkPhoneVal(e.target.value)}
                        placeholder="+44 7700 900077"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm"
                    >
                      {loading ? 'Sending code…' : 'Send Verification Code'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="font-serif text-[23px] font-bold text-[#18191B] tracking-tight leading-tight">
                      Enter your code
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-[#7A7E85]">
                      <span>Sent to <strong className="text-[#18191B] font-semibold">{linkPhoneVal}</strong></span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkOtpSent(false)
                          setLinkOtp('')
                          setError('')
                          setNotice('')
                        }}
                        className="text-[#9E593B] font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyLinkPhone} className="space-y-3.5 pt-1">
                    <div>
                      <input
                        type="text"
                        maxLength={4}
                        required
                        autoFocus
                        value={linkOtp}
                        onChange={(e) => setLinkOtp(e.target.value)}
                        placeholder={linkDemoCode}
                        className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#DDD6CB] bg-white py-2.5 focus:border-[#9E593B] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm"
                    >
                      {loading ? 'Verifying…' : 'Verify & Continue'}
                    </button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSendLinkOtp}
                        className="text-xs text-[#9E593B] font-semibold hover:underline"
                      >
                        Resend code
                      </button>
                    </div>
                  </form>
                </>
              )}

              {onSignOut && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut()
                      setMode('customer-options')
                      setPendingUser(null)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7A7E85] hover:text-red-600 transition-colors"
                  >
                    <LogOut size={12} />
                    <span>Sign out or use different account</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* CUSTOMER – Sign In / Sign Up Options                             */}
          {/* ================================================================ */}
          {mode === 'customer-options' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[24px] font-bold text-[#18191B] tracking-tight leading-tight">
                  Welcome to Darzi
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  Sign in or create an account for bespoke fitting passes.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <GoogleButton label="Continue with Google" loading={loading} onClick={() => triggerGoogle('CUSTOMER')} bordered />

                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setMode('customer-mobile')
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors"
                >
                  <Phone size={14} className="text-[#9E593B]" />
                  <span>Continue with Mobile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setMode('customer-email')
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors"
                >
                  <Mail size={14} className="text-[#9E593B]" />
                  <span>Continue with Email</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* CUSTOMER – Mobile Number / SMS OTP                               */}
          {/* ================================================================ */}
          {mode === 'customer-mobile' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#18191B]">
                  {cOtpSent ? 'Enter 4-Digit Code' : 'Enter mobile number'}
                </h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">
                  {cOtpSent
                    ? `Verification code sent to ${cPhone}`
                    : 'We will send a 4-digit SMS verification code.'}
                </p>
              </div>

              {!cOtpSent ? (
                <form onSubmit={handleSendMobileOtp} className="space-y-3 pt-1">
                  <Field label="Your name (optional)" value={cName} onChange={setCName} placeholder="Sarah Jenkins" />
                  <Field
                    label="Mobile phone number *"
                    type="tel"
                    required
                    value={cPhone}
                    onChange={setCPhone}
                    placeholder="+44 7700 900077"
                  />
                  <SubmitBtn loading={loading} label="Send Verification Code" />
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOtp} className="space-y-3 pt-1">
                  <input
                    type="text"
                    maxLength={4}
                    required
                    autoFocus
                    value={cOtp}
                    onChange={(e) => setCOtp(e.target.value)}
                    placeholder={cDemoCode}
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#DDD6CB] py-2.5 focus:border-[#9E593B] focus:outline-none"
                  />
                  <SubmitBtn loading={loading} label="Verify & Sign In" />
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => setCOtpSent(false)}
                      className="text-[#7A7E85] hover:text-[#18191B] underline"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      className="text-[#9E593B] font-semibold hover:underline"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* CUSTOMER – Email Form                                            */}
          {/* ================================================================ */}
          {mode === 'customer-email' && (
            <form onSubmit={handleCustomerEmail} className="space-y-3.5">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#18191B]">
                  Continue with Email
                </h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">
                  Connect your email and mobile for order tracking.
                </p>
              </div>

              <Field label="Your name" value={cName} onChange={setCName} placeholder="Sarah Jenkins" />
              <Field label="Email address *" type="email" required value={cEmail} onChange={setCEmail} placeholder="name@example.com" />
              <Field
                label="Mobile phone number *"
                type="tel"
                required
                value={cPhone}
                onChange={setCPhone}
                placeholder="+44 7700 900077"
              />

              <SubmitBtn loading={loading} label="Continue" />
            </form>
          )}

          {/* ================================================================ */}
          {/* STUDIO – Sign In / Register Options                              */}
          {/* ================================================================ */}
          {mode === 'studio-options' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">Partner Portal</p>
                <h2 className="font-serif text-[24px] font-bold text-[#18191B] mt-0.5">Sign in to Studio</h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">Access live orders, workbench controls, and payouts.</p>
              </div>

              <div className="space-y-2.5 pt-1">
                <GoogleButton label="Sign in with Google" loading={loading} onClick={() => triggerGoogle('STUDIO')} bordered />
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setMode('customer-mobile')
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors"
                >
                  <Phone size={14} className="text-[#9E593B]" />
                  <span>Sign in with Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('studio-login')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors"
                >
                  <Mail size={14} className="text-[#9E593B]" />
                  <span>Sign in with Email</span>
                </button>
                <button
                  onClick={() => setMode('studio-register')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-colors"
                >
                  <Store size={14} />
                  <span>Register New Studio</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STUDIO – Sign Up Options                                         */}
          {/* ================================================================ */}
          {mode === 'studio-signup-options' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">Partner Portal</p>
                <h2 className="font-serif text-[24px] font-bold text-[#18191B] mt-0.5">Register your Studio</h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">Join Darzi as a certified partner atelier.</p>
              </div>

              <div className="space-y-2.5 pt-1">
                <GoogleButton label="Sign up with Google (Studio)" loading={loading} onClick={() => triggerGoogle('STUDIO')} bordered />
                <button
                  onClick={() => setMode('studio-register')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-colors"
                >
                  <Store size={14} />
                  <span>Register with 3-Step Form</span>
                </button>
              </div>

              <Divider />
              <div className="text-center">
                <span className="text-xs text-[#9CA3AF]">Already have a studio? </span>
                <button
                  onClick={() => setMode('studio-options')}
                  className="text-xs text-[#9E593B] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STUDIO – Email Login Form                                        */}
          {/* ================================================================ */}
          {mode === 'studio-login' && (
            <form onSubmit={handleStudioLogin} className="space-y-3.5">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#18191B]">Partner Login</h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">Enter your registered email or phone.</p>
              </div>

              <Field label="Partner email or phone" required value={sLoginEmail} onChange={setSLoginEmail} placeholder="marco@ateliersoho.com" />
              <SubmitBtn loading={loading} label="Access Studio Dashboard" />
            </form>
          )}

          {/* ================================================================ */}
          {/* STUDIO – 3-Step Registration                                     */}
          {/* ================================================================ */}
          {mode === 'studio-register' && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">Step {registerStep} of 3</p>
                <h2 className="font-serif text-[22px] font-bold text-[#18191B] mt-0.5">
                  {registerStep === 1 ? 'Studio Location' : registerStep === 2 ? 'Lead Tailor' : 'Capacity & Tools'}
                </h2>
              </div>

              <div className="h-1 rounded-full bg-[#E5DFD5] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#9E593B] transition-all duration-300"
                  style={{ width: `${(registerStep / 3) * 100}%` }}
                />
              </div>

              {registerStep === 1 && (
                <div className="space-y-3">
                  <Field label="Atelier / Shop name *" required value={sName} onChange={setSName} placeholder="Atelier SoHo Tailors" />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Area *" required value={sArea} onChange={setSArea} placeholder="SoHo" />
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
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {registerStep === 2 && (
                <div className="space-y-3">
                  <Field label="Lead master tailor name *" required value={sTailorName} onChange={setSTailorName} placeholder="Marco Rossi" />
                  <Field label="Partner email *" type="email" required value={sEmail} onChange={setSEmail} placeholder="marco@ateliersoho.com" />
                  <Field label="Direct phone * (Required)" type="tel" required value={sPhone} onChange={setSPhone} placeholder="+44 7700 900123" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!sTailorName || !sEmail || !sPhone) { setError('Please fill in name, email, and phone.'); return }
                      setError('')
                      setRegisterStep(3)
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {registerStep === 3 && (
                <form onSubmit={handleStudioRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">Machines</label>
                      <select
                        value={sMachines}
                        onChange={(e) => setSMachines(e.target.value)}
                        className="w-full rounded-xl border border-[#DDD6CB] px-3 py-2 text-xs font-semibold text-[#18191B] focus:outline-none"
                      >
                        <option value="2-3">2–3 machines</option>
                        <option value="4-6">4–6 machines</option>
                        <option value="8+">8+ machines</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">Daily limit</label>
                      <select
                        value={sCapacity}
                        onChange={(e) => setSCapacity(e.target.value)}
                        className="w-full rounded-xl border border-[#DDD6CB] px-3 py-2 text-xs font-semibold text-[#18191B] focus:outline-none"
                      >
                        <option value="15">15 / day</option>
                        <option value="25">25 / day</option>
                        <option value="50">50 / day</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1.5">Specialties</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SPECIALTIES.map((s) => {
                        const on = sSpecialties.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold border transition-all ${
                              on
                                ? 'bg-[#0F1115] text-white border-[#0F1115]'
                                : 'bg-white text-[#5A5D64] border-[#DDD6CB] hover:border-[#9E593B]'
                            }`}
                          >
                            {on && <Check size={9} className="inline mr-0.5" />}
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-colors disabled:opacity-60"
                  >
                    <Sparkles size={14} />
                    <span>{loading ? 'Activating…' : 'Open Studio Dashboard'}</span>
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

// ── Reusable Small Components ───────────────────────────────────────────────

function GoogleButton({
  label,
  loading,
  onClick,
  bordered,
}: {
  label: string
  loading: boolean
  onClick: () => void
  bordered?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-[13px] font-semibold transition-all disabled:opacity-60 ${
        bordered
          ? 'border border-[#DDD6CB] bg-white text-[#18191B] hover:bg-[#FAF8F5]'
          : 'bg-white border border-[#DDD6CB] text-[#18191B] hover:bg-[#FAF8F5]'
      }`}
    >
      <GoogleLogo />
      <span>{loading ? 'Connecting…' : label}</span>
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
      />
    </div>
  )
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm"
    >
      {loading ? 'Please wait…' : label}
    </button>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#EAE5DE]" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">or</span>
      <div className="flex-1 h-px bg-[#EAE5DE]" />
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
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
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}
