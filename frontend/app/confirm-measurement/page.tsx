'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConfirmMeasurementView } from '@/components/confirm-measurement-view'
import { AuthModal } from '@/components/auth-modal'
import { getCurrentUser } from '@/lib/api'
import { type Screen, type StoreOption, type User } from '@/components/data'
import { Lock, LogIn, Sparkles } from 'lucide-react'

export default function ConfirmMeasurementPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'STUDIO'>('CUSTOMER')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')

  const [draft, setDraft] = useState<{
    city: string
    garmentId: string
    serviceId: string
    pickupOption: 'now' | 'schedule'
    scheduleDate: Date
    scheduleTime: string
    images: string[]
    measurements?: Record<string, string>
    brand?: string
    notes?: string
  }>({
    city: 'Vasai, IN-MH',
    garmentId: 'trousers',
    serviceId: 'trouser-hem-plain',
    pickupOption: 'now',
    scheduleDate: new Date(),
    scheduleTime: '03:30 PM',
    images: [],
  })

  // Load auth state & check access
  useEffect(() => {
    let isMounted = true
    getCurrentUser().then((u) => {
      if (isMounted) {
        setUser(u)
        setIsLoadingAuth(false)
        if (!u) {
          setIsAuthOpen(true)
        }
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Load measurement draft from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_measurement_draft')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDraft((prev) => ({
            ...prev,
            ...parsed,
            scheduleDate: parsed.scheduleDate ? new Date(parsed.scheduleDate) : prev.scheduleDate,
          }))
        } catch {}
      }
    }
  }, [])

  const handleGo = (s: Screen) => {
    if (s === 'home') router.push('/')
    else if (s === 'confirm-measurement') router.push('/confirm-measurement')
    else if (s === 'order') {
      const latest = typeof window !== 'undefined' ? localStorage.getItem('tg_latest_order') : null
      let orderId = 'ORD-6812'
      if (latest) {
        try {
          const parsed = JSON.parse(latest)
          if (parsed.id) orderId = parsed.id
        } catch {}
      }
      router.push(`/order/${orderId}`)
    }
    else router.push(`/?page=${s}`)
  }

  const handleConfirmMeasurements = (data: {
    garmentId: string
    serviceId: string
    measurements: Record<string, string>
    brand?: string
    notes?: string
    images?: string[]
    fittingMode?: string
    matchedStore?: StoreOption
    createdOrderId?: string
  }) => {
    const orderId = data.createdOrderId || 'ORD-6812'
    router.push(`/order/${orderId}`)
  }

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser)
    setIsAuthOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user_role', loggedUser.role || 'CUSTOMER')
    }
  }

  const handleAuthClose = () => {
    setIsAuthOpen(false)
    // If not logged in when modal is dismissed, redirect to home
    if (!user) {
      router.push('/')
    }
  }

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tg_token')
      localStorage.removeItem('tg_user')
      localStorage.removeItem('tg_user_role')
      localStorage.removeItem('tg_screen')
    }
    setUser(null)
    setIsAuthOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header
        currentScreen="confirm-measurement"
        go={handleGo}
        user={user}
        onOpenAuth={() => {
          setAuthRole('CUSTOMER')
          setAuthType('signin')
          setIsAuthOpen(true)
        }}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col">
        {isLoadingAuth ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="size-10 rounded-full border-2 border-[#9E593B] border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-[#6B7280]">Verifying session...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated Gate: Prevent access and prompt login */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center max-w-lg mx-auto">
            <div className="size-16 rounded-3xl bg-[#9E593B]/10 text-[#9E593B] flex items-center justify-center mb-6 shadow-sm">
              <Lock size={30} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F1115] tracking-tight">
              Authentication Required
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5A5D64] leading-relaxed">
              Please sign in or create an account to view and customize your garment measurements and proceed with your fitting pass.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setAuthRole('CUSTOMER')
                  setAuthType('signin')
                  setIsAuthOpen(true)
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0F1115] text-white text-sm font-bold shadow-md hover:bg-[#9E593B] transition-all"
              >
                <LogIn size={16} />
                <span>Sign In to Continue</span>
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D5CEB9] text-[#0F1115] text-sm font-bold hover:bg-[#F4EFEA] transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated User: Render Measurement View */
          <ConfirmMeasurementView
            go={handleGo}
            user={user}
            onOpenAuth={() => {
              setAuthRole('CUSTOMER')
              setAuthType('signin')
              setIsAuthOpen(true)
            }}
            initialCity={draft.city}
            initialGarmentId={draft.garmentId}
            initialServiceId={draft.serviceId}
            initialPickupOption={draft.pickupOption}
            initialScheduleDate={draft.scheduleDate}
            initialScheduleTime={draft.scheduleTime}
            initialImages={draft.images}
            onConfirmMeasurements={handleConfirmMeasurements}
          />
        )}
      </main>

      <Footer go={handleGo} />

      <AuthModal
        isOpen={isAuthOpen}
        targetRole={authRole}
        authType={authType}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
