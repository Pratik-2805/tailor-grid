'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, Navigation, Scissors } from 'lucide-react'
import { LiveMap } from './live-map'
import { formatClock, type Screen } from './data'

type Phase = 'incoming' | 'navigate' | 'collect' | 'working' | 'done'

const REQUEST = {
  ref: 'TG-1048',
  garment: 'Navy wool trousers',
  service: 'Shorten the hem',
  tier: 'Priority · under 24 hours',
  slaSeconds: 24 * 60 * 60,
  area: 'W8 5TT · Kensington',
  address: '18 Kensington Church St',
  customer: 'Rhea M.',
}

export function PartnerFlow({ go, otp }: { go: (s: Screen) => void; otp: string }) {
  const [available, setAvailable] = useState(true)
  const [phase, setPhase] = useState<Phase>('incoming')
  const [courier, setCourier] = useState(0)
  const [entry, setEntry] = useState('')
  const [error, setError] = useState('')
  const [sla, setSla] = useState(0)

  useEffect(() => {
    if (phase !== 'navigate') return
    const id = setInterval(() => {
      setCourier((c) => {
        const v = +(c + 0.1).toFixed(3)
        if (v >= 1) {
          clearInterval(id)
          return 1
        }
        return v
      })
    }, 700)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'working') return
    const id = setInterval(() => setSla((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [phase])

  const confirmOtp = () => {
    if (entry.trim() === otp) {
      setError('')
      setSla(REQUEST.slaSeconds)
      setPhase('working')
    } else {
      setError('That code doesn&apos;t match. Ask the customer to read it again.')
    }
  }

  return (
    <section className="mx-auto max-w-[1000px] px-5 py-10 lg:py-14">
      <button onClick={() => go('home')} className="mb-8 inline-flex items-center gap-2 text-sm text-[#5f625f]">
        <ArrowLeft size={15} /> Back home
      </button>

      <div className="flex flex-col justify-between gap-5 border-b border-[#d9d5cd] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Partner portal · Atelier North</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Today&apos;s pickups.</h1>
        </div>
        <button
          onClick={() => setAvailable((a) => !a)}
          className={`inline-flex items-center gap-2 border px-4 py-2 text-sm ${available ? 'border-[#a6593b] text-[#a6593b]' : 'border-[#d9d5cd] text-[#777973]'}`}
        >
          <span className={`size-2 rounded-full ${available ? 'bg-[#a6593b]' : 'bg-[#bcb8af]'}`} />
          {available ? 'Accepting new orders' : 'Paused for now'}
        </button>
      </div>

      {/* INCOMING — new request ping */}
      {phase === 'incoming' && (
        available ? (
          <div className="mt-8 border-2 border-[#a6593b] bg-[#eeece6] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 font-mono text-xs text-[#a6593b]">
                  <span className="size-1.5 animate-ping rounded-full bg-[#a6593b]" /> NEW PICKUP REQUEST · {REQUEST.ref}
                </p>
                <h2 className="mt-3 font-serif text-3xl">{REQUEST.garment}</h2>
                <p className="mt-2 text-sm text-[#5f625f]">{REQUEST.service} · {REQUEST.tier}</p>
                <p className="mt-1 text-sm text-[#5f625f]">{REQUEST.area}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm text-[#a6593b]"><Clock3 size={15} /> Respond now</span>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => { setCourier(0); setPhase('navigate') }} className="inline-flex items-center gap-2 bg-[#202b38] px-5 py-3 text-sm text-[#f8f7f3]">
                Accept &amp; head to pickup <ArrowRight size={16} />
              </button>
              <button className="border border-[#d9d5cd] px-5 py-3 text-sm">Decline</button>
            </div>
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-[#d9d5cd] p-10 text-center text-sm text-[#777973]">
            You&apos;re paused. Turn on &ldquo;Accepting new orders&rdquo; to receive pickup requests.
          </div>
        )
      )}

      {/* NAVIGATE — driving to the customer */}
      {phase === 'navigate' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="min-h-[300px]">
            <LiveMap progress={courier} originLabel="Atelier North" destLabel={REQUEST.customer} etaLabel={courier >= 1 ? 'Arrived' : `${Math.max(1, Math.ceil((1 - courier) * 9))} min`} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Heading to pickup</p>
            <h1 className="mt-4 font-serif text-4xl tracking-[-.04em]">Collect from {REQUEST.customer}</h1>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <p className="flex items-center gap-2"><MapPin size={15} className="text-[#a6593b]" /> {REQUEST.address}</p>
              <p className="flex items-center gap-2"><Scissors size={15} className="text-[#a6593b]" /> {REQUEST.garment} · {REQUEST.service}</p>
              <p className="flex items-center gap-2"><Clock3 size={15} className="text-[#a6593b]" /> {REQUEST.tier}</p>
            </div>
            <button
              onClick={() => setPhase('collect')}
              disabled={courier < 1}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-[#202b38] px-5 py-3.5 text-sm text-[#f8f7f3] disabled:opacity-40"
            >
              <Navigation size={16} /> {courier < 1 ? 'En route…' : "I've arrived"}
            </button>
          </div>
        </div>
      )}

      {/* COLLECT — enter customer OTP */}
      {phase === 'collect' && (
        <div className="mt-10 mx-auto max-w-[460px] text-center">
          <h1 className="font-serif text-4xl tracking-[-.04em]">Confirm the pickup code.</h1>
          <p className="mt-3 leading-7 text-[#5f625f]">
            Ask {REQUEST.customer} for their 4-digit code and enter it to collect the item. This starts the turnaround clock.
          </p>
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="––––"
            className="mt-8 w-full border-2 border-[#202b38] bg-transparent px-4 py-4 text-center font-mono text-4xl tracking-[.5em] outline-none placeholder:text-[#cfcabf]"
            aria-label="Pickup code"
          />
          {error && <p className="mt-3 text-sm text-[#a6593b]" dangerouslySetInnerHTML={{ __html: error }} />}
          <button onClick={confirmOtp} disabled={entry.length < 4} className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#a6593b] px-5 py-3.5 text-sm text-[#f8f7f3] disabled:opacity-40">
            Confirm &amp; collect item <ArrowRight size={16} />
          </button>
          <p className="mt-4 text-xs text-[#777973]">Demo code for this request: {otp}</p>
        </div>
      )}

      {/* WORKING — SLA running */}
      {phase === 'working' && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">{REQUEST.ref} · collected</p>
            <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Turnaround started.</h1>
            <p className="mt-4 max-w-[460px] leading-7 text-[#5f625f]">
              You&apos;ve collected {REQUEST.garment.toLowerCase()} from {REQUEST.customer} Finish within the window to keep your on-time rating.
            </p>
            <div className="mt-9 border border-[#202b38] bg-[#202b38] p-6 text-[#f8f7f3]">
              <p className="text-xs uppercase tracking-[.2em] text-[#e7c9ba]">Time to complete · {REQUEST.tier}</p>
              <p className="mt-3 font-mono text-5xl tabular-nums">{formatClock(sla)}</p>
            </div>
            <button onClick={() => setPhase('done')} className="mt-8 inline-flex items-center gap-2 bg-[#a6593b] px-5 py-3 text-sm text-[#f8f7f3]">
              Mark ready for return <Check size={16} />
            </button>
          </div>
          <aside className="h-fit border border-[#d9d5cd] bg-[#eeece6] p-6">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#a6593b]">Job details</p>
            <div className="mt-5 flex flex-col gap-4 text-sm">
              <div><span className="text-[#777973]">Customer</span><p className="mt-1">{REQUEST.customer}</p></div>
              <div><span className="text-[#777973]">Item</span><p className="mt-1">{REQUEST.garment}</p></div>
              <div><span className="text-[#777973]">Service</span><p className="mt-1">{REQUEST.service}</p></div>
              <div><span className="text-[#777973]">Collected with</span><p className="mt-1 font-mono">Code {otp}</p></div>
            </div>
          </aside>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div className="mt-12 flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[#202b38] text-[#f8f7f3]"><Check size={24} /></span>
          <h1 className="mt-6 font-serif text-4xl tracking-[-.04em]">Marked ready for return.</h1>
          <p className="mt-3 max-w-[420px] leading-7 text-[#5f625f]">
            {REQUEST.customer} has been notified that {REQUEST.garment.toLowerCase()} is ready. Nice work.
          </p>
          <button onClick={() => setPhase('incoming')} className="mt-8 border border-[#202b38] px-5 py-3 text-sm">Back to queue</button>
        </div>
      )}
    </section>
  )
}
