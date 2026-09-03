'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Store,
} from 'lucide-react'
import { useEffect } from 'react'
import type { User } from '@/components/data'
import { signUpUser, checkEmailExists } from '@/lib/api'

interface PartnerOnboardingProps {
  user?: User | null
  onComplete?: (user: User) => void
  onSignOut?: () => void
}

type Step = 'location' | 'language' | 'shop-info' | 'hub'

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
  const [currentStep, setCurrentStep] = useState<Step>('location')
  
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
  const [tailorName, setTailorName] = useState(user?.name && user.name !== 'Master Tailor' && user.name !== 'Google User' ? user.name : '')
  const [phone, setPhone] = useState(user?.phone || '')

  // Submission & error
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)

  useEffect(() => {
    if (user?.email) {
      checkEmailExists(user.email, 'STUDIO').then((res) => {
        if (res.exists) {
          setError(res.error || 'An account with this email address is already registered. Please sign in instead.')
          setAlreadyRegistered(true)
        }
      })
    }
  }, [user?.email])

  const stepsList: Step[] = ['location', 'language', 'shop-info', 'hub']
  const currentStepNum = stepsList.indexOf(currentStep) + 1

  const handleFinishOnboarding = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await signUpUser({
        name: tailorName.trim() || user?.name || 'Master Tailor',
        email: user?.email || undefined,
        phone: phone.trim() || user?.phone || undefined,
        address: streetAddress.trim(),
        postcode: postcode.trim(),
        role: 'STUDIO',
        storeName: shopName.trim(),
        storeArea: shopArea.trim(),
        machines,
      })

      const finalUser: User = res?.user || {
        id: user?.id || `usr_${Date.now()}`,
        name: tailorName.trim(),
        email: user?.email || 'partner@darzi.com',
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
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
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
                    if (typeof window !== 'undefined') {
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
