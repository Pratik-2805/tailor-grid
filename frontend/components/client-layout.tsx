'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ToastContainer } from 'react-toastify'
import { useApp } from './app-provider'
import { Header } from './header'
import { StudioSubNav } from './studio-sub-nav'
import { Footer } from './footer'
import { AuthModal } from './auth-modal'
import { SewingLoader } from './sewing-loader'
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
    if (clean === 'admin') return 'admin'
    if (clean === 'partner') return 'partner'
    if (clean === 'profile') return 'profile'
    return 'home'
  }

  const currentScreen = getScreenFromPath()
  const isStudioScreen = currentScreen === 'for-partners' || currentScreen === 'partner'
  const isBookScreen = pathname === '/book' || pathname?.startsWith('/book')
  const hideFooter = currentScreen === 'partner' || isBookScreen

  // Disable browser automatic scroll restoration and force top scroll on load / route changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">
      {/* Primary Global Navigation Header (Always permanently mounted) */}
      <Header
        currentScreen={currentScreen}
        go={navigate}
        user={user}
        onOpenAuth={() => {
          // Always open the role-selection modal — never direct redirect
          openAuth('CUSTOMER')
        }}
        onSignOut={handleSignOut}
      />

      {/* Sub-Navbar for Partner Pages */}
      {isStudioScreen && (
        <StudioSubNav
          currentScreen={currentScreen}
          go={navigate}
          user={user}
          onOpenAuth={() => {
            // Always open role-selection modal
            openAuth('CUSTOMER')
          }}
        />
      )}

      {/* Dynamic Main Route View Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Universal Footer */}
      {!hideFooter && <Footer go={navigate} />}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        targetRole={authRole}
        authType={authType}
        currentUser={user}
        mandatoryPhoneRequired={false}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
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
