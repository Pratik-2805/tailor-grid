'use client'

import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  X,
} from 'lucide-react'
import { type Screen } from './data'

export function Footer({ go }: { go: (s: Screen) => void }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'guarantee' | 'contact' | null>(null)

  const nav = (s: Screen) => {
    go(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setTimeout(() => {
        setEmail('')
      }, 3500)
    }
  }

  return (
    <>
      <footer className="bg-[#0F1115] text-[#FAF8F5] pt-14 pb-12 border-t border-[#1E2229] transition-colors">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

          {/* Main Footer Navigation Grid */}
          <div className="grid gap-10 pb-12 lg:grid-cols-12 border-b border-[#1E2229]/80">

            {/* Brand Col */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="grid size-9 place-items-center rounded-xl bg-white text-[#0F1115]">
                  <Scissors size={18} />
                </div>
                <span className="font-serif text-xl font-bold text-white tracking-tight">Darzi</span>
              </div>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed mb-6 max-w-[320px]">
                On-demand master tailoring and alterations network. Guaranteed fit, upfront fixed rates, and doorstep service.
              </p>

              {/* Newsletter Subscription */}
              <div className="pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D1D5DB] mb-2">
                  Join the Sartorial Club
                </p>
                {subscribed ? (
                  <div className="flex items-center gap-2 rounded-xl bg-[#064E3B]/30 border border-[#065F46] p-2.5 text-xs text-[#34D399]">
                    <CheckCircle2 size={15} />
                    <span>You&apos;re on the priority list for $10 off first fitting.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-[320px]">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 rounded-xl border border-[#2D333D] bg-[#1A1E24] px-3 py-2 text-xs text-white placeholder:text-[#6B7280] focus:border-[#9E593B] focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#0F1115] hover:bg-[#FAF8F5] transition-all active:scale-95 flex items-center justify-center shrink-0"
                      aria-label="Subscribe"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Services Column */}
            <div className="lg:col-span-3 sm:col-span-4 space-y-3">
              <h5 className="text-[11px] uppercase tracking-wider text-[#9E593B] font-bold">
                Services
              </h5>
              <ul className="space-y-2 text-xs text-[#9CA3AF]">
                {[
                  'Trousers & Jeans Alterations',
                  'Suits & Blazer Tailoring',
                  'Dresses & Gown Contouring',
                  'Waist Suppression & Tapering',
                  'Ethnic & Occasion Wear',
                  'Invisible Zip & Repair',
                ].map((serviceName) => (
                  <li key={serviceName}>
                    <button
                      onClick={() => nav('booking')}
                      className="hover:text-white transition-colors text-left block"
                    >
                      {serviceName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-3 sm:col-span-4">
              <h5 className="text-[11px] uppercase tracking-wider text-[#9E593B] font-bold mb-4">Company</h5>
              <ul className="space-y-2.5 text-xs text-[#9CA3AF]">
                <li><button onClick={() => nav('about')} className="hover:text-white transition-colors">About Darzi</button></li>
                <li><button onClick={() => nav('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => nav('for-partners')} className="hover:text-white transition-colors">Partner With Us</button></li>
                <li><button onClick={() => nav('orders')} className="hover:text-white transition-colors">Digital Fit Passport</button></li>
              </ul>
            </div>

            {/* Portals & Help Column */}
            <div className="lg:col-span-2 sm:col-span-4 space-y-3">
              <h5 className="text-[11px] uppercase tracking-wider text-[#9E593B] font-bold">
                Portals & Help
              </h5>
              <ul className="space-y-2 text-xs text-[#9CA3AF]">
                <li>
                  <button onClick={() => nav('orders')} className="hover:text-white transition-colors text-left">
                    Track Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => nav('partner')} className="hover:text-white transition-colors text-left">
                    Partner Studio Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => nav('admin')} className="hover:text-white transition-colors text-left">
                    Operations Admin
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors text-left">
                    Contact & Support
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Darzi Technologies Ltd.</span>
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
      </footer>

      {/* Policy & Contact Modal Overlays */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-[540px] rounded-3xl bg-[#FAF8F5] text-[#0F1115] p-6 sm:p-8 shadow-2xl border border-[#EBE6DF] max-h-[85vh] overflow-y-auto">

            {/* Close button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 size-8 rounded-full bg-[#F3EFEA] hover:bg-[#E5DFD5] grid place-items-center text-[#0F1115] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Guarantee Policy Modal */}
            {activeModal === 'guarantee' && (
              <div className="space-y-4">
                <div className="size-11 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] grid place-items-center text-[#10B981] mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1115]">
                  100% Fit Guarantee Policy
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                  Every order booked through Darzi is protected by our zero-risk Fit Guarantee. When you collect your tailored garment at the partner studio, you are invited to try it on in the private fitting room.
                </p>
                <div className="rounded-xl bg-white border border-[#EBE6DF] p-4 text-xs space-y-2">
                  <p className="font-bold text-[#0F1115]">What is covered:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[#5A5D64]">
                    <li>Complimentary micro-adjustments within 24–48 hours if the silhouette does not match your booked specifications.</li>
                    <li>OEM color-matched thread standards and industrial pressing.</li>
                    <li>Digital fit passport updates so future alterations are seamless.</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-xl bg-[#0F1115] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
                >
                  Understood
                </button>
              </div>
            )}

            {/* Privacy Modal */}
            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#0F1115]">
                  Privacy & Data Policy
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                  Darzi Technologies Ltd. values your privacy. We only collect essential customer data (fitting measurements, order status, contact phone/email) to facilitate studio bookings and maintain your secure Digital Fit Passport.
                </p>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                  Your payment information is encrypted end-to-end and never stored in plain text. We do not sell personal data to third parties.
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-xl bg-[#0F1115] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Terms Modal */}
            {activeModal === 'terms' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#0F1115]">
                  Terms of Service
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                  By using the Darzi platform and partner atelier network, you agree to our standardized craft guidelines, transparent fixed fee structure, and studio fitting room safety protocols.
                </p>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                  Alterations are completed within the agreed 48–72 hour turnaround timeline barring specialist luxury fabrics with prior customer notice.
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-xl bg-[#0F1115] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Contact Modal */}
            {activeModal === 'contact' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-[#0F1115]">
                  Contact & Concierge Support
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                  Have questions regarding your fitting, partner atelier matching, or custom luxury garments? Our master tailor concierge team is here to assist:
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 rounded-xl bg-white border border-[#EBE6DF] p-3 text-xs font-semibold text-[#0F1115]">
                    <Mail size={16} className="text-[#9E593B]" />
                    <span>support@darzi.com</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white border border-[#EBE6DF] p-3 text-xs font-semibold text-[#0F1115]">
                    <Phone size={16} className="text-[#10B981]" />
                    <span>+1 (800) 555-DARZI / +44 (20) 7946 0912</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-xl bg-[#0F1115] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors mt-2"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
