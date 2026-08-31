'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { OrderDetailsView } from '@/components/order-details-view'
import { AuthModal } from '@/components/auth-modal'
import { getCurrentUser } from '@/lib/api'
import { type Screen, type User } from '@/components/data'
import { Lock, LogIn } from 'lucide-react'

export default function OrderSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slugId = (params?.slug_id as string) || 'ORD-8492'

  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'STUDIO'>('CUSTOMER')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')

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

  const handleGo = (s: Screen) => {
    if (s === 'home') router.push('/')
    else router.push(`/?page=${s}`)
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
        currentScreen="order"
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
              Please sign in or create an account to view your confirmed order pass, atelier details, and digital tracking.
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
          /* Authenticated User: Render Order Confirmation Details */
          <OrderDetailsView
            slugId={slugId}
            onGoHome={() => router.push('/')}
            onGoOrders={() => router.push('/?page=orders')}
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
