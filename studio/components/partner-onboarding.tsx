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
import { OtpVerificationCard } from './otp-input'

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

  // Check if we have cached pending Google data from session
  const [pendingGoogle, setPendingGoogle] = useState<{
    tempSignupId?: string
    email?: string
    name?: string
    avatar?: string
  } | null>(() => {
    const stored = ssGet('tg_pending_google')
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

  // Multi-step Flow State — restore from sessionStorage on refresh
  const [currentStep, setCurrentStepRaw] = useState<Step>(() => {
    const cached = ssGet('tg_onboard_step')
    if (cached && ['auth', 'location', 'language', 'shop-info', 'phone-verify', 'hub'].includes(cached)) {
      return cached as Step
    }
    return user?.email || pendingGoogle?.email ? 'location' : 'auth'
  })
  // Wrapper that also persists to sessionStorage
  const setCurrentStep = (step: Step) => {
    setCurrentStepRaw(step)
    ssSet('tg_onboard_step', step)
  }

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  // ──────── Restore cached onboarding form data from sessionStorage ────────
  const cachedForm = (() => {
    const raw = ssGet('tg_onboard_form')
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  })()

  // Step 1: Location & Referral (Image 2 - Earn with Darzi)
  const [locationCity, setLocationCity] = useState(cachedForm?.locationCity || '')
  const [referralCode, setReferralCode] = useState(cachedForm?.referralCode || '')

  // Step 2: Language & Equipment
  const [language, setLanguage] = useState(cachedForm?.language || 'English')
  const [machines, setMachines] = useState(cachedForm?.machines || '4-6')
  const [dailyCapacity, setDailyCapacity] = useState(cachedForm?.dailyCapacity || '25')
  const [openTime, setOpenTime] = useState(cachedForm?.openTime || '10:00')
  const [closeTime, setCloseTime] = useState(cachedForm?.closeTime || '20:00')
  const [operatingHours, setOperatingHours] = useState(cachedForm?.operatingHours || `${cachedForm?.openTime || '10:00'} - ${cachedForm?.closeTime || '20:00'}`)

  // Step 3: Shop Info — only restore from sessionStorage (user's own typed data), never prefill from user object
  const [shopName, setShopName] = useState(cachedForm?.shopName || '')
  const [shopArea, setShopArea] = useState(cachedForm?.shopArea || '')
  const [postcode, setPostcode] = useState(cachedForm?.postcode || '')
  const [streetAddress, setStreetAddress] = useState(cachedForm?.streetAddress || '')
  const [tailorName, setTailorName] = useState(cachedForm?.tailorName || '')
  const [phone, setPhone] = useState(cachedForm?.phone || '')
  const [studioLat, setStudioLat] = useState<number | null>(cachedForm?.studioLat || null)
  const [studioLng, setStudioLng] = useState<number | null>(cachedForm?.studioLng || null)
  const [emailVal, setEmailVal] = useState(
    cachedForm?.emailVal || pendingGoogle?.email || ''
  )

  // Step 4 Direct Mobile Phone Twilio OTP Verification State
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    const cached = ssGet('tg_phone_verified')
    if (cached === 'true') return true
    return Boolean(user?.phone)
  })
  const [step3VerifiedPhone, setStep3VerifiedPhone] = useState(() => {
    return ssGet('tg_verified_phone') || user?.phone || ''
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
    if (pendingGoogle?.email && !emailVal) {
      setEmailVal(pendingGoogle.email)
    }
    if (user?.email && !emailVal) {
      setEmailVal(user.email)
    }
  }, [pendingGoogle, user])

  // ──────── Persist form data to sessionStorage on every change ────────
  useEffect(() => {
    const formData = {
      locationCity, referralCode, language, machines, dailyCapacity, openTime, closeTime, operatingHours: `${openTime} - ${closeTime}`,
      shopName, shopArea, postcode, streetAddress, tailorName, phone, emailVal,
      studioLat, studioLng,
    }
    ssSet('tg_onboard_form', JSON.stringify(formData))
  }, [locationCity, referralCode, language, machines, dailyCapacity, openTime, closeTime, shopName, shopArea, postcode, streetAddress, tailorName, phone, emailVal, studioLat, studioLng])

  // Persist phone verification state
  useEffect(() => {
    ssSet('tg_phone_verified', isPhoneVerified ? 'true' : 'false')
  }, [isPhoneVerified])
  useEffect(() => {
    if (step3VerifiedPhone) ssSet('tg_verified_phone', step3VerifiedPhone)
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
            if (!result.isNewUser && result.user && result.user.studioName && result.user.phone) {
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

      // Clear all onboarding session data on successful registration
      ssRemove('tg_pending_google')
      ssRemove('tg_onboard_step')
      ssRemove('tg_onboard_form')
      ssRemove('tg_phone_verified')
      ssRemove('tg_verified_phone')

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

  const stepsList: Step[] = ['auth', 'location', 'shop-info', 'phone-verify', 'hub']
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

  const isOtpFlipped =
    (currentStep === 'phone-verify' && step3OtpSent && !isPhoneVerified) ||
    (currentStep === 'auth' && signInMode === 'mobile' && sOtpSent)

  return (
    <div className={hideHeader ? 'w-full flex flex-col items-center justify-center text-[#0F1115] font-sans' : 'min-h-screen bg-[#FAF8F5] text-[#0F1115] flex flex-col font-sans'}>
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
              <span className="font-serif text-xl font-bold tracking-tight text-[#0F1115]">Darzi</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E593B] bg-[#9E593B]/10 px-2 py-0.5 rounded-md">
                Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentStep !== 'auth' && currentStep !== 'hub' && (
              <span className="text-xs font-semibold text-gray-500">
                Step {currentStepNum} of 4
              </span>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className="size-8 rounded-full bg-[#EBDDD5] text-[#8C4A2D] font-bold text-xs flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border border-[#DFC9BD]"
              >
                {(user?.name || 'P')[0].toUpperCase()}
              </button>
              {showHelpDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-xs z-50 animate-in fade-in slide-in-from-top-2">
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
      <main className={`w-full flex flex-col items-center justify-center ${hideHeader ? 'p-0' : 'flex-1 px-4 py-8 sm:py-12 my-auto'}`}>
        <div style={{ perspective: '1400px' }} className="w-full max-w-[480px]">
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



          {/* ================================================================ */}
          {/* 3D FLIP CONTAINER: FLIPS THE ENTIRE WORKBENCH / OTP CARD        */}
          {/* ================================================================ */}
          <div
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.65s cubic-bezier(0.34, 1.3, 0.64, 1)',
              transform: isOtpFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
            className="relative w-full"
          >
            {/* FRONT FACE: ENTIRE WORKBENCH CARD */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className={`bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 ${isOtpFlipped ? 'pointer-events-none select-none' : ''
                }`}
            >
              {/* Card Header with Step Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  {currentStep !== 'auth' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setError('')
                        setNotice('')
                        if (currentStep === 'hub') setCurrentStep('phone-verify')
                        else if (currentStep === 'phone-verify') setCurrentStep('shop-info')
                        else if (currentStep === 'shop-info') setCurrentStep('location')
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

                  {/* Submode: Mobile SMS OTP with Twilio */}
                  {signInMode === 'mobile' && (
                    <div className="w-full space-y-4">
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
                            Partner Mobile Number
                          </h2>
                        </div>
                      </div>
                      <form onSubmit={handleSendMobileOtp} className="space-y-3.5 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Mobile Phone Number *
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            required
                            autoFocus={!sOtpSent}
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
                  {/* Step 1: "Earn with Darzi" */}
                  {currentStep === 'location' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
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
                            Atelier / Shop Name *
                          </label>
                          <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="e.g. Savile Row Atelier or Royal Master Tailors"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Partner Contact Email *
                          </label>
                          <input
                            type="email"
                            value={emailVal}
                            onChange={(e) => { if (!pendingGoogle?.email) setEmailVal(e.target.value) }}
                            disabled={!!pendingGoogle?.email}
                            placeholder="business@atelier.com"
                            className={`w-full rounded-lg border-none px-4 py-3.5 text-sm font-medium outline-none transition-all ${pendingGoogle?.email ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115]'}`}
                          />
                          {pendingGoogle?.email && (
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                              <Lock size={10} /> Email linked via Google sign-in
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Lead Master Tailor *
                            </label>
                            <input
                              type="text"
                              value={tailorName}
                              onChange={(e) => setTailorName(e.target.value)}
                              placeholder="Full name"
                              className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Operating Hours *
                            </label>
                            <div className="flex items-center gap-1.5">
                              <div className="relative flex-1">
                                <input
                                  type="time"
                                  value={openTime}
                                  onChange={(e) => setOpenTime(e.target.value)}
                                  className="w-full rounded-lg bg-gray-100 border-none px-2 py-3.5 text-xs font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all cursor-pointer text-center"
                                  title="Opening Time"
                                />
                              </div>
                              <span className="text-[11px] text-gray-400 font-bold shrink-0">to</span>
                              <div className="relative flex-1">
                                <input
                                  type="time"
                                  value={closeTime}
                                  onChange={(e) => setCloseTime(e.target.value)}
                                  className="w-full rounded-lg bg-gray-100 border-none px-2 py-3.5 text-xs font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all cursor-pointer text-center"
                                  title="Closing Time"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Sewing Machines *
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
                              Daily Order Limit *
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
                        type="button"
                        onClick={() => {
                          if (!shopName.trim()) {
                            setError('Please enter your Atelier / Shop Name.')
                            toast.warning('Shop Name is required.', { position: 'top-center' })
                            return
                          }
                          if (!tailorName.trim()) {
                            setError('Please enter the Lead Master Tailor name.')
                            toast.warning('Lead Master Tailor is required.', { position: 'top-center' })
                            return
                          }
                          if (!emailVal.trim() || !emailVal.includes('@')) {
                            setError('Please enter a valid Partner Contact Email.')
                            toast.warning('Contact Email is required.', { position: 'top-center' })
                            return
                          }
                          setError('')
                          setCurrentStep('shop-info')
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-4 cursor-pointer"
                      >
                        <span>Continue to Workshop Address</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Shop Location & Address */}
                  {currentStep === 'shop-info' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115]">
                          Studio Location & Address
                        </h1>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Enter your atelier address so clients can find your workshop and drop off garments.
                        </p>
                      </div>

                      <div className="space-y-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="e.g. 14 Savile Row, Suite 2B"
                            className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Area / Neighborhood *
                            </label>
                            <input
                              type="text"
                              value={shopArea}
                              onChange={(e) => setShopArea(e.target.value)}
                              placeholder="e.g. Mayfair, Soho, Bandra..."
                              className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Postcode / ZIP / PIN *
                            </label>
                            <input
                              type="text"
                              maxLength={10}
                              value={postcode}
                              onChange={(e) => setPostcode(e.target.value.replace(/[^\d\w\s\-]/g, '').slice(0, 10))}
                              placeholder="e.g. 10001 or W1S 3JN"
                              className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Choose Exact Location Trigger */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Map Pin (Compulsory) *
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className="w-full flex items-center gap-2.5 rounded-lg bg-gray-100 hover:bg-gray-200/70 px-4 py-3.5 text-left transition-all cursor-pointer group"
                          >
                            <AnimatedLocationPin
                              size={22}
                              isConfirmed={Boolean(studioLat && studioLng)}
                            />
                            <span className="text-sm font-medium text-[#0F1115] truncate flex-1">
                              {studioLat && studioLng
                                ? `${streetAddress || shopArea || 'Location Pinned'}${postcode ? ` (${postcode})` : ''}`
                                : 'Choose Exact Location on Map'}
                            </span>
                            {studioLat && studioLng && (
                              <span className="size-2 rounded-full bg-emerald-500 shrink-0" title="Location Pinned" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!streetAddress.trim()) {
                            setError('Please enter your Street Address.')
                            toast.warning('Street Address is required.', { position: 'top-center' })
                            return
                          }
                          if (!shopArea.trim()) {
                            setError('Please enter your Area or Neighborhood.')
                            toast.warning('Area / Neighborhood is required.', { position: 'top-center' })
                            return
                          }
                          if (!postcode.trim() || postcode.trim().length < 3) {
                            const msg = 'Please enter a valid postal / ZIP code.'
                            setError(msg)
                            toast.warning(msg, { position: 'top-center' })
                            return
                          }
                          if (!studioLat || !studioLng) {
                            const msg = 'Please choose your exact shop location on the map. Latitude & Longitude are compulsory.'
                            setError(msg)
                            toast.warning(msg, { position: 'top-center' })
                            setIsMapModalOpen(true)
                            return
                          }
                          setError('')
                          setCurrentStep('phone-verify')
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-4 cursor-pointer"
                      >
                        <span>Save & Continue to Phone Verification</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 4: Phone Number Verification (Dedicated 4th Step) */}
                  {currentStep === 'phone-verify' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {isPhoneVerified ? (
                        <div className="space-y-6">
                          <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                              Mobile Verified
                            </h1>
                            <p className="text-sm text-gray-600 mt-1.5">
                              Your atelier phone number has been successfully verified.
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                                <CheckCircle2 size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                                  Verified Phone
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
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all cursor-pointer mt-4"
                          >
                            <span>Continue to Workbench Review</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                              Verify your phone
                            </h1>
                            <p className="text-sm text-gray-600 mt-1.5">
                              We&apos;ll send a 4-digit verification code to confirm your direct number.
                            </p>
                          </div>

                          <div className="space-y-4 pt-1">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Phone Number *
                              </label>
                              <div className="relative flex items-center">
                                <div className="absolute left-4 flex items-center pointer-events-none text-gray-400">
                                  <Phone size={16} className="text-[#9E593B]" />
                                </div>
                                <input
                                  type="tel"
                                  inputMode="tel"
                                  autoFocus={!step3OtpSent}
                                  value={phone}
                                  onChange={(e) => {
                                    const cleaned = e.target.value.replace(/[^\d+\-\s()]/g, '')
                                    setPhone(cleaned)
                                  }}
                                  placeholder="e.g. +91 98765 43210 or +44 7700 900000"
                                  className="w-full rounded-lg bg-gray-100 border-none pl-11 pr-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-500 leading-relaxed pt-1 flex items-center gap-1.5">
                            <Lock size={12} className="text-[#9E593B] shrink-0" />
                            <span>Standard carrier rates may apply. We keep your number strictly confidential.</span>
                          </p>

                          <button
                            type="button"
                            disabled={step3OtpLoading || !phone.trim()}
                            onClick={() => handleStep3SendOtp(false)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-4 cursor-pointer disabled:opacity-50"
                          >
                            <span>{step3OtpLoading ? 'Sending Verification Code…' : 'Send Verification Code'}</span>
                            <ArrowRight size={16} />
                          </button>
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

            {/* BACK FACE: ENTIRE CARD FLIPPED TO STANDALONE OTP CARD */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className={`absolute inset-0 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 flex flex-col items-center justify-center ${!isOtpFlipped ? 'pointer-events-none select-none' : ''
                }`}
            >
              {currentStep === 'phone-verify' && (
                <OtpVerificationCard
                  variant="plain"
                  value={step3Otp}
                  onChange={setStep3Otp}
                  onVerify={async () => {
                    await handleStep3VerifyOtp()
                    setCurrentStep('hub')
                  }}
                  onResend={() => handleStep3SendOtp(true)}
                  resendCountdown={step3Countdown}
                  loading={step3OtpLoading}
                  phoneNumber={phone}
                  onClose={() => {
                    setStep3OtpSent(false)
                    setStep3Otp('')
                  }}
                />
              )}
              {currentStep === 'auth' && signInMode === 'mobile' && (
                <OtpVerificationCard
                  variant="plain"
                  value={sOtp}
                  onChange={setSOtp}
                  onVerify={() => handleVerifyMobileOtp({ preventDefault: () => { } } as any)}
                  onResend={() => handleSendMobileOtp(undefined, true)}
                  resendCountdown={resendCountdown}
                  loading={authLoading}
                  phoneNumber={sPhoneLogin}
                  onClose={() => {
                    setSOtpSent(false)
                    setSOtp('')
                  }}
                />
              )}
            </div>
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
