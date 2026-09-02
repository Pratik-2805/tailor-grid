'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, LogOut, MapPin, Menu, Package, Phone, Scissors, ShieldCheck, User as UserIcon, X } from 'lucide-react'
import { type Screen, type User } from './data'

interface HeaderProps {
  currentScreen: Screen
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: () => void
  onOpenProfile?: () => void
  onSignOut?: () => void
}

export function Header({ currentScreen, go, user, onOpenAuth, onOpenProfile, onSignOut }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDropdownOpen = isPinned || isHovered

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPinned(false)
        setIsHovered(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const nav = (s: Screen) => {
    go(s)
    setOpen(false)
    setIsPinned(false)
    setIsHovered(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <button
            onClick={() => nav('home')}
            className="flex items-center gap-3 group text-left shrink-0 py-1"
            aria-label="Darzi home"
          >
            <Image
              src="/bg_logo.png"
              alt="Darzi"
              width={140}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#9E593B] block leading-none">
                On-Demand
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#6B7280] block mt-0.5 leading-none">
                Alterations
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8 text-[13.5px] font-medium text-[#4B5563] shrink-0">
          <button
            onClick={() => nav('how-it-works')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'how-it-works' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            How it Works
          </button>
          <button
            onClick={() => nav('about')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'about' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            About Us
          </button>
          <button
            onClick={() => nav('for-partners')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'for-partners' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            For Studios
          </button>
        </nav>

        {/* Right CTAs & User Auth */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth?.()
              } else {
                nav('orders')
              }
            }}
            className="flex items-center gap-1.5 rounded-full px-3 lg:px-4 py-2 text-[13px] font-medium text-[#1E2229] hover:bg-[#F3EFEA] transition-colors whitespace-nowrap shrink-0"
          >
            <Package size={14} className="text-[#6B7280] shrink-0" />
            <span>Track Order</span>
          </button>

          {user ? (
            <div
              ref={dropdownRef}
              className="relative shrink-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button
                type="button"
                onClick={() => setIsPinned((prev) => !prev)}
                className={`h-[34px] px-2.5 flex items-center gap-2 bg-white whitespace-nowrap cursor-pointer relative z-50 border border-[#E8E1D5] shadow-sm transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isDropdownOpen
                    ? 'rounded-t-2xl rounded-b-none border-b-transparent'
                    : 'rounded-full hover:border-[#D5CDC2]'
                  }`}
                aria-expanded={isDropdownOpen}
              >
                <UserAvatar src={user.avatar} name={user.name} />
                <span className="text-[13px] font-semibold text-[#18191B] max-w-[110px] truncate block">
                  {user.name.split(' ')[0] || user.name}
                </span>

                {/* Left Concave Shoulder Curve & Seamless Bottom Bridge */}
                {isDropdownOpen && (
                  <>
                    <div className="absolute inset-x-0 -bottom-[2px] h-[3px] bg-white z-50 pointer-events-none" />
                    <InvertedCorner side="left" className="absolute -left-[16px] -bottom-[1px] z-50" />
                  </>
                )}
              </button>

              {/* Seamless Connected Dropdown Card (Flush right alignment) */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 top-full -mt-[1px] w-72 rounded-2xl rounded-tr-none bg-white border border-[#E8E1D5] shadow-2xl p-3.5 z-40 animate-in fade-in duration-150"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {/* Account Summary Header */}
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]/70 flex items-center gap-3 mb-2">
                    <UserAvatar src={user.avatar} name={user.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#18191B] truncate">{user.name}</p>
                      {user.email && (
                        <p className="text-[11.5px] text-[#5A5D64] truncate leading-tight mt-0.5">{user.email}</p>
                      )}
                      {user.phone && (
                        <p className="text-[11px] text-[#065F46] font-semibold truncate flex items-center gap-1 mt-1">
                          <Phone size={10} className="text-[#059669]" /> {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsPinned(false)
                        setIsHovered(false)
                        nav('profile')
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[13px] font-semibold text-[#18191B] transition-colors text-left group"
                    >
                      <span className="size-6 rounded-lg bg-[#FAF8F5] group-hover:bg-white border border-[#E8E1D5]/80 grid place-items-center text-[#9E593B] shrink-0 transition-colors">
                        <UserIcon size={13} />
                      </span>
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsPinned(false)
                        setIsHovered(false)
                        nav('orders')
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[13px] font-semibold text-[#18191B] transition-colors text-left group"
                    >
                      <span className="size-6 rounded-lg bg-[#FAF8F5] group-hover:bg-white border border-[#E8E1D5]/80 grid place-items-center text-[#9E593B] shrink-0 transition-colors">
                        <Package size={13} />
                      </span>
                      <span>My Orders</span>
                    </button>
                  </div>

                  {onSignOut && (
                    <div className="pt-2 mt-1.5 border-t border-[#F3EFEA]">
                      <button
                        onClick={() => {
                          setIsPinned(false)
                          setIsHovered(false)
                          onSignOut()
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors text-left group"
                      >
                        <span className="size-6 rounded-lg bg-red-50 group-hover:bg-red-100/80 grid place-items-center text-red-600 shrink-0 transition-colors">
                          <LogOut size={12} />
                        </span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-full border border-[#0F1115] px-4 py-2 text-[13px] font-semibold text-[#0F1115] hover:bg-[#0F1115] hover:text-white transition-all whitespace-nowrap shrink-0"
            >
              <UserIcon size={14} className="shrink-0" />
              <span>Sign In / Up</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => onOpenProfile?.()}
              className="size-8 rounded-full border border-[#E8E1D5] overflow-hidden"
              aria-label="Profile"
            >
              <UserAvatar src={user.avatar} name={user.name} />
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="size-9 rounded-full bg-white border border-[#E8E1D5] grid place-items-center text-[#18191B]"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[#E8E1D5] bg-[#FAF8F5] px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {[
            { label: 'How it Works', screen: 'how-it-works' as Screen },
            { label: 'Track My Orders', screen: 'orders' as Screen },
            { label: 'About Us', screen: 'about' as Screen },
            { label: 'For Studios & Partners', screen: 'for-partners' as Screen },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.screen === 'orders' && !user && onOpenAuth) {
                  setOpen(false)
                  onOpenAuth()
                } else {
                  nav(item.screen)
                }
              }}
              className="flex items-center justify-between py-2.5 text-left text-[14.5px] font-medium text-[#1E2229] hover:text-[#9E593B] transition-colors"
            >
              <span>{item.label}</span>
              <span className="text-[#9CA3AF]">→</span>
            </button>
          ))}

          {user && (
            <button
              onClick={() => {
                setOpen(false)
                onOpenProfile?.()
              }}
              className="flex items-center justify-between py-2.5 text-left text-[14.5px] font-medium text-[#9E593B] border-t border-[#E8E1D5]/60"
            >
              <span>My Profile</span>
              <span className="text-[#9CA3AF]">→</span>
            </button>
          )}
        </div>
      )}
    </header>
  )
}

function UserAvatar({ src, name }: { src?: string | null; name?: string }) {
  const [failed, setFailed] = useState(false)
  const initial = (name || 'U')[0].toUpperCase()

  if (!src || failed) {
    return (
      <div className="size-6 rounded-full bg-[#0F1115] text-white text-[10px] font-bold grid place-items-center shrink-0">
        {initial}
      </div>
    )
  }

  return (
    <div className="size-6 rounded-full overflow-hidden shrink-0 border border-[#E8E1D5] relative">
      <Image
        src={src}
        alt={name || 'User'}
        width={24}
        height={24}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </div>
  )
}

function InvertedCorner({ side, className = '' }: { side: 'left' | 'right'; className?: string }) {
  if (side === 'left') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`pointer-events-none ${className}`}
      >
        <path d="M16 0 C16 8.837 8.837 16 0 16 H16.5 V0 Z" fill="white" />
        <path d="M16 0 C16 8.837 8.837 16 0 16" stroke="#E8E1D5" strokeWidth="1" fill="none" />
      </svg>
    )
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`pointer-events-none ${className}`}
      style={{ transform: 'translateY(1px)' }}
    >
      <path d="M0 0 C0 8.837 7.163 16 16 16 H0 V0 Z" fill="white" />
      <path d="M0 0 C0 8.837 7.163 16 16 16" stroke="#E8E1D5" strokeWidth="1" fill="none" />
    </svg>
  )
}
