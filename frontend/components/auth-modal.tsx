'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, Lock, LogOut, Mail, Phone, Sparkles, Store, X } from 'lucide-react'
import { toast } from 'react-toastify'
import type { User as UserType } from './data'
import { getStudioUrl, linkPhone, loginUser, loginWithGoogle, sendOtp, signUpUser, verifyOtp } from '@/lib/api'
import { setAuthUser, setAuthRole, setAuthToken } from '@/lib/cookies'

type AuthMode =
  | 'role-select'
  | 'customer-options'
  | 'customer-email'
  | 'customer-mobile'
  | 'link-phone-step'
  | 'studio-options'
  | 'studio-signup-options'
  | 'studio-login'
  | 'studio-register'
  | 'studio-partner-google'

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
    // Always start with role selection screen
    return 'role-select'
  }

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isSendingOtpRef = useRef(false)
  const isSendingLinkOtpRef = useRef(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (resendCountdown <= 0) return
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCountdown])

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

  // ── Mandatory Mobile Link fields ──────────────────────────────────────────
  const [linkPhoneVal, setLinkPhoneVal] = useState('')
  const [linkOtpSent, setLinkOtpSent] = useState(false)
  const [linkOtp, setLinkOtp] = useState('')

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
      const modeToSet = initialMode()
      setMode(modeToSet)
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

  const finalizeAuth = (user: UserType, role?: UserType['role']) => {
    if (!user.phone) {
      setPendingUser(user)
      setMode('link-phone-step')
      setError('')
      setNotice('')
      return
    }
    onSuccess(user)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).google?.accounts?.oauth2) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  // ── Google OAuth token flow – Studio Partner (redirects to Step 1) ─────────
  const triggerGoogleStudio = () => {
    setLoading(true)
    setError('')
    setNotice('')

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      setLoading(false)
      const msg = 'Google sign-in service is initializing. Please try again in a moment.'
      setError(msg)
      toast.info(msg, { position: 'top-center' })
      if (typeof window !== 'undefined' && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true
        document.head.appendChild(s)
      }
      return
    }

    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setLoading(false)
            if (tokenResponse.error === 'popup_closed' || tokenResponse.error === 'access_denied') {
              setError('Google sign-in was cancelled.')
              toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
            } else {
              setError(`Google sign-in error: ${tokenResponse.error}`)
              toast.error(`Google sign-in error: ${tokenResponse.error}`, { position: 'top-center' })
            }
            return
          }
          if (!tokenResponse?.access_token) {
            setLoading(false)
            setError('Google sign-in was cancelled.')
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
              },
            })
            setLoading(false)
            if (result?.user) {
              // Close modal and redirect to studio onboarding Step 1
              onClose()
              const token = result.token || (typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null)
              if (result.token) {
                setAuthToken(result.token)
              }
              setAuthRole('STUDIO')
              setAuthUser(result.user)

              if (!result.isNewUser && result.user.studioName && result.user.phone) {
                // Existing verified studio partner — go straight to dashboard
                window.location.href = getStudioUrl('/', token)
              } else {
                // New partner or incomplete registration — direct to Step 1 form!
                window.location.href = getStudioUrl('/?step=1', token)
              }
            }
          } catch (err: any) {
            setLoading(false)
            const msg = err.message || 'Google sign-in failed.'
            setError(msg)
            toast.error(msg, { position: 'top-center' })
          }
        },
        error_callback: (err: any) => {
          setLoading(false)
          const msg = 'Google sign-in popup was blocked by your browser. Please allow popups for this site.'
          setError(msg)
          toast.error(msg, { position: 'top-center' })
        },
      })
      tokenClient.requestAccessToken()
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Google sign-in initialization failed.')
    }
  }

  // ── Google OAuth token flow ───────────────────────────────────────────────
  const triggerGoogle = (role: 'CUSTOMER' | 'STUDIO') => {
    setLoading(true)
    setError('')
    setNotice('')

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      setLoading(false)
      const msg = 'Google sign-in service is initializing. Please try again in a moment.'
      setError(msg)
      toast.info(msg, { position: 'top-center' })
      if (typeof window !== 'undefined' && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true
        document.head.appendChild(s)
      }
      return
    }

    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setLoading(false)
            if (tokenResponse.error === 'popup_closed' || tokenResponse.error === 'access_denied') {
              setError('Google sign-in was cancelled.')
              toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
            } else {
              setError(`Google sign-in error: ${tokenResponse.error}`)
              toast.error(`Google sign-in error: ${tokenResponse.error}`, { position: 'top-center' })
            }
            return
          }
          if (!tokenResponse?.access_token) {
            setLoading(false)
            setError('Google sign-in was cancelled.')
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
              finalizeAuth(result.user, result.user.role || role)
            }
          } catch (err: any) {
            setLoading(false)
            const msg = err.message || 'Google sign-in failed.'
            if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('access denied')) {
              setError('')
              toast.error(msg, { position: 'top-center' })
            } else {
              setError(msg)
              toast.error(msg, { position: 'top-center' })
            }
          }
        },
        error_callback: (err: any) => {
          setLoading(false)
          const msg = 'Google sign-in popup was blocked by your browser. Please allow popups for this site.'
          setError(msg)
          toast.error(msg, { position: 'top-center' })
        },
      })
      tokenClient.requestAccessToken()
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Google sign-in initialization failed.')
    }
  }

  // ── Customer Mobile (SMS OTP) Flow ────────────────────────────────────────
  const handleSendMobileOtp = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault()
    if (isSendingOtpRef.current) return
    const cleanedDigits = cPhone.replace(/\D/g, '')
    if (cleanedDigits.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    isSendingOtpRef.current = true
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await sendOtp(cPhone.trim(), force)
      setLoading(false)
      setCOtpSent(true)
      setResendCountdown(30)
      if (res.phone) setCPhone(res.phone)
      if (res.cooldown) {
        toast.info(res.message, { position: 'top-center' })
      } else {
        toast.success(res.message || `Verification code sent via SMS to ${res.phone || cPhone.trim()}`, { position: 'top-center' })
      }
    } catch (err: any) {
      setLoading(false)
      const msg = err.message || 'Failed to send verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    } finally {
      isSendingOtpRef.current = false
    }
  }

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cOtp || cOtp.length < 4) {
      const msg = 'Please enter the 4-digit verification code.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
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
      const msg = err.message || 'Invalid code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    }
  }

  // ── Customer Email Sign-in Flow (with mandatory Mobile) ────────────────────
  const handleCustomerEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cEmail || !cEmail.includes('@')) {
      const msg = 'Please enter a valid email address.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    if (!cPhone || cPhone.trim().length < 6) {
      const msg = 'Mobile number is required for fitting passes.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
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
      const msg = err.message || 'Sign up failed.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    }
  }

  // ── Mandatory Mobile Link Step ────────────────────────────────────────────
  const handleSendLinkOtp = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault()
    if (isSendingLinkOtpRef.current) return
    const cleanedDigits = linkPhoneVal.replace(/\D/g, '')
    if (cleanedDigits.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number with country code (e.g. +91 98765 43210).'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    isSendingLinkOtpRef.current = true
    setLoading(true)
    setError('')
    try {
      const res = await sendOtp(linkPhoneVal.trim(), force)
      setLoading(false)
      setLinkOtpSent(true)
      if (res.phone) setLinkPhoneVal(res.phone)
      if (res.cooldown) {
        toast.info(res.message, { position: 'top-center' })
      } else {
        toast.success(res.message || `Verification code sent via SMS to ${res.phone || linkPhoneVal.trim()}`, { position: 'top-center' })
      }
    } catch (err: any) {
      setLoading(false)
      const msg = err.message || 'Failed to send verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    } finally {
      isSendingLinkOtpRef.current = false
    }
  }

  const handleVerifyLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkOtp || linkOtp.length < 4) {
      const msg = 'Please enter the 4-digit code.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
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
        toast.success('Mobile number linked successfully!', { position: 'top-center' })
        onSuccess(res.user)
      }
    } catch (err: any) {
      setLoading(false)
      const msg = err.message || 'Failed to verify code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
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
      const msg = err.message || 'Unauthorized user, access denied.'
      if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('access denied')) {
        setError('')
        toast.error(msg, { position: 'top-center' })
      } else {
        setError(msg)
        toast.error(msg, { position: 'top-center' })
      }
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
      setMode('role-select')
      setPendingUser(null)
    } else if (mode === 'customer-options' || mode === 'studio-partner-google') {
      setMode('role-select')
      setRegisterStep(1)
    } else {
      setMode('customer-options')
      setRegisterStep(1)
    }
    setError('')
    setNotice('')
  }

  if (!isOpen) return null

  const isSubPage = mode !== 'role-select'

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
      <div className={`relative w-full ${mode === 'role-select' ? 'max-w-[430px]' : 'max-w-[390px]'} rounded-3xl bg-white shadow-2xl border border-[#E8E1D5] overflow-hidden transition-all duration-200`}>

        {/* Top Controls: Back button & Top-Right Close Button */}
        {isSubPage && (
          <button
            onClick={goBack}
            className="absolute top-4 left-4 z-20 size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#18191B] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
          </button>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#7A7E85] hover:text-[#18191B] transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        {/* Header Logo */}
        <div className="flex items-center justify-center px-6 pt-7 pb-3">
          <img
            src="/bg_logo.png"
            alt="Darzi Logo"
            className="h-16 sm:h-20 max-h-24 w-auto object-contain transition-all duration-200"
          />
        </div>

        <div className="px-6 pb-6 pt-1 space-y-5">
          {/* Error Banner */}
          {error && !error.toLowerCase().includes('unauthorized') && !error.toLowerCase().includes('access denied') && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3.5 text-[15px] sm:text-base text-red-700 font-bold leading-snug shadow-sm animate-in fade-in space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-lg shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
              {error.includes('Please sign in instead') && (
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setMode(targetRole === 'STUDIO' ? 'studio-options' : 'customer-options')
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer ml-7"
                >
                  Sign in to this account →
                </button>
              )}
            </div>
          )}

          {/* Subtle Notice Banner */}
          {notice && !error && (
            <div className="rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] px-3.5 py-2.5 text-xs text-[#9E593B] font-medium flex items-center justify-between animate-in fade-in">
              <span>{notice}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* ROLE SELECTION – Customer vs Studio Partner                      */}
          {/* ================================================================ */}
          {mode === 'role-select' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="font-serif text-[22px] font-bold text-[#18191B] tracking-tight leading-tight">
                  How are you joining?
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  Choose your role to get started with Darzi.
                </p>
              </div>

              {/* Cards Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Customer Card */}
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setMode('customer-options')
                  }}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#9E593B] hover:bg-white p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left"
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
                      I'm a Customer
                    </p>
                    <p className="text-[11px] text-[#7A7E85] mt-0.5 leading-snug">
                      Book alterations & fittings
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 size-5 rounded-full border-2 border-[#E8E1D5] group-hover:border-[#9E593B] group-hover:bg-[#9E593B] transition-all flex items-center justify-center">
                    <svg className="size-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Studio Partner Card */}
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    setMode('studio-options')
                  }}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#0F1115] hover:bg-white p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left"
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
                      List your atelier & earn
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 size-5 rounded-full border-2 border-[#E8E1D5] group-hover:border-[#0F1115] group-hover:bg-[#0F1115] transition-all flex items-center justify-center">
                    <svg className="size-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              </div>

              <p className="text-center text-[10px] text-[#9CA3AF]">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </p>
            </div>
          )}

          {/* ================================================================ */}
          {/* STUDIO PARTNER – Google Sign-In / Sign-Up then redirect step 1   */}
          {/* ================================================================ */}
          {mode === 'studio-partner-google' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[24px] font-bold text-[#18191B] tracking-tight leading-tight">
                  Welcome to Darzi Studio
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  Sign in or register your atelier with Google to get started.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <GoogleButton
                  label="Continue with Google"
                  loading={loading}
                  onClick={() => triggerGoogleStudio()}
                  bordered
                />

                <p className="text-center text-[10px] text-[#9CA3AF] pt-1">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('studio-options')}
                    className="text-[#9E593B] font-semibold hover:underline"
                  >
                    Sign in instead
                  </button>
                </p>
              </div>

              <p className="text-center text-[10px] text-[#9CA3AF]">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </p>
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
                        inputMode="tel"
                        required
                        autoFocus
                        value={linkPhoneVal}
                        onChange={(e) => setLinkPhoneVal(e.target.value.replace(/[^\d+ ]/g, ''))}
                        placeholder="+91 98765 43210"
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        required
                        autoFocus
                        value={linkOtp}
                        onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • •"
                        className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#DDD6CB] bg-white py-3 focus:border-[#9E593B] focus:outline-none placeholder:text-gray-300 placeholder:tracking-[0.3em]"
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
                        disabled={loading || resendCountdown > 0}
                        onClick={() => handleSendLinkOtp(undefined, true)}
                        className="text-xs text-[#9E593B] font-semibold hover:underline disabled:opacity-50"
                      >
                        {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend code'}
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
                    onChange={(val) => setCPhone(val.replace(/[^\d+ ]/g, ''))}
                    placeholder="+91 98765 43210"
                  />
                  <SubmitBtn loading={loading} label="Send Verification Code" />
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOtp} className="space-y-3 pt-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    required
                    autoFocus
                    value={cOtp}
                    onChange={(e) => setCOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="• • • •"
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#DDD6CB] py-3 focus:border-[#9E593B] focus:outline-none placeholder:text-gray-300 placeholder:tracking-[0.3em]"
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
                      disabled={loading || resendCountdown > 0}
                      onClick={() => handleSendMobileOtp(undefined, true)}
                      className="text-[#9E593B] font-semibold hover:underline disabled:opacity-50"
                    >
                      {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend code'}
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
                <h2 className="font-serif text-[24px] font-bold text-[#18191B] tracking-tight leading-tight">
                  Welcome to Darzi Studio
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  Access live orders, workbench controls, and atelier payouts.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <GoogleButton label="Continue with Google" loading={loading} onClick={() => triggerGoogleStudio()} bordered />
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
                  onClick={() => setMode('studio-login')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors"
                >
                  <Mail size={14} className="text-[#9E593B]" />
                  <span>Continue with Email</span>
                </button>
              </div>

              <p className="text-center text-[10px] text-[#9CA3AF]">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </p>
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
                  onClick={() => {
                    onClose()
                    if (typeof window !== 'undefined') {
                      window.location.href = getStudioUrl('/onboarding')
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-colors"
                >
                  <Store size={14} />
                  <span>Register Atelier Shop</span>
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
                    <Field label="Postcode / ZIP / PIN *" required value={sPostcode} onChange={(val) => setSPostcode(val.replace(/[^\d\-]/g, '').slice(0, 10))} placeholder="10001 or 400001" />
                  </div>
                  <Field label="Street address" value={sAddress} onChange={setSAddress} placeholder="18 Kensington Church St" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!sName || !sArea || !sPostcode) { setError('Please fill in studio name, area, and postcode.'); return }
                      const cleanPin = sPostcode.trim().replace(/\D/g, '')
                      if (cleanPin.length < 5 || cleanPin.length > 10) {
                        setError('Please enter a valid postal / ZIP code.')
                        return
                      }
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
                  <Field label="Direct phone * (Required)" type="tel" required value={sPhone} onChange={(val) => setSPhone(val.replace(/[^\d+ ]/g, ''))} placeholder="+1 (555) 019-2834 or +91 98765 43210" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!sTailorName || !sEmail || !sPhone) { setError('Please fill in name, email, and phone.'); return }
                      const cleanDigits = sPhone.trim().replace(/\D/g, '')
                      if (cleanDigits.length < 10) {
                        setError('Please enter a valid 10-digit mobile number with country code.')
                        return
                      }
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
                            className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold border transition-all ${on
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
      className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-[13px] font-semibold transition-all disabled:opacity-60 ${bordered
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

// ── Role-Selection Illustrations ─────────────────────────────────────────────

function CustomerIllustration() {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <radialGradient id="custGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9E593B" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#9E593B" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#9E593B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mannequinGrad" x1="75" y1="36" x2="125" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F9F6F0" />
          <stop offset="50%" stopColor="#EFE8DC" />
          <stop offset="100%" stopColor="#DECEBE" />
        </linearGradient>
        <linearGradient id="woodGrad" x1="94" y1="20" x2="106" y2="148" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8C4A2D" />
          <stop offset="50%" stopColor="#6C351D" />
          <stop offset="100%" stopColor="#4A2211" />
        </linearGradient>
        <linearGradient id="tapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="goldShears" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Ambient background aura */}
      <circle cx="100" cy="75" r="70" fill="url(#custGlow)" />

      {/* Tailor's measuring arc guide */}
      <path d="M30 45 C65 15, 135 15, 170 45" stroke="#9E593B" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.3" fill="none" />
      <path d="M25 115 C60 145, 140 145, 175 115" stroke="#9E593B" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.25" fill="none" />

      {/* ── Mannequin Stand ── */}
      {/* Central Turned Wood Pole */}
      <rect x="97.5" y="105" width="5" height="34" rx="2.5" fill="url(#woodGrad)" />
      {/* Adjustment ring */}
      <circle cx="100" cy="116" r="3.5" fill="#D4AF37" stroke="#8C4A2D" strokeWidth="0.8" />
      {/* Turned Wood Pedestal Base */}
      <path d="M91 138 C94 133, 106 133, 109 138 L114 144 H86 Z" fill="url(#woodGrad)" />
      {/* Tripod legs */}
      <path d="M88 141 C76 142, 66 144, 55 147" stroke="url(#woodGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M112 141 C124 142, 134 144, 145 147" stroke="url(#woodGrad)" strokeWidth="3" strokeLinecap="round" />

      {/* ── Mannequin Torso ── */}
      {/* Turned Wood Finial on Top */}
      <ellipse cx="100" cy="21" rx="6" ry="4.5" fill="url(#woodGrad)" />
      <rect x="98" y="24" width="4" height="6" rx="1.5" fill="url(#woodGrad)" />
      {/* Neck collar */}
      <path d="M95 30 Q100 29 105 30 L106 37 Q100 39 94 37 Z" fill="#E8DDD2" stroke="#9E593B" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="94" y1="33" x2="106" y2="33" stroke="#D4AF37" strokeWidth="1" />

      {/* Couture Torso Body */}
      <path
        d="M94 36 C84 37, 72 41, 70 48 C68 55, 74 68, 77 78 C80 87, 83 94, 76 102 C72 106, 75 108, 80 108 H120 C125 108, 128 106, 124 102 C117 94, 120 87, 123 78 C126 68, 132 55, 130 48 C128 41, 116 37, 106 36 Z"
        fill="url(#mannequinGrad)"
        stroke="#9E593B"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Tailor's Princess Seams (Dashed stitch lines) */}
      <path d="M86 42 C82 58, 87 84, 88 108" stroke="#9E593B" strokeWidth="0.9" strokeDasharray="2.5 2" strokeOpacity="0.45" fill="none" />
      <path d="M114 42 C118 58, 113 84, 112 108" stroke="#9E593B" strokeWidth="0.9" strokeDasharray="2.5 2" strokeOpacity="0.45" fill="none" />
      {/* Center grainline */}
      <path d="M100 38 L100 108" stroke="#9E593B" strokeWidth="0.6" strokeDasharray="4 2.5" strokeOpacity="0.3" fill="none" />
      {/* Waistline contour mark */}
      <path d="M81 82 Q100 86 119 82" stroke="#9E593B" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.35" fill="none" />

      {/* ── Draped Measuring Tape ── */}
      <path
        d="M78 44 C84 48, 92 62, 94 76 C96 88, 90 94, 84 96 C74 98, 66 104, 60 114"
        stroke="url(#tapeGrad)"
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

      {/* ── Silk Thread Spool (Top Right) ── */}
      <g transform="translate(142, 28)">
        <ellipse cx="10" cy="4" rx="8" ry="3.5" fill="url(#woodGrad)" />
        <rect x="3" y="4" width="14" height="15" fill="#9E593B" rx="1.5" />
        <path d="M3 6 Q10 8 17 6 M3 10 Q10 12 17 10 M3 14 Q10 16 17 14" stroke="#F9ECE3" strokeWidth="0.6" strokeOpacity="0.6" />
        <ellipse cx="10" cy="19" rx="8" ry="3.5" fill="url(#woodGrad)" />
        {/* Thread unwinding */}
        <path d="M17 16 C22 24, 20 40, 10 52 C5 58, 2 64, -12 70" stroke="#9E593B" strokeWidth="0.9" strokeDasharray="3 2" strokeOpacity="0.5" fill="none" />
      </g>

      {/* ── Tailor's Gold Shears / Scissors (Bottom Left) ── */}
      <g transform="translate(24, 86) rotate(-22)">
        {/* Blade 1 */}
        <path d="M16 12 L42 5 C43 5, 43 8, 22 17 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.6" />
        {/* Blade 2 */}
        <path d="M16 14 L42 22 C43 22, 42 19, 22 13 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="0.6" />
        {/* Pivot screw */}
        <circle cx="20" cy="14" r="2.2" fill="#F59E0B" stroke="#78350F" strokeWidth="0.6" />
        {/* Gold Handle loops */}
        <circle cx="8" cy="8" r="6" fill="none" stroke="url(#goldShears)" strokeWidth="2.4" />
        <circle cx="8" cy="20" r="6" fill="none" stroke="url(#goldShears)" strokeWidth="2.4" />
        <path d="M13 10 L18 13 M13 18 L18 15" stroke="url(#goldShears)" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* ── Pearl-Head Pins in Shoulder ── */}
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

function StudioIllustration() {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <radialGradient id="studioGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9E593B" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#9E593B" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#9E593B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="machineBody" x1="40" y1="28" x2="160" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#222834" />
          <stop offset="45%" stopColor="#181D26" />
          <stop offset="100%" stopColor="#0F131A" />
        </linearGradient>
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="steelChrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Atmospheric Workbench Glow */}
      <circle cx="100" cy="75" r="70" fill="url(#studioGlow)" />

      {/* ── Precision Workbench Bed ── */}
      {/* Base shadow */}
      <rect x="20" y="118" width="160" height="4" rx="2" fill="#000000" fillOpacity="0.5" />
      {/* Solid workbench plate */}
      <rect x="22" y="108" width="156" height="11" rx="3.5" fill="#1A1F29" stroke="#333D4F" strokeWidth="1" />
      {/* Millimeter ruler markings along bed */}
      <line x1="28" y1="113" x2="78" y2="113" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="1.5 2.5" strokeOpacity="0.7" />
      {/* Chrome needle throat plate */}
      <rect x="54" y="107.5" width="30" height="3" rx="1" fill="url(#steelChrome)" />
      {/* Feed dog slots */}
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
        fill="url(#machineBody)"
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
        stroke="url(#goldAccent)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="60 3 8 3"
        fill="none"
      />

      {/* ── Handwheel / Balance Wheel (Right) ── */}
      <g transform="translate(150, 42)">
        <ellipse cx="6" cy="22" rx="7" ry="26" fill="#1F2633" stroke="url(#goldAccent)" strokeWidth="1.2" />
        <ellipse cx="6" cy="22" rx="3.5" ry="16" fill="#131720" stroke="#4B5563" strokeWidth="0.8" />
        {/* Wheel spoke details */}
        <line x1="6" y1="10" x2="6" y2="34" stroke="url(#goldAccent)" strokeWidth="1" />
        {/* Center clutch knob */}
        <circle cx="6" cy="22" r="3.2" fill="url(#steelChrome)" stroke="#78350F" strokeWidth="0.6" />
      </g>

      {/* ── Spool Pins & Twin Thread Spools (Top) ── */}
      {/* Spool 1 (Terracotta Silk) */}
      <rect x="118" y="16" width="3" height="16" fill="url(#steelChrome)" rx="1" />
      <rect x="114" y="20" width="11" height="12" rx="1.5" fill="#9E593B" stroke="#C48B6F" strokeWidth="0.6" />
      <ellipse cx="119.5" cy="20" rx="5.5" ry="1.8" fill="#F3D5C3" />
      {/* Spool 2 (Gold Thread) */}
      <rect x="134" y="18" width="3" height="14" fill="url(#steelChrome)" rx="1" />
      <rect x="130" y="22" width="11" height="10" rx="1.5" fill="#D97706" stroke="#FBBF24" strokeWidth="0.6" />
      <ellipse cx="135.5" cy="22" rx="5.5" ry="1.6" fill="#FEF3C7" />

      {/* ── Thread Take-Up Lever & Tension Assembly ── */}
      {/* Thread guide rod */}
      <path d="M116 20 C100 16, 75 18, 54 28" stroke="#FCD34D" strokeWidth="0.9" strokeDasharray="3 2" fill="none" strokeOpacity="0.8" />
      {/* Dynamic Take-Up Lever */}
      <path d="M54 36 L48 24" stroke="url(#steelChrome)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="48" cy="24" r="1.6" fill="#F59E0B" />
      {/* Tension Disc Knob on Faceplate */}
      <circle cx="56" cy="56" r="6" fill="#1E2532" stroke="url(#goldAccent)" strokeWidth="1.2" />
      <circle cx="56" cy="56" r="2.5" fill="url(#steelChrome)" />

      {/* ── Needle Bar & Presser Foot Mechanism ── */}
      {/* Needle bar shaft */}
      <rect x="47" y="52" width="3.5" height="42" rx="1.5" fill="url(#steelChrome)" />
      {/* Needle clamp */}
      <rect x="45.5" y="86" width="6.5" height="4.5" rx="1" fill="#475569" stroke="#94A3B8" strokeWidth="0.5" />
      <circle cx="51" cy="88.2" r="1" fill="#F59E0B" />
      {/* Precision Needle */}
      <line x1="48.8" y1="90" x2="48.8" y2="108" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" />
      {/* Presser foot bar & shoe */}
      <rect x="54" y="60" width="3" height="40" rx="1" fill="url(#steelChrome)" />
      <path d="M52 100 L58 100 L62 106 L50 106 Z" fill="url(#steelChrome)" stroke="#64748B" strokeWidth="0.6" />

      {/* Active Thread running through Needle */}
      <path d="M48 24 L48 88 L48.8 106" stroke="#FCD34D" strokeWidth="0.9" fill="none" />

      {/* ── Fabric Moving Under Foot ── */}
      {/* Folded garment fabric */}
      <path d="M26 107 C36 103, 46 104, 68 105 L96 105 C108 105, 118 106, 126 107.5 L124 112 H26 Z" fill="#9E593B" stroke="#B87150" strokeWidth="0.8" />
      {/* Fresh stitches row */}
      <line x1="28" y1="105.5" x2="66" y2="105.5" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2.5 2" strokeLinecap="round" />

      {/* ── Body Details: Stitch Dials & Badge ── */}
      {/* Rotary stitch length dial */}
      <circle cx="106" cy="62" r="8" fill="#131822" stroke="url(#goldAccent)" strokeWidth="1" />
      <circle cx="106" cy="62" r="5" fill="#1E2532" />
      <line x1="106" y1="57" x2="106" y2="60" stroke="#FCD34D" strokeWidth="1.2" strokeLinecap="round" />
      {/* Reverse stitch lever */}
      <rect x="98" y="78" width="16" height="3" rx="1.5" fill="url(#steelChrome)" />
      {/* Atelier Gold Emblem */}
      <rect x="80" y="44" width="18" height="8" rx="2" fill="#131822" stroke="url(#goldAccent)" strokeWidth="0.8" />
      <text x="89" y="50" fontSize="5" fontWeight="bold" fill="#FCD34D" textAnchor="middle" letterSpacing="0.5">DARZI</text>

      {/* Atelier atmosphere sparkles */}
      <text x="30" y="42" fontSize="12" fill="#FCD34D" fillOpacity="0.85">✦</text>
      <text x="165" y="32" fontSize="8" fill="#FFFFFF" fillOpacity="0.5">✦</text>
      <text x="168" y="104" fontSize="10" fill="#FCD34D" fillOpacity="0.75">✦</text>
      <text x="25" y="85" fontSize="7" fill="#FCD34D" fillOpacity="0.6">✦</text>
    </svg>
  )
}
