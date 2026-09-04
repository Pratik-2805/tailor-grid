'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { getCurrentUser, getStudioUrl } from '@/lib/api'
import type { Screen, StoreOption, User } from './data'

interface AppContextType {
  user: User | null
  setUser: (u: User | null) => void
  isAuthOpen: boolean
  authRole: 'CUSTOMER' | 'STUDIO'
  authType: 'signin' | 'signup'
  openAuth: (role?: 'CUSTOMER' | 'STUDIO', type?: 'signin' | 'signup') => void
  closeAuth: () => void
  isProfileOpen: boolean
  setIsProfileOpen: (open: boolean) => void
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
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'STUDIO'>('CUSTOMER')
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signup')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState('ORD-2654')

  const [prefilledPostcode, setPrefilledPostcode] = useState('W8 4EP')
  const [prefilledGarmentId, setPrefilledGarmentIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tg_prefilled_garment') || 'trousers'
    }
    return 'trousers'
  })
  const [prefilledServiceId, setPrefilledServiceIdState] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tg_prefilled_service') || undefined
    }
    return undefined
  })
  const [prefilledStore, setPrefilledStore] = useState<StoreOption | undefined>()
  const [confirmedMeasurements, setConfirmedMeasurements] = useState<Record<string, string> | undefined>()
  const [garmentBrand, setGarmentBrand] = useState<string | undefined>()
  const [garmentNotes, setGarmentNotes] = useState<string | undefined>()

  const setPrefilledGarmentId = (g: string) => {
    setPrefilledGarmentIdState(g)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_prefilled_garment', g)
    }
  }

  const setPrefilledServiceId = (s: string | undefined) => {
    setPrefilledServiceIdState(s)
    if (typeof window !== 'undefined') {
      if (s) localStorage.setItem('tg_prefilled_service', s)
      else localStorage.removeItem('tg_prefilled_service')
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
    city: 'Mumbai, IN',
    garmentId: 'trousers',
    serviceId: 'trouser-hem-plain',
    pickupOption: 'now',
    scheduleDate: new Date(),
    scheduleTime: '03:30 PM',
    images: [],
  })

  // Sync current user session on mount directly from DB
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tg_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUser(parsed)
          if (parsed.role === 'CUSTOMER' && window.location.pathname === '/') {
            router.replace('/book')
          }
        } catch { }
      }

      const params = new URLSearchParams(window.location.search)
      const authParam = params.get('auth')
      if (authParam === 'required' || authParam === 'signin') {
        openAuth('CUSTOMER', 'signin')
      }
    }

    getCurrentUser().then((u) => {
      if (u) {
        setUser(u)
        if (typeof window !== 'undefined') {
          localStorage.setItem('tg_user', JSON.stringify(u))
          if (u.role === 'CUSTOMER' && window.location.pathname === '/') {
            router.replace('/book')
          }
        }
      } else if (typeof window !== 'undefined' && !localStorage.getItem('tg_token')) {
        setUser(null)
      }
    })
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
    setUser(loggedUser)
    setIsAuthOpen(false)

    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_user_role', loggedUser.role ?? 'CUSTOMER')
      localStorage.setItem('tg_user', JSON.stringify(loggedUser))
    }

    toast.success(`Welcome back, ${loggedUser.name || 'Member'}!`, {
      position: 'top-center',
      autoClose: 3000,
    })

    if (loggedUser.role === 'STUDIO') {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
      toast.info('Redirecting to Studio Dashboard...', { position: 'top-center', autoClose: 2000 })
      window.location.href = getStudioUrl('/', token)
    } else {
      router.push('/book')
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
    setIsAuthOpen(false)
    toast.info('Signed out successfully.', {
      position: 'top-center',
      autoClose: 2500,
    })
    router.push('/')
  }

  const navigate = (screenOrPath: Screen | string) => {
    if (screenOrPath === 'book' || screenOrPath === '/book') {
      if (!user || !user.phone) {
        openAuth('CUSTOMER', 'signup')
        return
      }
      router.push('/book')
      return
    }

    if (screenOrPath === 'order' || screenOrPath.startsWith('/order')) {
      if (!user || !user.phone) {
        openAuth('CUSTOMER', user ? 'signup' : 'signin')
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
      if (!user || !user.phone) {
        openAuth('CUSTOMER', user ? 'signup' : 'signin')
        return
      }
      router.push('/orders')
      return
    }

    if (screenOrPath === 'profile' || screenOrPath === '/profile') {
      if (!user) {
        openAuth('CUSTOMER', 'signin')
        return
      }
      setIsProfileOpen(true)
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

    const target = screenOrPath.startsWith('/') ? screenOrPath : `/${screenOrPath}`
    router.push(target)
  }

  return (
    <AppContext.Provider
      value={{
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
