'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { OrderDetailsView } from '@/components/order-details-view'
import { useApp } from '@/components/app-provider'
import { NormalLoader } from '@/components/normal-loader'

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const slugId = typeof params?.slug_id === 'string' ? params.slug_id : Array.isArray(params?.slug_id) ? params.slug_id[0] : ''
  const { user, isAuthLoading, navigate, openAuth } = useApp()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuth('CUSTOMER', 'signin')
      router.replace('/')
    }
  }, [isAuthLoading, user, openAuth, router])

  if (isAuthLoading || !user) {
    return (
      <div className="flex-1 min-h-[60vh] flex items-center justify-center py-20 p-6 bg-[#FAF8F5] transition-opacity duration-300">
        <NormalLoader />
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
