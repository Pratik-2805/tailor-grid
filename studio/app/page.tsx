'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  LogIn,
  Package,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import { makeOtp, type Screen, type User } from '@/components/data'
import { StudioHeader } from '@/components/studio-header'
import { PartnerFlow, type StudioTab } from '@/components/partner-flow'
import { AuthModal } from '@/components/auth-modal'
import { getCurrentUser, CUSTOMER_SITE_URL } from '@/lib/api'

export default function StudioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [partnerTab, setPartnerTab] = useState<StudioTab>('cockpit')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')
  const [otp] = useState(() => makeOtp())
  const [loadingUser, setLoadingUser] = useState(true)

  const customerSiteUrl = CUSTOMER_SITE_URL

  // Token & auth action handover from main website (port 3000 -> port 3001)
  useEffect(() => {
    let authParam: string | null = null
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      authParam = params.get('auth') || params.get('action')
      if (token) {
        localStorage.setItem('tg_token', token)
        // Clean URL query params
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    getCurrentUser()
      .then((u) => {
        if (u) {
          setUser(u)
        } else if (authParam === 'signin' || authParam === 'login') {
          setAuthType('signin')
          setIsAuthOpen(true)
        } else if (authParam === 'signup' || authParam === 'register') {
          setAuthType('signup')
          setIsAuthOpen(true)
        }
      })
      .catch(() => {
        if (authParam === 'signin' || authParam === 'login') {
          setAuthType('signin')
          setIsAuthOpen(true)
        } else if (authParam === 'signup' || authParam === 'register') {
          setAuthType('signup')
          setIsAuthOpen(true)
        }
      })
      .finally(() => {
        setLoadingUser(false)
      })
  }, [])

  const handleDemoAccess = () => {
    const demoUser: User = {
      id: 'demo-studio-1',
      name: 'Mayfair Bespoke Atelier',
      contact: '+44 20 7946 0912',
      email: 'mayfair.atelier@darzi.co.uk',
      phone: '+44 20 7946 0912',
      avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop',
      method: 'email',
      role: 'STUDIO',
      studioId: 'store-mayfair',
      studioName: 'Mayfair Bespoke Atelier',
      address: '14 Savile Row, Mayfair',
      postcode: 'W1S 3JN',
    }
    setUser(demoUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user_role', 'STUDIO')
      localStorage.setItem('tg_user', JSON.stringify(demoUser))
    }
    toast.success('Workbench Demo Sandbox activated!', {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleOpenAuth = (type: 'signin' | 'signup' = 'signin') => {
    setAuthType(type)
    setIsAuthOpen(true)
  }

  const handleAuthSuccess = (loggedUser: User) => {
    if (loggedUser.role !== 'STUDIO') {
      toast.error('Unauthorized user, access denied.', {
        position: 'top-center',
        autoClose: 4000,
      })
      return
    }
    setUser(loggedUser)
    setIsAuthOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user_role', 'STUDIO')
      localStorage.setItem('tg_user', JSON.stringify(loggedUser))
    }
    toast.success(`Authenticated as ${loggedUser.name || 'Studio Partner'}!`, {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleUpdateUser = (updated: User) => {
    setUser(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user', JSON.stringify(updated))
    }
    toast.success('Studio profile updated successfully!', {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tg_token')
      localStorage.removeItem('tg_user')
      localStorage.removeItem('tg_user_role')
    }
    setUser(null)
    setIsAuthOpen(false)
    setPartnerTab('cockpit')
    toast.info('Signed out of Studio Workshop.', {
      position: 'top-center',
      autoClose: 2500,
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">

      {/* Studio Header (Port 3001) */}
      <StudioHeader
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onOpenProfile={() => setPartnerTab('profile')}
      />

      <main className="flex-1">
        {user ? (
          /* Active Studio Workbench Dashboard */
          <PartnerFlow
            go={() => { }}
            otp={otp}
            user={user}
            onSignOut={handleSignOut}
            onOpenProfile={() => setPartnerTab('profile')}
            onUpdateUser={handleUpdateUser}
            activeTab={partnerTab}
            onTabChange={setPartnerTab}
          />
        ) : (
          /* Studio Portal Sign-In / Landing View */
          <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1040px]">

              {/* Hero Banner */}
              <div className="rounded-3xl bg-[#0F1115] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-[620px]">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#E7C9BA] border border-white/15 mb-4">
                    <Store size={14} />
                    <span>Darzi Certified Partner Network · Port 3001</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Master Tailor Workshop Workbench.
                  </h1>

                  <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
                    Live alteration intake with 4-digit customer PIN verification, digital hang tags, 48h SLA timers, machine capacity controls, and guaranteed weekly payouts.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3.5">
                    <button
                      onClick={() => handleOpenAuth('signin')}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#0F1115] hover:bg-[#FAF8F5] shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <LogIn size={15} />
                      <span>Studio Log In</span>
                    </button>

                    <button
                      onClick={() => handleOpenAuth('signup')}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>Register Atelier</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={handleDemoAccess}
                      className="inline-flex items-center gap-2 rounded-full bg-[#9E593B] hover:bg-[#8A4C32] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={14} className="text-[#E7C9BA]" />
                      <span>Demo Workbench Sandbox</span>
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-6 text-xs text-white/60">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#10B981]" /> 100% Pre-paid</span>
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-[#F59E0B]" /> Weekly Bank Settlements</span>
                  </div>
                </div>

                {/* Background Decor */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#9E593B]/20 blur-3xl pointer-events-none" />
              </div>

              {/* 3 Value Pillars */}
              <div className="mt-10 grid sm:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-[#DDD6CB] bg-white p-6 shadow-xs">
                  <div className="size-10 rounded-xl bg-[#F4EFEA] text-[#9E593B] grid place-items-center mb-3">
                    <Package size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F1115]">PIN Order Intake</h3>
                  <p className="text-xs text-[#5A5D64] mt-1 leading-relaxed">
                    Verify customer 4-digit drop-off codes in under 10 seconds. Auto-generate hang tags and capture intake condition photos.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#DDD6CB] bg-white p-6 shadow-xs">
                  <div className="size-10 rounded-xl bg-[#F4EFEA] text-[#9E593B] grid place-items-center mb-3">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F1115]">Broadcast Jobs</h3>
                  <p className="text-xs text-[#5A5D64] mt-1 leading-relaxed">
                    Receive instant nearby alteration broadcast requests when you have idle machines. 1-click accept at fixed guaranteed payouts.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#DDD6CB] bg-white p-6 shadow-xs">
                  <div className="size-10 rounded-xl bg-[#F4EFEA] text-[#9E593B] grid place-items-center mb-3">
                    <Layers size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0F1115]">Capacity Management</h3>
                  <p className="text-xs text-[#5A5D64] mt-1 leading-relaxed">
                    Adjust daily piece limits and assign specific alterations to active machines and tailors on your team.
                  </p>
                </div>
              </div>

              {/* Demo Action & Customer Site Link */}
              <div className="mt-8 p-6 rounded-2xl bg-[#F4EFEA] border border-[#DDD6CB] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <span className="font-serif font-bold text-base text-[#0F1115] block">
                    Want to test without registering?
                  </span>
                  <span className="text-xs text-[#5A5D64]">
                    Launch the interactive master tailor sandbox to test order verification, customer PIN drop-offs, and tailoring timers.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDemoAccess}
                    className="rounded-full bg-[#0F1115] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#9E593B] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    Launch Demo Workbench
                  </button>
                  <a
                    href={customerSiteUrl}
                    className="text-xs font-bold text-[#7A7E85] hover:text-[#0F1115] transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={13} />
                    <span>Customer Site</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Studio Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        authType={authType}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* React Toastify Notifications Container */}
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}
