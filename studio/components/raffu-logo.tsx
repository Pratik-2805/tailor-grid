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
  subtitle = 'WORKBENCH NODE',
  devanagariOnly = false,
  size = 'md',
}: RaffuLogoProps) {
  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-[#FAF8F5]' : 'text-[#0F1115]'
  const subColor = isDark ? 'text-[#9CA3AF]' : 'text-[#9E593B]'
  const dividerColor = isDark ? 'bg-[#2D333D]' : 'bg-[#E8E1D5]'

  const sizeClasses = {
    sm: {
      hindi: 'text-[22px] sm:text-[24px]',
      dot: 'w-[3px] h-[3px] left-[18.5px] bottom-[2px]',
      romanDot: 'w-[3px] h-[3px] -ml-[1px] mb-[0.5px]',
      divider: 'h-5',
      roman: 'text-[11px] sm:text-[12px]',
      subtitle: 'text-[6.5px] sm:text-[7px]',
    },
    md: {
      hindi: 'text-[26px] sm:text-[29px]',
      dot: 'w-[4px] h-[4px] left-[22px] bottom-[2.5px]',
      romanDot: 'w-[3.5px] h-[3.5px] -ml-[1px] mb-[1px]',
      divider: 'h-6',
      roman: 'text-[13px] sm:text-[14px]',
      subtitle: 'text-[7.5px] sm:text-[8px]',
    },
    lg: {
      hindi: 'text-[32px] sm:text-[38px]',
      dot: 'w-[5px] h-[5px] left-[28px] bottom-[3.5px]',
      romanDot: 'w-[4.5px] h-[4.5px] -ml-[1.5px] mb-[1.5px]',
      divider: 'h-8',
      roman: 'text-[16px] sm:text-[18px]',
      subtitle: 'text-[9px] sm:text-[10px]',
    },
    xl: {
      hindi: 'text-[44px] sm:text-[54px]',
      dot: 'w-[7px] h-[7px] left-[39px] bottom-[5px]',
      romanDot: 'w-[6px] h-[6px] -ml-[2px] mb-[2px]',
      divider: 'h-10',
      roman: 'text-[20px] sm:text-[24px]',
      subtitle: 'text-[10px] sm:text-[12px]',
    },
  }[size]

  return (
    <div className={`flex items-center gap-3 sm:gap-3.5 select-none ${className}`}>
      {/* Devanagari Wordmark */}
      <div className="relative inline-flex items-baseline leading-none">
        <span className={`${sizeClasses.hindi} font-black ${textColor} tracking-tight leading-none inline-flex items-baseline`}>
          र
          <span className="relative inline-block leading-none">
            फू
            {/* Red dot nestled in the center / loop of the ukar of fu */}
            <span
              className={`absolute ${sizeClasses.dot} rounded-full bg-[#DC2626] pointer-events-none`}
            />
          </span>
        </span>
      </div>

      {!devanagariOnly && (
        <>
          {/* Minimalist Divider */}
          <div className={`${sizeClasses.divider} w-[1px] ${dividerColor}`} />

          {/* Roman Typographic Counterpart */}
          <div className="flex flex-col justify-center">
            <span className={`${sizeClasses.roman} font-black uppercase ${textColor} leading-none transition-colors inline-flex items-baseline`}>
              <span className="tracking-[0.2em]">RAFFU</span>
              <span className={`${sizeClasses.romanDot} rounded-full bg-[#DC2626] inline-block shrink-0`} />
            </span>
            {showSubtitle && (
              <span className={`${sizeClasses.subtitle} font-bold tracking-[0.2em] uppercase ${subColor} mt-1 leading-none`}>
                {subtitle}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
