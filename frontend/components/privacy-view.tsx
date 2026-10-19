'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  Mail,
  Phone,
  Scissors,
  Shield,
  ShieldCheck,
  Store,
  User,
  Users
} from 'lucide-react'
import type { Screen } from './data'

export function PrivacyView({ go }: { go: (s: Screen | string) => void }) {
  const [activeTab, setActiveTab] = useState<'customer' | 'studio'>('customer')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      const search = new URLSearchParams(window.location.search)
      if (hash.includes('studio') || search.get('tab') === 'studio') {
        setActiveTab('studio')
      } else if (hash.includes('customer') || search.get('tab') === 'customer') {
        setActiveTab('customer')
      }
    }
  }, [])

  const handleTabChange = (tab: 'customer' | 'studio') => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.replaceState(null, '', url.toString())
    }
  }

  return (
    <div className="flex-1 bg-[#FAF8F5] text-[#18191B] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A5D64] hover:text-[#0F1115] mb-8 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Page Main Header */}
        <header className="mb-8 pb-6 border-b border-[#EAE5DE]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E593B] mb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>Data Privacy &amp; Platform Security</span>
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7E85]">
            Last updated: October 2026 &middot; Compliant with UK GDPR, Data Protection Act 2018, and international security standards.
          </p>
        </header>

        {/* ── TWO-SECTION TABS (Customer vs Studio) ── */}
        <div className="mb-10">
          <div className="flex border-b border-[#DDD6CB] gap-3 sm:gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`pb-3.5 pt-1 px-1 transition-all flex items-center gap-2 cursor-pointer relative text-sm font-bold ${
                activeTab === 'customer'
                  ? 'text-[#0F1115] border-b-2 border-[#0F1115] -mb-px font-extrabold'
                  : 'text-[#7A7E85] hover:text-[#0F1115] border-b-2 border-transparent -mb-px'
              }`}
            >
              <User size={16} className={activeTab === 'customer' ? 'text-[#9E593B]' : 'text-[#A0A4AB]'} />
              <span>Customer Privacy Policy</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === 'customer' ? 'bg-[#0F1115] text-white' : 'bg-[#EFE9E0] text-[#7A7E85]'
                }`}
              >
                Clients &amp; Fittings
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('studio')}
              className={`pb-3.5 pt-1 px-1 transition-all flex items-center gap-2 cursor-pointer relative text-sm font-bold ${
                activeTab === 'studio'
                  ? 'text-[#0F1115] border-b-2 border-[#0F1115] -mb-px font-extrabold'
                  : 'text-[#7A7E85] hover:text-[#0F1115] border-b-2 border-transparent -mb-px'
              }`}
            >
              <Store size={16} className={activeTab === 'studio' ? 'text-[#9E593B]' : 'text-[#A0A4AB]'} />
              <span>Studio Partner Privacy Policy</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === 'studio' ? 'bg-[#0F1115] text-white' : 'bg-[#EFE9E0] text-[#7A7E85]'
                }`}
              >
                Ateliers &amp; Retailers
              </span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#7A7E85]">
            <span className="size-1.5 rounded-full bg-[#10B981]" />
            <span>
              {activeTab === 'customer'
                ? 'Viewing data protection and Digital Fit Passport policies for customers booking alterations.'
                : 'Viewing data handling, counter payouts, and NDA policies for partner studios and boutiques.'}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 1. CUSTOMER PRIVACY POLICY CONTENT */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'customer' && (
          <div className="space-y-10 text-sm sm:text-base text-[#3F4248] leading-relaxed animate-in fade-in duration-300">
            {/* Intro Alert Box */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">
                Customer Scope
              </span>
              <h2 className="text-base font-bold text-[#1E2229] mt-1 mb-2">
                Your Fitting Data Stays Private &amp; Vault-Encrypted
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                Raffu never sells or monetizes personal body measurements, silhouette notes, or fitting imagery. All customer sizing data is protected under AES-256 vault encryption.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                1. Introduction &amp; Data Controller
              </h2>
              <p className="mb-3">
                Raffu Labs Ltd. (&quot;Raffu&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates an on-demand garment alteration and repair platform connecting customers with certified master tailor ateliers. We act as the data controller for your personal information.
              </p>
              <p>
                We are committed to protecting your privacy and personal data under UK GDPR, the Data Protection Act 2018, and international data protection standards. We never sell, rent, or monetize your wardrobe data or body measurements to third-party advertisers.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                2. Personal Information We Collect
              </h2>
              <p className="mb-3">
                We collect only the essential information necessary to provide garment alteration, fitting, and repair services:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  <strong className="text-[#0F1115]">Contact &amp; Account Details:</strong> Full name, mobile phone number, and email address used for booking confirmations, SMS status notifications, drop-off PIN alerts, and digital receipts.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Digital Fit Passport:</strong> Body measurements (such as waist, inseam, chest circumference, shoulder span, sleeve length), garment fit preferences, and tailor pinning notes.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Garment Intake Imagery:</strong> Photos of clothing, pre-existing wear, tear areas, or pinning reference marks submitted during online booking or atelier drop-off for quality assurance.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Locality &amp; Postal Code:</strong> Used strictly to match you with verified partner ateliers within convenient traveling distance. We do not track continuous background GPS coordinates.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                3. Digital Fit Passport &amp; Vault Encryption
              </h2>
              <p className="mb-3">
                Your Digital Fit Passport is designed to eliminate the hassle of measuring your clothes repeatedly for future alterations. All measurement data and fitting notes are encrypted at rest using AES-256 standard encryption in our secure fit vault.
              </p>
              <p>
                You maintain full control over your measurements and can view, edit, or delete stored sizing specifications at any time directly through your customer profile.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                4. How Partner Ateliers Access Your Data &amp; NDA
              </h2>
              <p className="mb-3">
                To complete your garment alteration, only the specific partner atelier assigned to your order receives access to relevant order notes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  Ateliers receive your unique 4-digit drop-off PIN to verify physical garment custody upon handover.
                </li>
                <li>
                  Craftsmen view target hem lengths, taper measurements, sewing instructions, and reference photos needed to complete the alteration.
                </li>
                <li>
                  Partner studios are bound by strict Non-Disclosure Agreements (NDAs) and are strictly prohibited from using customer phone numbers or emails for unsolicited commercial contact or off-platform marketing.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                5. Fitting Room Privacy &amp; Garment Intake Imagery
              </h2>
              <p className="mb-3">
                In-studio fitting sessions take place in dedicated, private cabins or changing rooms with mirrors. Partner studios do not record video or photographs inside changing spaces.
              </p>
              <p>
                Garment intake photos submitted for craftsmanship verification (e.g. hem markings or zipper damage) are stored for 90 days following order collection to satisfy our 100% Fit Guarantee, after which they are permanently deleted from active storage.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                6. Payment Security &amp; Counter Direct Settlement
              </h2>
              <p className="mb-3">
                Customers enjoy transparent direct pricing. Depending on your booking preference:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  <strong className="text-[#0F1115]">Direct Counter Settlement:</strong> Pay directly at the studio counter via cash, UPI, or card terminal. Raffu never deducts third-party payout fees or holds customer funds.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Online Pre-Authorization:</strong> When booked online, payments are tokenized via PCI-DSS Level 1 compliant gateways. Raffu does not store raw card numbers or CVVs.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                7. Data Retention Schedule
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li><strong className="text-[#0F1115]">Fit Passport:</strong> Retained for the active life of your account to facilitate effortless repeat alterations, or until you request deletion.</li>
                <li><strong className="text-[#0F1115]">Garment Intake Imagery:</strong> Kept for 90 days after order completion for quality verification and then permanently purged.</li>
                <li><strong className="text-[#0F1115]">Order &amp; PIN History:</strong> Kept for 3 years for warranty and dispute auditing.</li>
                <li><strong className="text-[#0F1115]">Invoices &amp; Tax Records:</strong> Retained for 6 years in accordance with statutory accounting obligations.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                8. Your Statutory Privacy Rights
              </h2>
              <p className="mb-3">
                Under applicable data protection legislation, you possess the following rights regarding your information:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li><strong className="text-[#0F1115]">Right to Access:</strong> Request a complete digital export of all order records and fit passport dimensions held in your account.</li>
                <li><strong className="text-[#0F1115]">Right to Rectify:</strong> Correct or fine-tune any inaccurate personal details or measurements at any time.</li>
                <li><strong className="text-[#0F1115]">Right to Erasure:</strong> Request the complete and permanent deletion of your profile, fit passport, and order history.</li>
                <li><strong className="text-[#0F1115]">Right to Withdraw Consent:</strong> Unsubscribe from marketing communications at any time with a single click.</li>
              </ul>
            </section>

            {/* Switch Helper Card */}
            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E8E1D5] flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#0F1115]">Are you an artisan studio or retail boutique?</p>
                <p className="text-xs text-[#5A5D64]">Review specific partner data terms, workshop licensing, and counter earnings protection.</p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('studio')}
                className="shrink-0 rounded-full bg-[#0F1115] text-white px-4 py-2 text-xs font-bold hover:bg-[#9E593B] transition-colors cursor-pointer"
              >
                Studio Policy &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 2. STUDIO PARTNER PRIVACY POLICY CONTENT */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'studio' && (
          <div className="space-y-10 text-sm sm:text-base text-[#3F4248] leading-relaxed animate-in fade-in duration-300">
            {/* Intro Alert Box */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">
                Partner Studio Scope
              </span>
              <h2 className="text-base font-bold text-[#1E2229] mt-1 mb-2">
                Artisan Business Autonomy &amp; Workshop Privacy
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                Raffu respects the independence of partner ateliers and fashion boutiques. We protect your business records, machine specifications, and studio bank information with bank-grade security.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                1. Introduction &amp; Studio Governance
              </h2>
              <p className="mb-3">
                This section governs the collection and handling of business, financial, and operational data for independent master tailors, alteration ateliers, and fashion retail partners (&quot;Studio Partners&quot;, &quot;Ateliers&quot;, &quot;Boutiques&quot;) registered on the Raffu platform.
              </p>
              <p>
                Raffu acts as a technology intermediary and booking dispatch platform. We respect your operational freedom, your client pricing autonomy, and your proprietary workshop practices.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                2. Information We Collect from Studio Partners
              </h2>
              <p className="mb-3">
                To onboard, certify, and route alteration bookings to your studio, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  <strong className="text-[#0F1115]">Workshop &amp; Business Details:</strong> Registered studio name, commercial storefront address, shop lease / trade license, GSTIN or commercial registration numbers, and lead artisan contact details.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Machine &amp; Capacity Specs:</strong> Number of industrial single-needle lockstitch machines, sergers/overlock capabilities, blind-stitch hemmers, and daily garment capacity to ensure proper job dispatch.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Quality Screening &amp; Audit Records:</strong> Craftsmanship verification sample reviews, seam finish assessments, and verified customer turnaround ratings.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Studio Location &amp; Operating Hours:</strong> Geolocation coordinates, opening hours, and scheduled holiday/vacation mode dates displayed to nearby customers.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                3. Direct Counter Payments &amp; Zero Fund Withholding
              </h2>
              <p className="mb-3">
                Raffu upholds a craftsman-first payment architecture:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  Customers pay studios directly at your counter via card terminal, cash, or UPI upon trial handover.
                </li>
                <li>
                  Raffu never holds, delays, or deducts third-party payment settlement fees from your direct counter walk-in earnings.
                </li>
                <li>
                  Any banking information provided during partner enrollment is used strictly for digital invoicing, tax compliance, or authorized promotional bonus transfers.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                4. Customer Data Custody &amp; Strict Non-Disclosure (NDA)
              </h2>
              <p className="mb-3">
                In servicing Raffu orders, partner studios receive access to customer names, alteration notes, and 4-digit handover PINs:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  <strong className="text-[#0F1115]">Restricted Purpose:</strong> Customer contact details and measurements may only be used to facilitate garment fittings, pin checks, and order ready notifications.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Non-Disclosure &amp; Non-Solicitation:</strong> Studios agree never to export, copy, or distribute customer phone lists or body measurements for off-platform commercial marketing.
                </li>
                <li>
                  <strong className="text-[#0F1115]">Fitting Room Dignity:</strong> Studios agree to maintain clean, private changing areas with mirrors and enforce strict customer personal dignity standards.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                5. Studio Geolocation &amp; Directory Privacy
              </h2>
              <p className="mb-3">
                Your shop address and operating schedule are made public on the Raffu map so local clients can book fitting visits.
              </p>
              <p>
                Internal studio metrics—including total monthly volume, custom trade secrets, vendor fabric sources, and proprietary cutter patterns—are strictly confidential and never disclosed to competitor ateliers.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                6. Data Retention &amp; De-registration
              </h2>
              <p className="mb-3">
                Studio operational records are retained throughout your active partner agreement:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li>
                  If you choose to de-enroll your studio, your public directory listing is deactivated immediately.
                </li>
                <li>
                  Historical order receipts and tax compliance logs are retained securely for the statutory 6-year period in accordance with financial audit requirements.
                </li>
                <li>
                  Studios retain the right to download their complete ledger of completed orders, ratings, and transaction logs prior to closure.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
                7. Studio Partner Rights &amp; Data Portability
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
                <li><strong className="text-[#0F1115]">Export Your Ledger:</strong> Request a comprehensive export of all completed bookings, timestamps, and customer feedback.</li>
                <li><strong className="text-[#0F1115]">Update Workshop Profile:</strong> Edit machine capacity, add new tailors, or modify services via your Studio Portal anytime.</li>
                <li><strong className="text-[#0F1115]">Vacation / Pause Mode:</strong> Temporarily hide your studio from customer booking dispatches without deleting your account.</li>
              </ul>
            </section>

            {/* Switch Helper Card */}
            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E8E1D5] flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#0F1115]">Are you an alteration customer?</p>
                <p className="text-xs text-[#5A5D64]">Review how we safeguard your fitting dimensions, Digital Fit Passport, and wardrobe imagery.</p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('customer')}
                className="shrink-0 rounded-full bg-[#0F1115] text-white px-4 py-2 text-xs font-bold hover:bg-[#9E593B] transition-colors cursor-pointer"
              >
                Customer Policy &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COMMON FOOTER: PRIVACY OFFICE CONTACT */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="mt-12 pt-8 border-t border-[#EAE5DE]">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
            Contact Our Privacy &amp; Compliance Office
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5D64] mb-4 leading-relaxed">
            Whether you are a customer inquiring about your Digital Fit Passport or an atelier partner managing your studio data, our compliance team is available:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <p className="flex items-center gap-2">
              <Mail size={15} className="text-[#9E593B]" />
              <strong className="text-[#0F1115]">Email:</strong>{' '}
              <a href="mailto:developer.sitarahub@gmail.com" className="text-[#9E593B] hover:underline">
                developer.sitarahub@gmail.com
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Shield size={15} className="text-[#10B981]" />
              <span className="text-[#5A5D64]">Raffu Labs Ltd. &middot; Data Protection &amp; Atelier Compliance Desk</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
