'use client'

import React, { useRef, useEffect, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { X, Loader2 } from 'lucide-react'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onVerify: () => void
  onResend?: () => void
  onClose?: () => void
  resendCountdown?: number
  loading?: boolean
  phoneNumber?: string
  title?: string
  subtitle?: string
  isModal?: boolean
  variant?: 'card' | 'plain'
}

export function OtpVerificationCard({
  length = 4,
  value,
  onChange,
  onVerify,
  onResend,
  onClose,
  resendCountdown = 0,
  loading = false,
  phoneNumber = '',
  title = 'Enter OTP',
  subtitle = 'We have sent a verification code to your mobile number',
  isModal = false,
  variant = 'card',
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = Array(length).fill('')
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i]
    }
    return arr
  })

  // Sync internal digits when external value changes
  useEffect(() => {
    const arr = Array(length).fill('')
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i]
    }
    setDigits(arr)
  }, [value, length])

  // Auto-focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => !d)
    const targetIdx = firstEmptyIndex === -1 ? 0 : firstEmptyIndex
    if (inputRefs.current[targetIdx]) {
      inputRefs.current[targetIdx]?.focus()
    }
  }, [])

  const handleChange = (index: number, val: string) => {
    const cleanDigit = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = cleanDigit
    setDigits(newDigits)
    const combined = newDigits.join('')
    onChange(combined)

    // Advance focus to next input if digit entered
    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input and clear
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        onChange(newDigits.join(''))
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === 'Enter') {
      if (value.length === length && !loading) {
        onVerify()
      }
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pastedData) return

    const newDigits = Array(length).fill('')
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i]
    }
    setDigits(newDigits)
    onChange(pastedData)

    const focusIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const content = (
    <div
      className={
        variant === 'plain'
          ? 'relative w-full flex flex-col items-center text-center p-2 sm:p-4'
          : 'relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100/80 flex flex-col items-center text-center'
      }
    >
      {/* Optional Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:top-2 sm:right-2 size-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}

      {/* Header */}
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
      <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed max-w-[260px]">
        {phoneNumber ? (
          <>
            We have sent a verification code to <strong className="text-gray-800">{phoneNumber}</strong>
          </>
        ) : (
          subtitle
        )}
      </p>

      {/* 4-Box OTP Input Area */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 my-6">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold rounded-2xl outline-none transition-all ${
              digit
                ? 'bg-[#EEF0FF] text-[#2D2A4A] border-2 border-[#7B73FF]/40 shadow-xs'
                : 'bg-[#F2F3F8] text-gray-800 border border-transparent focus:bg-[#EEF0FF] focus:border-2 focus:border-[#7B73FF] focus:shadow-sm'
            }`}
          />
        ))}
      </div>

      {/* Verify Primary Button */}
      <button
        type="button"
        disabled={loading || value.length < length}
        onClick={onVerify}
        className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#7B73FF] hover:bg-[#6C63FF] active:scale-[0.99] text-white text-base font-extrabold tracking-wide shadow-md shadow-[#7B73FF]/25 hover:shadow-lg hover:shadow-[#7B73FF]/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Verifying…</span>
          </>
        ) : (
          <span>Verify</span>
        )}
      </button>

      {/* Resend Footer */}
      {onResend && (
        <div className="mt-6 flex flex-col items-center gap-1 text-xs sm:text-sm">
          <span className="text-gray-500 font-medium">Didn't receive the code?</span>
          <button
            type="button"
            disabled={loading || resendCountdown > 0}
            onClick={onResend}
            className="font-bold text-[#7B73FF] hover:text-[#6C63FF] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendCountdown > 0 ? `Resend Code in ${resendCountdown}s` : 'Resend Code'}
          </button>
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        {content}
      </div>
    )
  }

  return content
}

export default OtpVerificationCard
