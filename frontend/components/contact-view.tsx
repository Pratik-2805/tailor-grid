'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useApp } from './app-provider'
import type { Screen } from './data'

export function ContactView({ go }: { go: (s: Screen | string) => void }) {
  const { user, openAuth } = useApp()
  const pendingAutoSubmitRef = useRef(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'alteration_inquiry',
    orderNumber: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Auto-fill user details if logged in & auto-dispatch if user just signed in from popup
  useEffect(() => {
    if (user) {
      const rawUserPhone = user.phone || (user.contact && !user.contact.includes('@') ? user.contact : '')
      const userPhoneDigits = rawUserPhone.replace(/\D/g, '').slice(-10)
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || userPhoneDigits || '',
      }))

      if (pendingAutoSubmitRef.current) {
        pendingAutoSubmitRef.current = false
        setTimeout(() => {
          handleSubmit()
        }, 150)
      }
    }
  }, [user])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Validate 10-digit phone number
    const rawPhone = form.phone || (user?.phone || (user?.contact && !user.contact.includes('@') ? user.contact : ''))
    const phoneDigits = (rawPhone || '').replace(/\D/g, '')
    if (phoneDigits.length !== 10) {
      toast.warning('Please enter a valid 10-digit phone number.', {
        position: 'top-center',
      })
      return
    }

    // Require sign-in before submitting
    if (!user) {
      pendingAutoSubmitRef.current = true
      toast.info('Please sign in to your account to send your concierge request.', {
        position: 'top-center',
        autoClose: 3500,
      })
      openAuth('CUSTOMER', 'signin')
      return
    }

    setIsSubmitting(true)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || user.name,
          email: form.email || user.email,
          phone: form.phone || user.contact,
          topic: form.topic,
          orderNumber: form.orderNumber,
          message: form.message,
          source: 'Client Concierge Desk',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch request')
      }

      setIsSubmitted(true)
      toast.success('Your message has been received! Our concierge team will reach out shortly.', {
        position: 'top-center',
        autoClose: 4000,
      })
    } catch (err: any) {
      toast.error(err.message || 'Unable to submit your message. Please try again.', {
        position: 'top-center',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-[#FAF8F5] text-[#18191B] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A5D64] hover:text-[#18191B] mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {/* Hero Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E593B]/10 text-[#9E593B] text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={12} />
            <span>Dedicated Client Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-4">
            We Are Here to Perfect Your Fit
          </h1>
          <p className="text-sm sm:text-base text-[#5A5D64] leading-relaxed">
            Have questions about garment pinning, luxury fabric alterations, turnaround times, or need custom styling advice? Connect with our master tailor concierge desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0F1115] mb-2">
                Direct Concierge Desk
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5D64]">
                Reach out to our master tailors directly for any inquiries or fitting advice.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="tel:+919845095969"
                className="flex items-start gap-3.5 p-3.5 -mx-3.5 rounded-2xl hover:bg-white/70 transition-colors group"
              >
                <div className="size-10 rounded-xl bg-[#F4EFEB] text-[#9E593B] grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7E85]">Phone Concierge</p>
                  <p className="text-sm font-bold text-[#0F1115]">+91 98450 95969</p>
                  <p className="text-xs text-[#5A5D64]">Direct line to master tailor desk</p>
                </div>
              </a>

              <a
                href="mailto:developer.sitarahub@gmail.com"
                className="flex items-start gap-3.5 p-3.5 -mx-3.5 rounded-2xl hover:bg-white/70 transition-colors group"
              >
                <div className="size-10 rounded-xl bg-[#F4EFEB] text-[#9E593B] grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7E85]">Email Support</p>
                  <p className="text-sm font-bold text-[#0F1115]">developer.sitarahub@gmail.com</p>
                  <p className="text-xs text-[#5A5D64]">Replies within 2 hours</p>
                </div>
              </a>
            </div>

            {/* Fit Guarantee Callout */}
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#10B981] shrink-0 mt-0.5" />
              <div className="text-xs text-[#065F46]">
                <span className="font-bold block text-sm mb-0.5">100% Fit Guarantee Active</span>
                Every garment alteration booked via Raffu includes free micro-adjustments within 48 hours of trial.
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE6DF] shadow-xs">
              <h2 className="text-xl font-serif font-bold text-[#0F1115] mb-2">
                Send a Concierge Request
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5D64] mb-6">
                Fill in the details below and an alteration specialist will review your request immediately.
              </p>

              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="size-14 rounded-full bg-[#ECFDF5] text-[#10B981] grid place-items-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F1115]">Message Dispatched</h3>
                  <p className="text-sm text-[#5A5D64] max-w-md mx-auto">
                    Thank you, {form.name || user?.name || 'valued customer'}. Our master tailor concierge has received your request and will contact you via {form.phone || form.email || user?.contact || user?.email || 'your provided contact'} within 15–30 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setForm({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || (user?.contact && !user?.contact.includes('@') ? user.contact : '') || '',
                        topic: 'alteration_inquiry',
                        orderNumber: '',
                        message: '',
                      })
                    }}
                    className="px-6 py-2.5 rounded-full border border-[#D5CDC2] text-xs font-bold uppercase tracking-wider text-[#18191B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7E85] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 text-xs text-[#0F1115] bg-[#FAF8F5] border border-[#E0D9CF] rounded-xl focus:outline-none focus:border-[#9E593B] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7E85] mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        required
                        value={form.phone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setForm({ ...form, phone: digitsOnly })
                        }}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 text-xs text-[#0F1115] bg-[#FAF8F5] border border-[#E0D9CF] rounded-xl focus:outline-none focus:border-[#9E593B] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7E85] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 text-xs text-[#0F1115] bg-[#FAF8F5] border border-[#E0D9CF] rounded-xl focus:outline-none focus:border-[#9E593B] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7E85] mb-1.5">
                        Order Number (If applicable)
                      </label>
                      <input
                        type="text"
                        value={form.orderNumber}
                        onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                        placeholder="e.g. TG-849201"
                        className="w-full px-3.5 py-2.5 text-xs text-[#0F1115] bg-[#FAF8F5] border border-[#E0D9CF] rounded-xl focus:outline-none focus:border-[#9E593B] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7E85] mb-1.5">
                      How Can We Help? *
                    </label>
                    <select
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F1115] bg-[#FAF8F5] border border-[#E0D9CF] rounded-xl focus:outline-none focus:border-[#9E593B] focus:bg-white transition-all"
                    >
                      <option value="alteration_inquiry">Question about Garment Alteration & Pinning</option>
                      <option value="order_status">Order Progress & Studio Drop-off Assistance</option>
                      <option value="fit_guarantee">100% Fit Guarantee Adjustment Request</option>
                      <option value="bespoke_consultation">Bespoke Bridal or Suit Tailoring Advice</option>
                      <option value="other">General Inquiries / Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A7E85] mb-1.5">
                      Your Message or Garment Notes *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your garment type, preferred fit (e.g. slim taper, original hem, waist suppression), or any specific studio question..."
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F1115] bg-[#FAF8F5] border border-[#E0D9CF] rounded-xl focus:outline-none focus:border-[#9E593B] focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[#18191B] hover:bg-[#9E593B] text-white py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Transmitting to Concierge...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send to Concierge Desk</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
