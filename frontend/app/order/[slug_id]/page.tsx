'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OrderDetailsView } from '@/components/order-details-view'
import { useApp } from '@/components/app-provider'
import { CustomLoader } from '@/components/custom-loader'

export default function OrderSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slugId = (params?.slug_id as string) || ''
  const { user, isAuthLoading, navigate, openAuth } = useApp()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuth('CUSTOMER', 'signin')
      router.replace('/?auth=required')
    }
  }, [isAuthLoading, user, openAuth, router])

  if (isAuthLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text="Accessing your order details"
          subtext="Verifying authentication and security clearance"
        />
      </div>
    )
  }

  return (
    <OrderDetailsView
      slugId={slugId}
      onGoHome={() => navigate('home')}
      onGoOrders={() => navigate('orders')}
    />
  )
}
