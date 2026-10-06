'use client'

import { ArrowLeft, Check, Lock, Shield, ShieldCheck, UserCheck } from 'lucide-react'
import type { Screen } from './data'

export function PrivacyView({ go }: { go: (s: Screen | string) => void }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18191B] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A5D64] hover:text-[#18191B] mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {/* Hero Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E593B]/10 text-[#9E593B] text-[11px] font-bold uppercase tracking-wider mb-3">
            <Lock size={12} />
            <span>Customer Privacy &amp; Data Security</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-3">
            Customer Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5D64]">
            Effective Date: October 2026 &middot; Applicable to all Darzi Client Users &amp; Digital Fit Passports
          </p>
        </div>

        {/* Key Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-[#EBE6DF] shadow-xs">
            <ShieldCheck size={20} className="text-[#10B981] mb-2" />
            <h4 className="text-xs font-bold text-[#0F1115] mb-1">Encrypted Fit Vault</h4>
            <p className="text-[11px] text-[#5A5D64]">Your personal waist, inseam, and bespoke body measurements are encrypted at rest.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#EBE6DF] shadow-xs">
            <Lock size={20} className="text-[#9E593B] mb-2" />
            <h4 className="text-xs font-bold text-[#0F1115] mb-1">Zero Commercial Resale</h4>
            <p className="text-[11px] text-[#5A5D64]">We never sell, rent, or monetize your personal wardrobe data to third-party advertisers.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#EBE6DF] shadow-xs">
            <UserCheck size={20} className="text-[#3B82F6] mb-2" />
            <h4 className="text-xs font-bold text-[#0F1115] mb-1">Full Data Control</h4>
            <p className="text-[11px] text-[#5A5D64]">Export or permanently delete your fit profile and order history anytime from your profile.</p>
          </div>
        </div>

        {/* Policy Document Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE6DF] shadow-xs space-y-8 text-xs sm:text-sm text-[#4A4D54] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#0F1115] flex items-center gap-2">
              <span className="size-6 rounded-full bg-[#FAF8F5] border border-[#E0D9CF] text-xs grid place-items-center text-[#9E593B]">1</span>
              <span>Information We Collect as a Customer</span>
            </h2>
            <p>
              When you use Darzi to book clothing alterations, we collect only the information necessary to fulfill your garment tailoring:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5A5D64]">
              <li><strong className="text-[#18191B]">Contact Details:</strong> Your name, verified mobile phone number, and email address for order status SMS alerts, PIN verification, and receipts.</li>
              <li><strong className="text-[#18191B]">Digital Fit Passport:</strong> Body measurements (waist, inseam, chest, sleeve length, shoulder span), garment fit preferences, and sewing notes.</li>
              <li><strong className="text-[#18191B]">Garment Intake Imagery:</strong> Photos of clothing or fabric condition uploaded during booking or drop-off for quality assurance.</li>
              <li><strong className="text-[#18191B]">Location Data:</strong> Your locality or postcode to match you with certified ateliers within 1 to 5 miles. We do not track background GPS coordinates when the app is closed.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#0F1115] flex items-center gap-2">
              <span className="size-6 rounded-full bg-[#FAF8F5] border border-[#E0D9CF] text-xs grid place-items-center text-[#9E593B]">2</span>
              <span>How Partner Ateliers Access Your Data</span>
            </h2>
            <p>
              Under our strict atelier network guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5A5D64]">
              <li>Only the single, assigned partner atelier that accepts your order receives your garment notes and measurements.</li>
              <li>Partner tailors view your 4-digit drop-off PIN to verify physical garment custody upon arrival.</li>
              <li>Partner tailors are contractually bound by Non-Disclosure Agreements (NDAs) prohibiting them from using your phone number or email for unsolicited direct marketing or offline contact.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#0F1115] flex items-center gap-2">
              <span className="size-6 rounded-full bg-[#FAF8F5] border border-[#E0D9CF] text-xs grid place-items-center text-[#9E593B]">3</span>
              <span>Payment &amp; Transaction Security</span>
            </h2>
            <p>
              All customer payments are processed through PCI-DSS Level 1 certified payment infrastructure (such as Stripe and authorized banking gateways). Darzi does not store raw credit/debit card numbers or CVVs on our backend servers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#0F1115] flex items-center gap-2">
              <span className="size-6 rounded-full bg-[#FAF8F5] border border-[#E0D9CF] text-xs grid place-items-center text-[#9E593B]">4</span>
              <span>Your Privacy Rights &amp; Data Deletion</span>
            </h2>
            <p>
              In accordance with international privacy laws (including the Digital Personal Data Protection Act and UK GDPR):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5A5D64]">
              <li><strong className="text-[#18191B]">Right to Rectify:</strong> You can edit your personal details, home address, and stored measurements at any time directly in your Customer Profile.</li>
              <li><strong className="text-[#18191B]">Right to Erase:</strong> You may request complete erasure of your account, order archives, and Fit Passport by emailing <code className="px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#EBE6DF] text-[#0F1115]">privacy@darzi.com</code>.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#0F1115] flex items-center gap-2">
              <span className="size-6 rounded-full bg-[#FAF8F5] border border-[#E0D9CF] text-xs grid place-items-center text-[#9E593B]">5</span>
              <span>Contact Our Data Protection Officer</span>
            </h2>
            <p>
              If you have any questions regarding your data privacy, fit passport storage, or wish to exercise your data rights, contact:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DF] text-xs space-y-1">
              <p className="font-bold text-[#0F1115]">Darzi Technologies Ltd. &middot; Privacy &amp; Compliance Office</p>
              <p className="text-[#5A5D64]">Email: privacy@darzi.com &middot; concierge@darzi.com</p>
              <p className="text-[#5A5D64]">Support Hotline: +91 98450 95969 / +44 20 7946 0912</p>
            </div>
          </section>
        </div>

        {/* Back to Home CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => go('home')}
            className="px-6 py-2.5 rounded-full bg-[#18191B] hover:bg-[#9E593B] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Return to Darzi Home
          </button>
        </div>
      </div>
    </div>
  )
}
