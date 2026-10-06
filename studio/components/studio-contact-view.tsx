'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  Phone,
  Send,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

export function StudioContactView({ user }: { user?: any }) {
  const [form, setForm] = useState({
    studioName: user?.studioName || user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    category: 'payout_query',
    priority: 'normal',
    orderId: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast.success('Your partner operations ticket has been dispatched to your regional manager.', {
        position: 'top-center',
        autoClose: 4000,
      })
    }, 900)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Workbench</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link href="/support" className="hover:text-white transition-colors">
              SLA &amp; Help Center
            </Link>
            <span>&middot;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Partner Privacy
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E593B]/20 text-[#D88D70] border border-[#9E593B]/30 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Wrench size={12} />
            <span>Atelier Operations Desk</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Partner Studio Support &amp; Concierge
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Need urgent assistance with a live order dispatch, customer measurement dispute, weekly settlement reconciliation, or machine capacity adjustment?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Partner Ops Contacts */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-lg font-serif font-bold text-white">
                Direct Atelier Channels
              </h2>

              <div className="space-y-4 text-xs">
                <a
                  href="tel:+919845095969"
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#9E593B]/50 transition-colors group"
                >
                  <div className="size-10 rounded-xl bg-[#9E593B]/20 text-[#D88D70] grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Dispatch Hotline</p>
                    <p className="text-sm font-bold text-white">+91 98450 95969 / +44 20 7946 0912</p>
                    <p className="text-[11px] text-slate-400">For active order blocks &amp; immediate customer disputes</p>
                  </div>
                </a>

                <a
                  href="mailto:partners@darzi.com"
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#9E593B]/50 transition-colors group"
                >
                  <div className="size-10 rounded-xl bg-blue-500/20 text-blue-400 grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Partner Operations Desk</p>
                    <p className="text-sm font-bold text-white">partners@darzi.com</p>
                    <p className="text-[11px] text-slate-400">Settlements, GST invoicing &amp; capacity updates</p>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                  <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Partner Desk Response SLA</p>
                    <p className="text-xs font-bold text-white">Critical: Under 15 Minutes &middot; Normal: Under 2 Hours</p>
                    <p className="text-[11px] text-slate-400">Active monitoring during atelier hours (08:30 – 20:30 IST)</p>
                  </div>
                </div>
              </div>

              {/* Priority Escalation Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <span className="font-bold block text-sm mb-0.5">Machine Breakdown or Capacity Full?</span>
                  Toggle your workbench status to <strong className="text-white">"Offline"</strong> from the top navigation to immediately pause new incoming dispatches without SLA penalties.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Partner Operations Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <h2 className="text-xl font-serif font-bold text-white mb-2">
                Open Atelier Operations Ticket
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Submit your inquiry directly to our Atelier Support Engineering team.
              </p>

              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 grid place-items-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">Ticket Logged</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Ticket #{Math.floor(100000 + Math.random() * 900000)} has been assigned to your Regional Partner Manager. You will receive a direct update on {form.phone || form.email || 'your registered contact'}.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setForm({
                        studioName: user?.studioName || user?.name || '',
                        phone: user?.phone || '',
                        email: user?.email || '',
                        category: 'payout_query',
                        priority: 'normal',
                        orderId: '',
                        message: '',
                      })
                    }}
                    className="px-6 py-2.5 rounded-full border border-slate-700 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Studio / Partner Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.studioName}
                        onChange={(e) => setForm({ ...form, studioName: e.target.value })}
                        placeholder="e.g. Master Sartoria SoHo"
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-[#9E593B] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Partner Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. +91 98450 12345"
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-[#9E593B] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Inquiry Category *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-[#9E593B] transition-all"
                      >
                        <option value="payout_query">Weekly Settlement &amp; Bank Payout Query</option>
                        <option value="sla_dispute">Customer Measurement &amp; Fit Dispute</option>
                        <option value="capacity_pause">Temporary Capacity Pause / Machine Repair</option>
                        <option value="profile_specialties">Atelier Profile &amp; Services Update</option>
                        <option value="materials_threads">OEM Industrial Threads &amp; Hangtag Reorder</option>
                        <option value="app_bug">Workbench Software / Telemetry Assistance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Urgency Level *
                      </label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-[#9E593B] transition-all"
                      >
                        <option value="normal">Standard (Within 2 Hours)</option>
                        <option value="urgent">Urgent (Within 45 Mins)</option>
                        <option value="critical">Critical (Customer at Drop-off Counter)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.orderId}
                      onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                      placeholder="e.g. TG-849201"
                      className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-[#9E593B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Details / Operational Notes *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please state the specific order details, payout transaction ID, or machinery downtime timeline..."
                      className="w-full px-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-[#9E593B] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[#9E593B] hover:bg-[#8A4C32] text-white py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Ticket...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Dispatch to Partner Operations</span>
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
