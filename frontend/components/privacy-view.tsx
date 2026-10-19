'use client'

import { ArrowLeft } from 'lucide-react'
import type { Screen } from './data'

export function PrivacyView({ go }: { go: (s: Screen | string) => void }) {
  return (
    <div className="flex-1 bg-[#FAF8F5] text-[#18191B] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A5D64] hover:text-[#0F1115] mb-10 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <header className="mb-10 pb-8 border-b border-[#EAE5DE]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E593B] mb-2">
            Data Privacy &amp; Security
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-3">
            Customer Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7E85]">
            Last updated: October 2026 &middot; Applies to all customer accounts, fit profiles, and Digital Fit Passports across Raffu.
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-sm sm:text-base text-[#3F4248] leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              1. Introduction &amp; Commitment
            </h2>
            <p className="mb-3">
              Raffu Technologies Ltd. (&quot;Raffu&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates an on-demand garment alteration and repair platform connecting customers with certified master tailor ateliers. We act as the data controller for your personal information.
            </p>
            <p>
              We are committed to protecting your privacy and personal data under UK GDPR, the Data Protection Act 2018, and international data protection standards. We never sell, rent, or monetize your personal wardrobe data or body measurements to third-party advertisers or data brokers.
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
                <strong className="text-[#0F1115]">Contact &amp; Account Details:</strong> Your full name, mobile telephone number, and email address used for booking confirmations, SMS status notifications, drop-off PIN alerts, and digital receipts.
              </li>
              <li>
                <strong className="text-[#0F1115]">Digital Fit Passport:</strong> Body measurements (such as waist, inseam, chest circumference, shoulder span, sleeve length), garment fit preferences, and master tailor pinning notes.
              </li>
              <li>
                <strong className="text-[#0F1115]">Garment Intake Imagery:</strong> Photos of clothing, pre-existing wear, tear areas, or pinning reference marks submitted during online booking or atelier drop-off for quality assurance.
              </li>
              <li>
                <strong className="text-[#0F1115]">Locality &amp; Postal Code:</strong> Your locality or postal code used to match you with verified partner ateliers within convenient traveling distance. We do not track continuous background GPS coordinates.
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
              4. How Partner Ateliers Access Your Data
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
              5. Lawful Basis for Data Processing
            </h2>
            <p className="mb-3">
              We process your personal information only when we have a valid lawful basis:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
              <li>
                <strong className="text-[#0F1115]">Contract Performance:</strong> Processing your contact details, order specs, measurements, and drop-off PIN is strictly necessary to fulfill your alteration booking and honor our 100% Fit Guarantee.
              </li>
              <li>
                <strong className="text-[#0F1115]">Legitimate Interests:</strong> Managing customer service inquiries, recording pre-alteration garment condition photos, ensuring network security, and improving our tailoring workflows.
              </li>
              <li>
                <strong className="text-[#0F1115]">Legal Obligation:</strong> Maintaining accounting, VAT, and financial transaction records for statutory compliance.
              </li>
              <li>
                <strong className="text-[#0F1115]">Consent:</strong> Sending promotional offers and atelier updates where you have opted in (which you may withdraw at any time).
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              6. Payment Security &amp; Financial Information
            </h2>
            <p className="mb-3">
              All online customer payments are processed through PCI-DSS Level 1 certified payment infrastructure (such as Stripe and authorized banking partners).
            </p>
            <p>
              Raffu does not store raw credit/debit card numbers or security CVVs on our backend servers. Payment transactions are executed using secure tokenization protocols.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              7. Data Retention Schedule
            </h2>
            <p className="mb-3">
              We retain personal data only as long as necessary to fulfill the purposes for which it was collected:
            </p>
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

          {/* Section 9 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              9. Cookies &amp; Platform Diagnostics
            </h2>
            <p className="mb-3">
              We use strictly necessary cookies to keep you signed in, remember your selected garments, and preserve items in your active alteration draft.
            </p>
            <p>
              Anonymized telemetry helps us measure platform reliability and fix bugs. We do not use third-party tracking pixels to monitor your browsing behavior across external websites.
            </p>
          </section>

          {/* Section 10 */}
          <section className="pt-6 border-t border-[#EAE5DE]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              10. Contact Our Privacy Office
            </h2>
            <p className="mb-2">
              For any questions regarding your data protection, fit vault privacy, or to exercise your statutory data rights, reach out directly:
            </p>
            <p className="text-sm font-medium text-[#0F1115]">
              Raffu Privacy &amp; Compliance Office &middot;{' '}
              <a href="mailto:developer.sitarahub@gmail.com" className="text-[#9E593B] hover:underline">
                developer.sitarahub@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
