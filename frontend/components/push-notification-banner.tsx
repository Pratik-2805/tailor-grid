'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, AlertTriangle, Send, Sparkles, ShieldCheck, Check } from 'lucide-react'
import {
  isPushSupported,
  getNotificationPermissionState,
  subscribeToPush,
  sendTestPush,
} from '@/lib/push-notifications'
import { toast } from 'react-toastify'

interface PushNotificationBannerProps {
  userId?: string | null
  orderId?: string | null
  compact?: boolean
  className?: string
}

export function PushNotificationBanner({
  userId,
  orderId,
  compact = false,
  className = '',
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
      const result = await subscribeToPush({ userId })
      setPermission(getNotificationPermissionState())
      if (result.success) {
        toast.success(result.message || 'Live order alerts enabled!')
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
      const ok = await sendTestPush(userId)
      if (ok) {
        toast.success('Test notification sent! Check your device alerts.', {
          position: 'top-center',
          autoClose: 3000,
        })
      } else {
        toast.error('Could not dispatch test alert. Please verify notification permissions.', {
          position: 'top-center',
        })
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
      return (
        <button
          type="button"
          onClick={handleSendTest}
          disabled={testing}
          title="Notifications Active • Click to send test alert"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
        >
          <CheckCircle2 size={12} className="text-emerald-600" />
          <span>{testing ? 'Testing...' : 'Alerts Active'}</span>
        </button>
      )
    }

    if (permission === 'denied') {
      return (
        <span
          title="Push notifications are blocked in your browser settings"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80"
        >
          <AlertTriangle size={11} className="text-red-500" />
          <span>Alerts: Blocked</span>
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

  // Full Rich Card Mode (used in order details & tracking)
  if (permission === 'granted') {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-4 text-emerald-950 shadow-2xs ${className}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-emerald-950">
                  Live Notifications Active
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-200/70 text-emerald-900 uppercase">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                You will receive alerts when your studio accepts, starts stitching, and readies pickup.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing}
            className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 text-xs font-bold text-emerald-900 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send size={11} className={testing ? 'animate-pulse' : ''} />
            <span>{testing ? 'Sending alert...' : 'Send Test Alert'}</span>
          </button>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className={`rounded-2xl border border-amber-200 bg-amber-50/70 p-3 sm:p-4 text-amber-950 shadow-2xs ${className}`}>
        <div className="flex items-start gap-2.5">
          <div className="size-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
            <AlertTriangle size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
              Browser Notifications Blocked
            </h4>
            <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
              Notifications were dismissed or blocked in your browser settings. To receive instant alerts when your studio verifies your PIN and readies your garment, click the lock icon in your address bar and toggle notifications to <strong>Allow</strong>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Default Permission State: Engaging prompt banner
  return (
    <div className={`rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] p-3.5 sm:p-4 shadow-2xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-9 rounded-2xl bg-[#9E593B]/10 text-[#9E593B] flex items-center justify-center shrink-0 border border-[#9E593B]/20 mt-0.5">
            <Bell size={18} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#0F1115]">
                Enable Real-Time Order Alerts
              </h4>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#9E593B]/10 text-[#9E593B] uppercase">
                <Sparkles size={9} /> Instant
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
              Get notified immediately on this device when:
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-700 font-medium">
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#9E593B]" /> Studio accepts order
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-amber-500" /> PIN verified &amp; sewing starts
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Ready for pickup with PIN
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F1115] hover:bg-[#9E593B] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 w-full sm:w-auto"
        >
          <Bell size={13} />
          <span>{loading ? 'Enabling Alerts...' : 'Turn On Alerts'}</span>
        </button>
      </div>
    </div>
  )
}
