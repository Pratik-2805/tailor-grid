'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeAuthCode, getCurrentUser, refreshAccessToken, getStudioUrl } from '@/lib/api'
import { setAuthToken, setRefreshToken, setAuthRole, setAuthUser, getRefreshToken, decodeJwtPayload } from '@/lib/cookies'
import { AlertCircle } from 'lucide-react'
import { NormalLoader } from '@/components/normal-loader'

function CustomerAuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const exchangedRef = useRef(false)

  useEffect(() => {
    async function handleExchange() {
      if (exchangedRef.current) return
      exchangedRef.current = true

      const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token')
      const code = searchParams.get('code')
      const token = searchParams.get('token')
      const redirectPath = searchParams.get('redirect') || '/book'
      const existingRt = getRefreshToken()

      if (!refreshToken && !code && !token && !existingRt) {
        setError('No authentication token or authorization code found in callback URL.')
        return
      }

      try {
        let user: any = null

        if (refreshToken) {
          // 1. Push refresh token into cookie of this site
          setRefreshToken(refreshToken)
          // 2. Validate refresh token with backend and mint new access token into cookie
          const newAccessToken = await refreshAccessToken(refreshToken)
          if (!newAccessToken) {
            throw new Error('Refresh token validation failed. Please sign in again.')
          }
          user = await getCurrentUser()
        } else if (code) {
          // Exchange single-use authorization code
          const result = await exchangeAuthCode(code)
          user = result.user
        } else if (token) {
          // Legacy access token fallback
          setAuthToken(token)
          user = await getCurrentUser()
        } else if (existingRt) {
          // Validate existing cookie refresh token
          const newAccessToken = await refreshAccessToken(existingRt)
          if (!newAccessToken) {
            throw new Error('Session expired. Please sign in again.')
          }
          user = await getCurrentUser()
        }

        if (!user) {
          setError('Authentication session could not be established. Please try signing in again.')
          return
        }

        const effectiveRt = refreshToken || getRefreshToken()
        const tokenRole = effectiveRt ? decodeJwtPayload(effectiveRt)?.role : null
        const effectiveRole = tokenRole || user.role || 'CUSTOMER'

        // If user is actually a STUDIO / TEMP_STUDIO, route to Studio Portal
        if (effectiveRole === 'STUDIO' || effectiveRole === 'TEMP_STUDIO') {
          const rt = refreshToken || getRefreshToken()
          window.location.replace(getStudioUrl('/auth/callback', rt))
          return
        }

        setAuthRole('CUSTOMER')
        setAuthUser(user)
        const targetRedirect = redirectPath && redirectPath !== '/' ? redirectPath : '/book'
        window.location.replace(targetRedirect)
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate session.')
      }
    }

    handleExchange()
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4">
        <div className="max-w-md w-full bg-white border border-[#E7E2D9] rounded-2xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5 text-red-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1D2024] mb-2">Authentication Failed</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            className="w-full py-3 px-4 bg-[#18191B] hover:bg-black text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
          >
            Return to Darzi Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
      <NormalLoader />
    </div>
  )
}

export default function CustomerAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
          <NormalLoader />
        </div>
      }
    >
      <CustomerAuthCallbackInner />
    </Suspense>
  )
}
