'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, MapPin, Scissors, ShieldCheck } from 'lucide-react'
import { type Screen } from './data'

export function Footer({ go }: { go: (s: Screen) => void }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const nav = (s: Screen) => {
    go(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#0F1115] text-[#FAF8F5] pt-16 pb-12 border-t border-[#1E2229]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Top Grid */}
        <div className="grid gap-10 pb-12 lg:grid-cols-12 border-b border-[#1E2229]">

          {/* Brand Col */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="grid size-9 place-items-center rounded-xl bg-white text-[#0F1115]">
                <Scissors size={18} />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">TailorGrid</span>
            </div>
            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed mb-6 max-w-[320px]">
              On-demand master tailoring and alterations network. Guaranteed fit, upfront fixed rates, and doorstep service.
            </p>

            {/* Newsletter */}
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#10B981] font-medium">
                <CheckCircle2 size={15} /> Thank you — you&apos;re on the priority list.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true) }} className="flex gap-2 max-w-[320px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for $10 off first fit"
                  required
                  className="flex-1 rounded-xl border border-[#2D333D] bg-[#1A1E24] px-3.5 py-2.5 text-xs text-white placeholder:text-[#6B7280] focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0F1115] hover:bg-[#FAF8F5] transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Services */}
          <div className="lg:col-span-3 sm:col-span-4">
            <h5 className="text-[11px] uppercase tracking-wider text-[#9E593B] font-bold mb-4">Services</h5>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              {['Doorstep Master Darzi', 'Trousers & Jeans Alterations', 'Dresses & Evening Gowns', 'Suits & Bespoke Tailoring', 'Express Zip & Lining Repair', 'Wardrobe Refresh Bundle'].map((s) => (
                <li key={s}>
                  <button onClick={() => nav('booking')} className="hover:text-white transition-colors text-left">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-3 sm:col-span-4">
            <h5 className="text-[11px] uppercase tracking-wider text-[#9E593B] font-bold mb-4">Company</h5>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              <li><button onClick={() => nav('about')} className="hover:text-white transition-colors">About TailorGrid</button></li>
              <li><button onClick={() => nav('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => nav('for-partners')} className="hover:text-white transition-colors">Partner With Us</button></li>
              <li><button onClick={() => nav('orders')} className="hover:text-white transition-colors">Digital Fit Passport</button></li>
            </ul>
          </div>

          {/* Partner & Portals */}
          <div className="lg:col-span-2 sm:col-span-4">
            <h5 className="text-[11px] uppercase tracking-wider text-[#9E593B] font-bold mb-4">Portals</h5>
            <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
              <li><button onClick={() => nav('orders')} className="hover:text-white transition-colors">Track Orders</button></li>
              <li><button onClick={() => nav('partner')} className="hover:text-white transition-colors">Tailor Partner Login</button></li>
              <li><button onClick={() => nav('admin')} className="hover:text-white transition-colors text-[#6B7280]">Operations Admin</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} TailorGrid Technologies Ltd.</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#10B981]"><ShieldCheck size={13} /> 100% Fit Guarantee</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin size={12} /> London</span>
            <span>·</span>
            <span>Manchester</span>
            <span>·</span>
            <span>Birmingham</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

