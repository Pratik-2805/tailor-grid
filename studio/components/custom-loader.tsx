'use client'

import React, { useEffect, useState } from 'react'

export interface CustomLoaderProps {
  /** Text to display below the loader */
  text?: string
  /** Subtitle / hint text */
  subtext?: string
  /** Array of messages to cycle through sequentially */
  steps?: string[]
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
  /** Visual style variant */
  variant?: 'atelier' | 'stitch' | 'needle' | 'minimal' | 'luxury'
  /** Fullscreen overlay mode */
  fullscreen?: boolean
  /** Dark mode styling */
  dark?: boolean
  /** Blurred glass backdrop for overlays */
  blurBackdrop?: boolean
  /** Additional CSS class names */
  className?: string
  /** Show animated progress bar */
  showProgressBar?: boolean
  /** Numeric progress (0-100) or undefined for indeterminate */
  progress?: number
}

export function CustomLoader({
  text = 'Crafting your experience…',
  subtext,
  steps,
  size = 'md',
  variant = 'atelier',
  fullscreen = false,
  dark = false,
  blurBackdrop = true,
  className = '',
  showProgressBar = true,
  progress,
}: CustomLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [dots, setDots] = useState('')

  // Animate sequential steps if provided
  useEffect(() => {
    if (!steps || steps.length <= 1) return
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length)
    }, 2400)
    return () => clearInterval(interval)
  }, [steps])

  // Animate trailing dots: "" -> "." -> ".." -> "..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''))
    }, 450)
    return () => clearInterval(interval)
  }, [])

  const displayText = steps && steps.length > 0 ? steps[currentStepIndex] : text

  // Dimensions based on size prop
  const sizeConfig = {
    xs: { iconSize: 24, strokeWidth: 2, textSize: 'text-xs', subSize: 'text-[10px]' },
    sm: { iconSize: 36, strokeWidth: 2.2, textSize: 'text-xs', subSize: 'text-[11px]' },
    md: { iconSize: 64, strokeWidth: 2.5, textSize: 'text-sm', subSize: 'text-xs' },
    lg: { iconSize: 88, strokeWidth: 2.8, textSize: 'text-base', subSize: 'text-xs' },
    xl: { iconSize: 112, strokeWidth: 3, textSize: 'text-lg', subSize: 'text-sm' },
    fullscreen: { iconSize: 96, strokeWidth: 2.8, textSize: 'text-lg', subSize: 'text-xs' },
  }[size]

  const isFullscreenMode = fullscreen || size === 'fullscreen'

  const content = (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${
        dark ? 'text-white' : 'text-[#0F1115]'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Visual Animation Element */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Radial Aura */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
            dark ? 'bg-[#9E593B]/25' : 'bg-[#9E593B]/12'
          }`}
          style={{
            width: sizeConfig.iconSize * 1.8,
            height: sizeConfig.iconSize * 1.8,
            filter: 'blur(16px)',
            animation: 'darzi-pulse-glow 3s ease-in-out infinite',
          }}
        />

        {/* Tailor Bespoke SVG Graphic */}
        {variant === 'minimal' ? (
          <MinimalSpinner size={sizeConfig.iconSize} dark={dark} />
        ) : variant === 'needle' ? (
          <NeedleStitchAnimation size={sizeConfig.iconSize} dark={dark} />
        ) : (
          <AtelierBespokeAnimation size={sizeConfig.iconSize} dark={dark} />
        )}
      </div>

      {/* Primary Label */}
      {displayText && (
        <div className="mt-5 flex items-center justify-center font-medium tracking-tight">
          <p
            className={`${sizeConfig.textSize} font-semibold transition-all duration-300 ${
              dark ? 'text-white/95' : 'text-[#0F1115]'
            }`}
          >
            {displayText}
            <span className="inline-block w-[1.2em] text-left font-mono font-bold text-[#9E593B]">
              {dots}
            </span>
          </p>
        </div>
      )}

      {/* Subtitle / Context Note */}
      {subtext && (
        <p
          className={`mt-1 max-w-[280px] ${sizeConfig.subSize} leading-relaxed ${
            dark ? 'text-white/60' : 'text-[#6B7280]'
          }`}
        >
          {subtext}
        </p>
      )}

      {/* Shimmering Progress Bar */}
      {showProgressBar && (
        <div
          className={`mt-4 h-1 w-36 sm:w-44 rounded-full overflow-hidden relative ${
            dark ? 'bg-white/10' : 'bg-[#E5E0D8]'
          }`}
        >
          {typeof progress === 'number' ? (
            <div
              className="h-full bg-gradient-to-r from-[#9E593B] via-[#C97A56] to-[#E7C9BA] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          ) : (
            <div
              className="h-full bg-gradient-to-r from-transparent via-[#9E593B] to-transparent rounded-full w-1/2 absolute"
              style={{
                animation: 'darzi-shimmer-slide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              }}
            />
          )}
        </div>
      )}

      {/* Micro Tailor Badge */}
      {isFullscreenMode && (
        <div className="mt-6 flex items-center gap-1.5 opacity-60">
          <div className="size-1.5 rounded-full bg-[#9E593B] animate-ping" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E593B]">
            Darzi Atelier Engine
          </span>
        </div>
      )}

      {/* Inline Embedded Keyframes for zero-config portability */}
      <style jsx>{`
        @keyframes darzi-pulse-glow {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
        }
        @keyframes darzi-shimmer-slide {
          0% {
            left: -50%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes darzi-spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes darzi-spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes darzi-stitch-flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -48;
          }
        }
        @keyframes darzi-needle-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(4deg);
          }
        }
        @keyframes darzi-thread-wave {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 24;
          }
        }
      `}</style>
    </div>
  )

  if (isFullscreenMode) {
    return (
      <div
        className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in ${
          dark ? 'bg-[#0F1115]/95' : 'bg-[#FAF8F5]/95'
        } ${blurBackdrop ? 'backdrop-blur-md' : ''}`}
      >
        <div className="relative z-10">{content}</div>
      </div>
    )
  }

  return content
}

