'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { getCurrentUser, logoutUser, getStudioUrl, scheduleSilentRefresh } from '@/lib/api'
import {
  getAuthToken,
  getRefreshToken,
  getAuthRole,
  getAuthUser,
  setAuthUser,
  setAuthRole as setCookieAuthRole,
  clearAllAuth,
  getStorageCookie,
  setStorageCookie,
  removeStorageCookie,
  decodeJwtPayload,
  clearLegacyOrderCookies,
  deleteCookie,
  hasActiveSession,
  getCookie,
} from '@/lib/cookies'
import type { Screen, StoreOption, User } from './data'

interface AppContextType {
  user: User | null
  setUser: (u: User | null) => void
  isAuthLoading: boolean
  isAuthOpen: boolean
  authRole: 'CUSTOMER' | 'STUDIO'
  authType: 'signin' | 'signup'
  openAuth: (role?: 'CUSTOMER' | 'STUDIO', type?: 'signin' | 'signup') => void
  closeAuth: () => void
  navigate: (screen: Screen | string) => void
  handleAuthSuccess: (user: User) => void
  handleSignOut: () => void
  createdOrderId: string
  setCreatedOrderId: (id: string) => void
  prefilledPostcode: string
  setPrefilledPostcode: (p: string) => void
  prefilledGarmentId: string
  setPrefilledGarmentId: (g: string) => void
  prefilledServiceId: string | undefined
  setPrefilledServiceId: (s: string | undefined) => void
  prefilledStore: StoreOption | undefined
  setPrefilledStore: (s: StoreOption | undefined) => void
  garmentBrand: string | undefined
  setGarmentBrand: (b: string | undefined) => void
  garmentNotes: string | undefined
  setGarmentNotes: (n: string | undefined) => void
  isBookingTransitioning: boolean
  startBookingTransition: () => void
  stopBookingTransition: () => void
}

const AppContext = createContext<AppContextType | null>(null)

