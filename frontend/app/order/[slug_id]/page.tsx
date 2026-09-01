'use client'

import { useParams } from 'next/navigation'
import { OrderDetailsView } from '@/components/order-details-view'
import { useApp } from '@/components/app-provider'

export default function OrderSlugPage() {
  const params = useParams()
  const slugId = (params?.slug_id as string) || 'ORD-8492'
  const { navigate } = useApp()

  return (
    <OrderDetailsView
      slugId={slugId}
      onGoHome={() => navigate('home')}
      onGoOrders={() => navigate('orders')}
    />
  )
}
