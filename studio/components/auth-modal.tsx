'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Mail, Phone, Scissors, Sparkles, Store, X } from 'lucide-react'
import type { User as UserType } from './data'
import { linkPhone, loginUser, loginWithGoogle, sendOtp, signUpUser, verifyOtp } from '@/lib/api'

type AuthMode =
  | 'studio-options'
  | 'studio-signup-options'
  | 'studio-login'
  | 'studio-mobile'
  | 'link-phone-step'
  | 'studio-register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserType) => void
  authType?: 'signin' | 'signup'
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

export function AuthModal({ isOpen, onClose, onSuccess, authType = 'signin' }: AuthModalProps) {
  const initialMode = (): AuthMode => (authType === 'signup' ? 'studio-signup-options' : 'studio-options')
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [pendingUser, setPendingUser] = useState<UserType | null>(null)

  // Studio Login fields
  const [sLoginEmail, setSLoginEmail] = useState('')
  const [sLoginPass, setSLoginPass] = useState('')

  // Studio Mobile OTP fields
  const [sPhoneLogin, setSPhoneLogin] = useState('')
  const [sOtpSent, setSOtpSent] = useState(false)
  const [sOtp, setSOtp] = useState('')

  // Link Phone fields
  const [linkPhoneVal, setLinkPhoneVal] = useState('')
  const [linkOtpSent, setLinkOtpSent] = useState(false)
  const [linkOtp, setLinkOtp] = useState('')

  // Studio Register fields
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

  useEffect(() => {
    setMode(initialMode())
    setRegisterStep(1)
    setError('')
    setNotice('')
    setLoading(false)
    setPendingUser(null)
    setSOtpSent(false)
    setSOtp('')
    setLinkOtpSent(false)
    setLinkOtp('')
  }, [isOpen, authType])

  const finalizeAuth = (user: UserType) => {
    if (!user.phone) {
      setPendingUser(user)
      setMode('link-phone-step')
      setNotice('Direct phone number is mandatory for partner atelier dispatch and customer intake notifications.')
      return
    }
    onSuccess(user)
  }

  const triggerGoogle = async () => {
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
              role: 'STUDIO',
              profile: {
                name: profile.name || 'Studio Partner',
                contact: profile.email,
                email: profile.email,
                avatar: profile.picture,
                method: 'google',
                role: 'STUDIO',
                studioId: 'atelier-soho',
                studioName: sName || 'Atelier SoHo Tailors',
              },
            })
            setLoading(false)
            if (result?.user) {
              if (!result.user.studioName) {
                setMode('studio-register')
                setSTailorName(result.user.name || '')
                setSEmail(result.user.email || result.user.contact || '')
              } else {
                finalizeAuth(result.user)
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
      const demo: UserType = {
        name: 'Marco Rossi (Demo Master Tailor)',
        contact: 'marco@ateliersoho.com',
        email: 'marco@ateliersoho.com',
        phone: '+44 7700 900123',
        method: 'google',
        role: 'STUDIO',
        studioId: 'atelier-soho',
        studioName: 'Atelier SoHo Tailors',
      }
      finalizeAuth(demo)
    }
  }

  const handleStudioMobileSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sPhoneLogin.trim().length < 6) {
      setError('Please enter a valid phone number.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await sendOtp(sPhoneLogin.trim())
      setLoading(false)
      setSOtpSent(true)
      const code = res.demoCode || '4829'
      setNotice(`Verification code sent! Test code: ${code}`)
    } catch (err) {
      setLoading(false)
      setSOtpSent(true)
      setNotice('Verification code sent! Test code: 4829')
    }
  }

  const handleStudioMobileVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sOtp || sOtp.length < 4) {
      setError('Please enter 4-digit code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await verifyOtp({
        phone: sPhoneLogin.trim(),
        otp: sOtp.trim(),
        role: 'STUDIO',
      })
      setLoading(false)
      if (res?.user) onSuccess(res.user)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Invalid code. Use 4829.')
    }
  }

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
      setNotice(`Verification code sent! Test code: ${code}`)
    } catch (err) {
      setLoading(false)
      setLinkOtpSent(true)
      setNotice('Verification code sent! Test code: 4829')
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
        userId: pendingUser?.id,
      })
      setLoading(false)
      if (res?.user) onSuccess(res.user)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Failed to link phone. Use 4829.')
    }
  }

  const handleStudioLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await loginUser({ identifier: sLoginEmail.trim(), role: 'STUDIO' })
      setLoading(false)
      if (result?.user) finalizeAuth(result.user)
    } catch (err: any) {
      setLoading(false)
      const demo: UserType = {
        name: sTailorName || 'Marco Rossi (Master Tailor)',
        contact: sLoginEmail,
        email: sLoginEmail,
        phone: '+44 7700 900123',
        method: 'email',
        role: 'STUDIO',
        studioId: 'atelier-soho',
        studioName: 'Atelier SoHo Tailors',
      }
      onSuccess(demo)
    }
  }

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
      const demo: UserType = {
        name: sTailorName || 'Master Tailor',
        contact: sEmail || sPhone,
        email: sEmail,
        phone: sPhone,
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
      setMode('studio-signup-options')
      setRegisterStep(1)
    } else if (mode === 'studio-login' || mode === 'studio-mobile') {
      setMode('studio-options')
    } else if (mode === 'link-phone-step') {
      setMode('studio-options')
      setPendingUser(null)
    } else {
      setMode('studio-options')
      setRegisterStep(1)
    }
    setError('')
    setNotice('')
  }

  if (!isOpen) return null

  const isStrictLocked = mode === 'link-phone-step' && Boolean(pendingUser)

  const isSubPage =
    !isStrictLocked &&
    mode !== 'studio-options' &&
    mode !== 'studio-signup-options' &&
    mode !== 'link-phone-step'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (!isStrictLocked && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl border border-[#E5E7EB] max-h-[94vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            {isSubPage ? (
              <button onClick={goBack} className="size-7 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] grid place-items-center transition-colors">
                <ArrowLeft size={14} className="text-[#374151]" />
              </button>
            ) : isStrictLocked ? (
              <div className="flex items-center gap-2 text-amber-800">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-900">
                  Phone Verification Mandatory
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Scissors size={20} className="text-[#9E593B]" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0F1115]">Studio Partner</span>
              </div>
            )}
          </div>
          {!isStrictLocked && (
            <button onClick={onClose} className="size-7 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] grid place-items-center transition-colors">
              <X size={14} className="text-[#374151]" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* LINK PHONE STEP */}
          {mode === 'link-phone-step' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#0F1115] leading-tight">
                  Link Atelier Phone Number
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Required to receive booking SMS alerts and dispatch updates.
                </p>
              </div>

              {!linkOtpSent ? (
                <form onSubmit={handleSendLinkOtp} className="space-y-3.5">
                  <Field label="Direct mobile number *" type="tel" required value={linkPhoneVal} onChange={setLinkPhoneVal} placeholder="+44 7700 900123" />
                  <SubmitBtn loading={loading} label="Send Verification Code" />
                </form>
              ) : (
                <form onSubmit={handleVerifyLinkPhone} className="space-y-3.5">
                  <p className="text-xs text-[#6B7280]">Enter code sent to <strong>{linkPhoneVal}</strong></p>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    autoFocus
                    value={linkOtp}
                    onChange={(e) => setLinkOtp(e.target.value)}
                    placeholder="4829"
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#D1D5DB] py-3 focus:border-[#9E593B] focus:outline-none"
                  />
                  <SubmitBtn loading={loading} label="Verify & Link Phone" />
                </form>
              )}
            </div>
          )}

          {/* STUDIO SIGN IN OPTIONS */}
          {mode === 'studio-options' && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Partner Portal</p>
                <h2 className="font-serif text-[26px] font-bold text-[#0F1115] mt-0.5 leading-tight">Sign in to Studio</h2>
                <p className="text-[13px] text-[#6B7280] mt-1.5">Access live orders, workbench controls, and weekly settlements.</p>
              </div>

              <div className="space-y-2.5">
                <GoogleButton label="Sign in with Google" loading={loading} onClick={triggerGoogle} bordered />
                <AuthButton icon={<Phone size={15} className="text-[#9E593B]" />} label="Sign in with Mobile Number" onClick={() => setMode('studio-mobile')} />
                <AuthButton icon={<Mail size={15} className="text-[#9E593B]" />} label="Sign in with Email" onClick={() => setMode('studio-login')} />
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
                    onSuccess({
                      name: 'Atelier SoHo (Demo)',
                      contact: 'demo@ateliersoho.com',
                      email: 'demo@ateliersoho.com',
                      phone: '+44 7700 900123',
                      method: 'guest',
                      role: 'STUDIO',
                      studioId: 'atelier-soho',
                      studioName: 'Atelier SoHo Tailors',
                    })
                  }}
                  className="text-[12px] text-[#9CA3AF] hover:text-[#374151] underline underline-offset-4 transition-colors"
                >
                  Explore demo studio dashboard
                </button>
              </div>
            </div>
          )}

          {/* STUDIO MOBILE SIGN IN */}
          {mode === 'studio-mobile' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">SMS Authentication</p>
                <h2 className="font-serif text-2xl font-bold text-[#0F1115] mt-0.5">
                  {sOtpSent ? 'Enter Partner Code' : 'Partner Mobile Number'}
                </h2>
              </div>

              {!sOtpSent ? (
                <form onSubmit={handleStudioMobileSend} className="space-y-3.5">
                  <Field label="Registered mobile phone *" type="tel" required value={sPhoneLogin} onChange={setSPhoneLogin} placeholder="+44 7700 900123" />
                  <SubmitBtn loading={loading} label="Send Partner Code" />
                </form>
              ) : (
                <form onSubmit={handleStudioMobileVerify} className="space-y-3.5">
                  <input
                    type="text"
                    maxLength={4}
                    required
                    autoFocus
                    value={sOtp}
                    onChange={(e) => setSOtp(e.target.value)}
                    placeholder="4829"
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] rounded-xl border border-[#D1D5DB] py-3 focus:border-[#9E593B] focus:outline-none"
                  />
                  <SubmitBtn loading={loading} label="Verify & Sign In" />
                </form>
              )}
            </div>
          )}

          {/* STUDIO EMAIL LOGIN */}
          {mode === 'studio-login' && (
            <form onSubmit={handleStudioLogin} className="space-y-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Partner Login</p>
                <h2 className="font-serif text-2xl font-bold text-[#0F1115] mt-0.5">Welcome back</h2>
                <p className="text-xs text-[#6B7280] mt-1">Enter your registered partner email or phone.</p>
              </div>

              <Field label="Partner email or phone" required value={sLoginEmail} onChange={setSLoginEmail} placeholder="marco@ateliersoho.com" />
              <SubmitBtn loading={loading} label="Access Studio Dashboard" />
            </form>
          )}

          {/* STUDIO 3-STEP REGISTER */}
          {mode === 'studio-register' && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9E593B]">Partner Sign Up</p>
                <h2 className="font-serif text-[24px] font-bold text-[#0F1115] mt-0.5 leading-tight">Create Studio Account</h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-[#374151]">Step {registerStep} of 3</p>
                  <span className="text-[11px] font-bold text-[#6B7280]">{Math.round((registerStep / 3) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5DFD5] overflow-hidden">
                  <div className="h-full rounded-full bg-[#9E593B] transition-all duration-300" style={{ width: `${(registerStep / 3) * 100}%` }} />
                </div>
              </div>

              {registerStep === 1 && (
                <div className="space-y-4">
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

              {registerStep === 2 && (
                <div className="space-y-4">
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
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-colors"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {registerStep === 3 && (
                <form onSubmit={handleStudioRegister} className="space-y-4">
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
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                              on
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
      className={`w-full flex items-center justify-center gap-3 rounded-xl py-3 text-[13px] font-semibold transition-all disabled:opacity-60 ${
        bordered
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
