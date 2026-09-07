'use client'

import { useEffect } from 'react'
import { OrdersView } from '@/components/orders-view'
import { useApp } from '@/components/app-provider'
import { CustomLoader } from '@/components/custom-loader'

export default function OrdersPage() {
  const { user, isAuthLoading, navigate, openAuth } = useApp()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuth('CUSTOMER', 'signin')
    }
  }, [isAuthLoading, user, openAuth])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <CustomLoader
          size="lg"
          variant="atelier"
          text="Accessing your orders"
          subtext="Retrieving your bespoke fitting schedule and alteration history"
        />
      </div>
    )
  }

  return (
    <OrdersView
      go={navigate}
      user={user}
      onOpenAuth={() => openAuth('CUSTOMER', 'signin')}
    />
  )
}
