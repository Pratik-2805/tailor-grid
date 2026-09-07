'use client'

import { useParams } from 'next/navigation'
import { OrderDetailsView } from '@/components/order-details-view'
import { useApp } from '@/components/app-provider'
import { CustomLoader } from '@/components/custom-loader'

export default function OrderSlugPage() {
  const params = useParams()
  const slugId = (params?.slug_id as string) || 'ORD-8492'
  const { isAuthLoading, navigate } = useApp()

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text={`Locating Order ${slugId}`}
          subtext="Syncing garment status with Savile Row master tailors"
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