/**
 * 1. Signature Atelier Bespoke Animation (Measuring wheel + Stitch ring + Shears/Needle centerpiece)
 */
function AtelierBespokeAnimation({ size, dark }: { size: number; dark: boolean }) {
  const strokeColor = dark ? '#E5E7EB' : '#0F1115'
  const accentColor = '#9E593B'
  const goldColor = '#D97706'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      {/* Outer Measuring Wheel Ring (slow clockwise spin) */}
      <g style={{ transformOrigin: '50% 50%', animation: 'darzi-spin-slow 16s linear infinite' }}>
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,17,21,0.08)'}
          strokeWidth="1.5"
        />
        {/* Precision Measuring Ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const x1 = Number((50 + 42 * Math.cos(angle)).toFixed(4))
          const y1 = Number((50 + 42 * Math.sin(angle)).toFixed(4))
          const x2 = Number((50 + 46 * Math.cos(angle)).toFixed(4))
          const y2 = Number((50 + 46 * Math.sin(angle)).toFixed(4))
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 3 === 0 ? accentColor : dark ? 'rgba(255,255,255,0.3)' : 'rgba(15,17,21,0.2)'}
              strokeWidth={i % 3 === 0 ? '2' : '1'}
              strokeLinecap="round"
            />
          )
        })}
      </g>

      {/* Middle Animated Running Stitch Track (Counter-clockwise flow) */}
      <g style={{ transformOrigin: '50% 50%', animation: 'darzi-spin-reverse 10s linear infinite' }}>
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeDasharray="4 6"
          strokeLinecap="round"
          style={{ animation: 'darzi-stitch-flow 2s linear infinite' }}
        />
      </g>

      {/* Inner Accent Ring */}
      <circle
        cx="50"
        cy="50"
        r="24"
        fill={dark ? 'rgba(255,255,255,0.03)' : 'rgba(158,89,59,0.05)'}
        stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(15,17,21,0.1)'}
        strokeWidth="1"
      />

      {/* Centerpiece: Master Tailor Shears & Needle */}
      <g
        style={{
          transformOrigin: '50% 50%',
          animation: 'darzi-needle-float 3s ease-in-out infinite',
        }}
      >
        {/* Needle Blade */}
        <line
          x1="33"
          y1="67"
          x2="65"
          y2="35"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Needle Eye */}
        <ellipse
          cx="62"
          cy="38"
          rx="2"
          ry="3.5"
          transform="rotate(45 62 38)"
          fill={dark ? '#0F1115' : '#FAF8F5'}
          stroke={accentColor}
          strokeWidth="1.2"
        />
        {/* Golden Thread Wave looping out of eye */}
        <path
          d="M62 38 Q74 28, 70 42 T66 56"
          stroke={goldColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="16 4"
          style={{ animation: 'darzi-thread-wave 2.5s ease-in-out infinite' }}
        />

        {/* Left Scissors Loop */}
        <circle
          cx="36"
          cy="64"
          r="4.5"
          stroke={strokeColor}
          strokeWidth="2"
          fill="none"
        />
        {/* Right Scissor Blade Cross */}
        <line
          x1="36"
          y1="36"
          x2="58"
          y2="58"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Fulcrum Screw */}
        <circle cx="48" cy="48" r="2" fill={accentColor} />
      </g>
    </svg>
  )
}

/**
 * 2. Needle & Dynamic Thread Loop Animation
 */
function NeedleStitchAnimation({ size, dark }: { size: number; dark: boolean }) {
  const accentColor = '#9E593B'
  const goldColor = '#D97706'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      {/* Flowing Infinity Stitch Track */}
      <path
        d="M25 50 C25 35, 40 35, 50 50 C60 65, 75 65, 75 50 C75 35, 60 35, 50 50 C40 65, 25 65, 25 50 Z"
        stroke={accentColor}
        strokeWidth="3"
        strokeDasharray="6 6"
        strokeLinecap="round"
        fill="none"
        style={{
          animation: 'darzi-stitch-flow 2.5s linear infinite',
        }}
      />

      {/* Floating Center Needle */}
      <g
        style={{
          transformOrigin: '50% 50%',
          animation: 'darzi-needle-float 2.2s ease-in-out infinite',
        }}
      >
        <line
          x1="38"
          y1="62"
          x2="62"
          y2="38"
          stroke={dark ? '#FFFFFF' : '#0F1115'}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="58" cy="42" r="1.8" fill={goldColor} />
      </g>
    </svg>
  )
}

/**
 * 3. Minimal Dual-Arc Tailor Spinner (Perfect for compact inline / embedded widgets)
 */
function MinimalSpinner({ size, dark }: { size: number; dark: boolean }) {
  const accentColor = '#9E593B'
  const baseColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(15,17,21,0.1)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin [animation-duration:1.2s]"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke={baseColor}
        strokeWidth="4"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke={accentColor}
        strokeWidth="4"
        strokeDasharray="30 100"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Lightweight inline spinner component for buttons, badges, and small icons
 */
export function TailorSpinner({
  size = 18,
  className = '',
  color = '#9E593B',
}: {
  size?: number
  className?: string
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin inline-block shrink-0 ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      <path
        d="M12 3C7.02944 3 3 7.02944 3 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="3" r="1.2" fill={color} />
    </svg>
  )
}
