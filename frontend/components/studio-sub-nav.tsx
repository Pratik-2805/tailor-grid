'use client'

import { useState, useEffect } from 'react'
import {
  ChevronRight,
  LogIn,
  Store,
  Sparkles,
} from 'lucide-react'
import { type Screen, type User } from './data'
import { getStudioUrl } from '../lib/api'

interface StudioSubNavProps {
  currentScreen: Screen
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: (role: 'CUSTOMER' | 'STUDIO', authType?: 'signin' | 'signup') => void
}

export function StudioSubNav({
  currentScreen,
  go,
  user,
  onOpenAuth,
}: StudioSubNavProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isStudioUser =
    (user && user.role === 'STUDIO') ||
    (isClient && localStorage.getItem('tg_user_role') === 'STUDIO')

  const scrollToSection = (id: string) => {
    if (currentScreen !== 'for-partners') {
      go('for-partners')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const yOffset = -125
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 120)
    } else {
      const el = document.getElementById(id)
      if (el) {
        const yOffset = -125
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  const [scrolledPastHero, setScrolledPastHero] = useState(false)

  // Active section observer on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 380)

      if (currentScreen !== 'for-partners') return

      const sections = ['why-partner', 'requirements', 'safety', 'faq']
      const scrollPos = window.scrollY + 140

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentScreen])

  const handleOpenStudioPortal = (authAction?: 'signin' | 'signup') => {
    const token = isClient ? localStorage.getItem('tg_token') : null
    if (isStudioUser && token) {
      window.location.href = getStudioUrl('/', token)
    } else if (authAction) {
      window.location.href = getStudioUrl(`/?auth=${authAction}`)
    } else {
      window.location.href = getStudioUrl('/')
    }
  }

  return (
    <div className="sticky top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] shadow-xs transition-all">
      <div className="mx-auto flex h-[54px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-4">
        
        {/* Left: Bold Category Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              go('for-partners')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <span className="font-serif text-[19px] sm:text-[22px] font-bold text-[#0F1115] tracking-tight group-hover:text-[#9E593B] transition-colors">
              For Studios
            </span>
          </button>
        </div>

        {/* Center/Right: Informational Navigation Links + Action CTAs */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => scrollToSection('why-partner')}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'why-partner'
                ? 'bg-[#F4EFEA] text-[#0F1115] font-semibold'
                : 'text-[#4B5563] hover:text-[#0F1115] hover:bg-[#FAF8F5]'
            }`}
          >
            Why Partner
          </button>

          <button
            onClick={() => scrollToSection('requirements')}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'requirements'
                ? 'bg-[#F4EFEA] text-[#0F1115] font-semibold'
                : 'text-[#4B5563] hover:text-[#0F1115] hover:bg-[#FAF8F5]'
            }`}
          >
            Requirements
          </button>

          <button
            onClick={() => scrollToSection('safety')}
            className={`hidden md:inline-flex px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'safety'
                ? 'bg-[#F4EFEA] text-[#0F1115] font-semibold'
                : 'text-[#4B5563] hover:text-[#0F1115] hover:bg-[#FAF8F5]'
            }`}
          >
            Standards
          </button>

          <button
            onClick={() => scrollToSection('faq')}
            className={`hidden sm:inline-flex px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'faq'
                ? 'bg-[#F4EFEA] text-[#0F1115] font-semibold'
                : 'text-[#4B5563] hover:text-[#0F1115] hover:bg-[#FAF8F5]'
            }`}
          >
            FAQ
          </button>

          {/* Action CTAs (Studio Sign In / Apply to Partner / Studio Workbench) */}
          <div className="pl-2 border-l border-[#E8E1D5] flex items-center gap-2 shrink-0">
            {isStudioUser ? (
              <button
                onClick={() => handleOpenStudioPortal()}
                className="flex items-center gap-1.5 rounded-full bg-[#0F1115] px-3.5 sm:px-4 py-1.5 text-[12px] sm:text-[12.5px] font-semibold text-white hover:bg-[#9E593B] shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <Store size={13} className="text-[#E7C9BA]" />
                <span>Studio Workbench ↗</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleOpenStudioPortal('signin')}
                  className="flex items-center gap-1.5 rounded-full border border-[#D5CDC2] hover:border-[#0F1115] bg-white px-3 sm:px-3.5 py-1.5 text-[12px] sm:text-[12.5px] font-semibold text-[#0F1115] hover:bg-[#FAF8F5] transition-all whitespace-nowrap cursor-pointer"
                  title="Access Studio Portal Workbench"
                >
                  <LogIn size={13} className="text-[#6B7280]" />
                  <span>Studio Portal ↗</span>
                </button>

                {/* Show Enroll Studio button in sticky nav only when scrolled past the hero */}
                {scrolledPastHero && (
                  <button
                    onClick={() => {
                      window.location.href = '/partner/onboarding'
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-[#0F1115] px-3.5 sm:px-4 py-1.5 text-[12px] sm:text-[12.5px] font-semibold text-white hover:bg-[#9E593B] shadow-xs transition-all whitespace-nowrap cursor-pointer active:scale-95 animate-in fade-in duration-200"
                  >
                    <Sparkles size={12} className="text-[#E7C9BA]" />
                    <span>Enroll Studio</span>
                  </button>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
