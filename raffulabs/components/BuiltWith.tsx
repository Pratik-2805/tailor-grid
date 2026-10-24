"use client";

import { motion } from "framer-motion";
import { Cpu, Database, Monitor, ShieldCheck, Store } from "lucide-react";

// Stack as actually used across frontend/, studio/, admin/ and backend/.
const STACK = [
  { group: "Interface", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Motion", "Lottie"] },
  { group: "Core", items: ["Node.js", "Express", "PostgreSQL", "Prisma", "JWT auth", "Helmet & rate limiting"] },
  { group: "Services", items: ["Google Maps Platform", "AWS SNS (OTP)", "Resend (email)", "Google sign-in", "Vercel Analytics"] },
];

const CLIENTS = [
  { icon: Monitor, name: "Raffu web", sub: "Customers" },
  { icon: Store, name: "Studio OS", sub: "Ateliers" },
  { icon: ShieldCheck, name: "Ops console", sub: "Our team" },
];

function Wire({ delay }: { delay: number }) {
  return (
    <div className="relative mx-auto h-14 w-[3px] rounded-full bg-cream/15">
      <motion.span
        className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-saffron shadow-[0_0_12px_#E9A23B]"
        animate={{ top: ["-10%", "100%"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, delay, ease: "easeInOut" }}
      />
    </div>
  );
}

export function BuiltWith() {
  return (
    <section id="built-with" className="relative overflow-hidden bg-ink py-28 font-sans text-cream">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-clay/25 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="text-xs font-extrabold tracking-[0.2em] text-saffron uppercase">04 · Built with</span>
          <h2 className="mt-4 font-display text-[clamp(36px,5vw,64px)] leading-[1.02] font-semibold tracking-[-0.03em]">
            Built in-house, <em className="font-medium text-saffron">end to end.</em>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/70">
            Three apps, one API. Every booking flows through our allocation engine, which matches an order to a studio by
            proximity, machinery and availability, then keeps customer, atelier and our ops team in sync.
          </p>

          <div className="mt-10 space-y-6">
            {STACK.map(({ group, items }, gi) => (
              <div key={group}>
                <p className="text-xs font-bold tracking-[0.2em] text-cream/50 uppercase">{group}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {items.map((t, i) => (
                    <motion.li
                      key={t}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3, rotate: i % 2 ? 2 : -2 }}
                      viewport={{ once: true }}
                      transition={{ delay: gi * 0.15 + i * 0.04 }}
                      className="cursor-default rounded-full border border-cream/20 bg-cream/5 px-4 py-2 text-sm font-semibold transition-colors hover:border-saffron hover:bg-saffron hover:text-ink"
                    >
                      {t}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[36px] border border-cream/15 bg-cream/[0.04] p-6 sm:p-10"
        >
          <div className="grid grid-cols-3 gap-3">
            {CLIENTS.map(({ icon: Icon, name, sub }) => (
              <div key={name} className="rounded-2xl border-2 border-cream/20 bg-ink p-3 text-center sm:p-4">
                <Icon className="mx-auto text-saffron" size={22} />
                <p className="mt-2 text-sm font-bold">{name}</p>
                <p className="text-[11px] text-cream/50">{sub}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3">
            {[0, 0.5, 1].map((d) => <Wire key={d} delay={d} />)}
          </div>
          <div className="rounded-2xl border-2 border-ink bg-clay p-5 text-center text-cream shadow-[6px_6px_0_#E9A23B]">
            <Cpu className="mx-auto" size={26} />
            <p className="mt-2 font-display text-xl font-semibold">Raffu API · Allocation engine</p>
            <p className="mt-1 text-xs text-cream/80">Proximity · machinery · availability · payouts</p>
          </div>
          <Wire delay={0.3} />
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-cream/20 bg-ink p-4">
            <Database className="text-sage" size={22} />
            <p className="font-bold">PostgreSQL + Prisma</p>
            <span className="hidden text-cream/30 sm:inline">|</span>
            {["Maps", "SNS", "Resend"].map((s) => (
              <span key={s} className="rounded-full bg-cream/10 px-2.5 py-1 text-xs font-semibold">{s}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
