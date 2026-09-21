'use client'

import { useEffect, useRef, useState } from 'react'

export interface SewingLoaderProps {
  active: boolean
  durationSeconds?: number
  onComplete?: () => void
  persistent?: boolean
  title?: string
  subtitle?: string
  showRadiusProgression?: boolean
  onCancel?: () => void
  orderId?: string
}

export function SewingLoader({
  active,
  durationSeconds = 15,
  onComplete,
  persistent = false,
  title,
  subtitle,
  showRadiusProgression = false,
  onCancel,
  orderId,
}: SewingLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<any>(null)
  const [dots, setDots] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Track elapsed search time for radius progression
  useEffect(() => {
    if (!active || !showRadiusProgression) return
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [active, showRadiusProgression])

  useEffect(() => {
    if (!active) {
      setDots('')
      return
    }

    // Sequential dots animation: "" -> "." -> ".." -> "..." -> ""
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''))
    }, 450)

    let isMounted = true
    let minTimePassed = false
    let minTimer: NodeJS.Timeout | null = null

    // Minimum time threshold timer (only active if not in persistent manual mode)
    if (!persistent && onComplete) {
      minTimer = setTimeout(() => {
        minTimePassed = true
      }, durationSeconds * 1000)
    }

    // Dynamically load lottie-web for SSR safety in Next.js Turbopack
    import('lottie-web').then((lottie) => {
      if (!isMounted || !containerRef.current) return
      try {
        const anim = lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/Sewing tools.json',
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
          },
        })
        animRef.current = anim

        // Ensure animation finishes its full loop cycle cleanly without stopping mid-frame (only when timer based)
        anim.addEventListener('loopComplete', () => {
          if (!persistent && minTimePassed && onComplete) {
            try {
              anim.destroy()
            } catch { }
            onComplete()
          }
        })
      } catch (err) {
        console.warn('Lottie load error:', err)
      }
    })

    return () => {
      isMounted = false
      clearInterval(dotsInterval)
      if (minTimer) clearTimeout(minTimer)
      if (animRef.current) {
        try {
          animRef.current.destroy()
        } catch { }
      }
    }
  }, [active, durationSeconds, onComplete, persistent])

  if (!active) return null

  // Progressive search radius logic
  let radiusText = 'Searching closest ateliers within 1 mile'
  let radiusBadge = '1 Mile Radius'
  if (elapsedSeconds >= 60) {
    radiusText = 'Broadcasting to all ateliers within 8 miles'
    radiusBadge = '8 Miles Radius'
  } else if (elapsedSeconds >= 35) {
    radiusText = 'Expanding search radius to 4 miles'
    radiusBadge = '4 Miles Radius'
  } else if (elapsedSeconds >= 15) {
    radiusText = 'Expanding search radius to 2 miles'
    radiusBadge = '2 Miles Radius'
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-between p-6 text-center select-none animate-in fade-in duration-200 overflow-hidden">
      {/* Top spacer for vertical balance */}
      <div className="pt-4 h-8" />

      <div className="flex flex-col items-center justify-center my-auto relative max-w-full">
        {/* Lottie Animation Container */}
        <div className="w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] flex items-center justify-center relative overflow-hidden">
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center transform scale-[1.7] sm:scale-[2.0] transition-transform duration-300 [&_svg]:w-full [&_svg]:h-full"
          />
        </div>

        {/* Animated Heading: Only 'Finding...' */}
        <div className="mt-4 text-center z-10 flex flex-col items-center justify-center">
          <h2 className="font-serif text-[28px] sm:text-[36px] font-bold text-[#0F1115] tracking-tight leading-none flex items-baseline justify-center">
            <span>{title || 'Finding'}</span>
            <span className="inline-block text-left w-[0.8em] select-none">{dots}</span>
          </h2>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pb-6 min-h-[48px] flex items-center justify-center">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold border border-gray-200 hover:border-red-200 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  )
}

