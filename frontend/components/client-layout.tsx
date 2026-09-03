'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ToastContainer } from 'react-toastify'
import { useApp } from './app-provider'
import { Header } from './header'
import { StudioSubNav } from './studio-sub-nav'
import { Footer } from './footer'
import { AuthModal } from './auth-modal'
import { ProfileModal } from './profile-modal'
import type { Screen } from './data'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const {
    user,
    setUser,
    isAuthOpen,
    authRole,
    authType,
    openAuth,
    closeAuth,
    isProfileOpen,
    setIsProfileOpen,
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
    if (clean === 'confirm-measurement') return 'confirm-measurement'
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18191B]">
      {/* Primary Global Navigation Header (Always Mounted & Static) */}
      <Header
        currentScreen={currentScreen}
        go={navigate}
        user={user}
        onOpenAuth={() => openAuth('CUSTOMER')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Sub-Navbar for Partner Pages */}
      {isStudioScreen && (
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

      {/* Account Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUpdateUser={(updated) => setUser(updated)}
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
