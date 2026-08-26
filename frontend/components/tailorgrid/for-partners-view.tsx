'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, DollarSign, Laptop, Percent, Scissors, ShieldCheck, Sparkles, Store, TrendingUp, Users } from 'lucide-react'
import { type Screen } from './data'

export function ForPartnersView({ go }: { go: (s: Screen) => void }) {
  const [capacity, setCapacity] = useState(10)
  const [avgPrice, setAvgPrice] = useState(22)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [postcode, setPostcode] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [machines, setMachines] = useState('4')

  const estimatedMonthlyPayout = Math.round(capacity * avgPrice * 24 * 0.76) // ~76% partner payout
  const estimatedRetailAddOn = Math.round(capacity * 24 * 0.38 * 45) // 38% conversion with £45 basket

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Overview
        </button>

        {/* Hero Section for Tailor Studios */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD6CB] bg-[#F4EFEA] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9E593B]">
              <Store size={13} />
              <span>Studio Partner Program</span>
            </div>

            <h1 className="mt-4 font-serif text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-[#18191B] leading-[1.05]">
              More fittings. <br />
              <span className="italic font-serif text-[#9E593B]">Zero marketing</span> or chasing.
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#5A5D64]">
              Join the verified TailorGrid partner network. Receive steady, pre-paid alteration orders from nearby customers, boost high-margin in-store retail sales, and manage fittings effortlessly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#partner-apply"
                className="inline-flex items-center gap-2 rounded-full bg-[#18191B] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm"
              >
                <span>Apply as a Partner Studio</span>
                <ArrowRight size={14} />
              </a>

              <button
                onClick={() => go('partner')}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E593B] hover:underline"
              >
                <span>Launch live partner tablet demo</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="rounded-2xl border border-[#DDD6CB] bg-[#F4EFEA] p-7 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-semibold text-[#18191B]">
              Why Studios Choose TailorGrid
            </h3>

            <div className="flex items-start gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] shrink-0">
                <TrendingUp size={18} className="text-[#9E593B]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#18191B]">100% Pre-Paid Bookings</h4>
                <p className="text-xs text-[#5A5D64] mt-0.5">Customers pay online before stepping into your studio. Zero unpaid garments left on hangers.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] shrink-0">
                <Percent size={18} className="text-[#9E593B]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#18191B]">38%+ In-Store Retail Cross-Sell</h4>
                <p className="text-xs text-[#5A5D64] mt-0.5">Fitting traffic drives direct in-store purchases of retail garments, haberdashery, and accessories.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] shrink-0">
                <Laptop size={18} className="text-[#9E593B]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#18191B]">Free Studio Portal Software</h4>
                <p className="text-xs text-[#5A5D64] mt-0.5">Manage incoming drop-offs, fitting queues, and SLA timers from any tablet or phone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Partner Earnings Calculator */}
        <div className="mt-20 rounded-2xl bg-[#18191B] p-8 sm:p-12 text-[#FAF8F5]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C9BA]">
                Revenue Estimator
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-normal text-white">
                Calculate your spare capacity revenue.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#B1ACA4] leading-relaxed">
                Most studios have unused machine capacity in the afternoons. Fill those slots with guaranteed alteration jobs.
              </p>

              {/* Slider 1: Capacity */}
              <div className="mt-8">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#D5CFC5]">Additional alterations per day:</span>
                  <span className="font-mono font-bold text-white text-sm">{capacity} garments / day</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full accent-[#9E593B] cursor-pointer"
                />
              </div>

              {/* Slider 2: Average Service Value */}
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#D5CFC5]">Average service ticket:</span>
                  <span className="font-mono font-bold text-white text-sm">£{avgPrice}</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(Number(e.target.value))}
                  className="w-full accent-[#9E593B] cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl bg-[#25282F] p-6 border border-[#3A3F4A]">
                <p className="text-[11px] uppercase tracking-wider text-[#B1ACA4]">Estimated Monthly Alteration Payout</p>
                <p className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-[#E7C9BA]">
                  £{estimatedMonthlyPayout.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-[#7A7E85]">Bi-weekly direct bank settlement</p>
              </div>

              <div className="rounded-xl bg-[#25282F] p-6 border border-[#3A3F4A]">
                <p className="text-[11px] uppercase tracking-wider text-[#B1ACA4]">Estimated Added Retail Revenue (38% conv.)</p>
                <p className="mt-2 font-serif text-3xl font-bold text-emerald-400">
                  +£{estimatedRetailAddOn.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-[#7A7E85]">Based on in-store customer fitting footfall</p>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Requirements & Audit Specs */}
        <div className="mt-20">
          <div className="text-center max-w-[640px] mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Network Quality Standards
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-normal text-[#18191B]">
              What we look for in partner studios.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Industrial Machinery',
                desc: 'Specialist lockstitch, blind-hemming, overlock, and heavy-duty needle machines.',
              },
              {
                title: 'Fitting Space',
                desc: 'Dedicated, clean fitting area or changing cabin with 3-way mirrors for clients.',
              },
              {
                title: '48h SLA Reliability',
                desc: 'Ability to complete standard alteration tickets within 48 to 72 hours reliably.',
              },
              {
                title: 'Master Seamstress',
                desc: 'Minimum 5+ years professional tailoring or bespoke alteration experience on staff.',
              },
            ].map((req, i) => (
              <div key={i} className="rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] p-6">
                <span className="font-mono text-xs font-bold text-[#9E593B]">0{i + 1}</span>
                <h4 className="mt-4 font-serif text-lg font-semibold text-[#18191B]">{req.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#5A5D64]">{req.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Application Form */}
        <div id="partner-apply" className="mt-20 rounded-2xl border border-[#DDD6CB] bg-white p-8 sm:p-12 shadow-sm max-w-[800px] mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Join the Network
            </span>
            <h3 className="mt-2 font-serif text-3xl font-normal text-[#18191B]">
              Apply to become a verified studio
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              Our team audits and activates your studio profile within 48 hours.
            </p>
          </div>

          {formSubmitted ? (
            <div className="rounded-xl bg-[#F4EFEA] p-8 text-center border border-[#9E593B]/40">
              <div className="grid size-14 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] mx-auto">
                <CheckCircle2 size={24} className="text-[#9E593B]" />
              </div>
              <h4 className="mt-4 font-serif text-2xl font-semibold text-[#18191B]">Application Received</h4>
              <p className="mt-2 text-sm text-[#5A5D64] max-w-[480px] mx-auto">
                Thank you, {contactName}. Our partner director will contact {email} to schedule a brief studio visit and machine calibration audit.
              </p>
              <button
                onClick={() => go('partner')}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#18191B] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white"
              >
                <span>Preview Partner Tablet Portal</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Studio / Business Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Atelier West End"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Postcode / ZIP</label>
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. W1F 8RB"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Lead Tailor / Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Marco Rossi"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. marco@atelierwest.co.uk"
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Number of Machines</label>
                  <select
                    value={machines}
                    onChange={(e) => setMachines(e.target.value)}
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-3 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  >
                    <option value="2-3">2 – 3 Machines</option>
                    <option value="4-6">4 – 6 Machines</option>
                    <option value="7+">7+ Machines</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Daily Garment Capacity</label>
                  <select
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-3 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  >
                    <option>5 – 15 items/day</option>
                    <option>15 – 30 items/day</option>
                    <option>30+ items/day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18191B] mb-1.5">Do you sell retail goods?</label>
                  <select
                    className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-3 py-3 text-xs sm:text-sm focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  >
                    <option>Yes (Clothes/Fabrics/Goods)</option>
                    <option>No (Alterations Only)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-[#18191B] py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#9E593B] shadow-sm active:scale-95"
              >
                Submit Partner Studio Application
              </button>
              <p className="text-[11px] text-[#7A7E85] text-center mt-2">
                By applying, you agree to TailorGrid studio quality standards and 48-hour audit terms.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
