
'use client'

import { useRef, useEffect, useState } from 'react'
import { Lottie, type LottieHandle } from 'lottie-react'
import spinningPinData from '@/public/animated/spinning_location_pin.json'
import droppedPinData from '@/public/animated/dropped_location_pin.json'

interface AnimatedLocationPinProps {
  size?: number
  className?: string
  loop?: boolean
  autoplay?: boolean
  hoverTrigger?: boolean
  isConfirmed?: boolean
  isPinned?: boolean
}

export function AnimatedLocationPin({
  size = 20,
  className = '',
  loop = false,
  autoplay = false,
  hoverTrigger = true,
  isConfirmed = false,
  isPinned = false,
}: AnimatedLocationPinProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lottieRef = useRef<LottieHandle | null>(null)

  const confirmed = Boolean(isConfirmed || isPinned)
  const animationData = confirmed ? droppedPinData : spinningPinData

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-play once when newly confirmed
  useEffect(() => {
    if (confirmed && mounted) {
      if (lottieRef.current?.animationItem) {
        lottieRef.current.animationItem.goToAndPlay(0, true)
      } else if (lottieRef.current) {
        lottieRef.current.seek(0)
        lottieRef.current.play()
      }
    }
  }, [confirmed, mounted])

  useEffect(() => {
    if (!mounted || !hoverTrigger) return
    const el = containerRef.current
    if (!el) return

    const target = el.closest('button, [role="button"], .group, a') || el

    const onEnter = () => {
      if (lottieRef.current?.animationItem) {
        lottieRef.current.animationItem.goToAndPlay(0, true)
      } else if (lottieRef.current) {
        lottieRef.current.seek(0)
        lottieRef.current.play()
      }
    }

    const onLeave = () => {
      if (loop && lottieRef.current) {
        lottieRef.current.stop()
      }
    }

    target.addEventListener('mouseenter', onEnter)
    target.addEventListener('mouseleave', onLeave)

    if (target !== el) {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    }

    return () => {
      target.removeEventListener('mouseenter', onEnter)
      target.removeEventListener('mouseleave', onLeave)
      if (target !== el) {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      }
    }
  }, [mounted, hoverTrigger, loop, confirmed])

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="#EA4335"
          className="shrink-0"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Lottie
        key={confirmed ? 'pinned' : 'unpinned'}
        lottieRef={lottieRef}
        src={animationData}
        loop={loop}
        autoplay={confirmed ? true : autoplay}
        style={{ width: size, height: size }}
      />
    </div>
  )
}

export default AnimatedLocationPin

