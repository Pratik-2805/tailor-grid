'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, Scissors, X, MapPin, Package, ShieldCheck, User as UserIcon, LogOut, Phone } from 'lucide-react'
import { type Screen, type User } from './data'

interface HeaderProps {
  currentScreen: Screen
  go: (s: Screen) => void
  user?: User | null
  onOpenAuth?: () => void
  onSignOut?: () => void
}

export function Header({ currentScreen, go, user, onOpenAuth, onSignOut }: HeaderProps) {
  const [open, setOpen] = useState(false)

  const nav = (s: Screen) => {
    go(s)
    setOpen(false)
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
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-[13.5px] font-medium text-[#4B5563] shrink-0">
          <button
            onClick={() => nav('booking')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#0F1115] ${currentScreen === 'booking' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            Book a Tailor
          </button>
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
            <div className="relative group">
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-full pl-2 pr-3 py-1 bg-white whitespace-nowrap shrink-0 hover:border-[#9E593B] shadow-sm transition-all cursor-pointer">
                <UserAvatar src={user.avatar} name={user.name} />
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold text-[#1E2229] max-w-[90px] truncate block leading-tight">
                    {user.name.split(' ')[0] || user.name}
                  </span>
                  {user.phone ? (
                    <span className="text-[9px] text-[#059669] font-semibold leading-none flex items-center gap-0.5">
                      <span className="size-1 rounded-full bg-[#059669]"></span>
                      Phone linked
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#D97706] font-medium leading-none">
                      Link mobile
                    </span>
                  )}
                </div>
              </div>

              {/* Connected Account Hover/Click Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-4 hidden group-hover:block hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="pb-3 border-b border-[#F3F4F6]">
                  <p className="text-xs font-bold text-[#0F1115]">{user.name}</p>
                  {user.email && (
                    <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{user.email}</p>
                  )}
                  {user.phone && (
                    <p className="text-[11px] text-[#059669] font-medium mt-0.5 flex items-center gap-1">
                      <Phone size={10} /> {user.phone}
                    </p>
                  )}
                </div>

                <div className="py-2.5 space-y-1.5 text-xs">
                  <button
                    onClick={() => nav('orders')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF8F5] text-[#374151] font-medium transition-colors text-left"
                  >
                    <span>My Tailoring Orders</span>
                    <span className="text-[#9CA3AF]">→</span>
                  </button>
                  <button
                    onClick={() => nav('booking')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF8F5] text-[#374151] font-medium transition-colors text-left"
                  >
                    <span>Book New Alteration</span>
                    <span className="text-[#9CA3AF]">→</span>
                  </button>
                </div>

                {onSignOut && (
                  <div className="pt-2 border-t border-[#F3F4F6]">
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
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

          <button
            onClick={() => nav('booking')}
            className="rounded-full bg-[#0F1115] px-4 lg:px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#9E593B] transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            Book Now
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#0F1115] hover:bg-[#F3EFEA] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden border-t border-[#E8E1D5] bg-[#FAF8F5] px-5 py-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2229]">
              <ShieldCheck size={14} className="text-[#9E593B]" />
              <span>Audited Craft Standards</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-medium">Certified</span>
          </div>

          {[
            { label: 'Book a Fitting', screen: 'booking' as Screen },
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

          <div className="pt-3 border-t border-[#E8E1D5] flex flex-col gap-2">
            <button
              onClick={() => nav('booking')}
              className="w-full rounded-full bg-[#0F1115] py-3 text-center text-[13.5px] font-semibold text-white shadow-sm"
            >
              Book Fitting Pass
            </button>
          </div>
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

