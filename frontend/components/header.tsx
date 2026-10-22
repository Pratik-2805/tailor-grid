'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import {
  Building2,
  HelpCircle,
  Info,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Phone,
  Receipt,
  Scissors,
  User as UserIcon,
  Wallet,
  X,
} from 'lucide-react'
import { RaffuLogo } from './raffu-logo'
import { getStudioUrl } from '@/lib/api'
import { getRefreshToken, getAuthToken } from '@/lib/cookies'
import { type Screen, type User } from './data'

interface HeaderProps {
  currentScreen: Screen
  go: (s: Screen) => void
  user?: User | null
  isAuthLoading?: boolean
  onOpenAuth?: (authType?: 'signin' | 'signup') => void
  onSignOut?: () => void
}

export function Header({ currentScreen, go, user, isAuthLoading, onOpenAuth, onSignOut }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDropdownOpen = isPinned || isHovered

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

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

  // Whenever the active screen / route changes, close the drawer seamlessly
  useEffect(() => {
    setOpen(false)
  }, [currentScreen])

  const nav = (s: Screen) => {
    setIsPinned(false)
    setIsHovered(false)

    // If already on the requested screen, close drawer directly
    if (s === currentScreen) {
      setOpen(false)
      return
    }

    // If guest tapping protected screens, close drawer so login modal shows
    if (!user && (s === 'orders' || s === 'profile')) {
      setOpen(false)
      go(s)
      return
    }

    // Trigger navigation to requested screen
    go(s)

    // Safety fallback: ensure drawer closes after transition
    setTimeout(() => {
      setOpen(false)
    }, 500)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <Link
            href="/"
            onClick={() => nav('home')}
            className="flex items-center gap-3 group text-left shrink-0 py-1"
            aria-label="Raffu home"
          >
            <RaffuLogo subtitle="OWN YOUR FIT" size="md" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8 text-[13.5px] font-medium text-[#4B5563] shrink-0">
          {user ? (
            <>
              <Link
                href="/book"
                onClick={() => nav('book')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'book' ? 'text-[#0F1115] font-bold' : ''}`}
              >
                Book Alterations
              </Link>
              <Link
                href="/orders"
                onClick={() => nav('orders')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'orders' || currentScreen === 'order' ? 'text-[#0F1115] font-bold' : ''}`}
              >
                My Orders
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => nav('how-it-works')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'how-it-works' ? 'text-[#0F1115] font-semibold' : ''}`}
              >
                How it Works
              </Link>
              <Link
                href="/about"
                onClick={() => nav('about')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'about' ? 'text-[#0F1115] font-semibold' : ''}`}
              >
                About Us
              </Link>
            </>
          ) : isAuthLoading ? (
            <div className="flex items-center gap-5 lg:gap-7 xl:gap-8 opacity-0 pointer-events-none select-none">
              <span className="whitespace-nowrap">Book Alterations</span>
              <span className="whitespace-nowrap">My Orders</span>
              <span className="whitespace-nowrap">How it Works</span>
              <span className="whitespace-nowrap">About Us</span>
            </div>
          ) : (
            <>
              <Link
                href="/how-it-works"
                onClick={() => nav('how-it-works')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'how-it-works' ? 'text-[#0F1115] font-semibold' : ''}`}
              >
                How it Works
              </Link>
              <Link
                href="/about"
                onClick={() => nav('about')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'about' ? 'text-[#0F1115] font-semibold' : ''}`}
              >
                About Us
              </Link>
              <Link
                href="/for-partners"
                onClick={() => nav('for-partners')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'for-partners' ? 'text-[#0F1115] font-semibold' : ''}`}
              >
                For Studios
              </Link>
            </>
          )}
        </nav>

        {/* Right CTAs & User Auth */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">

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
                    {user?.role === 'STUDIO' && (
                      <button
                        onClick={() => {
                          setIsPinned(false)
                          setIsHovered(false)
                          const token = getRefreshToken() || getAuthToken()
                          window.location.href = getStudioUrl('/', token)
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[13px] font-semibold text-[#18191B] transition-colors text-left group"
                      >
                        <span className="size-6 rounded-lg bg-[#FAF8F5] group-hover:bg-white border border-[#E8E1D5]/80 grid place-items-center text-[#9E593B] shrink-0 transition-colors">
                          <Building2 size={13} />
                        </span>
                        <span>Studio Dashboard</span>
                      </button>
                    )}

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
          ) : isAuthLoading ? (
            <div className="h-[34px] w-[96px] rounded-full bg-[#E8E1D5]/40 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.('signin')}
                className="flex items-center gap-1.5 rounded-full border border-[#E8E1D5] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#18191B] hover:bg-[#F3EFEA] hover:border-[#0F1115] transition-all whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              >
                <UserIcon size={13} className="shrink-0 text-[#9E593B]" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('signup')}
                className="flex items-center gap-1.5 rounded-full bg-[#0F1115] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#9E593B] transition-all whitespace-nowrap shrink-0 shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Profile Trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <button
              onClick={() => setOpen(true)}
              className="size-8 rounded-full border border-[#E8E1D5] overflow-hidden cursor-pointer active:scale-95 transition-transform"
              aria-label="Account menu"
            >
              <UserAvatar src={user.avatar} name={user.name} />
            </button>
          ) : isAuthLoading ? (
            <div className="size-8 rounded-full bg-[#E8E1D5]/40 animate-pulse" />
          ) : null}
          <button
            onClick={() => setOpen(!open)}
            className="size-9 rounded-full bg-white border border-[#E8E1D5] grid place-items-center text-[#18191B] cursor-pointer active:scale-95 transition-transform"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Uber-style phone view account & navigation menu) */}
      {open && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999] md:hidden bg-white flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200 select-none">
          <div className="px-6 pt-5 pb-6 flex-1 flex flex-col">
            {/* Top Close Button */}
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -ml-2 rounded-full text-[#111827] hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={26} strokeWidth={2.4} />
              </button>
            </div>

            {/* User Header: Name on left, Avatar on right */}
            <div className="flex items-center justify-between mt-2 mb-6 gap-4">
              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] tracking-tight leading-tight line-clamp-2">
                {user ? (user.name || 'Member') : 'Welcome to Raffu'}
              </h2>
              <div className="size-14 sm:size-16 rounded-full bg-[#52525B] text-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-200">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User'}
                    width={64}
                    height={64}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="size-full object-cover"
                  />
                ) : (
                  <UserIcon size={30} className="text-white" strokeWidth={2.2} />
                )}
              </div>
            </div>

            {/* 3 Quick Action Cards Row */}
            {(() => {
              const isOrdersScreen = currentScreen === 'orders' || currentScreen === 'order'
              const isBookScreen = currentScreen === 'book'
              const activeQuickCard: 'help' | 'book' | 'orders' = isBookScreen
                ? 'book'
                : isOrdersScreen
                ? 'orders'
                : 'help'

              return (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Help Card */}
                  <button
                    type="button"
                    onClick={() => nav('support')}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl bg-[#F6F6F6] hover:bg-[#EFEFEF] transition-all cursor-pointer text-center group active:scale-95 ${
                      activeQuickCard === 'help'
                        ? 'border-2 border-[#DE9920]'
                        : 'border-2 border-transparent hover:border-[#DE9920]/40'
                    }`}
                  >
                    <LifeBuoy size={24} strokeWidth={2.2} className="text-[#111827] group-hover:scale-105 transition-transform" />
                    <span className="text-[13px] font-bold text-[#111827]">Help</span>
                  </button>

                  {/* Book Card */}
                  <button
                    type="button"
                    onClick={() => nav('book')}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl bg-[#F6F6F6] hover:bg-[#EFEFEF] transition-all cursor-pointer text-center group active:scale-95 ${
                      activeQuickCard === 'book'
                        ? 'border-2 border-[#DE9920]'
                        : 'border-2 border-transparent hover:border-[#DE9920]/40'
                    }`}
                  >
                    <Scissors size={24} strokeWidth={2.2} className="text-[#111827] group-hover:scale-105 transition-transform" />
                    <span className="text-[13px] font-bold text-[#111827]">Book</span>
                  </button>

                  {/* Orders Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        nav('orders')
                      } else {
                        setOpen(false)
                        onOpenAuth?.('signin')
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl bg-[#F6F6F6] hover:bg-[#EFEFEF] transition-all cursor-pointer text-center group active:scale-95 ${
                      activeQuickCard === 'orders'
                        ? 'border-2 border-[#DE9920]'
                        : 'border-2 border-transparent hover:border-[#DE9920]/40'
                    }`}
                  >
                    <Package size={24} strokeWidth={2.2} className="text-[#111827] group-hover:scale-105 transition-transform" />
                    <span className="text-[13px] font-bold text-[#111827]">Orders</span>
                  </button>
                </div>
              )
            })()}

            {/* Horizontal Divider (Edge to edge like reference) */}
            <div className="-mx-6 border-b border-[#EEEEEE] mb-3" />

            {/* Vertical Menu Navigation Items */}
            <div className="space-y-1">
              {user ? (
                <>
                  {/* Studio Dashboard (Only if Studio role) */}
                  {user.role === 'STUDIO' && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        const token = getRefreshToken() || getAuthToken()
                        window.location.href = getStudioUrl('/', token)
                      }}
                      className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                    >
                      <Building2 size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                      <span>Studio Dashboard</span>
                    </button>
                  )}

                  {/* My Profile */}
                  <button
                    type="button"
                    onClick={() => nav('profile')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <UserIcon size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>My Profile</span>
                  </button>

                  {/* Book Alterations */}
                  <button
                    type="button"
                    onClick={() => nav('book')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <Scissors size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>Book Alterations</span>
                  </button>

                  {/* My Orders */}
                  <button
                    type="button"
                    onClick={() => nav('orders')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <Package size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>My Orders</span>
                  </button>

                  {/* How it Works */}
                  <Link
                    href="/how-it-works"
                    onClick={() => nav('how-it-works')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <HelpCircle size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>How it Works</span>
                  </Link>

                  {/* About Us */}
                  <Link
                    href="/about"
                    onClick={() => nav('about')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <Info size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>About Us</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Guest Menu Items */}
                  <Link
                    href="/book"
                    onClick={() => nav('book')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <Scissors size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>Book Alterations</span>
                  </Link>

                  <Link
                    href="/how-it-works"
                    onClick={() => nav('how-it-works')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <HelpCircle size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>How it Works</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => nav('about')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                  >
                    <Info size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                    <span>About Us</span>
                  </Link>

                    <Link
                      href="/for-partners"
                      onClick={() => nav('for-partners')}
                      className="w-full flex items-center gap-4 py-3.5 px-2 text-left text-[16px] font-semibold text-[#111827] hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
                    >
                      <Building2 size={20} strokeWidth={2.2} className="text-[#111827] shrink-0" />
                      <span>For Studios & Partners</span>
                    </Link>
                  </>
                )}
            </div>
          </div>

          {/* Bottom Footer Action */}
          <div className="px-6 pb-8 pt-3 mt-auto">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onSignOut?.()
                }}
                className="w-full py-4 rounded-2xl bg-[#F3F4F6] hover:bg-red-50 active:bg-red-100 text-[#DC2626] font-semibold text-[16px] text-center transition-colors cursor-pointer active:scale-[0.99]"
              >
                Sign out
              </button>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onOpenAuth?.('signup')
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#0F1115] hover:bg-[#9E593B] text-white font-semibold text-[15px] text-center transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onOpenAuth?.('signin')
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] font-semibold text-[15px] text-center transition-colors cursor-pointer active:scale-[0.99]"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}

function UserAvatar({ src, name }: { src?: string | null; name?: string }) {
  const [failed, setFailed] = useState(false)
  const initial = (name || 'U')[0].toUpperCase()

  if (!src || src.includes('dicebear') || failed) {
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
