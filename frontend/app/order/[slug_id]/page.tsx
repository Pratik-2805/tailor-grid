'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { OrderDetailsView } from '@/components/order-details-view'
import { getCurrentUser } from '@/lib/api'
import { type Screen, type User } from '@/components/data'

export default function OrderSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slugId = (params?.slug_id as string) || 'ORD-8492'

  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

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

  const handleGo = (s: Screen) => {
    if (s === 'home') router.push('/')
    else router.push(`/?page=${s}`)
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
        currentScreen="order"
        go={handleGo}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col">
        <OrderDetailsView
          slugId={slugId}
          onGoHome={() => router.push('/')}
          onGoOrders={() => router.push('/?page=orders')}
        />
      </main>

      <Footer go={handleGo} />
    </div>
  )
}
