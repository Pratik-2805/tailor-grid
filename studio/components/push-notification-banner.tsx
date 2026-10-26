'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, AlertTriangle, Send, Sparkles } from 'lucide-react'
import {
  isPushSupported,
  getNotificationPermissionState,
  subscribeToPush,
  sendTestPush,
} from '@/lib/push-notifications'
import { toast } from 'react-toastify'

interface PushNotificationBannerProps {
  storeId?: string | null
  userId?: string | null
  compact?: boolean
}

export function PushNotificationBanner({
  storeId,
  userId,
  compact = false,
}: PushNotificationBannerProps) {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    setSupported(isPushSupported())
    setPermission(getNotificationPermissionState())
  }, [])

  if (!supported) return null

  const handleEnable = async () => {
    setLoading(true)
    try {
      const result = await subscribeToPush({ storeId, userId })
      setPermission(getNotificationPermissionState())
      if (result.success) {
        toast.success(result.message || 'Push alerts enabled!')
      } else {
        toast.info(result.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to enable notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    setTesting(true)
    try {
      const ok = await sendTestPush(storeId)
      if (ok) {
        toast.success('Test notification sent! Check your desktop alerts.')
      } else {
        toast.error('Could not trigger test notification. Please verify permissions.')
      }
    } catch (err: any) {
      toast.error('Error sending test notification')
    } finally {
      setTesting(false)
    }
  }

  // Compact Pill mode (e.g. for header)
  if (compact) {
    if (permission === 'granted') {
      return null
    }

    if (permission === 'denied') {
      return (
        <span
          title="Push notifications are blocked in your browser settings"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80"
        >
          <AlertTriangle size={11} className="text-red-500" />
          <span>Push: Blocked</span>
        </span>
      )
    }

    return (
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        title="Enable real-time order alerts"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#9E593B] text-white hover:bg-[#85472E] shadow-2xs transition-all cursor-pointer"
      >
        <Bell size={12} className="animate-bounce" />
        <span>{loading ? 'Connecting...' : 'Enable Alerts'}</span>
      </button>
    )
  }

  // Full Card Mode (Inside Notification popover / settings)
  // When already granted, don't show any mock card in the notification drawer
  if (permission === 'granted') {
    return null
  }

  if (permission === 'denied') {
    return (
      <div className="p-3 bg-amber-50/80 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-tight">
          <span className="font-bold block">Browser Push Notifications Blocked</span>
          <span className="text-[11px] text-amber-800">
            Click the padlock icon in your browser address bar and set Notifications to &quot;Allow&quot;.
          </span>
        </div>
      </div>
    )
  }

  // Default state: prompt user
  return (
    <div className="p-3 bg-gradient-to-r from-[#FAF8F5] to-[#F3EFEA] border-b border-[#E8E1D5] flex items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-2.5">
        <div className="size-7 rounded-lg bg-[#9E593B]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bell size={14} className="text-[#9E593B]" />
        </div>
        <div>
          <div className="font-bold text-slate-900 leading-tight">Enable Live Order Push Alerts</div>
          <div className="text-[10px] text-slate-500">
            Get instant alerts when fittings are booked nearby, even in background.
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#9E593B] text-white hover:bg-[#85472E] shadow-2xs transition-all cursor-pointer shrink-0"
      >
        <span>{loading ? 'Enabling...' : 'Allow'}</span>
      </button>
    </div>
  )
}
