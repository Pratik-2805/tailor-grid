'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, Phone, Scissors, Star } from 'lucide-react'
import { LiveMap } from './live-map'
import { GARMENTS, SERVICES, STORES, TIERS, formatClock, type Screen, type StoreOption, type Tier, type User } from './data'

type Phase = 'pin' | 'service' | 'details' | 'dispatch' | 'enroute' | 'handover' | 'progress'

const STEPPER: Phase[] = ['pin', 'service', 'details']

function Stepper({ phase }: { phase: Phase }) {
  const idx = STEPPER.indexOf(phase)
  return (
    <div className="flex gap-1.5">
      {STEPPER.map((s, i) => (
        <span key={s} className={`h-1 flex-1 ${i <= idx ? 'bg-[#202b38]' : 'bg-[#d9d5cd]'}`} />
      ))}
    </div>
  )
}

const PrimaryBtn = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#202b38] px-6 py-3.5 text-sm text-[#f8f7f3] disabled:opacity-40"
  >
    {children}
  </button>
)

export function CustomerFlow({
  go,
  otp,
  user,
  onOpenAuth,
}: {
  go: (s: Screen) => void
  otp: string
  user: User | null
  onOpenAuth?: () => void
}) {

  const [phase, setPhase] = useState<Phase>('pin')
  const [pin, setPin] = useState(user?.postcode || '')
  const [garment, setGarment] = useState(GARMENTS[0])
  const [service, setService] = useState(SERVICES[0])
  const [tier, setTier] = useState<Tier>(TIERS[1])
  const [address, setAddress] = useState(user?.address || '')
  const [store, setStore] = useState<StoreOption>(STORES[0])
  const [courier, setCourier] = useState(0)
  const [sla, setSla] = useState(0)
  const [geoLoading, setGeoLoading] = useState(false)

  // Sync user info into booking state when user logs in
  useEffect(() => {
    if (user?.postcode && !pin) setPin(user.postcode)
    if (user?.address && !address) setAddress(user.address)
  }, [user])

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false)
        setPin('W8 5TT')
        setAddress('18 Kensington Church St, London W8 4EP')
      },
      (err) => {
        setGeoLoading(false)
        setPin('W8 5TT')
        setAddress('18 Kensington Church St, London W8 4EP')
      }
    )
  }


  // Dispatch: broadcast to nearby stores, one accepts automatically.
  useEffect(() => {
    if (phase !== 'dispatch') return
    const t = setTimeout(() => {
      setStore(STORES[0])
      setCourier(0)
      setPhase('enroute')
    }, 3600)
    return () => clearTimeout(t)
  }, [phase])

  // En route: animate the courier along the route to the customer.
  useEffect(() => {
    if (phase !== 'enroute') return
    const id = setInterval(() => {
      setCourier((c) => {
        const nextVal = +(c + 0.09).toFixed(3)
        if (nextVal >= 1) {
          clearInterval(id)
          setTimeout(() => setPhase('handover'), 600)
          return 1
        }
        return nextVal
      })
    }, 700)
    return () => clearInterval(id)
  }, [phase])

  // SLA countdown, starts the moment the item is collected.
  useEffect(() => {
    if (phase !== 'progress') return
    const id = setInterval(() => setSla((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [phase])

  const back = () => {
    if (phase === 'pin') return go('home')
    if (phase === 'service') return setPhase('pin')
    if (phase === 'details') return setPhase('service')
    go('home')
  }

  const etaMins = Math.max(1, Math.ceil((1 - courier) * 9))

  return (
    <section className="mx-auto max-w-[940px] px-5 py-9 lg:py-14">
      <button onClick={back} className="mb-8 inline-flex items-center gap-2 text-sm text-[#5f625f]">
        <ArrowLeft size={15} /> Back
      </button>

      {STEPPER.includes(phase) && (
        <div className="flex flex-col gap-3">
          <Stepper phase={phase} />
          {user ? (
            <div className="mt-3 flex items-center justify-between border border-[#d9d5cd] bg-[#eeece6] px-4 py-2 text-xs">
              <span className="text-[#5f625f]">
                Signed in as <strong className="text-[#202b38]">{user.name}</strong> ({user.contact})
              </span>
              {onOpenAuth && (
                <button onClick={onOpenAuth} className="text-[#a6593b] hover:underline">
                  Switch account
                </button>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <div className="mt-3 flex items-center justify-between border border-dashed border-[#d9d5cd] bg-[#f8f7f3] px-4 py-2 text-xs">
                <span className="text-[#777973]">Want to track requests easily?</span>
                <button onClick={onOpenAuth} className="text-[#a6593b] font-medium hover:underline">
                  Sign Up with Email, Mobile or Social
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* STEP 1 — PIN */}
      {phase === 'pin' && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Your area</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Where should we look?</h1>
          <p className="mt-4 max-w-[460px] leading-7 text-[#5f625f]">
            Enter your postcode or PIN code. We&apos;ll find alteration stores that cover your area.
          </p>
          <div className="mt-9 flex max-w-[440px] items-center gap-3 border-b-2 border-[#202b38] pb-3">
            <MapPin className="text-[#a6593b]" size={20} />
            <input
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. W8 5TT"
              className="w-full bg-transparent text-xl outline-none placeholder:text-[#aaa69e]"
              aria-label="Postcode or PIN code"
            />
            <button
              onClick={detectLocation}
              disabled={geoLoading}
              className="shrink-0 rounded bg-[#eeece6] px-3 py-1.5 text-xs text-[#202b38] hover:bg-[#d9d5cd]"
            >
              {geoLoading ? 'Detecting…' : 'Use location'}
            </button>
          </div>
          <PrimaryBtn onClick={() => setPhase('service')} disabled={pin.trim().length < 3}>
            Continue <ArrowRight size={16} />
          </PrimaryBtn>
        </div>
      )}

      {/* STEP 2 — GARMENT + SERVICE + TIER */}
      {phase === 'service' && (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">What needs doing</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Your item &amp; service.</h1>

          <p className="mt-8 text-sm font-medium">Garment</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GARMENTS.map((g) => (
              <button
                key={g}
                onClick={() => setGarment(g)}
                className={`border px-4 py-2 text-sm ${garment === g ? 'border-[#a6593b] bg-[#eeece6]' : 'border-[#d9d5cd]'}`}
              >
                {g}
              </button>
            ))}
          </div>

          <p className="mt-8 text-sm font-medium">Service</p>
          <div className="mt-3 flex flex-col gap-2">
            {SERVICES.map((s) => (
              <button
                key={s}
                onClick={() => setService(s)}
                className={`flex items-center justify-between border p-4 text-left ${service === s ? 'border-[#a6593b] bg-[#eeece6]' : 'border-[#d9d5cd]'}`}
              >
                {s}
                {service === s && <Check size={18} className="text-[#a6593b]" />}
              </button>
            ))}
          </div>

          <p className="mt-8 text-sm font-medium">How fast do you need it?</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTier(t)}
                className={`border p-4 text-left ${tier.id === t.id ? 'border-[#a6593b] bg-[#eeece6]' : 'border-[#d9d5cd]'}`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-serif text-xl">{t.label}</span>
                  {tier.id === t.id && <Check size={16} className="text-[#a6593b]" />}
                </span>
                <span className="mt-2 block text-sm text-[#202b38]">{t.window}</span>
                <span className="mt-1 block text-xs text-[#777973]">{t.note}</span>
                <span className="mt-3 block font-mono text-xs text-[#a6593b]">{t.surcharge ? `+£${t.surcharge}` : 'Included'}</span>
              </button>
            ))}
          </div>

          <PrimaryBtn onClick={() => setPhase('details')}>
            Continue <ArrowRight size={16} />
          </PrimaryBtn>
        </div>
      )}

      {/* STEP 3 — DETAILS */}
      {phase === 'details' && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Pickup details</p>
            <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Where do we collect?</h1>

            {/* Profile avatar card */}
            {user && (
              <div className="mt-6 flex items-center gap-3 border border-[#d9d5cd] bg-[#eeece6] p-4">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="size-12 rounded-full border-2 border-[#202b38] object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#202b38]">{user.name}</p>
                  <p className="text-xs text-[#5f625f]">{user.contact}</p>
                  {user.method && <p className="text-[10px] uppercase text-[#a6593b]">Signed in via {user.method}</p>}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-6">
              <label className="text-sm">
                Pickup address
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat, street, city"
                  className="mt-2 block w-full border border-[#d9d5cd] bg-transparent p-4 text-base outline-none"
                />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" defaultChecked className="size-4 accent-[#a6593b]" /> I&apos;ll be available to hand over the item and share a pickup code.
              </label>
            </div>
            <PrimaryBtn onClick={() => setPhase('dispatch')} disabled={address.trim().length < 4}>
              Request pickup <ArrowRight size={16} />
            </PrimaryBtn>
          </div>
          <aside className="hidden h-fit border border-[#d9d5cd] bg-[#eeece6] p-6 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#a6593b]">Summary</p>
            {user && (
              <div className="my-4 flex items-center gap-3 border-b border-[#d9d5cd] pb-4">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="size-9 rounded-full object-cover border border-[#202b38]"
                />
                <div className="text-xs">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-[#777973]">{user.contact}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 text-sm">
              <div><span className="text-[#777973]">Item</span><p className="mt-1">{garment}</p></div>
              <div><span className="text-[#777973]">Service</span><p className="mt-1">{service}</p></div>
              <div><span className="text-[#777973]">Turnaround</span><p className="mt-1">{tier.label} · {tier.window}</p></div>
              <div><span className="text-[#777973]">Area</span><p className="mt-1">{pin || 'Not set'}</p></div>
              {address && <div><span className="text-[#777973]">Pickup Address</span><p className="mt-1 text-xs">{address}</p></div>}
            </div>
          </aside>
        </div>
      )}


      {/* DISPATCH — broadcasting to nearby stores */}
      {phase === 'dispatch' && (
        <div className="mt-12 flex flex-col items-center text-center">
          <span className="relative grid size-20 place-items-center">
            <span className="absolute inline-flex size-20 animate-ping rounded-full bg-[#a6593b]/30" />
            <span className="grid size-16 place-items-center rounded-full bg-[#202b38] text-[#f8f7f3]"><Scissors size={26} /></span>
          </span>
          <h1 className="mt-8 font-serif text-4xl tracking-[-.04em]">Finding a tailor near {pin || 'you'}…</h1>
          <p className="mt-3 max-w-[440px] leading-7 text-[#5f625f]">
            We&apos;ve sent your request to nearby stores. The first to accept will collect your {garment.toLowerCase()}.
          </p>
          <div className="mt-9 w-full max-w-[440px] overflow-hidden border-t-2 border-[#202b38]">
            {STORES.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between border-b border-[#d9d5cd] py-4 text-left">
                <div>
                  <p className="font-serif text-lg">{s.name}</p>
                  <p className="text-xs text-[#777973]">{s.area} · {s.distance}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#a6593b]">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#a6593b]" style={{ animationDelay: `${i * 200}ms` }} />
                  Notifying…
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EN ROUTE — live map to customer */}
      {phase === 'enroute' && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="min-h-[300px]">
            <LiveMap progress={courier} originLabel={store.name} destLabel="You" etaLabel={`${etaMins} min away`} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Pickup in progress</p>
            <h1 className="mt-4 font-serif text-4xl tracking-[-.04em]">{store.name} is on the way.</h1>
            <p className="mt-3 leading-7 text-[#5f625f]">
              A runner from {store.name} is heading to {address || 'your address'} to collect your {garment.toLowerCase()}.
            </p>
            <div className="mt-7 flex items-center justify-between border border-[#d9d5cd] bg-[#eeece6] p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#202b38] text-[#f8f7f3]"><Scissors size={16} /></span>
                <div>
                  <p className="text-sm font-medium">{store.name}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-[#777973]"><Star size={11} fill="currentColor" /> {store.rating} · {store.distance}</p>
                </div>
              </div>
              <button className="grid size-10 place-items-center border border-[#d9d5cd]" aria-label="Call the store"><Phone size={16} /></button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#5f625f]"><Clock3 size={15} /> Arriving in about {etaMins} minute{etaMins > 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* HANDOVER — OTP */}
      {phase === 'handover' && (
        <div className="mt-12 flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[#eeece6] text-[#a6593b]"><MapPin size={22} /></span>
          <h1 className="mt-6 font-serif text-4xl tracking-[-.04em]">The runner has arrived.</h1>
          <p className="mt-3 max-w-[420px] leading-7 text-[#5f625f]">
            Share this pickup code with the {store.name} runner. Once they confirm it, your {tier.label.toLowerCase()} turnaround begins.
          </p>
          <div className="mt-8 flex gap-3">
            {otp.split('').map((d, i) => (
              <span key={i} className="grid size-16 place-items-center border-2 border-[#202b38] font-mono text-3xl">{d}</span>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[.2em] text-[#777973]">Your pickup code</p>
          <PrimaryBtn onClick={() => { setSla(tier.slaSeconds); setPhase('progress') }}>
            Runner confirmed the code <ArrowRight size={16} />
          </PrimaryBtn>
        </div>
      )}

      {/* PROGRESS — SLA running */}
      {phase === 'progress' && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Order TG-1048 · {tier.label}</p>
            <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">In the workshop.</h1>
            <p className="mt-4 max-w-[460px] leading-7 text-[#5f625f]">
              {store.name} collected your {garment.toLowerCase()} and started work. We&apos;ll let you know the moment it&apos;s ready.
            </p>
            <div className="mt-9 border border-[#202b38] bg-[#202b38] p-6 text-[#f8f7f3]">
              <p className="text-xs uppercase tracking-[.2em] text-[#e7c9ba]">Time remaining · {tier.window}</p>
              <p className="mt-3 font-mono text-5xl tracking-tight tabular-nums">{formatClock(sla)}</p>
            </div>
            <div className="mt-9 border-t-2 border-[#202b38]">
              {[
                ['Item collected', `Handover confirmed with code ${otp}`, true],
                ['In the workshop', `${store.name} is working on your ${garment.toLowerCase()}`, true],
                ['Ready for return', 'We&apos;ll notify you when it&apos;s ready', false],
              ].map(([t, b, done], i) => (
                <div key={i} className="flex gap-4 border-b border-[#d9d5cd] py-5">
                  <span className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ${done ? 'bg-[#202b38] text-[#f8f7f3]' : 'border border-[#bcb8af]'}`}>
                    {done ? <Check size={14} /> : null}
                  </span>
                  <div>
                    <h2 className="font-serif text-xl">{t as string}</h2>
                    <p className="mt-1 text-sm text-[#5f625f]" dangerouslySetInnerHTML={{ __html: b as string }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => go('orders')} className="mt-8 border border-[#202b38] px-5 py-3 text-sm">View all my requests</button>
          </div>
          <aside className="h-fit border border-[#d9d5cd] bg-[#eeece6] p-6">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#a6593b]">Order summary</p>
            <div className="mt-5 flex flex-col gap-4 text-sm">
              <div><span className="text-[#777973]">Store</span><p className="mt-1">{store.name}</p></div>
              <div><span className="text-[#777973]">Item</span><p className="mt-1">{garment} · {service}</p></div>
              <div><span className="text-[#777973]">Turnaround</span><p className="mt-1">{tier.label} · {tier.window}</p></div>
              <div><span className="text-[#777973]">Service fee</span><p className="mt-1">{tier.surcharge ? `+£${tier.surcharge}` : 'Included'}</p></div>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}
