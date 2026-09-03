'use client'

import { OrdersView } from '@/components/orders-view'
import { useApp } from '@/components/app-provider'

export default function OrdersPage() {
  const { user, navigate, openAuth } = useApp()
  return (
    <OrdersView
      go={navigate}
      user={user}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
    />
  )
}
