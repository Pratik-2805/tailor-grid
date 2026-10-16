'use client'

import { ArrowLeft } from 'lucide-react'
import type { Screen } from './data'

export function SupportView({ go }: { go: (s: Screen | string) => void }) {
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
            Help Center &amp; Support
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7E85]">
            Everything you need to know about our alteration network, 100% Fit Guarantee, studio drop-offs, and pricing.
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-sm sm:text-base text-[#3F4248] leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-4">
              1. 100% Fit Guarantee &amp; Adjustments
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  How does the 100% Fit Guarantee work?
                </h3>
                <p>
                  Every alteration booked through Raffu is covered by our zero-risk Fit Guarantee. Once your tailored garment is ready and collected at the partner atelier, you are invited to try it on in our private studio fitting room. If anything is not completely true to your booked specifications or pinned line, the studio performs complimentary micro-adjustments within 24–48 hours at zero additional cost.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  What if I am still not satisfied after an adjustment?
                </h3>
                <p>
                  In the rare event that an alteration cannot be perfected to the agreed booking specifications, our concierge desk will either reassign the garment to a senior specialist atelier or issue a full refund to your original payment method under our Zero-Risk Fit Assurance policy.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-4">
              2. Studio Drop-Off &amp; The 4-Digit Verification PIN
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  What is the 4-digit PIN and why is it needed at drop-off?
                </h3>
                <p>
                  When your booking is confirmed, a unique 4-digit PIN (e.g. 4821) is generated in your Digital Order Passport and sent via SMS and email. When you drop off your garment at the partner atelier, the craftsman verifies this PIN on their workbench terminal. This ensures safe garment custody, links your exact fabric condition notes, and prevents any order mix-ups.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  Can someone else drop off or collect my garment?
                </h3>
                <p>
                  Yes. Anyone presenting your unique 4-digit PIN and order reference at the atelier can safely drop off or collect your garment on your behalf.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  What condition must my garments be in when dropped off?
                </h3>
                <p>
                  All garments submitted for alteration or repair must be freshly washed or dry-cleaned prior to drop-off. For hygiene and craft safety, studios reserve the right to decline heavily soiled or damp items.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-4">
              3. Fitting &amp; Direct Tailor Measurements
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  Do I need to measure or pre-fit my clothes myself?
                </h3>
                <p className="mb-2">
                  No, not at all! You do not need to use a measuring tape, pin, or submit any sizing specifications beforehand:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#4A4D54]">
                  <li><strong className="text-[#0F1115]">Direct Tailor Measurement:</strong> Hand your garment directly to your assigned master tailor upon intake. The artisan takes all precision measurements, pins, and marks the fit directly in person.</li>
                  <li><strong className="text-[#0F1115]">Zero Guesswork:</strong> You never have to worry about measuring errors. The professional tailor verifies the drape, hem break, and silhouette directly with you.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  What should I bring to an in-studio fitting?
                </h3>
                <p>
                  For trouser hems, skirts, and dresses, always bring the footwear you plan to wear with the garment. Heel height significantly impacts the finished hem break. For tailored blazers and waist adjustments, wear the type of shirts or undergarments intended for the outfit.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-4">
              4. Turnaround Times &amp; Deadlines
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  What are the standard turnaround times?
                </h3>
                <p>
                  Standard alterations (trouser hems, waistband adjustments, jean tapering, basic repairs) have a 48-hour turnaround. Express turnaround (24-hour service) is available on selected everyday garments. Luxury bespoke suits, intricate evening gowns, and heavy leather pieces typically require 72 hours for meticulous industrial finishing.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  How do I specify a strict event deadline?
                </h3>
                <p>
                  If you need a garment for an upcoming wedding, flight, or event, specify the date during checkout or contact our concierge desk immediately after booking. We will ensure the assigned atelier can guarantee completion before your deadline.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-4">
              5. Pricing &amp; Fabric Complexities
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  How does pricing work across partner ateliers?
                </h3>
                <p>
                  Prices displayed on Raffu represent fixed, standardized rates for standard garment constructions. When you book, the price you see is the price you pay for regular cotton, denim, wool, and linen garments.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  Are there extra charges for delicate or specialist fabrics?
                </h3>
                <p>
                  Garments requiring specialized craftsmanship—such as heavy leather, fine silk, velvet, beaded tulle, or intricate interior boning—may require a complexity surcharge. If applicable, this is always calculated and agreed upon with you at studio intake before any scissors touch the fabric.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-4">
              6. Order Tracking &amp; Garment Collection
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  How do I track my alteration order?
                </h3>
                <p>
                  You can track your order in real time from your Orders screen or Order Status link. The status updates through stages: &quot;Allocated&quot;, &quot;Accepted&quot;, &quot;Work in Progress&quot;, &quot;Ready for Fitting&quot;, and &quot;Collected&quot;. You also receive instant SMS and email notifications at each milestone.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F1115] mb-1.5">
                  How long do I have to collect my finished garment?
                </h3>
                <p>
                  Finished garments are held securely at the atelier for up to 30 calendar days following the ready-for-collection notification.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Contact */}
          <section className="pt-6 border-t border-[#EAE5DE]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              Still Have Questions?
            </h2>
            <p className="mb-2">
              Our master tailor concierge is available to guide you on any fitting or atelier questions:
            </p>
            <p className="text-sm font-medium text-[#0F1115]">
              Raffu Client Concierge Desk &middot;{' '}
              <a href="mailto:concierge@raffu.com" className="text-[#9E593B] hover:underline">
                concierge@raffu.com
              </a>{' '}
              &middot; +91 98450 95969 / +44 20 7946 0912
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
