'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, ChevronRight, LogOut, Menu, Scissors, UserRound, X } from 'lucide-react'
import { CustomerFlow } from '@/components/tailorgrid/customer-flow'
import { PartnerFlow } from '@/components/tailorgrid/partner-flow'
import { AuthModal } from '@/components/tailorgrid/auth-modal'
import { makeOtp, type Screen, type User } from '@/components/tailorgrid/data'

function Header({
  go,
  user,
  onOpenAuth,
  onSignOut,
}: {
  go: (s: Screen) => void
  user: User | null
  onOpenAuth: () => void
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <header className="border-b border-[#d9d5cd] bg-[#f8f7f3]">
      <div className="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <button onClick={() => go('home')} className="flex items-center gap-3" aria-label="TailorGrid home">
          <span className="grid size-9 place-items-center rounded-full bg-[#202b38] text-[#f8f7f3]"><Scissors size={17} /></span>
          <span className="font-serif text-[22px] tracking-[-.04em]">TailorGrid</span>
        </button>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#how-it-works" className="hover:text-[#a6593b]">How it works</a>
          <a href="#for-partners" className="hover:text-[#a6593b]">For partners</a>
          <button onClick={() => go('orders')} className="flex items-center gap-2 border-l border-[#d9d5cd] pl-6 hover:text-[#a6593b]">
            <UserRound size={16} /> My requests
          </button>
          {user ? (
            <div className="flex items-center gap-3 border-l border-[#d9d5cd] pl-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eeece6] pl-1.5 pr-3 py-1 text-xs font-medium border border-[#d9d5cd]">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="size-6 rounded-full object-cover border border-[#202b38]" />
                ) : (
                  <span className="size-2 rounded-full bg-[#a6593b]" />
                )}
                {user.name}
              </span>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="text-[#777973] hover:text-[#202b38]"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (

            <button
              onClick={onOpenAuth}
              className="rounded-full border border-[#202b38] px-4 py-1.5 text-xs font-medium transition hover:bg-[#202b38] hover:text-[#f8f7f3]"
            >
              Sign Up
            </button>
          )}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-[#d9d5cd] px-5 py-5 text-sm md:hidden">
          <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          <a href="#for-partners" onClick={() => setOpen(false)}>For partners</a>
          <button className="text-left" onClick={() => { go('orders'); setOpen(false) }}>My requests</button>
          {user ? (
            <div className="flex items-center justify-between border-t border-[#d9d5cd] pt-3 text-xs">
              <span>Signed in as {user.name}</span>
              <button onClick={onSignOut} className="text-[#a6593b]">Sign out</button>
            </div>
          ) : (
            <button onClick={() => { onOpenAuth(); setOpen(false) }} className="text-left text-[#a6593b] font-medium">Sign Up / Sign In</button>
          )}
        </nav>
      )}
    </header>
  )
}

