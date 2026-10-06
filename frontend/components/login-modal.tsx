'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, LogOut, Mail, Phone, X } from 'lucide-react'
import { toast } from 'react-toastify'
import type { User as UserType } from './data'
import { getStudioUrl, linkPhone, loginUser, loginWithGoogle, sendOtp, verifyOtp, checkPhoneExists } from '@/lib/api'
import { setAuthUser, setAuthRole, setAuthToken } from '@/lib/cookies'

type LoginMode = 'options' | 'email' | 'mobile' | 'link-phone'

export interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserType) => void
  onSwitchToSignUp?: () => void
  onSignOut?: () => void
  targetRole?: 'CUSTOMER' | 'STUDIO'
  currentUser?: UserType | null
  mandatoryPhoneRequired?: boolean
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

export function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToSignUp,
  onSignOut,
  targetRole = 'CUSTOMER',
  currentUser,
  mandatoryPhoneRequired = false,
}: LoginModalProps) {
  const isMissingPhone = Boolean(mandatoryPhoneRequired || (currentUser && !currentUser.phone))
  const [mode, setMode] = useState<LoginMode>(isMissingPhone ? 'link-phone' : 'options')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const isSendingOtpRef = useRef(false)
  const isSendingLinkOtpRef = useRef(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (resendCountdown <= 0) return
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCountdown])

  // Pending User awaiting Mobile Number linking
  const [pendingUser, setPendingUser] = useState<UserType | null>(currentUser || null)
  const [avatarError, setAvatarError] = useState(false)

  // Login inputs
  const [cEmail, setCEmail] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cOtpSent, setCOtpSent] = useState(false)
  const [cOtp, setCOtp] = useState('')

  // Mandatory Mobile Link inputs
  const [linkPhoneVal, setLinkPhoneVal] = useState('')
  const [linkOtpSent, setLinkOtpSent] = useState(false)
  const [linkOtp, setLinkOtp] = useState('')

  // Reset on open / role / currentUser switch
  useEffect(() => {
    const missing = Boolean(mandatoryPhoneRequired || (currentUser && !currentUser.phone))
    if (missing) {
      setMode('link-phone')
      setPendingUser(currentUser || null)
    } else {
      setMode('options')
      setPendingUser(null)
    }
    setNotice('')
    setLoading(false)
    setAvatarError(false)
    setCOtpSent(false)
    setCOtp('')
    setLinkOtpSent(false)
    setLinkOtp('')
  }, [isOpen, targetRole, currentUser, mandatoryPhoneRequired])

  const finalizeAuth = (user: UserType, role?: UserType['role'], token?: string, authCode?: string) => {
    const effectiveRole = user.role || role || 'CUSTOMER'
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null)

    if (effectiveRole === 'STUDIO' || effectiveRole === 'TEMP_STUDIO') {
      if (effectiveToken) {
        setAuthToken(effectiveToken)
      }
      setAuthRole(effectiveRole)
      setAuthUser(user)
      toast.success(`Welcome ${effectiveRole === 'TEMP_STUDIO' ? '' : 'back, '}${user.name || 'Studio Partner'}! Redirecting to Studio Portal...`, { position: 'top-center' })
      onClose()

      const targetParam = authCode || effectiveToken
      if (targetParam) {
        window.location.href = getStudioUrl('/auth/callback', targetParam)
      } else if (!user.studioName || !user.phone || user.status === 'INACTIVE' || effectiveRole === 'TEMP_STUDIO') {
        window.location.href = getStudioUrl('/?step=1')
      } else {
        window.location.href = getStudioUrl('/')
      }
      return
    }

    if (!user.phone) {
      setPendingUser(user)
      setMode('link-phone')
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

  // Google OAuth Login
  const triggerGoogle = (roleToUse: 'CUSTOMER' | 'STUDIO' = targetRole) => {
    setLoading(true)
    setNotice('')

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
              flow: 'login',
              isLogin: true,
            })

            setLoading(false)
            if (result?.isNewUser || !result?.user) {
              const msg = 'No account with Google Id , please sign up'
              setNotice(msg)
              toast.error(msg, { position: 'top-center' })
              return
            }

            if (result?.user) {
              finalizeAuth(result.user, result.user.role || roleToUse, result.token, result.authCode)
            }
          } catch (err: any) {
            setLoading(false)
            const rawMsg = err.message || ''
            const msg = rawMsg.includes('No account with Google Id') || rawMsg.includes('sign up')
              ? 'No account with Google Id , please sign up'
              : rawMsg.includes('Failed to retrieve email')
              ? 'No account with Google Id , please sign up'
              : rawMsg || 'No account with Google Id , please sign up'
            setNotice(msg)
            toast.error(msg, { position: 'top-center' })
          }
        },
      })
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } catch {
      setLoading(false)
      toast.error('Could not initialize Google login popup.', { position: 'top-center' })
    }
  }

  // Send Mobile OTP for Login
  const handleSendMobileOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault()
    const cleanPhone = cPhone.replace(/[^\d+]/g, '').trim()
    if (!cleanPhone || cleanPhone.length < 7) {
      toast.error('Please enter a valid phone number with country code.', { position: 'top-center' })
      return
    }

    if (isSendingOtpRef.current) return
    isSendingOtpRef.current = true
    setIsSendingOtp(true)
    setLoading(true)

    try {
      if (!isResend) {
        const check = await checkPhoneExists(cleanPhone)
        if (!check.exists) {
          setLoading(false)
          setIsSendingOtp(false)
          isSendingOtpRef.current = false
          toast.info('No account found with this number. Please sign up first.', { position: 'top-center' })
          return
        }
      }

      await sendOtp(cleanPhone, isResend)
      setCOtpSent(true)
      setResendCountdown(30)
      setNotice(`OTP code sent to ${cleanPhone}`)
      toast.success('Verification code sent!', { position: 'top-center' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP code.', { position: 'top-center' })
    } finally {
      setLoading(false)
      setIsSendingOtp(false)
      isSendingOtpRef.current = false
    }
  }

  // Verify Mobile OTP for Login
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cOtpSent) {
      await handleSendMobileOtp(e)
      return
    }

    const cleanPhone = cPhone.replace(/[^\d+]/g, '').trim()
    const cleanOtp = cOtp.trim()
    if (cleanOtp.length !== 4) {
      toast.error('Please enter the complete 4-digit code.', { position: 'top-center' })
      return
    }

    setLoading(true)
    try {
      const result = await verifyOtp({
        phone: cleanPhone,
        otp: cleanOtp,
        role: targetRole,
      })
      setLoading(false)
      if (result?.user) {
        finalizeAuth(result.user, result.user.role || targetRole, result.token, result.authCode)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'Invalid or expired OTP code.', { position: 'top-center' })
    }
  }

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = cEmail.trim()
    if (!cleanEmail) {
      toast.error('Please enter your email address.', { position: 'top-center' })
      return
    }

    setLoading(true)
    try {
      const result = await loginUser({ identifier: cleanEmail })
      setLoading(false)
      if (result?.user) {
        finalizeAuth(result.user, result.user.role || targetRole, result.token, result.authCode)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'No account found with this email.', { position: 'top-center' })
    }
  }

  // Mandatory Phone Linking OTP
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
      setResendCountdown(30)
      toast.success('Verification code sent!', { position: 'top-center' })
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
    if (mode === 'mobile' || mode === 'email') {
      setMode('options')
    } else if (mode === 'link-phone') {
      setMode('options')
      setPendingUser(null)
    } else {
      setMode('options')
    }
    setNotice('')
  }

  if (!isOpen) return null

  const isSubPage = mode !== 'options'
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
      <div className="relative w-full max-w-[420px] rounded-3xl bg-white shadow-2xl border border-[#E8E1D5] overflow-hidden transition-all duration-200">

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

        {/* Header Logo */}
        <div className="flex items-center justify-center px-6 pt-7 pb-3">
          <img
            src="/bg_logo.png"
            alt="Darzi Logo"
            className="h-16 sm:h-20 max-h-24 w-auto object-contain transition-all duration-200"
          />
        </div>

        <div className="px-6 pb-6 pt-1 space-y-5">
          {/* ── ROOT LOGIN OPTIONS ── */}
          {mode === 'options' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[24px] font-bold text-[#18191B] tracking-tight leading-tight">
                  Login to Darzi
                </h2>
                <p className="text-xs text-[#7A7E85] mt-1">
                  Access your bespoke fitting passes, saved sizes, and orders.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <GoogleButton label="Login with Google" loading={loading} onClick={() => triggerGoogle(targetRole)} bordered />

                <button
                  type="button"
                  onClick={() => {
                    setNotice('')
                    setMode('mobile')
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <Phone size={14} className="text-[#9E593B]" />
                  <span>Login with Mobile Number</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNotice('')
                    setMode('email')
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] py-2.5 text-[13px] font-semibold text-[#18191B] transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <Mail size={14} className="text-[#9E593B]" />
                  <span>Login with Email</span>
                </button>
              </div>

              {/* OR Divider & Switch to Sign Up */}
              <div className="pt-2 space-y-2.5">
                <Divider />
                <div className="text-center">
                  <span className="text-xs text-[#7A7E85]">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchToSignUp) {
                        onSwitchToSignUp()
                      }
                    }}
                    className="text-xs font-bold text-[#9E593B] hover:text-[#7A4027] hover:underline cursor-pointer ml-1"
                  >
                    Sign Up →
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] text-[#9CA3AF] pt-1">
                By continuing you agree to our Terms &amp; Privacy Policy.
              </p>
            </div>
          )}

          {/* ── MOBILE OTP LOGIN ── */}
          {mode === 'mobile' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#18191B]">
                  Login with Mobile
                </h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">
                  Enter your registered mobile number to receive an OTP.
                </p>
              </div>

              <form onSubmit={handleVerifyMobileOtp} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value.replace(/[^\d+ ]/g, ''))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                  />
                </div>

                {cOtpSent && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                      Enter 4-digit code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      required
                      autoFocus
                      value={cOtp}
                      onChange={(e) => setCOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      className="w-full text-center text-xl font-mono font-bold tracking-[0.3em] rounded-xl border border-[#DDD6CB] bg-white py-2.5 focus:border-[#9E593B] focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isSendingOtp}
                  className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer"
                >
                  {loading ? 'Verifying…' : cOtpSent ? 'Verify & Login' : 'Send OTP Code'}
                </button>

                {cOtpSent && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      disabled={loading || resendCountdown > 0}
                      onClick={() => handleSendMobileOtp(undefined, true)}
                      className="text-xs text-[#9E593B] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ── EMAIL LOGIN ── */}
          {mode === 'email' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#18191B]">
                  Login with Email
                </h2>
                <p className="text-xs text-[#7A7E85] mt-0.5">
                  Enter your registered email address to access your account.
                </p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[13px] text-[#18191B] placeholder:text-[#9CA3AF] focus:border-[#9E593B] focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer"
                >
                  {loading ? 'Logging in…' : 'Log In'}
                </button>
              </form>
            </div>
          )}

          {/* ── MANDATORY PHONE LINK ── */}
          {mode === 'link-phone' && (
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
                      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer"
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
                          setNotice('')
                        }}
                        className="text-[#9E593B] font-semibold hover:underline cursor-pointer"
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
                      className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm cursor-pointer"
                    >
                      {loading ? 'Verifying…' : 'Verify & Continue'}
                    </button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        disabled={loading || resendCountdown > 0}
                        onClick={() => handleSendLinkOtp(undefined, true)}
                        className="text-xs text-[#9E593B] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
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
                      setMode('options')
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
    <div className="relative my-2">
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
      className={`w-full flex items-center justify-center gap-3 rounded-2xl py-3 px-4 text-[13.5px] font-semibold transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] ${
        bordered
          ? 'bg-white hover:bg-[#FAF8F5] border border-[#E8E1D5] text-[#18191B] shadow-2xs'
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
