'use client'

import { useEffect, useRef, useState } from 'react'

export interface SewingLoaderProps {
  active: boolean
  durationSeconds?: number
  onComplete: () => void
}

export function SewingLoader({
  active,
  durationSeconds = 15,
  onComplete,
}: SewingLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<any>(null)
  const [dots, setDots] = useState('')

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

    // Minimum time threshold timer
    const minTimer = setTimeout(() => {
      minTimePassed = true
    }, durationSeconds * 1000)

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

        // Ensure animation finishes its full loop cycle cleanly without stopping mid-frame
        anim.addEventListener('loopComplete', () => {
          if (minTimePassed) {
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
      clearTimeout(minTimer)
      if (animRef.current) {
        try {
          animRef.current.destroy()
        } catch { }
      }
    }
  }, [active, durationSeconds, onComplete])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200 overflow-hidden">

      <div className="flex flex-col items-center justify-center my-auto relative max-w-full">

        {/* Perfect Mid-Sized Lottie Animation Container (2.1x scale) */}
        <div className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] flex items-center justify-center relative overflow-hidden">
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center transform scale-[1.8] sm:scale-[2.1] transition-transform duration-300 [&_svg]:w-full [&_svg]:h-full"
          />
        </div>

        {/* Animated "Finding..." Heading with sequential dot loading */}
        <div className="mt-6 text-center z-10 flex items-center justify-center">
          <h2 className="font-serif text-[30px] sm:text-[38px] font-bold text-[#0F1115] tracking-tight leading-none flex items-baseline justify-center">
            <span>Finding</span>
            <span className="inline-block text-left w-[0.8em] select-none">{dots}</span>
          </h2>
        </div>

      </div>

    </div>
  )
}

