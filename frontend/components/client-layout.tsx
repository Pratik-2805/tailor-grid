'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ToastContainer } from 'react-toastify'
import { useApp } from './app-provider'
import { Header } from './header'
import { StudioSubNav } from './studio-sub-nav'
import { Footer } from './footer'
import { LoginModal } from './login-modal'
import { SignUpModal } from './signup-modal'
import { SewingLoader } from './sewing-loader'
import { NormalLoader } from './normal-loader'
import { FloatingDemoAd } from './floating-demo-ad'
import { getAuthRole } from '@/lib/cookies'
import type { Screen } from './data'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const {
    user,
    setUser,
    isAuthLoading,
    isAuthOpen,
    authRole,
    authType,
    openAuth,
    closeAuth,
    navigate,
    handleAuthSuccess,
    handleSignOut,
    isBookingTransitioning,
  } = useApp()

  const getScreenFromPath = (): Screen => {
    if (!pathname || pathname === '/') return 'home'
    const clean = pathname.replace(/^\//, '').split('/')[0]
    if (clean === 'book') return 'book'
    if (clean === 'about') return 'about'
    if (clean === 'how-it-works') return 'how-it-works'
    if (clean === 'for-partners') return 'for-partners'
    if (clean === 'orders' || clean === 'order') return 'orders'
    if (clean === 'profile') return 'profile'
    if (clean === 'contact' || clean === 'support') return 'contact'
    if (clean === 'privacy') return 'privacy'
    if (clean === 'terms') return 'terms'
    return 'home'
  }

  const currentScreen = getScreenFromPath()
  const isCustomer = Boolean(user && user.role === 'CUSTOMER')
  const isStudioScreen = !isCustomer && currentScreen === 'for-partners'

  // Remove footers completely from book, my orders, order details, and profile in customer site
  const isCustomerNoFooterScreen =
    currentScreen === 'book' ||
    currentScreen === 'orders' ||
    currentScreen === 'profile' ||
    pathname === '/book' ||
    pathname?.startsWith('/book') ||
    pathname === '/orders' ||
    pathname?.startsWith('/orders') ||
    pathname === '/order' ||
    pathname?.startsWith('/order') ||
    pathname === '/profile' ||
    pathname?.startsWith('/profile')

  const hideFooter = isCustomerNoFooterScreen

  // Route Guard: Logged-in customers must never access '/' (home) via URL or back navigation
  React.useEffect(() => {
    if (isAuthLoading) return
    const role = user?.role || getAuthRole()
    if (role === 'CUSTOMER') {
      if (pathname === '/') {
        navigate('/book')
        return
      }
    }
  }, [user, pathname, isAuthLoading, navigate])

  // Suppress third-party Chrome Extension unhandled promise rejections from noise-polluting Next.js console
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason
      const reasonStr = String(reason || '')
      const stack = reason?.stack || ''
      if (
        reasonStr.includes('chrome-extension://') ||
        stack.includes('chrome-extension://') ||
        reasonStr.includes("reading 'M_ID'") ||
        stack.includes('eppiocemhmnlbhjplcgkofciiegomcon')
      ) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [])

  // Disable browser automatic scroll restoration and force top scroll on load / route changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }
  }, [pathname])

  // Full-screen loader only for customer-protected private account routes during auth validation
  const isProtectedAccountRoute =
    currentScreen === 'orders' ||
    currentScreen === 'order' ||
    currentScreen === 'profile' ||
    pathname === '/orders' ||
    pathname?.startsWith('/orders') ||
    pathname === '/order' ||
    pathname?.startsWith('/order') ||
    pathname === '/profile' ||
    pathname?.startsWith('/profile')

  if (isAuthLoading && isProtectedAccountRoute) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
        <NormalLoader />
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">
      {/* Primary Global Navigation Header (Always permanently mounted) */}
      <Header
        currentScreen={currentScreen}
        go={navigate}
        user={user}
        isAuthLoading={isAuthLoading}
        onOpenAuth={(type = 'signup') => {
          openAuth('CUSTOMER', type)
        }}
        onSignOut={handleSignOut}
      />

      {/* Sub-Navbar for Partner Pages */}
      {isStudioScreen && (
        <StudioSubNav
          currentScreen={currentScreen}
          go={navigate}
          user={user}
          onOpenAuth={(role = 'STUDIO', type = 'signup') => {
            openAuth(role, type)
          }}
        />
      )}

      {/* Dynamic Main Route View Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Universal Footer */}
      {!hideFooter && <Footer go={navigate} />}

      {/* Dedicated Login Modal */}
      <LoginModal
        isOpen={isAuthOpen && authType === 'signin'}
        targetRole={authRole}
        currentUser={user}
        mandatoryPhoneRequired={false}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
        onSwitchToSignUp={() => openAuth(authRole, 'signup')}
        onSignOut={handleSignOut}
      />

      {/* Dedicated Sign Up Modal */}
      <SignUpModal
        isOpen={isAuthOpen && authType === 'signup'}
        targetRole={authRole}
        currentUser={user}
        mandatoryPhoneRequired={false}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => openAuth(authRole, 'signin')}
        onSignOut={handleSignOut}
      />

      {/* Global Booking Seamless Transition Loader */}
      {isBookingTransitioning && (
        <SewingLoader active={true} persistent={true} />
      )}

      {/* Floating Walkthrough Ad Widget (Strictly restricted to "How It Works" page only) */}
      {!user && (currentScreen === 'how-it-works' || pathname === '/how-it-works' || pathname?.startsWith('/how-it-works')) && (
        <FloatingDemoAd
          onOpenStudioAuth={() => openAuth('STUDIO', 'signup')}
          onOpenCustomerAuth={() => openAuth('CUSTOMER', 'signup')}
          onNavigate={(path) => navigate(path as Screen)}
        />
      )}

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
