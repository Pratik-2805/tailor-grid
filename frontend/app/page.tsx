'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AboutView } from '@/components/about-view'
import { AdminView } from '@/components/admin-view'
import { AuthModal } from '@/components/auth-modal'
import { ConfirmMeasurementView } from '@/components/confirm-measurement-view'
import { CustomerFlow } from '@/components/customer-flow'
import { makeOtp, type Screen, type StoreOption, type User } from '@/components/data'
import { Footer } from '@/components/footer'
import { ForPartnersView } from '@/components/for-partners-view'
import { Header } from '@/components/header'
import { StudioSubNav } from '@/components/studio-sub-nav'
import { HomeView } from '@/components/home-view'
import { HowItWorksView } from '@/components/how-it-works-view'
import { OrderDetailsView } from '@/components/order-details-view'
import { OrdersView } from '@/components/orders-view'
import { PartnerFlow } from '@/components/partner-flow'
import { getCurrentUser } from '@/lib/api'

export default function Page() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('home')
  const [createdOrderId, setCreatedOrderId] = useState<string>('ORD-2654')
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'STUDIO'>('CUSTOMER')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signup')
  const [otp] = useState(() => makeOtp())

  // Measurement state from HeroSection to ConfirmMeasurementView
  const [measurementDraft, setMeasurementDraft] = useState<{
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
    fittingMode?: string
  }>({
    city: 'Mumbai, IN',
    garmentId: 'trousers',
    serviceId: 'trouser-hem-plain',
    pickupOption: 'now',
    scheduleDate: new Date(),
    scheduleTime: '03:30 PM',
    images: [],
  })

  // Read screen from URL on initial load and handle browser back/forward buttons
  useEffect(() => {
    const validScreens: Screen[] = [
      'home',
      'how-it-works',
      'about',
      'for-partners',
      'booking',
      'orders',
      'partner',
      'admin',
      'confirm-measurement',
      'order',
    ]

    const getScreenFromUrl = (): Screen => {
      if (typeof window === 'undefined') return 'home'

      // Check URL query param ?page=xxx
      const params = new URLSearchParams(window.location.search)
      const pageParam = params.get('page') as Screen | null

      // Automatically forward legacy query parameters to official Next.js routes
      const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
      if (pageParam === 'order') {
        if (!token) {
          setIsAuthOpen(true)
          setAuthRole('CUSTOMER')
          setAuthType('signin')
          return 'home'
        }
        const latestOrder = localStorage.getItem('tg_latest_order')
        let orderId = createdOrderId || 'ORD-2654'
        if (latestOrder) {
          try {
            const parsed = JSON.parse(latestOrder)
            if (parsed.id) orderId = parsed.id
          } catch {}
        }
        window.location.replace(`/order/${orderId}`)
        return 'home'
      }

      if (pageParam === 'confirm-measurement') {
        if (!token) {
          setIsAuthOpen(true)
          setAuthRole('CUSTOMER')
          setAuthType('signin')
          return 'home'
        }
        window.location.replace('/confirm-measurement')
        return 'home'
      }

      if (pageParam && validScreens.includes(pageParam)) {
        return pageParam
      }

      // Check URL hash #xxx
      const hash = window.location.hash.replace('#', '') as Screen
      if (hash && validScreens.includes(hash)) {
        return hash
      }

      // Root path '/' is ALWAYS home
      return 'home'
    }

    const initialScreen = getScreenFromUrl()
    setScreen(initialScreen)

    const handlePopState = () => {
      const current = getScreenFromUrl()
      setScreen(current)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Load authenticated user on mount
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) setUser(u)
    })
  }, [])

  // Booking pre-fill state
  const [prefilledPostcode, setPrefilledPostcode] = useState('W8 4EP')
  const [prefilledGarmentId, setPrefilledGarmentId] = useState('trousers')
  const [prefilledServiceId, setPrefilledServiceId] = useState<string | undefined>()
  const [prefilledStore, setPrefilledStore] = useState<StoreOption | undefined>()
  const [confirmedMeasurements, setConfirmedMeasurements] = useState<Record<string, string> | undefined>()
  const [garmentBrand, setGarmentBrand] = useState<string | undefined>()
  const [garmentNotes, setGarmentNotes] = useState<string | undefined>()

  const handleNavigate = (nextScreen: Screen) => {
    if (nextScreen === 'confirm-measurement') {
      if (!user) {
        handleOpenAuth('CUSTOMER', 'signin')
        return
      }
      router.push('/confirm-measurement')
      return
    }
    if (nextScreen === 'order') {
      if (!user) {
        handleOpenAuth('CUSTOMER', 'signin')
        return
      }
      router.push(`/order/${createdOrderId || 'ORD-2654'}`)
      return
    }
    if (nextScreen === 'home') {
      router.push('/')
      setScreen('home')
      return
    }
    setScreen(nextScreen)
    router.push(`/?page=${nextScreen}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRequestMeasurement = (params: {
    city: string
    garmentId: string
    serviceId: string
    pickupOption: 'now' | 'schedule'
    scheduleDate: Date
    scheduleTime: string
    images: string[]
  }) => {
    setMeasurementDraft(params)
    setPrefilledGarmentId(params.garmentId)
    setPrefilledServiceId(params.serviceId)
    setPrefilledPostcode(params.city.includes('Los Angeles') ? '90210' : params.city.includes('London') ? 'W8 4EP' : '10012')
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_measurement_draft', JSON.stringify(params))
    }
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
    setPrefilledGarmentId(data.garmentId)
    setPrefilledServiceId(data.serviceId)
    setConfirmedMeasurements(data.measurements)
    setGarmentBrand(data.brand)
    setGarmentNotes(data.notes)
    if (data.createdOrderId) {
      setCreatedOrderId(data.createdOrderId)
    }
    if (data.matchedStore) {
      setPrefilledStore(data.matchedStore)
    }
  }

  const handleOpenAuth = (role: 'CUSTOMER' | 'STUDIO' = 'CUSTOMER', type: 'signin' | 'signup' = 'signup') => {
    setAuthRole(role)
    setAuthType(type)
    setIsAuthOpen(true)
  }

  const handleQuickSearch = (postcode: string, garmentId: string) => {
    setPrefilledPostcode(postcode)
    setPrefilledGarmentId(garmentId)
  }

  const handleSelectService = (garmentId: string, serviceId: string) => {
    setPrefilledGarmentId(garmentId)
    setPrefilledServiceId(serviceId)
  }

  const handleSelectStore = (store: StoreOption) => {
    setPrefilledStore(store)
  }

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser)
    setIsAuthOpen(false)

    // Persist role alongside token so getCurrentUser can enforce it on reload
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user_role', loggedUser.role || 'CUSTOMER')
    }

    // Role-based post-auth redirect
    if (loggedUser.role === 'STUDIO') {
      // Studio partners are redirected to dedicated Studio domain on port 3001
      const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
      const studioUrl = token ? `http://localhost:3001/?token=${encodeURIComponent(token)}` : 'http://localhost:3001'
      window.location.href = studioUrl
      return
    } else {
      // Customer users stay on main portal
      if (screen === 'partner' || screen === 'for-partners') {
        handleNavigate('home')
      }
    }
  }

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tg_token')
      localStorage.removeItem('tg_user_role')
      localStorage.removeItem('tg_screen')
    }
    setUser(null)
    if (screen === 'partner' || screen === 'for-partners') {
      handleNavigate('for-partners')
    } else {
      handleNavigate('home')
    }
  }

  const isStudioScreen = screen === 'for-partners' || screen === 'partner'

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">

      {/* Primary Global Navigation Header (Always Visible) */}
      <Header
        currentScreen={screen}
        go={handleNavigate}
        user={user}
        onOpenAuth={() => handleOpenAuth('CUSTOMER')}
        onSignOut={handleSignOut}
      />

      {/* Secondary Sub-Navbar (Uber-style, appears below primary navbar for Studio pages) */}
      {isStudioScreen && (
        <StudioSubNav
          currentScreen={screen}
          go={handleNavigate}
          user={user}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Main Page Views */}
      <main className="flex-1">
        {screen === 'home' && (
          <HomeView
            go={handleNavigate}
            user={user}
            onOpenAuth={() => handleOpenAuth('CUSTOMER', 'signin')}
            onQuickSearch={handleQuickSearch}
            onSelectService={handleSelectService}
            onSelectStore={handleSelectStore}
            onRequestMeasurement={handleRequestMeasurement}
          />
        )}

        {screen === 'confirm-measurement' && (
          <ConfirmMeasurementView
            go={handleNavigate}
            user={user}
            onOpenAuth={() => handleOpenAuth('CUSTOMER', 'signin')}
            initialCity={measurementDraft.city}
            initialGarmentId={measurementDraft.garmentId}
            initialServiceId={measurementDraft.serviceId}
            initialPickupOption={measurementDraft.pickupOption}
            initialScheduleDate={measurementDraft.scheduleDate}
            initialScheduleTime={measurementDraft.scheduleTime}
            initialImages={measurementDraft.images}
            onConfirmMeasurements={handleConfirmMeasurements}
          />
        )}

        {screen === 'how-it-works' && (
          <HowItWorksView
            go={handleNavigate}
            onQuickSearch={handleQuickSearch}
            onSelectService={handleSelectService}
          />
        )}

        {screen === 'about' && <AboutView go={handleNavigate} />}

        {screen === 'for-partners' && (
          <ForPartnersView
            go={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onPartnerRegistered={handleAuthSuccess}
          />
        )}

        {screen === 'booking' && (
          <CustomerFlow
            go={handleNavigate}
            otp={otp}
            initialPostcode={prefilledPostcode}
            initialGarmentId={prefilledGarmentId}
            initialServiceId={prefilledServiceId}
            initialStore={prefilledStore}
            initialMeasurements={confirmedMeasurements}
            initialBrand={garmentBrand}
            initialNotes={garmentNotes}
            initialDate={
              measurementDraft.pickupOption === 'schedule'
                ? measurementDraft.scheduleDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
                : 'Today (Immediate slot)'
            }
            initialTimeSlot={
              measurementDraft.pickupOption === 'schedule'
                ? measurementDraft.scheduleTime
                : '11:30 AM – 01:00 PM'
            }
          />
        )}

        {screen === 'order' && (
          <OrderDetailsView
            slugId={createdOrderId}
            onGoHome={() => handleNavigate('home')}
            onGoOrders={() => handleNavigate('orders')}
          />
        )}

        {screen === 'orders' && (
          <OrdersView
            go={handleNavigate}
            user={user}
            onOpenAuth={() => handleOpenAuth('CUSTOMER', 'signin')}
          />
        )}

        {screen === 'partner' && (
          <PartnerFlow
            go={handleNavigate}
            otp={otp}
            user={user}
            onSignOut={handleSignOut}
          />
        )}

        {screen === 'admin' && <AdminView go={handleNavigate} />}
      </main>

      {/* Universal Footer (hidden on dedicated partner app workspace) */}
      {screen !== 'partner' && <Footer go={handleNavigate} />}

      {/* Role-Aware Authentication Modal (Customer or Studio Partner) */}
      <AuthModal
        isOpen={isAuthOpen}
        targetRole={authRole}
        authType={authType}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
