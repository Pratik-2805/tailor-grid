'use client'

import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  PauseCircle,
  PlayCircle,
  Ruler,
  Scissors,
  ShoppingBag,
  Sparkles,
  Star,
  User,
} from 'lucide-react'
import { formatClock, type OrderStatus, type Screen } from './data'

type PartnerPhase =
  | 'queue'
  | 'checkin'
  | 'measuring'
  | 'working'
  | 'ready'
  | 'retail-tracking'
  | 'completed'

interface PartnerFlowProps {
  go: (s: Screen) => void
  otp: string
}

export function PartnerFlow({ go, otp }: PartnerFlowProps) {
  const [acceptingOrders, setAcceptingOrders] = useState(true)
  const [phase, setPhase] = useState<PartnerPhase>('queue')
  const [inputOtp, setInputOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  
  // Fitting measurement logs
  const [pinnedAdjustment, setPinnedAdjustment] = useState('Shorten hem by 3.5cm (1.37 in)')
  const [sewingNotes, setSewingNotes] = useState('Preserve original wash chainstitch hem with gold Gütermann thread')
  
  // SLA Timer in seconds (e.g. 48 hours)
  const [slaTime, setSlaTime] = useState(48 * 3600)

  // Retail Purchase Tracking (CRITICAL FOR MVP as in Tech Brief)
  const [boughtRetail, setBoughtRetail] = useState<boolean | null>(null)
  const [retailValue, setRetailValue] = useState('45')
  const [retailCategory, setRetailCategory] = useState('Merchandise / Linen Shirt')

  const verifyOtp = () => {
    if (inputOtp.trim() === otp) {
      setOtpError('')
      setPhase('measuring')
    } else {
      setOtpError('Invalid fitting pass code. Please verify the 4-digit code on the customer pass.')
    }
  }

  return (
    <div className="py-10 lg:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-[1080px] px-5 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDD6CB]">
          <button
            onClick={() => go('home')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors"
          >
            <ArrowLeft size={14} /> Exit to Overview
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAcceptingOrders(!acceptingOrders)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                acceptingOrders
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-200 text-stone-700 border border-stone-300'
              }`}
            >
              <span className={`size-2 rounded-full ${acceptingOrders ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span>{acceptingOrders ? 'Studio Online: Accepting Jobs' : 'Studio Paused'}</span>
            </button>
          </div>
        </div>

        {/* Studio Banner */}
        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDD6CB]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Partner Studio Portal
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-[#18191B]">
              Atelier North Kensington
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5D64] mt-1">
              Lead Master Tailor: Marco Rossi · 18 Kensington Church St, W8 4EP
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-[#7A7E85] block">Today&apos;s Payouts</span>
              <span className="font-serif text-xl font-bold text-[#18191B]">£185.00</span>
            </div>
            <div>
              <span className="text-[#7A7E85] block">Studio Rating</span>
              <span className="font-serif text-xl font-bold text-[#9E593B]">4.96 ★</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            PHASE 1: INCOMING JOBS QUEUE
        ======================================================== */}
        {phase === 'queue' && (
          <div className="mt-8 space-y-6">
            <h3 className="font-serif text-xl font-semibold text-[#18191B]">
              Incoming Alteration Orders
            </h3>

            {/* Active Highlighted Order */}
            <div className="rounded-2xl border-2 border-[#9E593B] bg-[#F4EFEA] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#18191B] text-white px-2.5 py-0.5 rounded">
                      NEW FITTING · #TG-1048
                    </span>
                    <span className="text-xs font-semibold text-[#9E593B] uppercase tracking-wider">
                      Fitting Window: 11:30 AM
                    </span>
                  </div>

                  <h4 className="mt-4 font-serif text-2xl font-bold text-[#18191B]">
                    Trousers &amp; Jeans · Shorten with Original Jean Hem
                  </h4>
                  <p className="mt-1 text-xs text-[#5A5D64]">
                    Customer: Camilla Harrington · Levi&apos;s 501 Selvedge (Brand new with tags)
                  </p>
                  <p className="mt-2 text-xs italic text-[#7A7E85] bg-white p-2.5 rounded-lg border border-[#DDD6CB] max-w-[560px]">
                    Customer note: &ldquo;Keep original distressed factory hem, shorten for slight shoe break.&rdquo;
                  </p>
                </div>

                <div className="text-right sm:self-start bg-white p-4 rounded-xl border border-[#DDD6CB]">
                  <span className="text-[11px] text-[#7A7E85] block">Your Studio Payout</span>
                  <span className="font-serif text-2xl font-bold text-emerald-700">£20.00</span>
                  <span className="text-[10px] text-[#7A7E85] block">Standard 48h SLA</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#DDD6CB] flex flex-wrap gap-4 items-center justify-between">
                <span className="text-xs text-[#5A5D64]">
                  Pre-paid via TailorGrid. Guaranteed direct settlement.
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPhase('checkin')}
                    className="inline-flex items-center gap-2 rounded-full bg-[#18191B] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-all"
                  >
                    <span>Check-In Customer Arrival</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Other Queued Orders */}
            <div className="rounded-xl border border-[#DDD6CB] bg-white p-5 flex items-center justify-between opacity-80">
              <div>
                <span className="font-mono text-xs text-[#7A7E85]">#TG-1049 · Shirt Slimming</span>
                <p className="font-serif text-base font-semibold text-[#18191B]">Oxford Cotton Shirt — Take In Darts</p>
                <p className="text-xs text-[#7A7E85]">Slot: 02:00 PM · Payout: £16.00</p>
              </div>
              <span className="text-xs font-semibold text-[#7A7E85] bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-[#DDD6CB]">
                Scheduled
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            PHASE 2: CUSTOMER ARRIVAL & OTP SCAN
        ======================================================== */}
        {phase === 'checkin' && (
          <div className="mt-10 max-w-[580px] mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 02 · Check In Fitting Pass
            </span>
            <h2 className="mt-2 font-serif text-3xl font-normal text-[#18191B]">
              Verify Customer Fitting Code
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              Ask Camilla for the 4-digit code shown on her digital fitting pass.
            </p>

            <div className="mt-8 rounded-2xl border border-[#DDD6CB] bg-white p-8 shadow-sm">
              <input
                type="text"
                maxLength={4}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="––––"
                className="w-full text-center font-mono text-4xl font-bold tracking-[0.5em] py-4 border-2 border-[#18191B] rounded-xl bg-[#FAF8F5] focus:outline-none"
              />

              {otpError && (
                <p className="mt-3 text-xs text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> {otpError}
                </p>
              )}

              <p className="mt-4 text-[11px] text-[#7A7E85]">
                Demo fitting pass code for this booking is: <strong className="font-mono text-[#9E593B]">{otp}</strong>
              </p>

              <button
                onClick={verifyOtp}
                className="mt-6 w-full rounded-full bg-[#18191B] py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-all"
              >
                Verify Code &amp; Start Fitting Session
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PHASE 3: RECORD FITTING MEASUREMENTS
        ======================================================== */}
        {phase === 'measuring' && (
          <div className="mt-8 max-w-[760px] mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 03 · Fitting Completed &amp; Pinned
            </span>
            <h2 className="mt-2 font-serif text-3xl font-normal text-[#18191B]">
              Log Pinning &amp; Adjustment Specs
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              These adjustments will be saved into Camilla&apos;s Customer Fit Profile for future orders.
            </p>

            <div className="mt-6 rounded-2xl border border-[#DDD6CB] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-[#18191B] mb-1.5">
                  Exact Adjustment Performed / Pinned
                </label>
                <input
                  type="text"
                  value={pinnedAdjustment}
                  onChange={(e) => setPinnedAdjustment(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-3 text-xs sm:text-sm font-medium focus:border-[#9E593B] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18191B] mb-1.5">
                  Sewing &amp; Machinery Instructions
                </label>
                <textarea
                  rows={2}
                  value={sewingNotes}
                  onChange={(e) => setSewingNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] p-3 text-xs sm:text-sm font-medium focus:border-[#9E593B] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE4DC] flex items-center justify-between">
                <span className="text-xs text-[#7A7E85]">Promised Turnaround: 48 Hours</span>
                <button
                  onClick={() => setPhase('working')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18191B] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B]"
                >
                  <span>Mark &ldquo;Work In Progress&rdquo;</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PHASE 4: WORK IN PROGRESS & SLA COUNTDOWN
        ======================================================== */}
        {phase === 'working' && (
          <div className="mt-8 max-w-[760px] mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 04 · Tailoring in Progress
            </span>
            <h2 className="mt-2 font-serif text-3xl font-normal text-[#18191B]">
              Active Workshop Ticket #TG-1048
            </h2>

            <div className="mt-6 rounded-2xl border border-[#DDD6CB] bg-[#18191B] p-8 text-[#FAF8F5]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#E7C9BA]">SLA Turnaround Timer</span>
                  <p className="mt-2 font-mono text-4xl sm:text-5xl font-bold text-white tabular-nums">
                    {formatClock(slaTime)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#B1ACA4]">Payout upon pick-up:</span>
                  <p className="font-serif text-3xl font-bold text-emerald-400">£20.00</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#2C3038] text-xs text-[#B1ACA4] space-y-1">
                <p>• Item: Levi&apos;s 501 Selvedge Jeans</p>
                <p>• Pinned spec: {pinnedAdjustment}</p>
                <p>• Notes: {sewingNotes}</p>
              </div>
            </div>

            <button
              onClick={() => setPhase('ready')}
              className="mt-6 w-full rounded-full bg-[#9E593B] py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#B85F3B] transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>Mark Tailoring Complete &amp; Notify Customer Ready for Pick-Up</span>
            </button>
          </div>
        )}

        {/* ========================================================
            PHASE 5: GARMENT READY & PICK-UP
        ======================================================== */}
        {phase === 'ready' && (
          <div className="mt-8 max-w-[620px] mx-auto text-center">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800 mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Step 05 · Ready for Collection
            </span>
            <h2 className="mt-1 font-serif text-3xl font-normal text-[#18191B]">
              Garment Pressed &amp; Stored on Rack
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              SMS sent to Camilla. When customer arrives to try on and collect, click below to close order.
            </p>

            <button
              onClick={() => setPhase('retail-tracking')}
              className="mt-8 rounded-full bg-[#18191B] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B]"
            >
              Customer Has Collected &middot; Close Order
            </button>
          </div>
        )}

        {/* ========================================================
            PHASE 6: RETAIL PURCHASE TRACKING (TECH BRIEF CRITICAL REQ)
        ======================================================== */}
        {phase === 'retail-tracking' && (
          <div className="mt-8 max-w-[640px] mx-auto">
            <div className="rounded-2xl border-2 border-[#9E593B] bg-white p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9E593B]">
                Tech Brief MVP Requirement · Retail Purchase Tracking
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#18191B]">
                Did this customer purchase merchandise from your store?
              </h3>
              <p className="mt-2 text-xs text-[#5A5D64]">
                We track in-store conversion to measure how alteration footfall drives additional retail sales for your studio.
              </p>

              {/* YES / NO Toggle */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBoughtRetail(true)}
                  className={`py-3.5 rounded-xl border font-semibold text-xs transition-all ${
                    boughtRetail === true
                      ? 'border-[#9E593B] bg-[#F4EFEA] text-[#18191B] ring-1 ring-[#9E593B]'
                      : 'border-[#DDD6CB] bg-[#FAF8F5] text-[#5A5D64]'
                  }`}
                >
                  YES (Merchandise Purchased)
                </button>
                <button
                  type="button"
                  onClick={() => setBoughtRetail(false)}
                  className={`py-3.5 rounded-xl border font-semibold text-xs transition-all ${
                    boughtRetail === false
                      ? 'border-[#18191B] bg-[#18191B] text-white'
                      : 'border-[#DDD6CB] bg-[#FAF8F5] text-[#5A5D64]'
                  }`}
                >
                  NO (Alteration Only)
                </button>
              </div>

              {/* If YES: value & category */}
              {boughtRetail === true && (
                <div className="mt-6 space-y-3 pt-4 border-t border-[#EAE4DC] animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-[#18191B] mb-1">Approximate Purchase Value (£)</label>
                    <input
                      type="number"
                      value={retailValue}
                      onChange={(e) => setRetailValue(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-2.5 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#18191B] mb-1">Product Category</label>
                    <input
                      type="text"
                      value={retailCategory}
                      onChange={(e) => setRetailCategory(e.target.value)}
                      placeholder="e.g. Linen Shirt, Tie, Accessories"
                      className="w-full rounded-xl border border-[#DDD6CB] bg-[#FAF8F5] px-4 py-2.5 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                disabled={boughtRetail === null}
                onClick={() => setPhase('completed')}
                className="mt-6 w-full rounded-full bg-[#18191B] py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] disabled:opacity-40"
              >
                Complete Transaction &amp; Settle £20.00
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PHASE 7: ORDER CLOSED & SETTLED
        ======================================================== */}
        {phase === 'completed' && (
          <div className="mt-10 max-w-[540px] mx-auto text-center">
            <div className="grid size-16 place-items-center rounded-full bg-[#18191B] text-[#FAF8F5] mx-auto">
              <Sparkles size={28} className="text-[#9E593B]" />
            </div>
            <h2 className="mt-4 font-serif text-3xl font-normal text-[#18191B]">
              Order Closed &amp; Reconciled
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              £20.00 payout added to your bi-weekly direct bank settlement. Camilla&apos;s fit profile updated.
            </p>

            {boughtRetail && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                Logged retail merchandise purchase of <strong>£{retailValue}</strong> ({retailCategory}).
              </div>
            )}

            <button
              onClick={() => setPhase('queue')}
              className="mt-6 rounded-full border border-[#DDD6CB] bg-white px-6 py-2.5 text-xs font-semibold text-[#18191B] hover:bg-[#FAF8F5]"
            >
              Back to Incoming Queue
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