// Max time the initial session check may hold the full-page loader
const AUTH_BOOT_TIMEOUT_MS = 8000

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'STUDIO'>('CUSTOMER')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signup')
  const [createdOrderId, setCreatedOrderId] = useState('')
  const [isBookingTransitioning, setIsBookingTransitioning] = useState(false)

  const startBookingTransition = () => setIsBookingTransitioning(true)
  const stopBookingTransition = () => setIsBookingTransitioning(false)

  const [prefilledPostcode, setPrefilledPostcode] = useState('')
  const [prefilledGarmentId, setPrefilledGarmentIdState] = useState<string>('')
  const [prefilledServiceId, setPrefilledServiceIdState] = useState<string | undefined>(undefined)
  const [prefilledStore, setPrefilledStore] = useState<StoreOption | undefined>()
  const [garmentBrand, setGarmentBrand] = useState<string | undefined>()
  const [garmentNotes, setGarmentNotes] = useState<string | undefined>()

  const setPrefilledGarmentId = (g: string) => {
    setPrefilledGarmentIdState(g)
  }

  const setPrefilledServiceId = (s: string | undefined) => {
    setPrefilledServiceIdState(s)
  }

  // Sync current user session on mount directly from DB / cookies and purge legacy storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      clearLegacyOrderCookies()

      // Automatically purge legacy order, measurement, and prefill keys from localStorage
      try {
        const keysToRemove = Object.keys(localStorage).filter(
          (k) =>
            k.startsWith('tg_order_') ||
            k.startsWith('tg_prefilled_') ||
            k.startsWith('tg_measurement_') ||
            k.startsWith('tg_order_notes_') ||
            k === 'tg_latest_order' ||
            k === 'tg_last_booking_note' ||
            k === 'tg_booking_notes'
        )
        keysToRemove.forEach((k) => localStorage.removeItem(k))
      } catch { }

      const params = new URLSearchParams(window.location.search)
      const isStudioSignout = params.get('signout') === 'studio' || Boolean(getCookie('tg_studio_signout'))

      if (isStudioSignout) {
        deleteCookie('tg_studio_signout', '/')
        deleteCookie('tg_studio_signout', '')
        clearAllAuth()
        setUser(null)
        if (params.get('signout') === 'studio') {
          window.history.replaceState({}, '', window.location.pathname)
        }
      } else {
        const stored = getAuthUser<User>()
        if (stored && stored.status !== 'INACTIVE') {
          if (stored.role === 'STUDIO' || stored.role === 'TEMP_STUDIO') {
            const cookieRt = getCookie('tg_refresh_token') || getCookie('refreshToken')
            const rt = cookieRt || getAuthToken()
            if (!rt) {
              clearAllAuth()
              setUser(null)
              setIsAuthLoading(false)
              return
            }
            window.location.replace(getStudioUrl('/auth/callback', rt))
            return
          }
          if (stored.role === 'ADMIN') {
            // Admin account must never be treated as a customer on the storefront.
            clearAllAuth()
            setUser(null)
            setIsAuthLoading(false)
            return
          }
          setUser(stored)
        } else if (!hasActiveSession() && !getAuthToken() && !getRefreshToken()) {
          setUser(null)
        }
      }

      const authParam = params.get('auth')
      const unauthParam = params.get('unauthorized')

      if (unauthParam === 'studio_access_denied') {
        toast.error('Unauthorized access, redirecting to user portal.', {
          position: 'top-center',
          autoClose: 3500,
          toastId: 'studio-access-denied-toast',
        })
        window.history.replaceState({}, '', window.location.pathname)
      } else if (authParam === 'required' || authParam === 'signin') {
        const hasToken = Boolean(hasActiveSession() || getAuthToken() || getRefreshToken())
        if (!hasToken) {
          openAuth('CUSTOMER', 'signin')
        }
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    const searchParamsInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const isExplicitSignout = Boolean(searchParamsInit?.get('signout') === 'studio' || getCookie('tg_studio_signout'))
    const hasSession = !isExplicitSignout && (hasActiveSession() || Boolean(getAuthToken() || getRefreshToken()))
    if (hasSession) {
      scheduleSilentRefresh()
      // Never leave the app on the loader if the auth server is slow or unreachable;
      // a late response still updates the user when it arrives.
      const authBootTimeout = window.setTimeout(() => setIsAuthLoading(false), AUTH_BOOT_TIMEOUT_MS)
      getCurrentUser()
        .then((u) => {
          if (u) {
            if (u.role === 'STUDIO' || u.role === 'TEMP_STUDIO') {
              const rt = getRefreshToken() || getAuthToken()
              if (rt) {
                window.location.replace(getStudioUrl('/auth/callback', rt))
                return
              }
            }
            if (u.role === 'ADMIN') {
              clearAllAuth()
              setUser(null)
              return
            }
            if (u.status !== 'INACTIVE') {
              setUser(u)
            } else {
              setUser(null)
              clearAllAuth()
            }
          } else {
            if (!hasActiveSession() && !getRefreshToken()) {
              setUser(null)
              clearAllAuth()
            }
          }
        })
        .catch(() => {
          clearAllAuth()
          setUser(null)
        })
        .finally(() => {
          window.clearTimeout(authBootTimeout)
          setIsAuthLoading(false)
        })
    } else {
      setUser(null)
      setIsAuthLoading(false)
    }

    // Sync auth state if cookies changed while user was in another portal tab
    const handleSync = () => {
      if (getCookie('tg_studio_signout')) {
        deleteCookie('tg_studio_signout', '/')
        deleteCookie('tg_studio_signout', '')
        clearAllAuth()
        setUser(null)
        return
      }
      const hasToken = Boolean(getAuthToken() || getRefreshToken() || hasActiveSession())
      if (!hasToken) {
        setUser((prev) => (prev ? null : prev))
      } else {
        getCurrentUser().then((u) => {
          if (u) {
            if (u.role === 'STUDIO' || u.role === 'TEMP_STUDIO') {
              const rt = getRefreshToken() || getAuthToken()
              if (rt) {
                window.location.replace(getStudioUrl('/auth/callback', rt))
                return
              }
            }
            if (u.status !== 'INACTIVE') {
              setUser(u)
            } else {
              setUser(null)
              clearAllAuth()
            }
          } else {
            if (!hasActiveSession() && !getRefreshToken()) {
              setUser(null)
              clearAllAuth()
            }
          }
        }).catch(() => {
          clearAllAuth()
          setUser(null)
        })
      }
    }

    window.addEventListener('focus', handleSync)
    document.addEventListener('visibilitychange', handleSync)

    return () => {
      window.removeEventListener('focus', handleSync)
      document.removeEventListener('visibilitychange', handleSync)
    }
  }, [])

  const openAuth = (role: 'CUSTOMER' | 'STUDIO' = 'CUSTOMER', type: 'signin' | 'signup' = 'signup') => {
    setAuthRole(role)
    setAuthType(type)
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    setIsAuthOpen(false)
  }

  const handleAuthSuccess = (loggedUser: User) => {
    const rt = getRefreshToken()
    const rtPayload = decodeJwtPayload(rt)
    const tokenRole = rtPayload?.role
    const effectiveRole = tokenRole || loggedUser.role || 'CUSTOMER'

    if (effectiveRole === 'STUDIO' || effectiveRole === 'TEMP_STUDIO') {
      setIsAuthOpen(false)
      const rtVal = getRefreshToken() || getAuthToken()
      window.location.replace(getStudioUrl('/auth/callback', rtVal))
      return
    }

    if (loggedUser.status === 'INACTIVE') {
      setUser(null)
      setIsAuthOpen(false)
      clearAllAuth()
      toast.info('Studio enrollment is incomplete. Please complete your registration in Studio Portal.', {
        position: 'top-center',
        autoClose: 4000,
      })
      return
    }

    const updatedUser = { ...loggedUser, role: effectiveRole as any }
    setUser(updatedUser)
    setIsAuthOpen(false)
    setAuthRole(effectiveRole === 'STUDIO' ? 'STUDIO' : 'CUSTOMER')
    setCookieAuthRole(effectiveRole)
    setAuthUser(updatedUser)
    scheduleSilentRefresh((loggedUser as any).token)

    toast.success(`Welcome back, ${loggedUser.name || 'Member'}!`, {
      position: 'top-center',
      autoClose: 3000,
    })

    if (effectiveRole === 'CUSTOMER') {
      router.push('/book')
    } else {
      router.push('/')
    }
  }

  const handleSignOut = async () => {
    try {
      await logoutUser()
    } catch {
      clearAllAuth()
    }
    setUser(null)
    setIsAuthOpen(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    } else {
      router.push('/')
    }
  }

  const navigate = async (screenOrPath: Screen | string) => {
    if (screenOrPath === 'book' || screenOrPath === '/book') {
      if (!user) {
        const refToken = getRefreshToken()
        if (refToken) {
          const validated = await getCurrentUser()
          if (validated) {
            router.push('/book')
            return
          }
        }
        openAuth('CUSTOMER', 'signin')
        return
      }
      router.push('/book')
      return
    }

    if (screenOrPath === 'order' || screenOrPath.startsWith('/order')) {
      if (!user) {
        const refToken = getRefreshToken()
        if (refToken) {
          const validated = await getCurrentUser()
          if (validated) {
            if (screenOrPath.startsWith('/order/')) {
              router.push(screenOrPath)
              return
            }
            const orderId = createdOrderId || 'ORD-2654'
            router.push(`/order/${orderId}`)
            return
          }
        }
        openAuth('CUSTOMER', 'signin')
        return
      }
      if (screenOrPath.startsWith('/order/')) {
        router.push(screenOrPath)
        return
      }
      const orderId = createdOrderId || 'ORD-2654'
      router.push(`/order/${orderId}`)
      return
    }

    if (screenOrPath === 'orders' || screenOrPath === '/orders') {
      if (!user) {
        const refToken = getRefreshToken()
        if (refToken) {
          const validated = await getCurrentUser()
          if (validated) {
            router.push('/orders')
            return
          }
        }
        openAuth('CUSTOMER', 'signin')
        return
      }
      router.push('/orders')
      return
    }

    if (screenOrPath === 'profile' || screenOrPath === '/profile') {
      if (!user) {
        const refToken = getRefreshToken()
        if (refToken) {
          const validated = await getCurrentUser()
          if (validated) {
            router.push('/profile')
            return
          }
        }
        openAuth('CUSTOMER', 'signin')
        return
      }
      router.push('/profile')
      return
    }

    if (screenOrPath === 'home' || screenOrPath === '/') {
      const currentRole = user?.role || getAuthRole()
      if (currentRole === 'CUSTOMER') {
        router.push('/book')
        return
      }
      router.push('/')
      return
    }

    // Normalize legacy aliases directly to canonical routes
    let normalized = screenOrPath
    if (normalized === 'support' || normalized === '/support' || normalized.startsWith('/support/')) {
      normalized = '/contact'
    } else if (normalized === 'order' || normalized === '/order') {
      normalized = '/orders'
    }

    const target = normalized.startsWith('/') ? normalized : `/${normalized}`
    router.push(target)
  }

  return (
    <AppContext.Provider
      value={{
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
        createdOrderId,
        setCreatedOrderId,
        prefilledPostcode,
        setPrefilledPostcode,
        prefilledGarmentId,
        setPrefilledGarmentId,
        prefilledServiceId,
        setPrefilledServiceId,
        prefilledStore,
        setPrefilledStore,
        garmentBrand,
        setGarmentBrand,
        garmentNotes,
        setGarmentNotes,
        isBookingTransitioning,
        startBookingTransition,
        stopBookingTransition,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
