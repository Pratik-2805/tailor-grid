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
    if (clean === 'orders') return 'orders'
    if (clean === 'order') return 'order'
    if (clean === 'partner') return 'partner'
    if (clean === 'profile') return 'profile'
    if (clean === 'contact') return 'contact'
    if (clean === 'support') return 'support'
    if (clean === 'privacy') return 'privacy'
    return 'home'
  }

  const currentScreen = getScreenFromPath()
  const isCustomer = Boolean(user && user.role === 'CUSTOMER')
  const isStudioScreen = !isCustomer && (currentScreen === 'for-partners' || currentScreen === 'partner')
  const isBookScreen = pathname === '/book' || pathname?.startsWith('/book')
  const hideFooter = currentScreen === 'partner' || isBookScreen

  // Route Guard: Logged-in customers must never access partner or studio routes via URL
  React.useEffect(() => {
    if (isAuthLoading) return
    if (user && user.role === 'CUSTOMER') {
      const clean = pathname ? pathname.replace(/^\//, '').split('/')[0] : ''
      if (clean === 'for-partners' || clean === 'partner') {
        navigate('/book')
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

  // Full-screen clean site normal loader without navbar or footer during initial load
  if (isAuthLoading) {
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
