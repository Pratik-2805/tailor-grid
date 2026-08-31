'use client'

import { useParams, useRouter } from 'next/navigation'
import { OrderDetailsView } from '@/components/order-details-view'

export default function OrderSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slugId = (params?.slug_id as string) || 'ORD-8492'

  return (
    <OrderDetailsView
      slugId={slugId}
      onGoHome={() => router.push('/')}
      onGoOrders={() => router.push('/?page=orders')}
    />
  )
}
