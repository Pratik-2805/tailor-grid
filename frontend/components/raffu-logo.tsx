import React from 'react'

interface RaffuLogoProps {
  className?: string
  theme?: 'light' | 'dark'
  showSubtitle?: boolean
  subtitle?: string
  devanagariOnly?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function RaffuLogo({
  className = '',
  theme = 'light',
  showSubtitle = true,
  subtitle = 'OWN YOUR FIT',
  devanagariOnly = false,
  size = 'md',
}: RaffuLogoProps) {
  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-[#FAF8F5]' : 'text-[#0F1115]'
  const subColor = isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'
  const dividerColor = isDark ? 'bg-[#2D333D]' : 'bg-[#E8E1D5]'

  const sizeClasses = {
    sm: {
      hindi: 'text-[22px] sm:text-[24px]',
      dot: 'w-1 h-1 ml-1 mb-0.5',
      divider: 'h-5',
      roman: 'text-[11px] sm:text-[12px]',
      subtitle: 'text-[6.5px] sm:text-[7px]',
      stitchHeight: 'top-[1px] h-[1.5px]',
    },
    md: {
      hindi: 'text-[26px] sm:text-[29px]',
      dot: 'w-1.5 h-1.5 ml-1.5 mb-0.5',
      divider: 'h-6',
      roman: 'text-[13px] sm:text-[14px]',
      subtitle: 'text-[7.5px] sm:text-[8px]',
      stitchHeight: 'top-[1.5px] h-[2px]',
    },
    lg: {
      hindi: 'text-[32px] sm:text-[38px]',
      dot: 'w-2 h-2 ml-2 mb-1',
      divider: 'h-8',
      roman: 'text-[16px] sm:text-[18px]',
      subtitle: 'text-[9px] sm:text-[10px]',
      stitchHeight: 'top-[2px] h-[2.5px]',
    },
    xl: {
      hindi: 'text-[44px] sm:text-[54px]',
      dot: 'w-2.5 h-2.5 ml-2.5 mb-1.5',
      divider: 'h-10',
      roman: 'text-[20px] sm:text-[24px]',
      subtitle: 'text-[10px] sm:text-[12px]',
      stitchHeight: 'top-[3px] h-[3px]',
    },
  }[size]

  return (
    <div className={`flex items-center gap-3 sm:gap-3.5 select-none ${className}`}>
      {/* Devanagari Wordmark with Red Tailor Stitch Line */}
      <div className="relative flex items-baseline leading-none">
        <div className="relative inline-flex items-baseline">
          <span className={`${sizeClasses.hindi} font-black ${textColor} tracking-tight leading-none inline-flex items-baseline`}>
            रफू
          </span>
          {/* Crimson Tailor Stitch Seam across the shirorekha */}
          <div
            className={`absolute ${sizeClasses.stitchHeight} left-0 right-0 pointer-events-none`}
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #DC2626 0, #DC2626 3.5px, transparent 3.5px, transparent 6px)',
            }}
          />
        </div>
        {/* Modern Red End Dot */}
        <span className={`${sizeClasses.dot} rounded-full bg-[#DC2626] inline-block shrink-0 shadow-xs`} />
      </div>

      {!devanagariOnly && (
        <>
          {/* Minimalist Divider */}
          <div className={`${sizeClasses.divider} w-[1px] ${dividerColor}`} />

          {/* Roman Typographic Counterpart */}
          <div className="flex flex-col justify-center">
            <span className={`${sizeClasses.roman} font-black tracking-[0.2em] uppercase ${textColor} leading-none transition-colors`}>
              RAFFU
            </span>
            {showSubtitle && (
              <span className={`${sizeClasses.subtitle} font-semibold tracking-[0.22em] uppercase ${subColor} mt-1 leading-none`}>
                {subtitle}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
