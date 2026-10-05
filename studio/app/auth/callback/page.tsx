'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeAuthCode, getCurrentUser } from '@/lib/api'
import { setAuthToken, setAuthRole, setAuthUser } from '@/lib/cookies'
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'

function StudioAuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const exchangedRef = useRef(false)

  useEffect(() => {
    async function handleExchange() {
      if (exchangedRef.current) return
      exchangedRef.current = true

      const code = searchParams.get('code')
      const token = searchParams.get('token')

      if (!code && !token) {
        setError('No authorization code or token found in callback URL.')
        setIsProcessing(false)
        return
      }

      try {
        let user: any = null
        let result: any = null

        if (code) {
          // Option A: Exchange single-use authorization code
          result = await exchangeAuthCode(code)
          user = result.user
        } else if (token) {
          // Fallback if legacy token was passed
          setAuthToken(token)
          user = await getCurrentUser()
        }

        if (!user) {
          setError('Authentication session could not be established. Please try logging in again.')
          setIsProcessing(false)
          return
        }

        const effectiveRole = (result?.role === 'STUDIO' || user.role === 'STUDIO') ? 'STUDIO' : 'TEMP_STUDIO'
        const effectiveUser = { ...user, role: effectiveRole }
        setAuthRole(effectiveRole)
        setAuthUser(effectiveUser)

        // Determine destination based on studio profile completeness
        const isProfileComplete = Boolean(
          effectiveRole === 'STUDIO' &&
          effectiveUser.studioName &&
          effectiveUser.phone &&
          effectiveUser.status !== 'INACTIVE'
        )

        if (isProfileComplete) {
          window.location.replace('/dashboard')
        } else {
          window.location.replace('/?step=1')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate authorization code.')
        setIsProcessing(false)
      }
    }

    handleExchange()
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1115] px-4">
        <div className="max-w-md w-full bg-[#181B20] border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5 text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            className="w-full py-3 px-4 bg-[#9E593B] hover:bg-[#85472C] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#9E593B]/20"
          >
            Return to Studio Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] px-4">
      <div className="max-w-md w-full bg-[#181B20] border border-white/5 rounded-2xl p-8 text-center shadow-2xl">
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#9E593B]/20 animate-ping opacity-40" />
          <div className="w-16 h-16 rounded-full bg-[#9E593B]/10 border border-[#9E593B]/30 flex items-center justify-center text-[#9E593B]">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-serif font-bold text-white mb-2">Authenticating Studio Atelier</h2>
        <p className="text-sm text-slate-400 mb-6">
          Exchanging secure one-time credentials and syncing your partner workbench...
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#9E593B]" />
          <span>Setting up workspace session...</span>
        </div>
      </div>
    </div>
  )
}

export default function StudioAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0F1115]">
          <div className="w-8 h-8 border-2 border-[#9E593B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudioAuthCallbackInner />
    </Suspense>
  )
}
