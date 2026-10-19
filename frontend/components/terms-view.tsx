'use client'

import { ArrowLeft } from 'lucide-react'
import type { Screen } from './data'

export function TermsView({ go }: { go: (s: Screen | string) => void }) {
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
            Legal &amp; Service Agreement
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7E85]">
            Last updated: October 2026 &middot; Applies to all garment alteration, repair, and tailoring services booked via Raffu.
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-sm sm:text-base text-[#3F4248] leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              1. Introduction &amp; Agreement
            </h2>
            <p className="mb-3">
              These Terms &amp; Conditions (&quot;Terms&quot;) govern the contractual relationship between you (&quot;Customer&quot;, &quot;you&quot;) and Raffu Technologies Ltd. (&quot;Raffu&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) when accessing our platform, website, applications, or booking clothing alteration, tailoring, and repair services through our certified partner atelier network.
            </p>
            <p>
              By creating an account, booking an alteration service, dropping off a garment at a partner studio, or using our concierge services, you confirm that you have read, understood, and agreed to be bound by these Terms in full.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              2. Scope of Our Services
            </h2>
            <p className="mb-3">
              Raffu connects customers with master tailors and certified atelier studios for garment alterations (including trouser hems, waist adjustments, jacket tapering, dress fittings, sleeve shortening, and bespoke micro-tailoring) and clothing repairs (such as zip replacements, seam restitching, and patch mending).
            </p>
            <p>
              We ensure rigorous craft standards across all partner studios, provide upfront pricing, and back eligible alterations with our 100% Fit Guarantee.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              3. Garment Intake, Assessment &amp; Surcharges
            </h2>
            <p className="mb-3">
              When an item arrives at an atelier, the master tailor assesses the fabric, construction, and existing condition against your booked alteration specifications.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A4D54] mb-3">
              <li>
                <strong className="text-[#0F1115]">Fabric Complexity:</strong> Specialist fabrics—such as delicate silks, velvet, heavy leather, suede, layered tulle, sequins, beadwork, or horsehair canvas—require specialized needles and handcrafting techniques.
              </li>
              <li>
                <strong className="text-[#0F1115]">Structural Complexities:</strong> Hidden zippers, interior boning, blind hems, vents, or original factory washes on denim may involve additional labor.
              </li>
              <li>
                <strong className="text-[#0F1115]">Price Adjustments:</strong> If additional work is needed beyond standard booking parameters, our concierge will notify you with a transparent quote before any tailoring begins. Work proceeds only with your approval. If declined, your garment will be safely returned.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              4. Garment Cleanliness &amp; Acceptance Standards
            </h2>
            <p className="mb-3">
              For hygiene reasons and the well-being of our tailors, all garments submitted for alteration or repair must be freshly washed or dry-cleaned prior to drop-off or collection.
            </p>
            <p>
              Raffu and our partner studios reserve the right to decline garments that are unwashed, visibly soiled, heavily damp, infested, structurally deteriorated beyond stable sewing capability, or previously cut or altered by third parties in a way that prevents a safe finish.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              5. Measurements, Fitting &amp; Direct Tailor Handover
            </h2>
            <p className="mb-3">
              Accurate measurements are handled directly by your assigned master tailor:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A4D54]">
              <li>
                <strong className="text-[#0F1115]">Direct Tailor Measurement:</strong> You are not required to take measurements or pre-fit your clothes beforehand. Upon handover, your master tailor takes all precision measurements, pins, and verifies the line, break, and silhouette with you in person before cutting.
              </li>
              <li>
                <strong className="text-[#0F1115]">Fitting Specifications:</strong> Any specific alteration preferences (such as crop length or slimness) recorded during direct fitting or noted in the order form the basis of the work performed.
              </li>
              <li>
                <strong className="text-[#0F1115]">Footwear &amp; Undergarments:</strong> For hem adjustments and gown fittings, you must wear the actual shoes and undergarments intended for the outfit to ensure correct finished lengths.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              6. Turnaround Times &amp; Deadlines
            </h2>
            <p className="mb-3">
              Standard alterations are typically completed within 48 to 72 hours from studio intake confirmation. Complex garments (e.g. bridal gowns, lined overcoats) may require 5 to 7 working days.
            </p>
            <p>
              If you have a strict deadline (such as a wedding, flight, or event), you must specify the date during booking. While we make every reasonable effort to accommodate target dates, guaranteed delivery dates are only valid when confirmed in writing by our concierge desk.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              7. 100% Fit Guarantee &amp; Adjustments
            </h2>
            <p className="mb-3">
              We stand behind the craft of our partner ateliers. If your alteration does not match the confirmed booking specifications or studio fitting notes, you are entitled to our 100% Fit Guarantee:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A4D54] mb-3">
              <li>
                You must notify us within 48 hours of collecting or trying on your altered garment.
              </li>
              <li>
                Complimentary micro-adjustments will be performed by the atelier to correct the fit in accordance with the original booking scope.
              </li>
              <li>
                The guarantee does not cover requests for a completely different styling choice, substantial body weight/measurement changes occurring after booking, or alterations requested beyond the original garment allowances (e.g. fabric cannot be added if the excess seam allowance was already trimmed per your original instructions).
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              8. Pricing, Payments &amp; Invoicing
            </h2>
            <p className="mb-3">
              All prices shown on our platform are displayed in local currency and inclusive of applicable taxes unless stated otherwise.
            </p>
            <p>
              Payment is processed securely online via PCI-DSS compliant providers. In the event an additional complexity fee is approved by you following physical garment assessment, the revised total will be charged to your saved payment method prior to garment handover.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              9. Cancellations &amp; Modifications
            </h2>
            <p className="mb-3">
              You may cancel or amend an order free of charge up until physical work or fabric cutting has commenced at the studio.
            </p>
            <p>
              Once a tailor has commenced deconstructing, cutting, or sewing your garment, orders cannot be cancelled and fees cannot be refunded, as custom craftsmanship services cannot be restored.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              10. Garment Care &amp; Limitation of Liability
            </h2>
            <p className="mb-3">
              We treat every garment with the utmost care, utilizing industrial presses, fabric-specific needles, and color-matched threads. However:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A4D54] mb-3">
              <li>
                <strong className="text-[#0F1115]">Pre-existing Wear:</strong> We are not liable for pre-existing defects, fabric fatigue, sun rot, moth holes, manufacturer weaknesses, or loose buttons present before intake.
              </li>
              <li>
                <strong className="text-[#0F1115]">Uncollected Garments:</strong> Finished garments must be collected within 30 calendar days of notification. After 60 days of unanswered reminders, garments may be donated to a registered charitable organization to cover storage costs.
              </li>
              <li>
                <strong className="text-[#0F1115]">Liability Limit:</strong> In the rare event of demonstrable physical damage or loss directly caused by gross negligence, Raffu&apos;s liability is strictly capped at the fair depreciated value of the garment or up to a maximum amount of £250 / ₹15,000 per item (whichever is lower), unless private luxury insurance was specifically declared and agreed upon prior to booking.
              </li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              11. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the applicable operating jurisdiction. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in the operating territory.
            </p>
          </section>

          {/* Section 12 */}
          <section className="pt-6 border-t border-[#EAE5DE]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F1115] mb-3">
              12. Contact &amp; Concierge Enquiries
            </h2>
            <p className="mb-2">
              If you have any questions or require clarification regarding these Terms &amp; Conditions, please reach out directly:
            </p>
            <p className="text-sm font-medium text-[#0F1115]">
              Raffu Client Concierge Desk &middot;{' '}
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
