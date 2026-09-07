'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ToastContainer } from 'react-toastify'
import { useApp } from './app-provider'
import { Header } from './header'
import { StudioSubNav } from './studio-sub-nav'
import { Footer } from './footer'
import { AuthModal } from './auth-modal'
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

  // Check if home page is in custom loader state
  const isHomePageLoading =
    (pathname === '/' || !pathname) &&
    (isAuthLoading || (user && user.role === 'CUSTOMER'))

  const isLoaderRunning = isHomePageLoading
  const showHeader = !isLoaderRunning
  const showFooter = !isLoaderRunning && !hideFooter

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">
      {/* Primary Global Navigation Header (Only visible when loader is not running) */}
      {showHeader && (
        <Header
          currentScreen={currentScreen}
          go={navigate}
          user={user}
          onOpenAuth={() => openAuth('CUSTOMER')}
          onSignOut={handleSignOut}
        />
      )}

      {/* Sub-Navbar for Partner Pages */}
      {showHeader && isStudioScreen && (
        <StudioSubNav
          currentScreen={currentScreen}
          go={navigate}
          user={user}
          onOpenAuth={openAuth}
        />
      )}

      {/* Dynamic Main Route View Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Universal Footer */}
      {showFooter && <Footer go={navigate} />}

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
