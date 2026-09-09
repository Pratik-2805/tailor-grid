'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useLottie } from 'lottie-react'

interface AnimatedLocationPinProps {
  size?: number
  className?: string
  loop?: boolean
  autoplay?: boolean
  hoverTrigger?: boolean
}

export function AnimatedLocationPin({
  size = 20,
  className = '',
  loop = false,
  autoplay = false,
  hoverTrigger = true,
}: AnimatedLocationPinProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const lottie = useLottie({
    src: '/animated/system-solid-18-location-pin-hover-pinch.json',
    loop,
    autoplay,
  })

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      lottie.setDisplayRef(node)
    },
    [lottie]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !hoverTrigger) return

    const target = el.closest('button, [role="button"], .group, a') || el

    const onEnter = () => {
      if (lottie.animationItem) {
        lottie.animationItem.goToAndPlay(0, true)
      } else {
        lottie.seek(0)
        lottie.play()
      }
    }

    const onLeave = () => {
      if (loop) {
        lottie.stop()
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
  }, [hoverTrigger, loop, lottie.animationItem, lottie])

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="size-3 rounded-full bg-[#EA4335] animate-ping" />
      </div>
    )
  }

  return (
    <div
      ref={setRefs}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default AnimatedLocationPin
