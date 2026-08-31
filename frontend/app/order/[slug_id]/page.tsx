'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { OrderDetailsView } from '@/components/order-details-view'
import { type Screen } from '@/components/data'

export default function OrderSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slugId = (params?.slug_id as string) || 'ORD-8492'

  const handleGo = (s: Screen) => {
    if (s === 'home') router.push('/')
    else router.push(`/?page=${s}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header
        currentScreen="order"
        go={handleGo}
      />
      <main className="flex-1">
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

