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
  sendOtp,
  verifyOtp,
  checkEmailExists,
  CUSTOMER_SITE_URL,
} from '@/lib/api'
import { setAuthRole, setAuthToken, setAuthUser, clearAllAuth, getAuthToken, getAuthUser } from '@/lib/cookies'
import { UberMapModal, SelectedLocationData } from './uber-map-modal'
import { AnimatedLocationPin } from './animated-location-pin'
import { OtpVerificationCard } from './otp-input'
import { CustomSelect } from './custom-select'

interface PartnerOnboardingProps {
  user?: User | null
  onComplete?: (user: User) => void
  onSignOut?: () => void
  hideHeader?: boolean
}

type Step = 'location' | 'shop-info' | 'phone-verify'

const stepToUrlNum: Record<Step, string> = {
  'location': '1',
  'shop-info': '2',
  'phone-verify': '3',
}

const urlParamToStep = (param: string | null): Step | null => {
  if (!param) return null
  const p = param.toLowerCase().trim()
  if (p === '1' || p === 'location' || p === 'step1' || p === 'step-1') return 'location'
  if (p === '2' || p === 'shop-info' || p === 'shopinfo' || p === 'step2' || p === 'step-2') return 'shop-info'
  if (p === '3' || p === 'phone-verify' || p === 'phone' || p === 'step3' || p === 'step-3') return 'phone-verify'
  return null
}

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

  // Check if we have cached pending Google data from session / local storage or JWT payload
  const [pendingGoogle] = useState<{
    tempSignupId?: string
    email?: string
    name?: string
    avatar?: string
  } | null>(() => {
    const stored = ssGet('tg_pending_google') || (typeof window !== 'undefined' ? localStorage.getItem('tg_pending_google') : null)
    if (stored) {
      try { return JSON.parse(stored) } catch { }
    }
    if (typeof window !== 'undefined') {
      const token = getAuthToken()
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload && (payload.method === 'google' || payload.type === 'pending_google_signup') && payload.email) {
            return {
              tempSignupId: payload.id || `temp_g_${payload.email}`,
              email: payload.email,
              name: payload.name || 'Master Tailor',
              avatar: payload.avatar,
            }
          }
        } catch { }
      }
    }
    return null
  })

  // Double-submit locks
  const isSendingStep3OtpRef = useRef(false)
  const [step3Countdown, setStep3Countdown] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (step3Countdown <= 0) return
    const interval = setInterval(() => {
      setStep3Countdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [step3Countdown])

  // Multi-step Flow State (strictly location, shop-info, phone-verify)
  const [currentStep, setCurrentStepRaw] = useState<Step>(() => {
    if (typeof window !== 'undefined') {
      const urlStep = urlParamToStep(new URLSearchParams(window.location.search).get('step'))
      if (urlStep) return urlStep
    }
    const cached = ssGet('tg_onboard_step')
    if (cached && ['location', 'shop-info', 'phone-verify'].includes(cached)) {
      return cached as Step
    }
    return 'location'
  })

  // Wrapper that also persists to storage and continuously syncs ?step=1, ?step=2, etc. in URL
  const setCurrentStep = (step: Step, pushHistory: boolean = false) => {
    setCurrentStepRaw(step)
    ssSet('tg_onboard_step', step)
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('tg_onboard_step', step) } catch { }
      const url = new URL(window.location.href)
      url.searchParams.set('step', stepToUrlNum[step])
      if (pushHistory) {
        window.history.pushState({}, '', url.toString())
      } else {
        window.history.replaceState({}, '', url.toString())
      }
    }
  }

  // Continuously sync URL query param ?step=1, ?step=2, etc.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const stepFromUrl = urlParamToStep(params.get('step'))

    if (stepFromUrl) {
      if (stepFromUrl !== currentStep) {
        setCurrentStepRaw(stepFromUrl)
      }
      ssSet('tg_onboard_step', stepFromUrl)
    } else {
      const url = new URL(window.location.href)
      url.searchParams.set('step', stepToUrlNum[currentStep])
      window.history.replaceState({}, '', url.toString())
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search)
      const s = urlParamToStep(p.get('step')) || 'location'
      setCurrentStepRaw(s)
      ssSet('tg_onboard_step', s)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentStep])

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  // ──────── Restore cached onboarding form data from browser storage ────────
  const cachedForm = (() => {
    const raw = ssGet('tg_onboard_form') || (typeof window !== 'undefined' ? localStorage.getItem('tg_onboard_form') : null)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  })()

  // Step 1: Location & Referral
  const [locationCity, setLocationCity] = useState(cachedForm?.locationCity || '')
  const [referralCode, setReferralCode] = useState(cachedForm?.referralCode || '')

  // Step 2: Language & Equipment
  const [language, setLanguage] = useState(cachedForm?.language || 'English')
  const [machines, setMachines] = useState(cachedForm?._v === 2 ? (cachedForm?.machines || '') : '')
  const [dailyCapacity, setDailyCapacity] = useState(cachedForm?._v === 2 ? (cachedForm?.dailyCapacity || '') : '')
  const [openTime, setOpenTime] = useState(cachedForm?.openTime || '10:00')
  const [closeTime, setCloseTime] = useState(cachedForm?.closeTime || '20:00')
  const [operatingHours, setOperatingHours] = useState(cachedForm?.operatingHours || `${cachedForm?.openTime || '10:00'} - ${cachedForm?.closeTime || '20:00'}`)

  const parseTime12 = (timeStr: string): { time12: string; period: 'AM' | 'PM' } => {
    if (!timeStr) return { time12: '10:00', period: 'AM' }
    const trimmed = timeStr.trim().toUpperCase()
    if (trimmed.includes('AM') || trimmed.includes('PM')) {
      const period: 'AM' | 'PM' = trimmed.includes('PM') ? 'PM' : 'AM'
      const timePart = trimmed.replace(/[AP]M/, '').trim()
      return { time12: timePart || '10:00', period }
    }
    const [hStr, mStr] = trimmed.split(':')
    let h = parseInt(hStr, 10)
    if (isNaN(h)) h = 10
    const m = mStr || '00'
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return {
      time12: `${String(h12).padStart(2, '0')}:${m.slice(0, 2)}`,
      period,
    }
  }

  const to24Hour = (time12: string, period: 'AM' | 'PM'): string => {
    const [hStr, mStr] = (time12 || '10:00').split(':')
    let h = parseInt(hStr, 10)
    if (isNaN(h)) h = 10
    const m = (mStr || '00').slice(0, 2)
    if (period === 'PM' && h < 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${m}`
  }

  // Step 3: Shop Info
  const [shopName, setShopName] = useState(cachedForm?.shopName || '')
  const [shopNo, setShopNo] = useState(cachedForm?.shopNo || '')
  const [shopArea, setShopArea] = useState(cachedForm?.shopArea || '')
  const [postcode, setPostcode] = useState(cachedForm?.postcode || '')
  const [streetAddress, setStreetAddress] = useState(cachedForm?.streetAddress || '')
  const [tailorName, setTailorName] = useState(cachedForm?.tailorName || '')
  const [phone, setPhone] = useState(
    cachedForm?.phone ||
    ssGet('tg_pending_mobile') ||
    (typeof window !== 'undefined' ? localStorage.getItem('tg_pending_mobile') : null) ||
    ''
  )
  const [studioLat, setStudioLat] = useState<number | null>(cachedForm?.studioLat || null)
  const [studioLng, setStudioLng] = useState<number | null>(cachedForm?.studioLng || null)
  const [emailVal, setEmailVal] = useState(
    cachedForm?.emailVal || pendingGoogle?.email || user?.email || (typeof window !== 'undefined' ? localStorage.getItem('tg_onboard_email') : '') || ''
  )

  // Direct Mobile Phone Twilio OTP Verification State
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    const cached = ssGet('tg_phone_verified') || (typeof window !== 'undefined' ? localStorage.getItem('tg_phone_verified') : null)
    if (cached === 'true') return true
    if (ssGet('tg_pending_mobile') || (typeof window !== 'undefined' && localStorage.getItem('tg_pending_mobile'))) return true
    return Boolean(user?.phone)
  })
  const [step3VerifiedPhone, setStep3VerifiedPhone] = useState(() => {
    return (
      ssGet('tg_verified_phone') ||
      (typeof window !== 'undefined' ? localStorage.getItem('tg_verified_phone') : null) ||
      ssGet('tg_pending_mobile') ||
      (typeof window !== 'undefined' ? localStorage.getItem('tg_pending_mobile') : null) ||
      user?.phone ||
      ''
    )
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
  const hasPendingMobile = Boolean(
    ssGet('tg_pending_mobile') ||
    (typeof window !== 'undefined' && localStorage.getItem('tg_pending_mobile'))
  )
  const cachedAuthUser = typeof window !== 'undefined' ? getAuthUser<User>() : null

  const isGoogleAuthUser = Boolean(
    !hasPendingMobile &&
    (
      pendingGoogle?.email ||
      user?.method === 'google' ||
      cachedAuthUser?.method === 'google' ||
      (typeof window !== 'undefined' && (() => {
        try {
          const pg = JSON.parse(sessionStorage.getItem('tg_pending_google') || localStorage.getItem('tg_pending_google') || '{}')
          return !!pg.email
        } catch { return false }
      })()) ||
      user?.email ||
      cachedAuthUser?.email
    )
  )
  const fixedGoogleEmail =
    pendingGoogle?.email ||
    (typeof window !== 'undefined' && (() => {
      try {
        const pg = JSON.parse(sessionStorage.getItem('tg_pending_google') || localStorage.getItem('tg_pending_google') || '{}')
        return pg.email || ''
      } catch { return '' }
    })()) ||
    user?.email ||
    cachedAuthUser?.email ||
    emailVal ||
    ''

  useEffect(() => {
    const activeEmail = user?.email || pendingGoogle?.email || (typeof window !== 'undefined' ? getAuthUser<User>()?.email : '')
    if (activeEmail && emailVal !== activeEmail) {
      setEmailVal(activeEmail)
    }
  }, [pendingGoogle, user])

  useEffect(() => {
    if (emailVal && typeof window !== 'undefined') {
      try { localStorage.setItem('tg_onboard_email', emailVal) } catch { }
    }
  }, [emailVal])

  // ──────── Persist form data to storage on every change ────────
  useEffect(() => {
    const formData = {
      _v: 2,
      locationCity, referralCode, language, machines, dailyCapacity, openTime, closeTime, operatingHours: `${openTime} - ${closeTime}`,
      shopName, shopNo, shopArea, postcode, streetAddress, tailorName, phone, emailVal,
      studioLat, studioLng,
    }
    ssSet('tg_onboard_form', JSON.stringify(formData))
  }, [locationCity, referralCode, language, machines, dailyCapacity, openTime, closeTime, shopName, shopNo, shopArea, postcode, streetAddress, tailorName, phone, emailVal, studioLat, studioLng])

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
    const cached = getAuthUser<User>()
    const email = user?.email || pendingGoogle?.email || cached?.email
    if (email && !emailVal) {
      setEmailVal(email)
    }
    const name = user?.name || pendingGoogle?.name || cached?.name
    if (name && !tailorName && name !== 'Google User' && name !== 'Studio Partner') {
      setTailorName(name)
    }
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
  }, [user?.email, user?.name, pendingGoogle?.email, pendingGoogle?.name])

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
  const handleStep3VerifyOtp = async (): Promise<boolean> => {
    const cleanOtp = step3Otp.trim()
    if (!cleanOtp || cleanOtp.length < 4) {
      const msg = 'Please enter the 4-digit verification code.'
      setError(msg)
      toast.warning(msg, { position: 'top-center' })
      return false
    }
    setStep3OtpLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await verifyOtp({
        phone: phone.trim(),
        otp: cleanOtp,
        role: 'STUDIO',
        userId: user?.id && !String(user.id).startsWith('temp_g_') ? user.id : undefined,
        email: emailVal.trim() || user?.email || pendingGoogle?.email,
      })
      setStep3OtpLoading(false)
      setIsPhoneVerified(true)
      const validatedPhone = res.phone || phone.trim()
      setPhone(validatedPhone)
      setStep3VerifiedPhone(validatedPhone)
      setStep3OtpSent(false)
      setStep3Otp('')
      toast.success('Mobile number verified! Activating studio...', { position: 'top-center' })
      await handleFinishOnboarding(validatedPhone)
      return true
    } catch (err: any) {
      setStep3OtpLoading(false)
      const msg = err.message || 'Invalid verification code.'
      setError(msg)
      toast.error(msg, { position: 'top-center' })
      return false
    }
  }



  // Final submit & Studio Activation upon verification
  const handleFinishOnboarding = async (overridePhone?: string) => {
    const effectivePhone = overridePhone || phone.trim() || user?.phone

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

      const fullRegisteredAddress = shopNo.trim()
        ? (streetAddress.trim() ? `${shopNo.trim()}, ${streetAddress.trim()}` : shopNo.trim())
        : streetAddress.trim()

      const res = await signUpUser({
        tempSignupId: resolvedTempId,
        name: tailorName.trim() || user?.name || pendingGoogle?.name || 'Master Tailor',
        email: emailToSubmit || undefined,
        phone: effectivePhone || undefined,
        address: fullRegisteredAddress.trim(),
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
      ssRemove('tg_pending_mobile')
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('tg_pending_google')
          localStorage.removeItem('tg_onboard_step')
          localStorage.removeItem('tg_onboard_form')
          localStorage.removeItem('tg_onboard_email')
          localStorage.removeItem('tg_phone_verified')
          localStorage.removeItem('tg_verified_phone')
          localStorage.removeItem('tg_pending_mobile')
        } catch { }
      }

      const finalUser: User = res?.user || {
        id: user?.id || `usr_${Date.now()}`,
        name: tailorName.trim(),
        contact: effectivePhone || emailToSubmit || 'partner@darzi.com',
        email: emailToSubmit || 'partner@darzi.com',
        phone: effectivePhone || '',
        method: 'email',
        role: 'STUDIO',
        status: 'ACTIVE',
        studioId: 'atelier-soho',
        studioName: shopName.trim(),
        postcode: postcode.trim(),
        address: fullRegisteredAddress.trim(),
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

  const stepsList: Step[] = ['location', 'shop-info', 'phone-verify']
  const currentStepNum = stepsList.indexOf(currentStep) + 1

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

  const isOtpFlipped = currentStep === 'phone-verify' && step3OtpSent && !isPhoneVerified

  return (
    <div className={hideHeader ? 'w-full flex flex-col items-center justify-center text-[#0F1115] font-sans' : 'min-h-screen bg-[#FAF8F5] text-[#0F1115] flex flex-col font-sans'}>
      {/* Top Navbar */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStepNum > 1 && (
              <button
                onClick={() => {
                  setError('')
                  setNotice('')
                  setCurrentStep(stepsList[currentStepNum - 2])
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
            <span className="text-xs font-semibold text-gray-500">
              Step {currentStepNum} of 3
            </span>

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
      <main className={`w-full flex flex-col items-center justify-center ${hideHeader ? 'p-0' : 'flex-1 px-4 py-8 sm:py-12 my-auto'}`}>
        <div style={{ perspective: '1400px' }} className="w-full max-w-[540px]">
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
              className={`bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[640px] animate-in fade-in duration-200 ${isOtpFlipped ? 'pointer-events-none select-none' : ''
                }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setNotice('')
                      if (currentStep === 'phone-verify') setCurrentStep('shop-info')
                      else if (currentStep === 'shop-info') setCurrentStep('location')
                      else if (currentStep === 'location') {
                        if (onSignOut) onSignOut()
                        else if (typeof window !== 'undefined') window.location.replace(CUSTOMER_SITE_URL)
                      }
                    }}
                    className="size-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                    title="Back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#9E593B] block leading-tight">
                      Studio Onboarding
                    </span>
                    <span className="text-xs font-bold text-[#0F1115] block">
                      Workbench Node
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Step {currentStepNum} of 3
                </span>
              </div>

              {/* ── ONBOARDING FORM (Strictly Step 1, Step 2, Step 3) ── */}
              <div className="flex-1 flex flex-col justify-between pt-1">
                  {/* Step 1: "Earn with Darzi" */}
                  {currentStep === 'location' && (
                    <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                            Earn with Darzi
                          </h1>
                        </div>

                        <div className="space-y-3.5">
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
                            {isGoogleAuthUser ? (
                              <div className="space-y-1">
                                <div className="relative flex items-center">
                                  <input
                                    type="email"
                                    value={fixedGoogleEmail || emailVal}
                                    readOnly
                                    disabled
                                    autoComplete="off"
                                    tabIndex={-1}
                                    className="w-full rounded-lg bg-[#F3EFEA]/80 border border-[#E8E1D5] px-4 py-3.5 text-sm font-semibold text-[#0F1115] cursor-not-allowed select-none pr-10 outline-none shadow-xs"
                                  />
                                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E593B]">
                                    <Lock size={15} />
                                  </div>
                                </div>
                                <p className="text-[11px] text-[#7A7E85] flex items-center gap-1.5 font-medium pt-0.5">
                                  <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                  </svg>
                                  <span>Verified via Google account — locked &amp; cannot be changed</span>
                                </p>
                              </div>
                            ) : (
                              <input
                                type="email"
                                value={emailVal}
                                onChange={(e) => setEmailVal(e.target.value)}
                                placeholder="business@atelier.com"
                                className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                              />
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
                                <div className="relative flex-1 flex items-center justify-center bg-gray-100 rounded-lg py-3.5 px-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F1115] transition-all cursor-text">
                                  <input
                                    type="text"
                                    value={parseTime12(openTime).time12}
                                    onChange={(e) => {
                                      const { period } = parseTime12(openTime)
                                      setOpenTime(to24Hour(e.target.value, period))
                                    }}
                                    className="w-[44px] bg-transparent border-none text-xs font-medium text-[#0F1115] outline-none text-right tracking-tight p-0"
                                    placeholder="10:00"
                                    title="Opening Time"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const { time12, period } = parseTime12(openTime)
                                      setOpenTime(to24Hour(time12, period === 'AM' ? 'PM' : 'AM'))
                                    }}
                                    className="ml-1 text-xs font-semibold text-[#0F1115] hover:text-[#9E593B] cursor-pointer select-none transition-colors p-0"
                                    title="Click or touch to toggle AM/PM"
                                  >
                                    {parseTime12(openTime).period}
                                  </button>
                                </div>
                                <span className="text-[11px] text-gray-400 font-bold shrink-0">to</span>
                                <div className="relative flex-1 flex items-center justify-center bg-gray-100 rounded-lg py-3.5 px-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F1115] transition-all cursor-text">
                                  <input
                                    type="text"
                                    value={parseTime12(closeTime).time12}
                                    onChange={(e) => {
                                      const { period } = parseTime12(closeTime)
                                      setCloseTime(to24Hour(e.target.value, period))
                                    }}
                                    className="w-[44px] bg-transparent border-none text-xs font-medium text-[#0F1115] outline-none text-right tracking-tight p-0"
                                    placeholder="08:00"
                                    title="Closing Time"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const { time12, period } = parseTime12(closeTime)
                                      setCloseTime(to24Hour(time12, period === 'AM' ? 'PM' : 'AM'))
                                    }}
                                    className="ml-1 text-xs font-semibold text-[#0F1115] hover:text-[#9E593B] cursor-pointer select-none transition-colors p-0"
                                    title="Click or touch to toggle AM/PM"
                                  >
                                    {parseTime12(closeTime).period}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Sewing Machines *
                              </label>
                              <CustomSelect
                                value={machines}
                                onChange={(val) => setMachines(val)}
                                placeholder="No. of sewing machines"
                                buttonClassName="bg-gray-100 border-transparent py-3 text-sm focus:bg-white"
                                options={[
                                  { value: '2-3', label: '2–3 machines', sublabel: 'Boutique' },
                                  { value: '4-6', label: '4–6 machines', sublabel: 'Mid-sized' },
                                  { value: '8+', label: '8+ machines', sublabel: 'High Capacity' },
                                ]}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Daily Order Limit *
                              </label>
                              <CustomSelect
                                value={dailyCapacity}
                                onChange={(val) => setDailyCapacity(val)}
                                placeholder="No. of orders/day"
                                buttonClassName="bg-gray-100 border-transparent py-3 text-sm focus:bg-white"
                                options={[
                                  { value: '15', label: '15 orders / day', sublabel: 'Standard Pace' },
                                  { value: '25', label: '25 orders / day', sublabel: 'High Volume' },
                                  { value: '50', label: '50 orders / day', sublabel: 'Peak Capacity' },
                                ]}
                              />
                            </div>
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
                          if (!machines) {
                            setError('Please select the number of sewing machines.')
                            toast.warning('Number of sewing machines is required.', { position: 'top-center' })
                            return
                          }
                          if (!dailyCapacity) {
                            setError('Please select your daily order limit.')
                            toast.warning('Daily order limit is required.', { position: 'top-center' })
                            return
                          }
                          setError('')
                          setCurrentStep('shop-info')
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6 cursor-pointer"
                      >
                        <span>Continue to Workshop Address</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Shop Location & Address */}
                  {currentStep === 'shop-info' && (
                    <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1115]">
                            Studio Location & Address
                          </h1>
                          <p className="text-xs text-gray-500 mt-1.5">
                            Pin your atelier on the map. Only your shop / unit number needs to be typed manually.
                          </p>
                        </div>

                        <div className="space-y-3.5">
                          {/* Shop No. / Workshop Unit (The ONLY manually entered field) */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-semibold text-gray-700">
                                Shop No. / Workshop Unit *
                              </label>
                              <span className="text-[10px] font-semibold text-[#9E593B] bg-[#FAF3EC] px-2 py-0.5 rounded-full border border-[#E8E1D5]">
                                Manual Entry
                              </span>
                            </div>
                            <input
                              type="text"
                              value={shopNo}
                              onChange={(e) => setShopNo(e.target.value)}
                              placeholder="e.g. Shop No. 4, Ground Floor, Gala 12, or Suite 2B"
                              className="w-full rounded-lg bg-gray-100 border-none px-4 py-3.5 text-sm font-medium text-[#0F1115] focus:bg-white focus:ring-2 focus:ring-[#0F1115] outline-none transition-all"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">
                              Only your shop/unit number is typed manually. Street, neighborhood, and PIN are set from the map pin below.
                            </p>
                          </div>

                          {/* Choose Exact Location Trigger */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Workshop Map Pin (Compulsory) *
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

                          {/* Auto-synced Map Address Card */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                Map-Detected Details
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Auto-synced via Pin
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                              <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Street / Road</span>
                                <div className="text-xs font-medium text-[#0F1115] truncate mt-0.5" title={streetAddress || 'Not set'}>
                                  {streetAddress || (studioLat && studioLng ? 'Location Pinned' : 'Pin on map')}
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Area / Neighborhood</span>
                                <div className="text-xs font-medium text-[#0F1115] truncate mt-0.5" title={shopArea || 'Not set'}>
                                  {shopArea || (studioLat && studioLng ? 'Location Pinned' : 'Pin on map')}
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Postcode / PIN</span>
                                <div className="text-xs font-mono font-bold text-[#0F1115] truncate mt-0.5" title={postcode || 'Not set'}>
                                  {postcode || (studioLat && studioLng ? 'Auto-detected' : '—')}
                                </div>
                              </div>
                            </div>

                            {/* Client Delivery Preview */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                              <MapPin size={13} className="text-emerald-700 shrink-0" />
                              <span className="font-bold text-emerald-900 shrink-0">Client Delivery Address:</span>
                              <span className="truncate font-medium">
                                {[shopNo, streetAddress || shopArea, postcode ? `(${postcode})` : ''].filter(Boolean).join(', ') || 'Enter Shop No. and pin your workshop on the map'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!shopNo.trim()) {
                            setError('Please enter your Shop No. / Workshop Unit.')
                            toast.warning('Shop No. is required.', { position: 'top-center' })
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
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all mt-6 cursor-pointer"
                      >
                        <span>Save & Continue to Phone Verification</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 3: Phone Number Verification */}
                  {currentStep === 'phone-verify' && (
                    <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                      {isPhoneVerified ? (
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex-1 flex flex-col justify-center space-y-6 my-auto">
                            <div className="bg-white pt-1">
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
                          </div>

                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleFinishOnboarding()}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all cursor-pointer mt-6 disabled:opacity-50"
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
                      ) : (
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-6 pt-8 sm:pt-10">
                            <div className="text-center">
                              <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1115]">
                                Verify your phone number
                              </h1>
                              <p className="text-sm text-gray-600 mt-5.5 max-w-sm mx-auto">
                                We&apos;ll send a 4-digit verification code to confirm your direct number.
                              </p>
                            </div>

                            <div className="space-y-4 pt-7">
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
                          </div>

                          <div className="mt-6 space-y-3.5">
                            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 leading-snug px-0.5">
                              <Lock size={14} className="text-[#9E593B] shrink-0 mt-0.5" />
                              <p>
                                Standard carrier rates may apply.
                                <br />
                                We keep your number strictly confidential.
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={step3OtpLoading || !phone.trim()}
                              onClick={() => handleStep3SendOtp(false)}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-black py-4 text-sm font-extrabold text-white shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span>{step3OtpLoading ? 'Sending Verification Code…' : 'Send Verification Code'}</span>
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>

            {/* BACK FACE: ENTIRE CARD FLIPPED TO STANDALONE OTP CARD */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className={`absolute inset-0 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[640px] ${!isOtpFlipped ? 'pointer-events-none select-none' : ''
                }`}
            >
              {currentStep === 'phone-verify' && (
                <OtpVerificationCard
                  variant="plain"
                  value={step3Otp}
                  onChange={setStep3Otp}
                  onVerify={async () => {
                    await handleStep3VerifyOtp()
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
