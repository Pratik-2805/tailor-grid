'use client'

import { useState } from 'react'
import { Menu, Scissors, X, MapPin, Package, ShieldCheck } from 'lucide-react'
import { type Screen } from './data'

interface HeaderProps {
  currentScreen: Screen
  go: (s: Screen) => void
}

export function Header({ currentScreen, go }: HeaderProps) {
  const [open, setOpen] = useState(false)

  const nav = (s: Screen) => {
    go(s)
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo + City Selector */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => nav('home')}
            className="flex items-center gap-2.5 group text-left"
            aria-label="TailorGrid home"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-[#0F1115] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Scissors size={16} className="text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-[19px] tracking-tight text-[#0F1115] block leading-none">
                TailorGrid
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#9E593B] block mt-0.5">
                On-Demand Alterations
              </span>
            </div>
          </button>

          {/* Certified Network Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] text-[12px] font-medium text-[#1E2229] border border-[#EBE6DF]">
            <MapPin size={12} className="text-[#9E593B]" />
            <span>Certified Atelier Network</span>
            <span className="size-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-[#4B5563]">
          <button
            onClick={() => nav('booking')}
            className={`transition-colors hover:text-[#0F1115] ${currentScreen === 'booking' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            Book a Tailor
          </button>
          <button
            onClick={() => nav('how-it-works')}
            className={`transition-colors hover:text-[#0F1115] ${currentScreen === 'how-it-works' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            How it Works
          </button>
          <button
            onClick={() => nav('about')}
            className={`transition-colors hover:text-[#0F1115] ${currentScreen === 'about' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            About Us
          </button>
          <button
            onClick={() => nav('for-partners')}
            className={`transition-colors hover:text-[#0F1115] ${currentScreen === 'for-partners' ? 'text-[#0F1115] font-semibold' : ''}`}
          >
            For Tailors
          </button>
        </nav>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => nav('orders')}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-[#1E2229] hover:bg-[#F3EFEA] transition-colors"
          >
            <Package size={14} className="text-[#6B7280]" />
            <span>Track Order</span>
          </button>

          <button
            onClick={() => nav('booking')}
            className="rounded-full bg-[#0F1115] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#9E593B] transition-all active:scale-95"
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
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-5 py-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2229]">
              <ShieldCheck size={14} className="text-[#9E593B]" />
              <span>100% Free Fit Guarantee</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-medium">Active</span>
          </div>

          {[
            { label: 'Book a Fitting', screen: 'booking' as Screen },
            { label: 'How it Works', screen: 'how-it-works' as Screen },
            { label: 'Track My Orders', screen: 'orders' as Screen },
            { label: 'About Us', screen: 'about' as Screen },
            { label: 'For Tailors & Partners', screen: 'for-partners' as Screen },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => nav(item.screen)}
              className="flex items-center justify-between py-2.5 text-left text-[14.5px] font-medium text-[#1E2229] hover:text-[#9E593B] transition-colors"
            >
              <span>{item.label}</span>
              <span className="text-[#9CA3AF]">→</span>
            </button>
          ))}

          <div className="pt-3 border-t border-[#F3F4F6] flex flex-col gap-2">
            <button
              onClick={() => nav('booking')}
              className="w-full rounded-full bg-[#0F1115] py-3 text-center text-[13.5px] font-semibold text-white shadow-sm"
            >
              Book Doorstep or Studio
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

