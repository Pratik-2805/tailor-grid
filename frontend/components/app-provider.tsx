'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { getCurrentUser, logoutUser, getStudioUrl } from '@/lib/api'
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
  measurementDraft: {
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
  }
  setMeasurementDraft: React.Dispatch<React.SetStateAction<{
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
  }>>
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
  confirmedMeasurements: Record<string, string> | undefined
  setConfirmedMeasurements: (m: Record<string, string> | undefined) => void
  garmentBrand: string | undefined
  setGarmentBrand: (b: string | undefined) => void
  garmentNotes: string | undefined
  setGarmentNotes: (n: string | undefined) => void
  isBookingTransitioning: boolean
  startBookingTransition: () => void
  stopBookingTransition: () => void
}

const AppContext = createContext<AppContextType | null>(null)

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
  const [prefilledGarmentId, setPrefilledGarmentIdState] = useState<string>('trousers')
  const [prefilledServiceId, setPrefilledServiceIdState] = useState<string | undefined>(undefined)
  const [prefilledStore, setPrefilledStore] = useState<StoreOption | undefined>()
  const [confirmedMeasurements, setConfirmedMeasurements] = useState<Record<string, string> | undefined>()
  const [garmentBrand, setGarmentBrand] = useState<string | undefined>()
  const [garmentNotes, setGarmentNotes] = useState<string | undefined>()

  const setPrefilledGarmentId = (g: string) => {
    setPrefilledGarmentIdState(g)
    if (typeof window !== 'undefined') {
      setStorageCookie('tg_prefilled_garment', g)
    }
  }

  const setPrefilledServiceId = (s: string | undefined) => {
    setPrefilledServiceIdState(s)
    if (typeof window !== 'undefined') {
      if (s) setStorageCookie('tg_prefilled_service', s)
      else removeStorageCookie('tg_prefilled_service')
    }
  }

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
    city: '',
    garmentId: 'trousers',
    serviceId: 'trouser-hem-plain',
    pickupOption: 'now',
    scheduleDate: new Date(),
    scheduleTime: '03:30 PM',
    images: [],
  })

  // Sync current user session on mount directly from DB / cookies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const g = getStorageCookie('tg_prefilled_garment', 'trousers')
      if (g && g !== 'trousers') setPrefilledGarmentIdState(g)
      const s = getStorageCookie('tg_prefilled_service')
      if (s) setPrefilledServiceIdState(s)

      const stored = getAuthUser<User>()
      if (stored && stored.status !== 'INACTIVE') {
        if (stored.role === 'STUDIO' || stored.role === 'TEMP_STUDIO') {
          const rt = getRefreshToken() || getAuthToken()
          window.location.replace(getStudioUrl('/auth/callback', rt))
          return
        }
        setUser(stored)
      } else if (!getAuthToken() && !getRefreshToken()) {
        setUser(null)
      }

      const params = new URLSearchParams(window.location.search)
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
        const hasToken = Boolean(getAuthToken() || getRefreshToken())
        if (!hasToken) {
          openAuth('CUSTOMER', 'signin')
        }
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    const token = getAuthToken() || getRefreshToken()
    if (token) {
      getCurrentUser()
        .then((u) => {
          if (u) {
            if (u.role === 'STUDIO' || u.role === 'TEMP_STUDIO') {
              const rt = getRefreshToken() || getAuthToken()
              window.location.replace(getStudioUrl('/auth/callback', rt))
              return
            }
            if (u.status !== 'INACTIVE') {
              setUser(u)
            } else {
              setUser(null)
              clearAllAuth()
            }
          } else {
            setUser(null)
            clearAllAuth()
          }
        })
        .catch(() => {
          const cached = getAuthUser<User>()
          if (cached && (cached.role === 'STUDIO' || cached.role === 'TEMP_STUDIO')) {
            const rt = getRefreshToken() || getAuthToken()
            window.location.replace(getStudioUrl('/auth/callback', rt))
            return
          }
          if (cached && cached.status !== 'INACTIVE') {
            setUser(cached)
          } else {
            setUser(null)
            clearAllAuth()
          }
        })
        .finally(() => {
          setIsAuthLoading(false)
        })
    } else {
      setUser(null)
      setIsAuthLoading(false)
    }

    // Sync auth state if cookies changed while user was in another portal tab
    const handleSync = () => {
      const hasToken = Boolean(getAuthToken() || getRefreshToken())
      if (!hasToken) {
        setUser((prev) => (prev ? null : prev))
      } else {
        getCurrentUser().then((u) => {
          if (u) {
            if (u.role === 'STUDIO' || u.role === 'TEMP_STUDIO') {
              const rt = getRefreshToken() || getAuthToken()
              window.location.replace(getStudioUrl('/auth/callback', rt))
              return
            }
            if (u.status !== 'INACTIVE') {
              setUser(u)
            } else {
              setUser(null)
              clearAllAuth()
            }
          } else {
            setUser(null)
            clearAllAuth()
          }
        }).catch(() => {})
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
    if (loggedUser.role === 'STUDIO' || loggedUser.role === 'TEMP_STUDIO') {
      setIsAuthOpen(false)
      const rt = getRefreshToken() || getAuthToken()
      window.location.replace(getStudioUrl('/auth/callback', rt))
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

    setUser(loggedUser)
    setIsAuthOpen(false)
    const effectiveRole: 'CUSTOMER' | 'STUDIO' = 'CUSTOMER'
    setAuthRole(effectiveRole)
    setCookieAuthRole(loggedUser.role || effectiveRole)
    setAuthUser(loggedUser)

    toast.success(`Welcome back, ${loggedUser.name || 'Member'}!`, {
      position: 'top-center',
      autoClose: 3000,
    })

    if (loggedUser.role === 'CUSTOMER') {
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
    toast.info('Signed out successfully.', {
      position: 'top-center',
      autoClose: 2500,
    })
    router.push('/')
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
      if (user && user.role === 'CUSTOMER') {
        router.push('/book')
        return
      }
      router.push('/')
      return
    }

    if (
      screenOrPath === 'for-partners' ||
      screenOrPath === '/for-partners' ||
      screenOrPath === 'partner' ||
      screenOrPath === '/partner' ||
      screenOrPath.startsWith('/partner/') ||
      screenOrPath.startsWith('/for-partners/')
    ) {
      if (user && user.role === 'CUSTOMER') {
        router.push('/book')
        return
      }
    }

    const target = screenOrPath.startsWith('/') ? screenOrPath : `/${screenOrPath}`
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
        measurementDraft,
        setMeasurementDraft,
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
        confirmedMeasurements,
        setConfirmedMeasurements,
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
