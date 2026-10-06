'use client'

import {
  ArrowLeft,
  Building,
  CheckCircle2,
  EyeOff,
  FileText,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'

export function StudioPrivacyView() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              Partner Operations
            </Link>
            <span>&middot;</span>
            <Link href="/support" className="hover:text-white transition-colors">
              SLA Guidelines
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E593B]/20 text-[#D88D70] border border-[#9E593B]/30 text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={12} />
            <span>Commercial Atelier Governance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Atelier Partner Commercial Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Effective Date: October 2026 &middot; Binding Agreement for All Certified Darzi Tailor Studios
          </p>
        </div>

        {/* 3 Core Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <Building size={20} className="text-[#D88D70] mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Workshop Confidentiality</h4>
            <p className="text-[11px] text-slate-400">Your machinery counts, internal staff records, and daily capacities remain private.</p>
          </div>
          <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <Lock size={20} className="text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Encrypted Settlements</h4>
            <p className="text-[11px] text-slate-400">Partner bank accounts and payout transaction telemetry are protected by AES-256 encryption.</p>
          </div>
          <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <EyeOff size={20} className="text-blue-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Customer Custody NDA</h4>
            <p className="text-[11px] text-slate-400">Mutual non-disclosure terms protecting customer privacy and atelier reputation.</p>
          </div>
        </div>

        {/* Document Body */}
        <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="size-6 rounded-full bg-slate-900 border border-slate-700 text-xs grid place-items-center text-[#D88D70]">1</span>
              <span>Information Darzi Collects from Partner Studios</span>
            </h2>
            <p>
              To certify and connect your workshop to the 5-mile live dispatch grid, Darzi collects:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong className="text-white">Facility Telemetry:</strong> Physical workshop address, precise GPS coordinates (lat/lng), opening hours, daily capacity, machine equipment counts, and master craftsman credentials.</li>
              <li><strong className="text-white">Banking &amp; Settlement Data:</strong> Account numbers, IFSC codes / routing details, GSTIN/tax identification numbers for automated weekly payout transfers.</li>
              <li><strong className="text-white">Performance Telemetry:</strong> SLA turnaround adherence, dispatch accept/skip ratios, and customer review scores used purely for regional allocation fairness.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="size-6 rounded-full bg-slate-900 border border-slate-700 text-xs grid place-items-center text-[#D88D70]">2</span>
              <span>Customer Data Custody &amp; Strict Non-Solicitation</span>
            </h2>
            <p>
              As a certified Darzi atelier partner, you receive customer fit information (measurements, pinned adjustments, garment notes, and 4-digit drop-off PINs) solely to execute alterations.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
              <p className="font-bold text-white">Strict Customer Protection Clause:</p>
              <p>
                Ateliers are strictly prohibited from harvesting customer telephone numbers, addresses, or emails for independent offline marketing, private solicitations, or third-party marketing. Any violation results in immediate studio suspension and revocation of partner network certification.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="size-6 rounded-full bg-slate-900 border border-slate-700 text-xs grid place-items-center text-[#D88D70]">3</span>
              <span>Dispatch Algorithm &amp; Telemetry Fairness</span>
            </h2>
            <p>
              Our dispatch engine allocates alteration opportunities based on three transparent factors:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong className="text-white">Proximity Radius:</strong> Distance from customer (Stage 1: 0–1 mi &middot; Stage 2: 1–3 mi &middot; Stage 3: 3–5 mi).</li>
              <li><strong className="text-white">Available Capacity:</strong> Current active jobs vs. declared daily machine capacity.</li>
              <li><strong className="text-white">SLA Quality Score:</strong> On-time completion history and customer ratings.</li>
            </ul>
            <p>
              We do not auction dispatch priority to the highest bidder. Every certified local atelier receives equal opportunity within their catchment area.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="size-6 rounded-full bg-slate-900 border border-slate-700 text-xs grid place-items-center text-[#D88D70]">4</span>
              <span>Financial Data Encryption &amp; Audit Logs</span>
            </h2>
            <p>
              All payout statements, earnings records, and banking credentials are stored in encrypted form with strict role-based access. Partner studios may download reconciled tax invoices and settlement history directly from the Workbench Payouts tab at any time.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="size-6 rounded-full bg-slate-900 border border-slate-700 text-xs grid place-items-center text-[#D88D70]">5</span>
              <span>Partner Compliance &amp; Support Contacts</span>
            </h2>
            <p>
              For legal inquiries, NDA clarifications, or partner data requests:
            </p>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-white">Darzi Technologies Ltd. &middot; Partner Legal &amp; Compliance</p>
              <p className="text-slate-400">Partner Desk Email: partners@darzi.com &middot; legal@darzi.com</p>
              <p className="text-slate-400">Partner Escalations Hotline: +91 98450 95969 / +44 20 7946 0912</p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-full bg-slate-800 hover:bg-[#9E593B] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Return to Studio Workbench
          </Link>
        </div>
      </div>
    </div>
  )
}
