'use client'

import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  HelpCircle,
  KeyRound,
  Layers,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'

interface StudioFaqItem {
  q: string
  a: string
  category: 'sla' | 'intake' | 'disputes' | 'payouts'
}

const STUDIO_FAQS: StudioFaqItem[] = [
  {
    category: 'sla',
    q: 'What is the required Turnaround SLA for accepted alteration jobs?',
    a: 'Standard alterations (hems, waist suppression, sleeve shortening, basic zip repairs) carry a strict 48-hour SLA from the moment the customer drops off their garment and the PIN is verified. Maintaining a >98% on-time completion rate boosts your studio’s priority weight in our automated proximity dispatch algorithm.',
  },
  {
    category: 'intake',
    q: 'How do I securely intake a customer garment using their 4-digit PIN?',
    a: 'When a customer arrives at your studio counter, open your Workbench Intake modal or click "Lookup by PIN". Ask the customer for their unique 4-digit PIN (generated on their booking receipt). Entering this PIN validates the order in the database, locks in the confirmed partner payout, and transitions the order status to "Accepted" or "In Progress". Never cut or mark a garment without PIN confirmation.',
  },
  {
    category: 'disputes',
    q: 'What should the atelier do if the customer’s garment measurements look incorrect before cutting?',
    a: 'Before applying shears or chalk, always cross-reference the customer’s pinned adjustment with standard anatomical proportions. If you identify a significant error (e.g. inseam shortened by 6+ inches unexpectedly), do NOT cut. Immediately message the customer through the Workbench or call our Partner Escalations Desk. Darzi will verify customer intent to protect your atelier from liability.',
  },
  {
    category: 'disputes',
    q: 'Who covers the cost if a customer claims a fit adjustment under the 100% Fit Guarantee?',
    a: 'If your atelier followed the exact pinned measurements recorded in the order, and the customer simply requests a secondary styling preference, Darzi provides compensatory micro-adjustment reimbursement. If the alteration deviated from the agreed order specifications, the studio must perform the complimentary minor correction within 24–48 hours.',
  },
  {
    category: 'payouts',
    q: 'When and how are tailor partner payouts disbursed?',
    a: 'Partner payouts are calculated automatically per completed and collected order. Payout batches are finalized every Sunday at 23:59 and disbursed directly via automated NEFT/IMPS bank transfer or UPI within 48 banking hours. You can inspect all individual payouts, platform commissions, and retail add-ons in your Workbench Earnings tab.',
  },
  {
    category: 'intake',
    q: 'Can our studio accept walk-in alterations directly through the workbench?',
    a: 'Yes! Certified partners can intake walk-in clients directly using the "New Counter Intake" module on your Workbench Cockpit. Walk-in jobs booked through your terminal benefit from our standardized automated invoicing, hang-tag generator, and digital fit profile storage.',
  },
]

export function StudioSupportView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const filteredFaqs = STUDIO_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
            <Link href="/contact" className="hover:text-white transition-colors">
              Partner Operations Desk
            </Link>
            <span>&middot;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Commercial Privacy
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider mb-3">
            <BookOpen size={12} />
            <span>Master Craftsman Knowledge Base</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Partner Support &amp; SLA Guidelines
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Everything you need to know about drop-off PIN intake verification, 48-hour turnarounds, customer dispute protocols, and weekly automated settlements.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SLA rules, PIN lookup, payout schedules, cutting disputes..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white bg-slate-900 border border-slate-700 rounded-full shadow-lg focus:outline-none focus:border-[#9E593B] transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* 3 Core Atelier Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
            <div className="size-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 grid place-items-center text-amber-400">
              <Clock size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-white">48-Hour Turnaround SLA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Timely delivery is vital. Maintaining high completion speed keeps your atelier at the top of the regional 5-mile dispatch queue.
            </p>
          </div>

          <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
            <div className="size-11 rounded-2xl bg-blue-500/20 border border-blue-500/30 grid place-items-center text-blue-400">
              <KeyRound size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-white">Mandatory PIN Intake</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Always verify the client's 4-digit PIN upon drop-off. This confirms physical custody and locks your guaranteed partner payout.
            </p>
          </div>

          <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
            <div className="size-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 grid place-items-center text-emerald-400">
              <Banknote size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-white">Weekly Automated Payouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct bank settlements processed weekly without withdrawal delays. Track all job earnings and retail commissions live on your dashboard.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'sla', label: 'SLA & Turnaround' },
            { id: 'intake', label: 'PIN & Garment Intake' },
            { id: 'disputes', label: 'Fit Disputes & Guarantee' },
            { id: 'payouts', label: 'Payouts & Banking' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#9E593B] text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-12 divide-y divide-slate-800">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No questions matched your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="mt-3 text-xs font-bold text-[#9E593B] underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 py-1 cursor-pointer group"
                  >
                    <span className="text-sm font-bold text-white group-hover:text-[#D88D70] transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`size-7 rounded-full bg-slate-900 border border-slate-700 grid place-items-center shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 bg-[#9E593B] text-white' : 'text-slate-400'
                      }`}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 pr-8 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Escalation CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-[#1E293B] p-6 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Need Direct Operational Escalation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Our Partner Relationship Managers are available to assist with machinery capacity pause, bulk supplies, or urgent order disputes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full bg-[#9E593B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8A4C32] transition-all cursor-pointer shadow-xs"
            >
              Open Partner Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
