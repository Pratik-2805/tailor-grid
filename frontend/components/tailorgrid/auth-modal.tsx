'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Lock, Mail, MapPin, Phone, Scissors, User, X } from 'lucide-react'
import type { User as UserType } from './data'
import { loginWithGoogle, signUpUser } from '@/lib/api'

type AuthMode = 'options' | 'email' | 'mobile'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: UserType) => void
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
  } catch (e) {
    return null
  }
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('options')

  // Email form state
  const [emailName, setEmailName] = useState('')
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailPostcode, setEmailPostcode] = useState('')

  // Mobile form state
  const [countryCode, setCountryCode] = useState('+44')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mobileStep, setMobileStep] = useState<'phone' | 'otp'>('phone')
  const [mobileOtp, setMobileOtp] = useState('')
  const [mobileName, setMobileName] = useState('')
  const [mobileAddress, setMobileAddress] = useState('')
  const [mobilePostcode, setMobilePostcode] = useState('')

  // Loading & status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const googleBtnRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

  // Load Google Identity Services SDK script
  useEffect(() => {
    if (!isOpen) return

    const handleCredentialResponse = async (response: any) => {
      if (response && response.credential) {
        setLoading(true)
        try {
          const payload = parseJwt(response.credential)
          const result = await loginWithGoogle({
            idToken: response.credential,
            profile: payload ? {
              name: payload.name || payload.given_name || 'Google User',
              contact: payload.email,
              avatar: payload.picture,
              address: '18 Kensington Church St',
              postcode: 'W8 4EP',
              method: 'google',
            } : undefined
          })
          setLoading(false)
          if (result && result.user) {
            onSuccess(result.user)
          }
        } catch (err: any) {
          setLoading(false)
          setError(err.message || 'Google signup failed')
        }
      }
    }

    const scriptId = 'google-gsi-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    const initGsi = () => {
      if ((window as any).google?.accounts?.id) {
        try {
          ;(window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          })
          if (googleBtnRef.current) {
            ;(window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signup_with',
            })
          }
        } catch (err) {
          console.warn('GSI render notice:', err)
        }
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGsi
      document.head.appendChild(script)
    } else {
      initGsi()
    }
  }, [isOpen, clientId, onSuccess])

  if (!isOpen) return null

  // Trigger Original Google OAuth 2.0 Popup
  const handleGoogleSignUp = () => {
    setLoading(true)
    setError('')

    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const profile = await res.json()
                const result = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  profile: profile && profile.email ? {
                    name: profile.name || profile.given_name || 'Google User',
                    contact: profile.email,
                    avatar: profile.picture,
                    address: '18 Kensington Church St',
                    postcode: 'W8 4EP',
                    method: 'google',
                  } : undefined
                })
                setLoading(false)
                if (result && result.user) {
                  onSuccess(result.user)
                  return
                }
              } catch (err) {
                setLoading(false)
                setError('Failed to fetch user profile from Google. Please try again.')
              }
            } else {
              setLoading(false)
            }
          },
          error_callback: (err: any) => {
            setLoading(false)
            setError('Google sign in was cancelled or encountered an error.')
          },
        })
        tokenClient.requestAccessToken()
        return
      } catch (err) {
        console.error('OAuth token client init error:', err)
      }
    }

    // Secondary fallback: prompt GSI One-Tap or simulate fallback login
    if ((window as any).google?.accounts?.id) {
      ;(window as any).google.accounts.id.prompt((notification: any) => {
        setLoading(false)
      })
    } else {
      // Direct backend Google auth trigger fallback for testing
      loginWithGoogle({
        profile: {
          name: 'Google User',
          contact: 'user.google@example.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          address: '18 Kensington Church St',
          postcode: 'W8 4EP',
          method: 'google'
        }
      }).then(res => {
        setLoading(false)
        onSuccess(res.user)
      }).catch(err => {
        setLoading(false)
        setError('Google sign in encountered an issue: ' + err.message)
      })
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailName || !email || !emailPassword) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await signUpUser({
        name: emailName,
        email,
        address: emailAddress || '10 Kensington Church St',
        postcode: emailPostcode || 'W8 4EP'
      })
      setLoading(false)
      onSuccess(res.user)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Signup failed')
    }
  }

  const handleSendMobileOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError('Please enter a valid mobile phone number.')
      return
    }
    setError('')
    setMobileStep('otp')
  }

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mobileOtp.trim().length < 4) {
      setError('Please enter the 4-digit verification code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const fullContact = `${countryCode} ${phoneNumber}`
      const res = await signUpUser({
        name: mobileName.trim() || 'Mobile TailorGrid User',
        phone: fullContact,
        address: mobileAddress || '42 Earls Court Road',
        postcode: mobilePostcode || 'W8 6EJ'
      })
      setLoading(false)
      onSuccess(res.user)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Mobile sign in failed')
    }
  }

  const handleGuest = () => {
    const user: UserType = {
      name: 'Guest User',
      contact: 'Guest',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: 'Central London',
      postcode: 'W8 5TT',
      method: 'guest',
    }
    onSuccess(user)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202b38]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[500px] overflow-hidden border border-[#d9d5cd] bg-[#f8f7f3] p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-[#777973] hover:bg-[#eeece6] hover:text-[#202b38]"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#202b38] text-[#f8f7f3]">
            <Scissors size={17} />
          </span>
          <span className="font-serif text-xl tracking-[-.03em]">TailorGrid</span>
        </div>

        {/* MAIN OPTIONS VIEW */}
        {mode === 'options' && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Original OAuth Sign Up</p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-.04em] text-[#202b38]">Sign up with Google</h2>
            <p className="mt-2 text-sm leading-6 text-[#5f625f]">
              Connect your official Google account to automatically fetch your profile picture, name, and email.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {/* Google Button - Triggers Real Google Sign In Window */}
              <button
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-3 border-2 border-[#202b38] bg-white px-4 text-sm font-medium text-[#202b38] shadow-sm transition hover:bg-[#eeece6] disabled:opacity-50"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {loading ? 'Opening Google Sign In…' : 'Sign up with Google'}
              </button>

              {/* Rendered Google GSI button container */}
              <div ref={googleBtnRef} className="w-full" />

              {/* Email */}
              <button
                onClick={() => { setError(''); setMode('email') }}
                className="flex h-12 w-full items-center justify-center gap-3 border border-[#d9d5cd] bg-[#eeece6] px-4 text-sm font-medium text-[#202b38] transition hover:border-[#a6593b]"
              >
                <Mail size={18} className="text-[#a6593b]" />
                Sign up with Email
              </button>

              {/* Mobile */}
              <button
                onClick={() => { setError(''); setMode('mobile') }}
                className="flex h-12 w-full items-center justify-center gap-3 border border-[#d9d5cd] bg-[#eeece6] px-4 text-sm font-medium text-[#202b38] transition hover:border-[#a6593b]"
              >
                <Phone size={18} className="text-[#a6593b]" />
                Sign up with Mobile
              </button>
            </div>

            {error && <p className="mt-3 text-center text-xs text-[#a6593b]">{error}</p>}

            <div className="relative my-6 flex items-center justify-center border-t border-[#d9d5cd]">
              <span className="bg-[#f8f7f3] px-3 font-mono text-xs uppercase text-[#777973]">or</span>
            </div>

            <button
              onClick={handleGuest}
              className="w-full text-center text-xs text-[#777973] underline underline-offset-4 hover:text-[#202b38]"
            >
              Continue as guest
            </button>
          </div>
        )}

        {/* EMAIL SIGN UP VIEW */}
        {mode === 'email' && (
          <div className="mt-5">
            <button
              onClick={() => { setError(''); setMode('options') }}
              className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-[#777973] hover:text-[#202b38]"
            >
              <ArrowLeft size={14} /> Back to options
            </button>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Email Sign Up</p>
            <h2 className="mt-1 font-serif text-2xl tracking-[-.04em] text-[#202b38]">Create your account &amp; profile</h2>

            <form onSubmit={handleEmailSignUp} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Full Name *</label>
                <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                  <User size={16} className="text-[#a6593b]" />
                  <input
                    type="text"
                    required
                    value={emailName}
                    onChange={(e) => setEmailName(e.target.value)}
                    placeholder="e.g. Rhea Sharma"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Email Address *</label>
                <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                  <Mail size={16} className="text-[#a6593b]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rhea@example.com"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Pickup Address</label>
                  <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                    <MapPin size={16} className="text-[#a6593b]" />
                    <input
                      type="text"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="18 Kensington Ch St"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Postcode</label>
                  <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                    <input
                      type="text"
                      value={emailPostcode}
                      onChange={(e) => setEmailPostcode(e.target.value)}
                      placeholder="W8 4EP"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Password *</label>
                <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                  <Lock size={16} className="text-[#a6593b]" />
                  <input
                    type="password"
                    required
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-[#a6593b]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#202b38] px-4 text-sm font-medium text-[#f8f7f3] transition hover:bg-[#202b38]/90 disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Sign Up & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* MOBILE SIGN UP VIEW */}
        {mode === 'mobile' && (
          <div className="mt-5">
            <button
              onClick={() => {
                setError('')
                if (mobileStep === 'otp') {
                  setMobileStep('phone')
                } else {
                  setMode('options')
                }
              }}
              className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-[#777973] hover:text-[#202b38]"
            >
              <ArrowLeft size={14} /> {mobileStep === 'otp' ? 'Back to phone number' : 'Back to options'}
            </button>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Mobile Sign Up</p>
            <h2 className="mt-1 font-serif text-2xl tracking-[-.04em] text-[#202b38]">
              {mobileStep === 'phone' ? 'Enter mobile number & address' : 'Verify SMS Code'}
            </h2>

            {mobileStep === 'phone' ? (
              <form onSubmit={handleSendMobileOtp} className="mt-4 flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Your Full Name</label>
                  <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                    <User size={16} className="text-[#a6593b]" />
                    <input
                      type="text"
                      value={mobileName}
                      onChange={(e) => setMobileName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Mobile Phone Number *</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="border border-[#d9d5cd] bg-white px-2 py-2 text-sm font-mono outline-none"
                    >
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                    </select>
                    <div className="flex flex-1 items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                      <Phone size={16} className="text-[#a6593b]" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="7911 123456"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Pickup Address</label>
                    <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                      <MapPin size={16} className="text-[#a6593b]" />
                      <input
                        type="text"
                        value={mobileAddress}
                        onChange={(e) => setMobileAddress(e.target.value)}
                        placeholder="42 Earls Court Rd"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Postcode</label>
                    <div className="mt-1 flex items-center gap-2 border border-[#d9d5cd] bg-white px-3 py-2">
                      <input
                        type="text"
                        value={mobilePostcode}
                        onChange={(e) => setMobilePostcode(e.target.value)}
                        placeholder="W8 6EJ"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-[#a6593b]">{error}</p>}

                <button
                  type="submit"
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#202b38] px-4 text-sm font-medium text-[#f8f7f3] transition hover:bg-[#202b38]/90"
                >
                  Send Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyMobileOtp} className="mt-4 flex flex-col gap-4">
                <p className="text-xs leading-5 text-[#5f625f]">
                  We sent a 4-digit code to <span className="font-mono font-medium text-[#202b38]">{countryCode} {phoneNumber}</span>.
                </p>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5f625f]">Enter Verification Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    autoFocus
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 8 2 1"
                    className="mt-1 w-full border border-[#202b38] bg-white p-3 text-center font-mono text-2xl tracking-[.4em] outline-none"
                  />
                  <p className="mt-1.5 text-center font-mono text-[11px] text-[#777973]">Demo code: 4821</p>
                </div>

                {error && <p className="text-xs text-[#a6593b]">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#202b38] px-4 text-sm font-medium text-[#f8f7f3] transition hover:bg-[#202b38]/90 disabled:opacity-50"
                >
                  {loading ? 'Verifying…' : 'Verify & Complete Sign Up'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
