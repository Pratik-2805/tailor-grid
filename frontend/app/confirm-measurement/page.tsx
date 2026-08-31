'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConfirmMeasurementView } from '@/components/confirm-measurement-view'
import { getCurrentUser } from '@/lib/api'
import { type Screen, type StoreOption, type User } from '@/components/data'

export default function ConfirmMeasurementPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const [draft, setDraft] = useState<{
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
  }>({
    city: 'Vasai, IN-MH',
    garmentId: 'trousers',
    serviceId: 'trouser-hem-plain',
    pickupOption: 'now',
    scheduleDate: new Date(),
    scheduleTime: '03:30 PM',
    images: [],
  })

  // Synchronously & asynchronously verify authentication
  useEffect(() => {
    let isMounted = true

    const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
    if (!token) {
      // Immediately redirect to home and open login modal without showing route
      router.replace('/?auth=required')
      return
    }

    getCurrentUser().then((u) => {
      if (isMounted) {
        if (!u) {
          router.replace('/?auth=required')
        } else {
          setUser(u)
          setIsLoadingAuth(false)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [router])

  // Load measurement draft from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_measurement_draft')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDraft((prev) => ({
            ...prev,
            ...parsed,
            scheduleDate: parsed.scheduleDate ? new Date(parsed.scheduleDate) : prev.scheduleDate,
          }))
        } catch {}
      }
    }
  }, [])

  const handleGo = (s: Screen) => {
    if (s === 'home') router.push('/')
    else if (s === 'confirm-measurement') router.push('/confirm-measurement')
    else if (s === 'order') {
      const latest = typeof window !== 'undefined' ? localStorage.getItem('tg_latest_order') : null
      let orderId = 'ORD-6812'
      if (latest) {
        try {
          const parsed = JSON.parse(latest)
          if (parsed.id) orderId = parsed.id
        } catch {}
      }
      router.push(`/order/${orderId}`)
    }
    else router.push(`/?page=${s}`)
  }

  const handleConfirmMeasurements = (data: {
    garmentId: string
    serviceId: string
    measurements: Record<string, string>
    brand?: string
    notes?: string
    images?: string[]
    fittingMode?: string
    matchedStore?: StoreOption
    createdOrderId?: string
  }) => {
    const orderId = data.createdOrderId || 'ORD-6812'
    router.push(`/order/${orderId}`)
  }

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tg_token')
      localStorage.removeItem('tg_user')
      localStorage.removeItem('tg_user_role')
      localStorage.removeItem('tg_screen')
    }
    setUser(null)
    router.replace('/?auth=required')
  }

  // Do not render any route UI if not logged in or verifying session
  if (isLoadingAuth || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header
        currentScreen="confirm-measurement"
        go={handleGo}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col">
        <ConfirmMeasurementView
          go={handleGo}
          user={user}
          initialCity={draft.city}
          initialGarmentId={draft.garmentId}
          initialServiceId={draft.serviceId}
          initialPickupOption={draft.pickupOption}
          initialScheduleDate={draft.scheduleDate}
          initialScheduleTime={draft.scheduleTime}
          initialImages={draft.images}
          onConfirmMeasurements={handleConfirmMeasurements}
        />
      </main>

      <Footer go={handleGo} />
    </div>
  )
}
