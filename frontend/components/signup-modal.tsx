'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, Eye, EyeOff, LogOut, Mail, Phone, X } from 'lucide-react'
import { toast } from 'react-toastify'
import type { User as UserType } from './data'
import {
  getStudioUrl,
  linkPhone,
  loginWithGoogle,
  sendOtp,
  sendEmailOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  signUpUser,
  checkPhoneExists,
} from '@/lib/api'
import {
  setAuthUser,
  setAuthRole,
  setAuthToken,
  getAuthToken,
  setRefreshToken,
  getRefreshToken,
  decodeJwtPayload,
} from '@/lib/cookies'
import { RaffuLogo } from './raffu-logo'

type SignUpMode = 'role-select' | 'customer-signup' | 'studio-options' | 'link-phone'

export interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserType) => void
  onSwitchToLogin?: () => void
  onSignOut?: () => void
  targetRole?: 'CUSTOMER' | 'STUDIO'
  currentUser?: UserType | null
  mandatoryPhoneRequired?: boolean
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  ''

export function SignUpModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
  onSignOut,
  targetRole = 'CUSTOMER',
  currentUser,
  mandatoryPhoneRequired = false,
}: SignUpModalProps) {
  const isMissingPhone = Boolean(mandatoryPhoneRequired || (currentUser && !currentUser.phone))
  const [mode, setMode] = useState<SignUpMode>(
    isMissingPhone ? 'link-phone' : targetRole === 'STUDIO' ? 'studio-options' : 'role-select'
  )
  const [loading, setLoading] = useState(false)

  // Pending user for linking
  const [pendingUser, setPendingUser] = useState<UserType | null>(currentUser || null)
  const [avatarError, setAvatarError] = useState(false)

  // Customer Signup form fields
  const [cName, setCName] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [isEmailOtpOpen, setIsEmailOtpOpen] = useState(false)
  const [emailOtp, setEmailOtp] = useState('')
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false)
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false)
  const [emailCountdown, setEmailCountdown] = useState(0)

  const [cPhone, setCPhone] = useState('')
  const [isPhoneOtpOpen, setIsPhoneOtpOpen] = useState(false)
  const [phoneOtp, setPhoneOtp] = useState('')
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false)
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false)
  const [phoneCountdown, setPhoneCountdown] = useState(0)

  const [cPassword, setCPassword] = useState('')
  const [cConfirmPassword, setCConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Studio Email Signup form fields
  const [isStudioEmailOpen, setIsStudioEmailOpen] = useState(false)
  const [sEmail, setSEmail] = useState('')
  const [isSEmailOtpOpen, setIsSEmailOtpOpen] = useState(false)
  const [sEmailOtp, setSEmailOtp] = useState('')
  const [isSEmailVerified, setIsSEmailVerified] = useState(false)
  const [isSendingSEmailOtp, setIsSendingSEmailOtp] = useState(false)
  const [isVerifyingSEmailOtp, setIsVerifyingSEmailOtp] = useState(false)
  const [sEmailCountdown, setSEmailCountdown] = useState(0)

  const [sPassword, setSPassword] = useState('')
  const [sConfirmPassword, setSConfirmPassword] = useState('')
  const [showSPassword, setShowSPassword] = useState(false)
  const [showSConfirmPassword, setShowSConfirmPassword] = useState(false)

  // Mandatory Mobile Link fields
  const [linkPhoneVal, setLinkPhoneVal] = useState('')
  const [linkOtpSent, setLinkOtpSent] = useState(false)
  const [linkOtp, setLinkOtp] = useState('')
  const [linkCountdown, setLinkCountdown] = useState(0)
  const isSendingLinkOtpRef = useRef(false)

  // Countdowns
  useEffect(() => {
    if (emailCountdown <= 0) return
    const interval = setInterval(() => {
      setEmailCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [emailCountdown])

  useEffect(() => {
    if (phoneCountdown <= 0) return
    const interval = setInterval(() => {
      setPhoneCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [phoneCountdown])

  useEffect(() => {
    if (sEmailCountdown <= 0) return
    const interval = setInterval(() => {
      setSEmailCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [sEmailCountdown])

  useEffect(() => {
    if (linkCountdown <= 0) return
    const interval = setInterval(() => {
      setLinkCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [linkCountdown])

  // Reset fields on open / role change
  useEffect(() => {
    const missing = Boolean(mandatoryPhoneRequired || (currentUser && !currentUser.phone))
    if (missing) {
      setMode('link-phone')
      setPendingUser(currentUser || null)
    } else if (targetRole === 'STUDIO') {
      setMode('studio-options')
      setPendingUser(null)
    } else {
      setMode('role-select')
      setPendingUser(null)
    }
    setLoading(false)
    setAvatarError(false)
    setCName('')
    setCEmail('')
    setIsEmailOtpOpen(false)
    setEmailOtp('')
    setIsEmailVerified(false)
    setCPhone('')
    setIsPhoneOtpOpen(false)
    setPhoneOtp('')
    setIsPhoneVerified(false)
    setCPassword('')
    setCConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsStudioEmailOpen(false)
    setSEmail('')
    setIsSEmailOtpOpen(false)
    setSEmailOtp('')
    setIsSEmailVerified(false)
    setSPassword('')
    setSConfirmPassword('')
    setShowSPassword(false)
    setShowSConfirmPassword(false)
    setSEmailCountdown(0)
    setLinkPhoneVal('')
    setLinkOtpSent(false)
    setLinkOtp('')
  }, [isOpen, targetRole, currentUser, mandatoryPhoneRequired])

  const finalizeAuth = (
    user: UserType,
    role?: UserType['role'],
    token?: string,
    authCode?: string,
    refreshToken?: string
  ) => {
    const effectiveRt = refreshToken || getRefreshToken()
    if (effectiveRt) {
      setRefreshToken(effectiveRt)
    }
    const effectiveToken = token || getAuthToken()
    if (effectiveToken) {
      setAuthToken(effectiveToken)
    }

    const tokenRole = effectiveRt ? decodeJwtPayload(effectiveRt)?.role : null
    const effectiveRole = tokenRole || user.role || role || 'CUSTOMER'

    if (effectiveRole === 'STUDIO' || effectiveRole === 'TEMP_STUDIO') {
      setAuthRole(effectiveRole)
      setAuthUser({ ...user, role: effectiveRole })
      toast.success(
        `Welcome ${effectiveRole === 'TEMP_STUDIO' ? '' : 'back, '}${user.name || 'Studio Partner'}! Redirecting to Studio Portal...`,
        { position: 'top-center' }
      )
      onClose()

      const targetParam = effectiveRt || authCode || effectiveToken
      if (targetParam) {
        window.location.href = getStudioUrl('/auth/callback', targetParam)
      } else if (!user.studioName || !user.phone || user.status === 'INACTIVE' || effectiveRole === 'TEMP_STUDIO') {
        window.location.href = getStudioUrl('/?step=1')
      } else {
        window.location.href = getStudioUrl('/dashboard')
      }
      return
    }

    if (!user.phone) {
      setPendingUser(user)
      setMode('link-phone')
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

  // Google OAuth Signup
  const triggerGoogle = (roleToUse: 'CUSTOMER' | 'STUDIO' = 'CUSTOMER') => {
    setLoading(true)

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      setLoading(false)
      toast.info('Google sign-in service is initializing. Please try again.', { position: 'top-center' })
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
              toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
            } else {
              toast.error(`Google sign-in error: ${tokenResponse.error}`, { position: 'top-center' })
            }
            return
          }
          if (!tokenResponse?.access_token) {
            setLoading(false)
            toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
            return
          }
          try {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
            if (!profileRes.ok) throw new Error('Could not fetch Google profile.')
            const gProfile = await profileRes.json()
            if (!gProfile.email) throw new Error('No email found on Google account.')

            const result = await loginWithGoogle({
              email: gProfile.email,
              name: gProfile.name || gProfile.given_name || '',
              googleId: gProfile.sub,
              avatar: gProfile.picture,
              accessToken: tokenResponse.access_token,
              role: roleToUse,
              flow: 'signup',
              isSignup: true,
            })

            setLoading(false)
            if (result?.user) {
              finalizeAuth(result.user, result.user.role || roleToUse, result.token, result.authCode, result.refreshToken)
            }
          } catch (err: any) {
            setLoading(false)
            toast.error(err.message || 'Google sign-up failed.', { position: 'top-center' })
          }
        },
      })
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } catch {
      setLoading(false)
      toast.error('Could not initialize Google sign-up popup.', { position: 'top-center' })
    }
  }

  // --- Email OTP Handlers ---
  const handleSendEmailOtp = async (isResend = false) => {
    const cleanEmail = cEmail.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address.', { position: 'top-center' })
      return
    }
    setIsSendingEmailOtp(true)
    try {
      const res = await sendEmailOtp(cleanEmail)
      setIsEmailOtpOpen(true)
      setEmailCountdown(60)
      toast.success(res.message || 'Verification code sent to your email! Valid for 10 minutes.', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email verification code.', { position: 'top-center' })
    } finally {
      setIsSendingEmailOtp(false)
    }
  }

  const handleVerifyEmailOtp = async () => {
    const cleanEmail = cEmail.trim().toLowerCase()
    const cleanOtp = emailOtp.trim()
    if (cleanOtp.length !== 4) {
      toast.error('Please enter the 4-digit code.', { position: 'top-center' })
      return
    }
    setIsVerifyingEmailOtp(true)
    try {
      await verifyEmailOtp(cleanEmail, cleanOtp)
      setIsEmailVerified(true)
      setIsEmailOtpOpen(false)
      setEmailOtp('')
      toast.success('Email verified successfully!', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired verification code.', { position: 'top-center' })
    } finally {
      setIsVerifyingEmailOtp(false)
    }
  }

  // --- Phone OTP Handlers ---
  const handleSendPhoneOtp = async (isResend = false) => {
    const cleanPhone = cPhone.replace(/[^\d+]/g, '').trim()
    if (!cleanPhone || cleanPhone.length < 7) {
      toast.error('Please enter a valid mobile number with country code.', { position: 'top-center' })
      return
    }
    setIsSendingPhoneOtp(true)
    try {
      const res = await sendOtp(cleanPhone, isResend)
      setIsPhoneOtpOpen(true)
      setPhoneCountdown(60)
      toast.success(res.message || 'Verification code sent! Valid for 10 minutes.', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to send mobile verification code.', { position: 'top-center' })
    } finally {
      setIsSendingPhoneOtp(false)
    }
  }

  const handleVerifyPhoneOtp = async () => {
    const cleanPhone = cPhone.replace(/[^\d+]/g, '').trim()
    const cleanOtp = phoneOtp.trim()
    if (cleanOtp.length !== 4) {
      toast.error('Please enter the 4-digit code.', { position: 'top-center' })
      return
    }
    setIsVerifyingPhoneOtp(true)
    try {
      await verifyPhoneOtp(cleanPhone, cleanOtp)
      setIsPhoneVerified(true)
      setIsPhoneOtpOpen(false)
      setPhoneOtp('')
      toast.success('Mobile number verified successfully!', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired verification code.', { position: 'top-center' })
    } finally {
      setIsVerifyingPhoneOtp(false)
    }
  }

  // --- Customer Final Sign Up ---
  const handleCustomerSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = cName.trim()
    const cleanEmail = cEmail.trim().toLowerCase()
    const cleanPhone = cPhone.replace(/[^\d+]/g, '').trim()

    if (!cleanName) {
      toast.error('Please enter your full name.', { position: 'top-center' })
      return
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address.', { position: 'top-center' })
      return
    }
    if (!isEmailVerified) {
      toast.error('Please verify your email address before creating an account.', { position: 'top-center' })
      return
    }

    if (!cleanPhone || cleanPhone.length < 7) {
      toast.error('Please enter a valid mobile number.', { position: 'top-center' })
      return
    }
    if (!isPhoneVerified) {
      toast.error('Please verify your mobile number before creating an account.', { position: 'top-center' })
      return
    }

    if (!cPassword || cPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.', { position: 'top-center' })
      return
    }
    if (cPassword !== cConfirmPassword) {
      toast.error('Passwords do not match.', { position: 'top-center' })
      return
    }

    setLoading(true)
    try {
      const result = await signUpUser({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cPassword.trim(),
        role: 'CUSTOMER',
      })
      setLoading(false)
      if (result?.user) {
        finalizeAuth(result.user, 'CUSTOMER', result.token, result.authCode, result.refreshToken)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'Account creation failed. Please try again.', { position: 'top-center' })
    }
  }

  // --- Studio Email OTP Handlers ---
  const handleSendStudioEmailOtp = async (isResend = false) => {
    const cleanEmail = sEmail.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address.', { position: 'top-center' })
      return
    }
    setIsSendingSEmailOtp(true)
    try {
      const res = await sendEmailOtp(cleanEmail)
      setIsSEmailOtpOpen(true)
      setSEmailCountdown(60)
      toast.success(res.message || 'Verification code sent to your email! Valid for 10 minutes.', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email verification code.', { position: 'top-center' })
    } finally {
      setIsSendingSEmailOtp(false)
    }
  }

  const handleVerifyStudioEmailOtp = async () => {
    const cleanEmail = sEmail.trim().toLowerCase()
    const cleanOtp = sEmailOtp.trim()
    if (cleanOtp.length !== 4) {
      toast.error('Please enter the 4-digit code.', { position: 'top-center' })
      return
    }
    setIsVerifyingSEmailOtp(true)
    try {
      await verifyEmailOtp(cleanEmail, cleanOtp)
      setIsSEmailVerified(true)
      setIsSEmailOtpOpen(false)
      setSEmailOtp('')
      toast.success('Email verified successfully!', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired verification code.', { position: 'top-center' })
    } finally {
      setIsVerifyingSEmailOtp(false)
    }
  }

  // --- Studio Final Sign Up ---
  const handleStudioSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = sEmail.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address.', { position: 'top-center' })
      return
    }
    if (!isSEmailVerified) {
      toast.error('Please verify your email address before creating an account.', { position: 'top-center' })
      return
    }

    if (!sPassword || sPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.', { position: 'top-center' })
      return
    }
    if (sPassword !== sConfirmPassword) {
      toast.error('Passwords do not match.', { position: 'top-center' })
      return
    }

    setLoading(true)
    try {
      const result = await signUpUser({
        email: cleanEmail,
        password: sPassword.trim(),
        role: 'STUDIO',
      })
      setLoading(false)
      if (result?.user) {
        finalizeAuth(result.user, result.user.role || 'STUDIO', result.token, result.authCode, result.refreshToken)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'Studio account creation failed. Please try again.', { position: 'top-center' })
    }
  }

  // Mandatory Phone Linking OTP Handlers
  const handleSendLinkOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault()
    const clean = linkPhoneVal.replace(/[^\d+]/g, '').trim()
    if (!clean || clean.length < 7) {
      toast.error('Please enter a valid phone number with country code.', { position: 'top-center' })
      return
    }

    if (isSendingLinkOtpRef.current) return
    isSendingLinkOtpRef.current = true
    setLoading(true)

    try {
      if (!isResend) {
        const check = await checkPhoneExists(clean)
        if (check.exists) {
          setLoading(false)
          isSendingLinkOtpRef.current = false
          toast.error('This phone number is already associated with another account.', { position: 'top-center' })
          return
        }
      }

      await sendOtp(clean, isResend)
      setLinkOtpSent(true)
      setLinkCountdown(30)
      toast.success('Verification code sent! Valid for 10 minutes.', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification code.', { position: 'top-center' })
    } finally {
      setLoading(false)
      isSendingLinkOtpRef.current = false
    }
  }

  const handleVerifyLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = linkPhoneVal.replace(/[^\d+]/g, '').trim()
    const cleanOtp = linkOtp.trim()
    if (cleanOtp.length !== 4) {
      toast.error('Please enter the 4-digit code.', { position: 'top-center' })
      return
    }

    setLoading(true)
    try {
      const targetUid = pendingUser?.id || currentUser?.id
      const res = await linkPhone({ phone: clean, otp: cleanOtp, userId: targetUid })
      setLoading(false)
      if (res?.user) {
        setPendingUser(null)
        onSuccess(res.user)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'Invalid verification code.', { position: 'top-center' })
    }
  }

  const goBack = () => {
    if (mode === 'customer-signup' || mode === 'studio-options' || mode === 'link-phone') {
      setMode('role-select')
      setPendingUser(null)
    } else {
      setMode('role-select')
    }
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
      <div className="relative w-full max-w-[400px] rounded-2xl bg-white shadow-xl border border-[#E8E1D5] overflow-hidden transition-all duration-200">
        {/* Top Controls: Back button & Close Button */}
        {isSubPage && (
          <button
            onClick={goBack}
            className="absolute top-4 left-4 z-20 size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#18191B] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
          </button>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#7A7E85] hover:text-[#18191B] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        <div className="px-6 pb-6 pt-11 space-y-3.5">
          {/* ── ROLE SELECTION SCREEN ── */}
          {mode === 'role-select' && (
            <div className="space-y-3.5">
              <div className="text-center">
                <h2 className="font-serif text-[20px] font-bold text-[#18191B] tracking-tight leading-tight">
                  How are you joining?
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  Choose your role to get started with Raffu.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Customer Card */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('customer-signup')
                  }}
                  className="group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#9E593B] hover:bg-white p-3 transition-all duration-200 hover:shadow-md text-left cursor-pointer"
                >
                  <div className="w-full h-[120px] rounded-xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center relative border border-[#E8E1D5]/60 shadow-inner">
                    <img
                      src="/role-customer.jpg"
                      alt="Customer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-[13px] font-bold text-[#18191B] group-hover:text-[#9E593B] transition-colors">
                      I'm a Customer
                    </p>
                    <p className="text-[10px] text-[#7A7E85] mt-0.5 leading-snug">
                      Book alterations & fittings
                    </p>
                  </div>
                </button>

                {/* Studio Partner Card */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('studio-options')
                  }}
                  className="group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 border-[#E8E1D5] bg-[#FAF8F5] hover:border-[#0F1115] hover:bg-white p-3 transition-all duration-200 hover:shadow-md text-left cursor-pointer"
                >
                  <div className="w-full h-[120px] rounded-xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center relative border border-[#E8E1D5]/60 shadow-inner">
                    <img
                      src="/role-studio.jpg"
                      alt="Studio Partner"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-[13px] font-bold text-[#18191B] group-hover:text-[#0F1115] transition-colors">
                      Studio Partner
                    </p>
                    <p className="text-[10px] text-[#7A7E85] mt-0.5 leading-snug">
                      List atelier & workbench
                    </p>
                  </div>
                </button>
              </div>

              {/* Already have an account? Log In */}
              <div className="pt-1 text-center">
                <span className="text-xs text-[#7A7E85]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToLogin) onSwitchToLogin()
                  }}
                  className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] hover:underline cursor-pointer ml-1"
                >
                  Log In
                </button>
              </div>

              <p className="text-center text-[10px] text-[#9CA3AF]">
                By continuing you agree with our terms and condition thing.
              </p>
            </div>
          )}

          {/* ── CUSTOMER SIGN UP FORM ── */}
          {mode === 'customer-signup' && (
            <div className="space-y-3">
              <div>
                <h2 className="font-serif text-[20px] font-bold text-[#18191B] tracking-tight">
                  Sign Up to Raffu
                </h2>
              </div>

              <form onSubmit={handleCustomerSignUp} className="space-y-2.5">
                {/* 1. Full Name Input Area */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                  />
                </div>

                {/* 2. Email Address Input Area with In-Place Flip */}
                <div>
                  {!isEmailOtpOpen ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64]">
                          Email Address
                        </label>
                        {isEmailVerified && (
                          <span className="text-[11px] font-semibold text-emerald-600">✓ Verified</span>
                        )}
                      </div>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={cEmail}
                        disabled={isEmailVerified}
                        onChange={(e) => {
                          setCEmail(e.target.value)
                          if (isEmailVerified) setIsEmailVerified(false)
                        }}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors disabled:bg-[#FAF8F5] disabled:text-[#5A5D64]"
                      />
                      {!isEmailVerified && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={isSendingEmailOtp}
                            onClick={() => handleSendEmailOtp(false)}
                            className="text-xs text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer disabled:opacity-50"
                          >
                            {isSendingEmailOtp ? 'Sending code…' : 'Send OTP'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64]">
                          Verify Email Address
                        </label>
                        <span className="text-[10px] text-[#7A7E85]">Valid for 10 minutes</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        autoFocus
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter email otp for verification"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (emailOtp.length === 4) handleVerifyEmailOtp()
                          }
                        }}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailOtpOpen(false)
                            setEmailOtp('')
                          }}
                          className="text-xs text-[#7A7E85] hover:text-[#18191B] underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <div className="flex items-center gap-3">
                          {emailCountdown > 0 ? (
                            <span className="text-xs text-[#9CA3AF]">Resend in {emailCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              disabled={isSendingEmailOtp}
                              onClick={() => handleSendEmailOtp(true)}
                              className="text-xs text-[#7A7E85] hover:text-[#18191B] underline cursor-pointer"
                            >
                              Resend
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isVerifyingEmailOtp || emailOtp.length !== 4}
                            onClick={handleVerifyEmailOtp}
                            className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer disabled:opacity-40"
                          >
                            {isVerifyingEmailOtp ? 'Verifying…' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Mobile Number Input Area with In-Place Flip */}
                <div>
                  {!isPhoneOtpOpen ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64]">
                          Mobile Number
                        </label>
                        {isPhoneVerified && (
                          <span className="text-[11px] font-semibold text-emerald-600">✓ Verified</span>
                        )}
                      </div>
                      <input
                        type="tel"
                        required
                        value={cPhone}
                        disabled={isPhoneVerified}
                        onChange={(e) => {
                          setCPhone(e.target.value.replace(/[^\d+ ]/g, ''))
                          if (isPhoneVerified) setIsPhoneVerified(false)
                        }}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors disabled:bg-[#FAF8F5] disabled:text-[#5A5D64]"
                      />
                      {!isPhoneVerified && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={isSendingPhoneOtp}
                            onClick={() => handleSendPhoneOtp(false)}
                            className="text-xs text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer disabled:opacity-50"
                          >
                            {isSendingPhoneOtp ? 'Sending code…' : 'Send OTP'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64]">
                          Verify Mobile Number
                        </label>
                        <span className="text-[10px] text-[#7A7E85]">Valid for 10 minutes</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        autoFocus
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter mobile otp for verification"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (phoneOtp.length === 4) handleVerifyPhoneOtp()
                          }
                        }}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPhoneOtpOpen(false)
                            setPhoneOtp('')
                          }}
                          className="text-xs text-[#7A7E85] hover:text-[#18191B] underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <div className="flex items-center gap-3">
                          {phoneCountdown > 0 ? (
                            <span className="text-xs text-[#9CA3AF]">Resend in {phoneCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              disabled={isSendingPhoneOtp}
                              onClick={() => handleSendPhoneOtp(true)}
                              className="text-xs text-[#7A7E85] hover:text-[#18191B] underline cursor-pointer"
                            >
                              Resend
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isVerifyingPhoneOtp || phoneOtp.length !== 4}
                            onClick={handleVerifyPhoneOtp}
                            className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer disabled:opacity-40"
                          >
                            {isVerifyingPhoneOtp ? 'Verifying…' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Password Input Area */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#DDD6CB] bg-white pl-3 pr-9 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#18191B] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm Password Input Area */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={cConfirmPassword}
                      onChange={(e) => setCConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-[#DDD6CB] bg-white pl-3 pr-9 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#18191B] transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* 6. Create Account / Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer mt-1"
                >
                  {loading ? 'Creating Account…' : 'Sign Up'}
                </button>
              </form>

              {/* 7. OR Divider & Sign up with Google */}
              <div>
                <Divider />
                <GoogleButton
                  label="Sign up with Google"
                  loading={loading}
                  onClick={() => triggerGoogle('CUSTOMER')}
                  bordered
                />
              </div>

              {/* 8. Terms & Conditions disclaimer */}
              <p className="text-center text-[10px] text-[#9CA3AF] pt-0.5">
                By continuing you agree with our terms and condition thing.
              </p>

              {/* 9. Switch to Log In */}
              <div className="text-center pt-0.5">
                <span className="text-xs text-[#7A7E85]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToLogin) onSwitchToLogin()
                  }}
                  className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] hover:underline cursor-pointer ml-1"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* ── STUDIO SIGN UP FORM ── */}
          {mode === 'studio-options' && (
            <div className="space-y-3">
              <div>
                <h2 className="font-serif text-[20px] font-bold text-[#18191B] tracking-tight">
                  Sign Up as Studio
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  List yourself on Raffu
                </p>
              </div>

              <form onSubmit={handleStudioSignUp} className="space-y-2.5">
                {/* 1. Email Address Input Area with In-Place Flip */}
                <div>
                  {!isSEmailOtpOpen ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64]">
                          Email Address
                        </label>
                        {isSEmailVerified && (
                          <span className="text-[11px] font-semibold text-emerald-600">✓ Verified</span>
                        )}
                      </div>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={sEmail}
                        disabled={isSEmailVerified}
                        onChange={(e) => {
                          setSEmail(e.target.value)
                          if (isSEmailVerified) setIsSEmailVerified(false)
                        }}
                        placeholder="Enter studio email"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors disabled:bg-[#FAF8F5] disabled:text-[#5A5D64]"
                      />
                      {!isSEmailVerified && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={isSendingSEmailOtp}
                            onClick={() => handleSendStudioEmailOtp(false)}
                            className="text-xs text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer disabled:opacity-50"
                          >
                            {isSendingSEmailOtp ? 'Sending code…' : 'Send OTP'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64]">
                          Verify Email Address
                        </label>
                        <span className="text-[10px] text-[#7A7E85]">Valid for 10 minutes</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        autoFocus
                        value={sEmailOtp}
                        onChange={(e) => setSEmailOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter email otp for verification"
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (sEmailOtp.length === 4) handleVerifyStudioEmailOtp()
                          }
                        }}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSEmailOtpOpen(false)
                            setSEmailOtp('')
                          }}
                          className="text-xs text-[#7A7E85] hover:text-[#18191B] underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <div className="flex items-center gap-3">
                          {sEmailCountdown > 0 ? (
                            <span className="text-xs text-[#9CA3AF]">Resend in {sEmailCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              disabled={isSendingSEmailOtp}
                              onClick={() => handleSendStudioEmailOtp(true)}
                              className="text-xs text-[#7A7E85] hover:text-[#18191B] underline cursor-pointer"
                            >
                              Resend
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isVerifyingSEmailOtp || sEmailOtp.length !== 4}
                            onClick={handleVerifyStudioEmailOtp}
                            className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] underline cursor-pointer disabled:opacity-40"
                          >
                            {isVerifyingSEmailOtp ? 'Verifying…' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Password Input Area */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSPassword ? 'text' : 'password'}
                      required
                      value={sPassword}
                      onChange={(e) => setSPassword(e.target.value)}
                      placeholder="Enter password (min. 6 characters)"
                      className="w-full rounded-xl border border-[#DDD6CB] bg-white pl-3 pr-9 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSPassword(!showSPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#18191B] transition-colors cursor-pointer"
                      aria-label={showSPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm Password Input Area */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSConfirmPassword ? 'text' : 'password'}
                      required
                      value={sConfirmPassword}
                      onChange={(e) => setSConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-[#DDD6CB] bg-white pl-3 pr-9 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSConfirmPassword(!showSConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#18191B] transition-colors cursor-pointer"
                      aria-label={showSConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* 4. Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer mt-1"
                >
                  {loading ? 'Creating Studio Account…' : 'Sign Up'}
                </button>
              </form>

              {/* 5. OR Divider & Sign up with Google */}
              <div>
                <Divider />
                <GoogleButton
                  label="Sign up with Google"
                  loading={loading}
                  onClick={() => triggerGoogle('STUDIO')}
                  bordered
                />
              </div>

              {/* 6. Terms & Conditions disclaimer */}
              <p className="text-center text-[10px] text-[#9CA3AF] pt-0.5">
                By continuing you agree with our terms and condition thing.
              </p>

              {/* 7. Switch to Log In */}
              <div className="text-center pt-0.5">
                <span className="text-xs text-[#7A7E85]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToLogin) onSwitchToLogin()
                  }}
                  className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] hover:underline cursor-pointer ml-1"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* ── MANDATORY PHONE LINK ── */}
          {mode === 'link-phone' && (
            <div className="space-y-3">
              {!linkOtpSent ? (
                <>
                  <div>
                    <h2 className="font-serif text-[20px] font-bold text-[#18191B] tracking-tight">
                      Link mobile number
                    </h2>
                    <p className="text-xs text-[#7A7E85] mt-1">
                      Required for alteration booking updates and notifications.
                    </p>
                  </div>

                  {activeUser && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-7 rounded-full overflow-hidden shrink-0 bg-[#18191B] text-white text-xs font-bold grid place-items-center border border-[#E8E1D5]">
                          {activeUser.avatar && !avatarError ? (
                            <Image
                              src={activeUser.avatar}
                              alt={activeUser.name || 'User avatar'}
                              width={28}
                              height={28}
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

                  <form onSubmit={handleSendLinkOtp} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
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
                        className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3 py-2 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer"
                    >
                      {loading ? 'Sending code…' : 'Send Verification Code'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="font-serif text-[20px] font-bold text-[#18191B] tracking-tight">
                      Enter verification code
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-[#7A7E85]">
                      <span>Sent to <strong className="text-[#18191B] font-semibold">{linkPhoneVal}</strong></span>
                      <span>(valid 10 mins)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkOtpSent(false)
                          setLinkOtp('')
                        }}
                        className="text-[#9E593B] font-semibold hover:underline cursor-pointer ml-auto"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyLinkPhone} className="space-y-3 pt-1">
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
                        className="w-full text-center text-xl font-mono font-bold tracking-[0.3em] rounded-xl border border-[#DDD6CB] bg-white py-2.5 focus:border-[#9E593B] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer"
                    >
                      {loading ? 'Verifying…' : 'Verify & Continue'}
                    </button>
                    <div className="text-center pt-0.5">
                      <button
                        type="button"
                        disabled={loading || linkCountdown > 0}
                        onClick={() => handleSendLinkOtp(undefined, true)}
                        className="text-xs text-[#9E593B] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        {linkCountdown > 0 ? `Resend (${linkCountdown}s)` : 'Resend code'}
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
                      setMode('role-select')
                      setPendingUser(null)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7A7E85] hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Sign out or use different account</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="relative my-2.5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E8E1D5]" />
      </div>
      <div className="relative flex justify-center text-[10px] uppercase">
        <span className="bg-white px-3 text-[#9CA3AF] font-bold tracking-wider">or</span>
      </div>
    </div>
  )
}

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
      disabled={loading}
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-2 px-3.5 text-[13px] font-semibold transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] ${bordered
          ? 'bg-white hover:bg-[#FAF8F5] border border-[#E8E1D5] text-[#18191B]'
          : 'bg-[#0F1115] hover:bg-[#1e2229] text-white shadow-xs'
        }`}
    >
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
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}
