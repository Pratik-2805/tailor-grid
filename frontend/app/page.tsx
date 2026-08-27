'use client'

import { useEffect, useState } from 'react'
import { AboutView } from '@/components/tailorgrid/about-view'
import { AdminView } from '@/components/tailorgrid/admin-view'
import { AuthModal } from '@/components/tailorgrid/auth-modal'
import { CustomerFlow } from '@/components/tailorgrid/customer-flow'
import { makeOtp, type Screen, type StoreOption, type User } from '@/components/tailorgrid/data'
import { Footer } from '@/components/tailorgrid/footer'
import { ForPartnersView } from '@/components/tailorgrid/for-partners-view'
import { Header } from '@/components/tailorgrid/header'
import { StudioHeader } from '@/components/tailorgrid/studio-header'
import { HomeView } from '@/components/tailorgrid/home-view'
import { HowItWorksView } from '@/components/tailorgrid/how-it-works-view'
import { OrdersView } from '@/components/tailorgrid/orders-view'
import { PartnerFlow } from '@/components/tailorgrid/partner-flow'
import { getCurrentUser } from '@/lib/api'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'STUDIO'>('CUSTOMER')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signup')
  const [otp] = useState(() => makeOtp())

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
    ]

    const getScreenFromUrl = (): Screen => {
      if (typeof window === 'undefined') return 'home'

      // Check URL query param ?page=xxx
      const params = new URLSearchParams(window.location.search)
      const pageParam = params.get('page') as Screen | null
      if (pageParam && validScreens.includes(pageParam)) {
        return pageParam
      }

      // Check URL hash #xxx
      const hash = window.location.hash.replace('#', '') as Screen
      if (hash && validScreens.includes(hash)) {
        return hash
      }

      // Check localStorage
      const saved = localStorage.getItem('tg_screen') as Screen | null
      if (saved && validScreens.includes(saved)) {
        return saved
      }

      return 'home'
    }

    const initialScreen = getScreenFromUrl()
    if (initialScreen !== 'home') {
      setScreen(initialScreen)
    }

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

  const handleNavigate = (nextScreen: Screen) => {
    setScreen(nextScreen)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_screen', nextScreen)
      const newUrl = nextScreen === 'home' ? '/' : `?page=${nextScreen}`
      window.history.pushState({ screen: nextScreen }, '', newUrl)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      // Studio users always land on the partner dashboard
      handleNavigate('partner')
    } else {
      // Customer users stay where they are (booking, orders, home)
      // — do NOT redirect to studio screens
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
      
      {/* Route-Aware Navigation Header */}
      {isStudioScreen ? (
        <StudioHeader
          currentScreen={screen}
          go={handleNavigate}
          user={user?.role === 'STUDIO' ? user : null}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
        />
      ) : (
        <Header
          currentScreen={screen}
          go={handleNavigate}
          user={user?.role === 'CUSTOMER' ? user : null}
          onOpenAuth={() => handleOpenAuth('CUSTOMER')}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Page Views */}
      <main className="flex-1">
        {screen === 'home' && (
          <HomeView
            go={handleNavigate}
            onQuickSearch={handleQuickSearch}
            onSelectService={handleSelectService}
            onSelectStore={handleSelectStore}
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
          />
        )}

        {screen === 'orders' && <OrdersView go={handleNavigate} user={user} />}

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
