'use client'

import React, { useState, useEffect } from 'react'

export interface StudioAvatarProps {
  avatar?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
  showStatusDot?: boolean
  className?: string
}

export function StudioAvatar({
  avatar,
  name = 'Master Tailor',
  size = 'sm',
  shape = 'circle',
  showStatusDot = true,
  className = '',
}: StudioAvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Reset imgError whenever avatar prop changes
  useEffect(() => {
    setImgError(false)
  }, [avatar])

  // Extract clean initial letter
  const cleanName = (name || '').trim()
  const initial = (cleanName ? cleanName.charAt(0) : 'M').toUpperCase()

  const sizeClasses = {
    xs: 'size-7 text-[11px]',
    sm: 'size-8 text-xs',
    md: 'size-9 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-20 text-2xl',
  }[size]

  const dotSizeClasses = {
    xs: 'size-1.5 bottom-0 right-0',
    sm: 'size-2 bottom-0 right-0',
    md: 'size-2.5 bottom-0 right-0',
    lg: 'size-3 bottom-0.5 right-0.5',
    xl: 'size-3.5 bottom-1 right-1',
  }[size]

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
  const hasValidImage = Boolean(avatar && avatar.trim() && !imgError)

  return (
    <div
      className={`relative ${sizeClasses} ${shapeClasses} shrink-0 select-none overflow-visible ${
        hasValidImage
          ? 'bg-slate-200'
          : 'bg-gradient-to-br from-[#384650] via-[#2A3440] to-[#1E252E] shadow-2xs'
      } ${className}`}
    >
      <div className={`size-full ${shapeClasses} overflow-hidden flex items-center justify-center`}>
        {hasValidImage ? (
          <img
            src={avatar!}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="font-bold text-white tracking-wide leading-none flex items-center justify-center">
            {initial}
          </span>
        )}
      </div>

      {showStatusDot && (
        <span
          className={`absolute ${dotSizeClasses} rounded-full bg-emerald-500 ring-2 ring-white shadow-2xs pointer-events-none`}
          title="Active & Online"
        />
      )}
    </div>
  )
}