function Home({ go, onFixItem }: { go: (s: Screen) => void; onFixItem: () => void }) {
  return (
    <>
      <section className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-20 lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-7 text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Alterations, on demand</p>
          <h1 className="max-w-[620px] font-serif text-[clamp(3.5rem,7vw,6.8rem)] leading-[.91] tracking-[-.065em] text-[#202b38]">Clothes that fit <em className="font-serif text-[#a6593b]">your</em> life.</h1>
          <p className="mt-8 max-w-[470px] text-[17px] leading-7 text-[#5f625f]">Request a pickup, and the nearest available tailor collects your item, fixes it, and returns it — on your schedule.</p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button onClick={onFixItem} className="group inline-flex items-center gap-4 rounded-full bg-[#202b38] px-6 py-3.5 text-sm font-medium text-[#f8f7f3] transition hover:bg-[#a6593b]">
              Fix an item <span className="grid size-7 place-items-center rounded-full bg-[#a6593b] group-hover:bg-[#202b38]"><ArrowRight size={15} /></span>
            </button>
            <button onClick={() => go('partner')} className="text-sm font-medium underline decoration-[#a6593b] underline-offset-4">I&apos;m a tailoring partner</button>
            <button onClick={() => go('admin')} className="text-sm text-[#777973] underline underline-offset-4">Admin workspace</button>
          </div>
          <p className="mt-6 text-xs text-[#777973]">No payment until your fitting is confirmed.</p>
        </div>

        <div className="relative overflow-hidden rounded-[2px] bg-[#d8d0c2]">
          <Image src="/images/atelier-hero.png" alt="A tailor pinning the hem of a navy trouser" width={900} height={1125} priority className="h-auto w-full object-cover" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between bg-[#f8f7f3]/95 px-4 py-3 text-xs"><span>Made for the way you move</span><span className="font-mono text-[#a6593b]">TG / 01</span></div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#d9d5cd] bg-[#eeece6]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">How it works</p>
          <h2 className="max-w-[540px] font-serif text-4xl leading-tight tracking-[-.04em] text-[#202b38] sm:text-5xl">Like calling a cab — for your clothes.</h2>
          <div className="mt-12 grid gap-0 border-t border-[#cfcac0] md:grid-cols-4">
            {[
              ['01', 'Tell us the job', 'Pick the garment, service and how fast you need it.'],
              ['02', 'A tailor accepts', 'Nearby stores are notified and the first free one takes it.'],
              ['03', 'Runner collects', 'Track them to your door and hand over with a pickup code.'],
              ['04', 'Fixed & returned', 'The turnaround clock starts the moment it&apos;s collected.'],
            ].map(([n, t, b]) => (
              <article key={n} className="border-b border-[#cfcac0] py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
                <span className="font-mono text-xs text-[#a6593b]">{n}</span>
                <h3 className="mt-8 font-serif text-2xl tracking-[-.03em]">{t}</h3>
                <p className="mt-3 max-w-[240px] text-sm leading-6 text-[#5f625f]" dangerouslySetInnerHTML={{ __html: b as string }} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="for-partners" className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-24">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">For independent tailors</p>
          <h2 className="font-serif text-4xl tracking-[-.04em]">More fitting. Less chasing.</h2>
        </div>
        <button onClick={() => go('partner')} className="inline-flex items-center gap-2 text-sm font-medium text-[#a6593b]">Open partner portal <ChevronRight size={16} /></button>
      </section>
    </>
  )
}

function Orders({ go, onFixItem }: { go: (s: Screen) => void; onFixItem: () => void }) {
  const rows = [
    ['TG-1048', 'Navy wool trousers', 'In the workshop · Atelier North', 'Priority'],
    ['TG-1039', 'White cotton shirt', 'Ready for collection · Stitch & Form', 'Standard'],
    ['TG-1021', 'Wool overcoat', 'Completed · The Hem Room', 'Standard'],
  ]
  return (
    <section className="mx-auto max-w-[1000px] px-5 py-12 lg:py-16">
      <button onClick={() => go('home')} className="mb-10 inline-flex items-center gap-2 text-sm text-[#5f625f]"><ArrowLeft size={15} /> Back home</button>
      <div className="flex flex-col justify-between gap-5 border-b border-[#d9d5cd] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Your requests</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Your alterations.</h1>
        </div>
        <button onClick={onFixItem} className="inline-flex items-center gap-2 rounded-full bg-[#202b38] px-5 py-3 text-sm text-[#f8f7f3] transition hover:bg-[#a6593b]">New request <ArrowRight size={15} /></button>
      </div>
      <div className="mt-8 border-t-2 border-[#202b38]">
        {rows.map(([id, item, status, tier]) => (
          <div key={id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9d5cd] py-5">
            <div>
              <p className="font-mono text-xs text-[#a6593b]">{id} · {tier}</p>
              <p className="mt-2 font-serif text-2xl tracking-[-.03em]">{item}</p>
              <p className="mt-1 text-sm text-[#5f625f]">{status}</p>
            </div>
            <ChevronRight size={18} className="text-[#bcb8af]" />
          </div>
        ))}
      </div>
    </section>
  )
}

function Admin({ go }: { go: (s: Screen) => void }) {
  const [filter, setFilter] = useState('All orders')
  const [notice, setNotice] = useState('')
  const rows = [
    ['TG-1048', 'Atelier North', 'Shorten the hem', 'In progress'],
    ['TG-1047', 'Stitch & Form', 'Repair a zip', 'En route to pickup'],
    ['TG-1046', 'The Hem Room', 'Adjust the waist', 'Ready for return'],
  ]
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8 lg:py-14">
      <button onClick={() => go('home')} className="mb-8 inline-flex items-center gap-2 text-sm text-[#5f625f]"><ArrowLeft size={15} /> Back home</button>
      <div className="flex flex-col justify-between gap-5 border-b border-[#d9d5cd] pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a6593b]">Main admin</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Network overview.</h1>
          <p className="mt-3 text-[#5f625f]">Every request moving through TailorGrid, in real time.</p>
        </div>
        <button onClick={() => setNotice('Report exported')} className="border border-[#202b38] px-4 py-2 text-sm">Export report</button>
      </div>
      {notice && <p className="mt-4 text-sm text-[#a6593b]">{notice}</p>}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Active requests', '128', '+14 this week'],
          ['Stores online', '42', '3 need attention'],
          ['Avg. accept time', '2 min', 'Within target'],
          ['Completed today', '36', '92% on time'],
        ].map(([a, b, c]) => (
          <div key={a} className="border border-[#d9d5cd] bg-[#eeece6] p-5">
            <p className="text-sm text-[#777973]">{a}</p>
            <p className="mt-3 font-serif text-3xl">{b}</p>
            <p className="mt-2 text-xs text-[#a6593b]">{c}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col justify-between gap-4 border-b border-[#d9d5cd] pb-4 sm:flex-row sm:items-center">
        <h2 className="font-serif text-3xl tracking-[-.04em]">Live requests</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-[#d9d5cd] bg-transparent px-3 py-2 text-sm">
          <option>All orders</option>
          <option>En route to pickup</option>
          <option>In progress</option>
          <option>Ready for return</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto border-t-2 border-[#202b38]">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#d9d5cd] text-xs uppercase tracking-[.14em] text-[#777973]">
              <th className="py-4 pr-4">Request</th>
              <th className="py-4 pr-4">Store</th>
              <th className="py-4 pr-4">Service</th>
              <th className="py-4 pr-4">Status</th>
              <th className="py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([id, store, service, status]) => (
              <tr key={id} className="border-b border-[#d9d5cd]">
                <td className="py-5 pr-4 font-mono text-xs">{id}</td>
                <td className="py-5 pr-4">{store}</td>
                <td className="py-5 pr-4">{service}</td>
                <td className="py-5 pr-4 text-[#a6593b]">{status}</td>
                <td className="py-5"><button onClick={() => setNotice(`${id} flagged for review`)} className="underline underline-offset-4">Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [otp] = useState(() => makeOtp())

  const handleFixItem = () => {
    if (!user) {
      setIsAuthOpen(true)
    } else {
      setScreen('booking')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#202b38]">
      <Header
        go={setScreen}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={() => setUser(null)}
      />
      <main>
        {screen === 'home' && <Home go={setScreen} onFixItem={handleFixItem} />}
        {screen === 'booking' && (
          <CustomerFlow
            go={setScreen}
            otp={otp}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {screen === 'orders' && <Orders go={setScreen} onFixItem={handleFixItem} />}
        {screen === 'partner' && <PartnerFlow go={setScreen} otp={otp} />}
        {screen === 'admin' && <Admin go={setScreen} />}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser)
          setIsAuthOpen(false)
          setScreen('booking')
        }}
      />
    </div>
  )
}
