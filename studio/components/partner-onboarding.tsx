'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  Store,
} from 'lucide-react'
import { toast } from 'react-toastify'
import type { User } from '@/components/data'
import {
  signUpUser,
  loginUser,
  loginWithGoogle,
  sendOtp,
  verifyOtp,
  checkEmailExists,
  CUSTOMER_SITE_URL,
} from '@/lib/api'
import { setAuthRole, setAuthToken } from '@/lib/cookies'
import { UberMapModal, SelectedLocationData } from './uber-map-modal'
import { AnimatedLocationPin } from './animated-location-pin'

interface PartnerOnboardingProps {
  user?: User | null
  onComplete?: (user: User) => void
  onSignOut?: () => void
  initialTab?: 'signin' | 'signup'
  hideHeader?: boolean
}

type Step = 'auth' | 'location' | 'language' | 'shop-info' | 'phone-verify' | 'hub'

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
  // ──────── Session-persisted state helpers ────────
  const ssGet = (key: string) => {
    if (typeof window === 'undefined') return null
    try { return sessionStorage.getItem(key) } catch { return null }
  }
  const ssSet = (key: string, val: string) => {
    if (typeof window !== 'undefined') try { sessionStorage.setItem(key, val) } catch { }
  }
  const ssRemove = (key: string) => {
    if (typeof window !== 'undefined') try { sessionStorage.removeItem(key) } catch { }
  }

  // Check if we have cached pending Google data from session / local storage
  const [pendingGoogle, setPendingGoogle] = useState<{
    tempSignupId?: string
    email?: string
    name?: string
    avatar?: string
  } | null>(() => {
    const stored = ssGet('tg_pending_google') || (typeof window !== 'undefined' ? localStorage.getItem('tg_pending_google') : null)
    return stored ? JSON.parse(stored) : null
  })

  // Auth Card State: single card with options, mobile, or email subviews
  const [signInMode, setSignInMode] = useState<'options' | 'mobile' | 'email'>('options')
  const [authLoading, setAuthLoading] = useState(false)

  // Double-submit locks
  const isSendingMobileOtpRef = useRef(false)
  const isSendingStep3OtpRef = useRef(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [step3Countdown, setStep3Countdown] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown <= 0 && step3Countdown <= 0) return
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
      setStep3Countdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCountdown, step3Countdown])

  // Sign In with Mobile fields
  const [sPhoneLogin, setSPhoneLogin] = useState('')
  const [sOtpSent, setSOtpSent] = useState(false)
  const [sOtp, setSOtp] = useState('')

  // Sign In with Email field
  const [sLoginEmail, setSLoginEmail] = useState('')

  // Multi-step Flow State — restore from URL ?step= first ONLY IF an authenticated or pending Google session exists
  const [currentStep, setCurrentStepRaw] = useState<Step>(() => {
    const cached = ssGet('tg_onboard_step')
    if (cached && ['auth', 'location', 'language', 'shop-info', 'phone-verify', 'hub'].includes(cached)) {
      return cached as Step
    }
    return 'location'
  })

  // Wrapper that also persists to storage and continuously syncs ?step=1, ?step=2, etc. in URL
  const setCurrentStep = (step: Step, pushHistory: boolean = false) => {
    setCurrentStepRaw(step)
    ssSet('tg_onboard_step', step)
  }

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  // ──────── Restore cached onboarding form data from storage (only for authenticated session) ────────
  const cachedForm = (() => {
    if (!user?.email && !pendingGoogle?.email) return null
    const raw = ssGet('tg_onboard_form') || (typeof window !== 'undefined' ? localStorage.getItem('tg_onboard_form') : null)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  })()

  // Step 1: Location & Referral (Image 2 - Earn with Darzi)
  const [locationCity, setLocationCity] = useState(cachedForm?.locationCity || '')
  const [referralCode, setReferralCode] = useState(cachedForm?.referralCode || '')

  // Step 2: Language & Capacity
  const [language, setLanguage] = useState(cachedForm?.language || 'English')
  const [machines, setMachines] = useState(cachedForm?.machines || '4-6')
  const [dailyCapacity, setDailyCapacity] = useState(cachedForm?.dailyCapacity || '25')

  // Step 3: Shop Info — only restore from storage (user's own typed data), never prefill from user object
  const [shopName, setShopName] = useState(cachedForm?.shopName || '')
  const [shopArea, setShopArea] = useState(cachedForm?.shopArea || '')
  const [postcode, setPostcode] = useState(cachedForm?.postcode || '')
  const [streetAddress, setStreetAddress] = useState(cachedForm?.streetAddress || '')
  const [tailorName, setTailorName] = useState(cachedForm?.tailorName || '')
  const [phone, setPhone] = useState(cachedForm?.phone || '')
  const [studioLat, setStudioLat] = useState<number | null>(cachedForm?.studioLat || null)
  const [studioLng, setStudioLng] = useState<number | null>(cachedForm?.studioLng || null)
  const [emailVal, setEmailVal] = useState(
    cachedForm?.emailVal || pendingGoogle?.email || user?.email || (typeof window !== 'undefined' ? localStorage.getItem('tg_onboard_email') : '') || ''
  )

  // Step 4 Direct Mobile Phone Twilio OTP Verification State
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    const cached = ssGet('tg_phone_verified') || (typeof window !== 'undefined' ? localStorage.getItem('tg_phone_verified') : null)
    if (cached === 'true') return true
    return Boolean(user?.phone)
  })
  const [step3VerifiedPhone, setStep3VerifiedPhone] = useState(() => {
    return ssGet('tg_verified_phone') || (typeof window !== 'undefined' ? localStorage.getItem('tg_verified_phone') : null) || user?.phone || ''
  })
  const [step3OtpSent, setStep3OtpSent] = useState(false)
  const [step3Otp, setStep3Otp] = useState('')
  const [step3OtpLoading, setStep3OtpLoading] = useState(false)

  // Submission & Error
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [alreadyRegisteredUser, setAlreadyRegisteredUser] = useState<User | null>(null)
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)

  useEffect(() => {
    const activeEmail = user?.email || pendingGoogle?.email
    if (activeEmail && !emailVal) {
      setEmailVal(activeEmail)
    }
  }, [pendingGoogle, user, emailVal])

  useEffect(() => {
    if (emailVal && typeof window !== 'undefined') {
      try { localStorage.setItem('tg_onboard_email', emailVal) } catch { }
    }
  }, [emailVal])

  // ──────── Persist form data to storage on every change ────────
  useEffect(() => {
    const formData = {
      locationCity, referralCode, language, machines, dailyCapacity,
      shopName, shopArea, postcode, streetAddress, tailorName, phone, emailVal,
      studioLat, studioLng,
    }
    ssSet('tg_onboard_form', JSON.stringify(formData))
  }, [locationCity, referralCode, language, machines, dailyCapacity, shopName, shopArea, postcode, streetAddress, tailorName, phone, emailVal, studioLat, studioLng])

  // Persist phone verification state
  useEffect(() => {
    ssSet('tg_phone_verified', isPhoneVerified ? 'true' : 'false')
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('tg_phone_verified', isPhoneVerified ? 'true' : 'false') } catch { }
    }
  }, [isPhoneVerified])
  useEffect(() => {
    if (step3VerifiedPhone) {
      ssSet('tg_verified_phone', step3VerifiedPhone)
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('tg_verified_phone', step3VerifiedPhone) } catch { }
      }
    }
  }, [step3VerifiedPhone])

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

            // If existing registered studio user in Prisma with complete atelier and phone -> sign in directly
            if (!result.isNewUser && result.user && result.user.status === 'ACTIVE' && result.user.studioName && result.user.phone) {
              if (result.user.role && result.user.role !== 'STUDIO') {
                setError('This Google account is registered as a Customer. Please use a Studio partner account.')
                return
              }
              if (typeof window !== 'undefined') {
                setAuthRole('STUDIO')
                if (result.token) setAuthToken(result.token)
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

            // Only set email from Google — don't prefill name or shop
            if (profile.email) setEmailVal(profile.email)

            // Clear stale form cache — start fresh registration
            ssRemove('tg_onboard_form')
            ssRemove('tg_phone_verified')
            ssRemove('tg_verified_phone')
            setLocationCity('')
            setReferralCode('')
            setShopName('')
            setShopArea('')
            setPostcode('')
            setStreetAddress('')
            setTailorName('')
            setPhone('')
            setIsPhoneVerified(false)
            setStep3VerifiedPhone('')

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

  // Handle Mobile Sign In: Send Twilio OTP
  const handleSendMobileOtp = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault()
    if (isSendingMobileOtpRef.current) return
    const raw = sPhoneLogin.trim()
    const cleanedDigits = raw.replace(/\D/g, '')
    if (cleanedDigits.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number with country code. '
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    isSendingMobileOtpRef.current = true
    setAuthLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await sendOtp(raw, force)
      setAuthLoading(false)
      setSOtpSent(true)
      setResendCountdown(30)
      if (res.phone) setSPhoneLogin(res.phone)
      setNotice(res.message || `Verification code sent via SMS to ${res.phone || sPhoneLogin.trim()}`)
      if (res.cooldown) {
        toast.info(res.message, { position: 'top-center' })
      } else {
        toast.success(res.message || `Verification code sent via SMS to ${res.phone || sPhoneLogin.trim()}`, { position: 'top-center' })
      }
    } catch (err: any) {
      setAuthLoading(false)
      const msg = err.message || 'Failed to send verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    } finally {
      isSendingMobileOtpRef.current = false
    }
  }

  // Handle Mobile: Verify Twilio OTP (Log in if in Prisma, or open registration form if not)
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanOtp = sOtp.trim()
    if (!cleanOtp || cleanOtp.length < 4) {
      const msg = 'Please enter the 4-digit verification code.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    setAuthLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await verifyOtp({
        phone: sPhoneLogin.trim(),
        otp: cleanOtp,
        role: 'STUDIO',
      })
      setAuthLoading(false)

      if (res?.isNewUser) {
        // Verified with Twilio SMS OTP, but not in Prisma yet!
        // Advance seamlessly to Studio Registration form ("Earn with Darzi")
        const verifiedPhone = res.phone || sPhoneLogin.trim()
        setPhone(verifiedPhone)
        setIsPhoneVerified(true)
        setStep3VerifiedPhone(verifiedPhone)
        toast.info('Mobile verified! Complete your atelier registration to enter Workbench.', {
          position: 'top-center',
        })
        setCurrentStep('location')
        return
      }

      if (res?.user) {
        if (typeof window !== 'undefined') {
          setAuthRole('STUDIO')
          if (res.token) setAuthToken(res.token)
        }
        toast.success(`Authenticated as ${res.user.name || 'Studio Partner'}!`, {
          position: 'top-center',
        })
        if (onComplete) {
          onComplete(res.user)
        } else {
          window.location.href = '/'
        }
      }
    } catch (err: any) {
      setAuthLoading(false)
      const msg = err.message || 'Invalid verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    }
  }

  // Step 3: Send Twilio OTP for Direct Mobile Phone
  const handleStep3SendOtp = async (force: boolean = false) => {
    if (isSendingStep3OtpRef.current) return
    const raw = phone.trim()
    const cleanedDigits = raw.replace(/\D/g, '')
    if (cleanedDigits.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number with country code.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    isSendingStep3OtpRef.current = true
    setStep3OtpLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await sendOtp(raw, force)
      setStep3OtpLoading(false)
      setStep3OtpSent(true)
      setStep3Countdown(30)
      if (res.phone) setPhone(res.phone)
      const successMsg = res.message || `Verification code sent via SMS to ${res.phone || raw}`
      setNotice(successMsg)
      if (res.cooldown) {
        toast.info(successMsg, { position: 'top-center' })
      } else {
        toast.success(successMsg, { position: 'top-center' })
      }
    } catch (err: any) {
      setStep3OtpLoading(false)
      const msg = err.message || 'Failed to send verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    } finally {
      isSendingStep3OtpRef.current = false
    }
  }

  // Step 3: Verify Twilio OTP for Direct Mobile Phone
  const handleStep3VerifyOtp = async () => {
    const cleanOtp = step3Otp.trim()
    if (!cleanOtp || cleanOtp.length < 4) {
      const msg = 'Please enter the 4-digit verification code.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return
    }
    setStep3OtpLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await verifyOtp({
        phone: phone.trim(),
        otp: cleanOtp,
        role: 'STUDIO',
      })
      setStep3OtpLoading(false)
      setIsPhoneVerified(true)
      const validatedPhone = res.phone || phone.trim()
      setPhone(validatedPhone)
      setStep3VerifiedPhone(validatedPhone)
      setStep3OtpSent(false)
      setStep3Otp('')
      toast.success('Mobile number verified successfully!', { position: 'top-center' })
    } catch (err: any) {
      setStep3OtpLoading(false)
      const msg = err.message || 'Invalid verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
    }
  }

  // Handle Email: Check Prisma & Trigger SMS OTP for registered phone, or open form if not registered
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
            setAuthRole('STUDIO')
            if (res.token) setAuthToken(res.token)
            window.location.href = '/'
          }
        }
      }

      // Not in Prisma yet -> open registration form with email prefilled
      setAuthLoading(false)
      setEmailVal(cleanEmail)
      setCurrentStep('location')
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
      setAuthRole('STUDIO')
      window.location.href = '/'
    }
  }

  // Final submit at step 4 (Hub)
  const handleFinishOnboarding = async () => {
    if (!studioLat || !studioLng) {
      const msg = 'Studio map location (Latitude & Longitude) is compulsory.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
      setCurrentStep('shop-info')
      setIsMapModalOpen(true)
      return
    }

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
        lat: studioLat || undefined,
        lng: studioLng || undefined,
      })

      // Clear all onboarding session and local data on successful registration
      ssRemove('tg_pending_google')
      ssRemove('tg_onboard_step')
      ssRemove('tg_onboard_form')
      ssRemove('tg_phone_verified')
      ssRemove('tg_verified_phone')
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('tg_pending_google')
          localStorage.removeItem('tg_onboard_step')
          localStorage.removeItem('tg_onboard_form')
          localStorage.removeItem('tg_onboard_email')
          localStorage.removeItem('tg_phone_verified')
          localStorage.removeItem('tg_verified_phone')
        } catch { }
      }

      const finalUser: User = res?.user || {
        id: user?.id || `usr_${Date.now()}`,
        name: tailorName.trim(),
        contact: phone.trim() || emailToSubmit || 'partner@darzi.com',
        email: emailToSubmit || 'partner@darzi.com',
        phone: phone.trim(),
        method: 'email',
        role: 'STUDIO',
        status: 'ACTIVE',
        studioId: 'atelier-soho',
        studioName: shopName.trim(),
        postcode: postcode.trim(),
        address: streetAddress.trim(),
      }

      if (typeof window !== 'undefined') {
        if (res?.token) setAuthToken(res.token)
        setAuthUser(finalUser)
        setAuthRole('STUDIO')
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

  const stepsList: Step[] = ['auth', 'location', 'language', 'shop-info', 'phone-verify', 'hub']
  const currentStepNum = stepsList.indexOf(currentStep)

  const handleSelectMapLocation = (loc: SelectedLocationData) => {
    if (loc.area) setShopArea(loc.area)
    if (loc.postcode) setPostcode(loc.postcode)
    if (loc.streetAddress) setStreetAddress(loc.streetAddress)
    if (loc.lat && loc.lng) {
      setStudioLat(loc.lat)
      setStudioLng(loc.lng)
    }
    toast.success(`Location set: ${loc.area}${loc.postcode ? ` (${loc.postcode})` : ''}`, {
      position: 'top-center',
    })
  }

  return (
    <div className={`${hideHeader ? 'w-full' : 'min-h-screen'} bg-[#FAF8F5] text-[#0F1115] flex flex-col font-sans`}>
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
                      clearAllAuth()
                      if (onSignOut) onSignOut()
                      if (typeof window !== 'undefined') {
                        window.location.href = CUSTOMER_SITE_URL || '/'
                      }
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
      <main className={`flex-1 flex flex-col items-center justify-center px-4 ${hideHeader ? 'py-1 sm:py-2' : 'py-8 sm:py-12'}`}>
        <div className={`w-full ${currentStep === 'auth' ? 'max-w-[460px]' : 'max-w-[540px]'} transition-all`}>
          {alreadyRegistered && (
            <div className="mb-6 rounded-2xl bg-[#FFF7F2] border border-[#E8D0C5] p-5 shadow-none text-left">
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
          <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-none overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Card Header */}
            {currentStep === 'auth' ? (
              <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-gray-100">
                <img
                  src="/bg_logo.png"
                  alt="Darzi Atelier"
                  className="h-11 sm:h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E1D5]">
                  <span className="size-1.5 rounded-full bg-[#9E593B]" />
                  <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#9E593B]">
                    Studio Workbench Node
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setNotice('')
                      if (currentStep === 'hub') setCurrentStep('phone-verify')
                      else if (currentStep === 'phone-verify') setCurrentStep('shop-info')
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
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#9E593B] block leading-tight">
                      Studio Portal
                    </span>
                    <span className="text-xs font-bold text-[#0F1115] block">
                      Workbench Node
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Step {currentStepNum} of 5
                </span>
              </div>
            )}

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

                {/* Submode: Mobile SMS OTP with Twilio */}
                {signInMode === 'mobile' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSignInMode('options')
                          setError('')
                          setNotice('')
                          setSOtpSent(false)
                          setSOtp('')
                        }}
                        className="size-7 rounded-lg bg-gray-100 hover:bg-gray-200 grid place-items-center text-gray-700 cursor-pointer text-xs transition-colors"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">SMS Verification</p>
                        <h2 className="font-serif text-2xl font-bold text-[#0F1115]">
                          {sOtpSent ? 'Enter Verification Code' : 'Partner Mobile Number'}
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
                            inputMode="tel"
                            required
                            autoFocus
                            value={sPhoneLogin}
                            onChange={(e) => setSPhoneLogin(e.target.value.replace(/[^\d+\-\s()]/g, ''))}
                            placeholder="+91 98765 43210 or +44 7700 900000"
                            className="w-full rounded-xl bg-gray-50 border border-[#DDD6CB] px-4 py-3 text-sm font-medium text-[#0F1115] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#9E593B] focus:ring-1 focus:ring-[#9E593B] outline-none transition-all"
                          />
                          <p className="text-[11px] text-[#7A7E85] mt-1.5">
                            We will send a 4-digit verification code via SMS to this mobile number.
                          </p>
                        </div>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-sm"
                        >
                          {authLoading ? 'Sending SMS code…' : 'Send Verification Code'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyMobileOtp} className="space-y-3.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-[#7A7E85]">
                          <span>
                            Enter code sent to <strong className="text-[#0F1115]">{sPhoneLogin}</strong>
                          </span>
                          <button
                            type="button"
                            disabled={authLoading || resendCountdown > 0}
                            onClick={() => handleSendMobileOtp(undefined, true)}
                            className="text-[#9E593B] font-bold hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend'}
                          </button>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          required
                          autoFocus
                          value={sOtp}
                          onChange={(e) => setSOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • •"
                          className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-gray-300 py-3 focus:border-[#9E593B] focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={authLoading || sOtp.length < 4}
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
                    <div className="text-center space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B] block">
                        Partner Portal
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#0F1115] tracking-tight">
                        Studio Workbench Access
                      </h2>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        Access live alteration intake, 48h timers, and atelier operations.
                      </p>
                    </div>

                    <div className="space-y-3 pt-3">
                      {/* 1. Google Button */}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={triggerGoogleAuth}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#0F1115] bg-white hover:bg-gray-50 py-3.5 px-4 text-sm font-bold text-[#0F1115] shadow-none active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 hover:border-[#9E593B]"
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
                          placeholder="Enter your shop or atelier name"
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
                            placeholder="Enter your area or locality"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Postcode / ZIP / PIN *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value.replace(/[^\d\-]/g, '').slice(0, 10))}
                            placeholder="e.g. 10001 (US) or 400001 (IN)"
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
                          placeholder="Enter your full street address"
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                        />
                      </div>

                      {/* Choose Exact Location Trigger */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsMapModalOpen(true)}
                          className="w-full flex items-center gap-2.5 rounded-lg bg-gray-100 hover:bg-gray-200/70 px-4 py-3 text-left transition-all cursor-pointer group"
                        >
                          <AnimatedLocationPin size={20} />
                          <span className="text-sm font-semibold text-[#0F1115] truncate flex-1">
                            {studioLat && studioLng
                              ? `${streetAddress || shopArea || 'Location Pinned'}${postcode ? ` (${postcode})` : ''}`
                              : 'Choose Exact Location'}
                          </span>
                          {studioLat && studioLng && (
                            <span className="size-2 rounded-full bg-emerald-500 shrink-0" title="Location Pinned" />
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Lead Master Tailor *
                          </label>
                          <input
                            type="text"
                            value={tailorName}
                            onChange={(e) => setTailorName(e.target.value)}
                            placeholder="Enter lead tailor's full name"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3 text-sm font-semibold text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Partner Contact Email *
                          </label>
                          <input
                            type="email"
                            value={emailVal}
                            onChange={(e) => { if (!pendingGoogle?.email) setEmailVal(e.target.value) }}
                            disabled={!!pendingGoogle?.email}
                            placeholder="Enter your business email"
                            className={`w-full rounded-lg border-none px-4 py-3 text-sm font-semibold outline-none transition-all ${pendingGoogle?.email ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115]'}`}
                          />
                          {pendingGoogle?.email && (
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                              <Lock size={10} /> Email linked via Google sign-in
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Field-by-field validation for Step 3
                        if (!shopName.trim()) {
                          setError('Please enter your Atelier / Shop Name.')
                          toast.warning('Shop Name is required.', { position: 'top-center' })
                          return
                        }
                        if (!shopArea.trim()) {
                          setError('Please enter your Area or Neighborhood.')
                          toast.warning('Area / Neighborhood is required.', { position: 'top-center' })
                          return
                        }
                        const cleanPin = postcode.trim().replace(/\D/g, '')
                        if (cleanPin.length < 4 || cleanPin.length > 10) {
                          const msg = 'Please enter a valid postal / ZIP code.'
                          setError(msg)
                          toast.warning(msg, { position: 'top-center' })
                          return
                        }
                        if (!streetAddress.trim()) {
                          setError('Please enter your Street Address.')
                          toast.warning('Street Address is required.', { position: 'top-center' })
                          return
                        }
                        if (!studioLat || !studioLng) {
                          const msg = 'Please choose your exact shop location on the map. Latitude & Longitude are compulsory.'
                          setError(msg)
                          toast.warning(msg, { position: 'top-center' })
                          setIsMapModalOpen(true)
                          return
                        }
                        if (!tailorName.trim()) {
                          setError('Please enter the Lead Master Tailor name.')
                          toast.warning('Lead Master Tailor is required.', { position: 'top-center' })
                          return
                        }
                        setError('')
                        setCurrentStep('phone-verify')
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6 cursor-pointer"
                    >
                      <span>Save & Continue to Phone Verification</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* Step 4: Phone Number Verification (Dedicated 4th Step) */}
                {currentStep === 'phone-verify' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9E593B]">
                        Partner Contact Verification
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115] mt-1">
                        Verify Your Mobile Number
                      </h1>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Enter your direct contact number. We will send a 4-digit SMS verification code to verify your studio account.
                      </p>
                    </div>

                    {isPhoneVerified ? (
                      <div className="space-y-5 pt-1">
                        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                              <CheckCircle2 size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                                Mobile Number Verified
                              </p>
                              <p className="text-sm font-mono font-bold text-[#0F1115] mt-0.5">
                                {phone || step3VerifiedPhone}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPhoneVerified(false)
                              setStep3OtpSent(false)
                              setStep3Otp('')
                            }}
                            className="text-xs text-[#9E593B] font-bold hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setError('')
                            setCurrentStep('hub')
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all cursor-pointer"
                        >
                          <span>Continue to Workbench Review</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Direct Mobile Phone Number *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              inputMode="tel"
                              autoFocus
                              value={phone}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^\d+\-\s()]/g, '')
                                setPhone(cleaned)
                              }}
                              placeholder="e.g. +1 555 019 2834 or +91 98765 43210"
                              className="flex-1 rounded-xl bg-gray-50 border border-[#DDD6CB] px-4 py-3.5 text-sm font-semibold text-[#0F1115] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#9E593B] focus:ring-1 focus:ring-[#9E593B] outline-none transition-all"
                            />
                            <button
                              type="button"
                              disabled={step3OtpLoading || !phone.trim() || (step3OtpSent && step3Countdown > 0)}
                              onClick={() => handleStep3SendOtp(step3OtpSent)}
                              className="px-5 py-3.5 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50 active:scale-[0.99] shadow-xs"
                            >
                              {step3OtpLoading
                                ? 'Sending…'
                                : step3OtpSent
                                  ? step3Countdown > 0
                                    ? `Resend in ${step3Countdown}s`
                                    : 'Resend Code'
                                  : 'Send OTP'}
                            </button>
                          </div>
                          <p className="text-[11px] text-[#7A7E85] mt-1.5">
                            We will send a 4-digit SMS verification code to verify this phone number.
                          </p>
                        </div>

                        {step3OtpSent && (
                          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs text-[#7A7E85]">
                              <span>
                                Enter code sent to <strong className="text-[#0F1115]">{phone}</strong>
                              </span>
                              <button
                                type="button"
                                disabled={step3OtpLoading || step3Countdown > 0}
                                onClick={() => handleStep3SendOtp(true)}
                                className="text-[#9E593B] font-bold hover:underline cursor-pointer disabled:opacity-50"
                              >
                                {step3Countdown > 0 ? `Resend (${step3Countdown}s)` : 'Resend'}
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                autoFocus
                                value={step3Otp}
                                onChange={(e) => setStep3Otp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="• • • •"
                                className="flex-1 text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#DDD6CB] bg-white py-3 focus:border-[#9E593B] focus:outline-none placeholder:text-gray-300 placeholder:tracking-[0.2em]"
                              />
                              <button
                                type="button"
                                disabled={step3OtpLoading || step3Otp.length < 4}
                                onClick={async () => {
                                  await handleStep3VerifyOtp()
                                  setCurrentStep('hub')
                                }}
                                className="sm:w-44 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] text-white py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-xs"
                              >
                                {step3OtpLoading ? 'Verifying…' : 'Verify & Continue'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Hub (Shifted from 4th to 5th Step) */}
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
                        All 4 atelier steps completed. Ready to launch your workbench.
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
                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Studio Location & Shop Details</p>
                          <p className="text-xs text-gray-500">{shopName} · {shopArea} ({postcode})</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Language & Daily Capacity</p>
                          <p className="text-xs text-gray-500">{language} · {machines} Machines ({dailyCapacity}/day limit)</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Lead Tailor & Contact Email</p>
                          <p className="text-xs text-gray-500">{tailorName} · {emailVal}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-[#0F1115]">Verified Partner Mobile</p>
                          <p className="text-xs text-gray-500">{phone || step3VerifiedPhone || 'Verified via SMS'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span>Verified</span>
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

      {/* Uber-Style Locality Picker Google Map Modal */}
      <UberMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleSelectMapLocation}
        initialCity={locationCity}
        initialArea={shopArea}
        initialAddress={streetAddress}
      />
    </div>
  )
}
