"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, Bell, Check, LayoutDashboard, MapPin, Package, Scissors, Wallet } from "lucide-react";
import { SectionHeading } from "./ui";

type Product = {
  name: string;
  status: string;
  audience: string;
  tagline: string;
  desc: string;
  points: string[];
  cta: { label: string; href: string };
  theme: string;
  accent: string;
  Mock: () => React.ReactElement;
};

const mockFrame = "overflow-hidden rounded-2xl border border-ink/10 bg-cream text-ink shadow-float";
const appear = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: 0.15 + i * 0.1, duration: 0.5 },
});

function RaffuMock() {
  return (
    <div className={mockFrame}>
      <div className="flex items-center gap-2 border-b border-ink/10 bg-white px-4 py-3">
        {["bg-clay/70", "bg-saffron/70", "bg-sage"].map((c) => <span key={c} className={`size-2.5 rounded-full ${c}`} />)}
        <span className="ml-3 rounded-full bg-paper px-3 py-0.5 text-xs text-cocoa">raffu.com</span>
      </div>
      <div className="space-y-2.5 p-5">
        <p className="text-xs font-semibold tracking-widest text-cocoa uppercase">Book an alteration</p>
        {[["Trousers", "Hem shortening"], ["Suits & blazers", "Sleeve hem"], ["Ethnic wear", "Kurta refitting"]].map(([g, s], i) => (
          <motion.div key={g} {...appear(i)} className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 ${i === 0 ? "border-clay/50 ring-4 ring-clay/10" : "border-ink/10"}`}>
            <div>
              <p className="text-sm font-semibold">{g}</p>
              <p className="text-xs text-cocoa">{s}</p>
            </div>
            <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium">Fixed price</span>
          </motion.div>
        ))}
        <motion.div {...appear(3)} className="flex items-center gap-3 rounded-xl bg-ink px-4 py-3 text-cream">
          <MapPin size={16} className="text-saffron" />
          <p className="text-sm">Allocated to a certified studio nearby</p>
        </motion.div>
      </div>
    </div>
  );
}

function StudioMock() {
  const orders = [["Suit · Waist", "Allocated", "bg-blush"], ["Trousers · Hem", "Fitting Completed", "bg-saffron/40"], ["Kurta · Refit", "Work in Progress", "bg-sage/50"], ["Dress · Zip", "Ready", "bg-moss text-white"]];
  return (
    <div className={`${mockFrame} grid grid-cols-[auto_1fr]`}>
      <nav className="space-y-1 bg-ink p-3 text-cream">
        {[LayoutDashboard, Package, Scissors, Wallet].map((Icon, i) => (
          <span key={i} className={`flex size-9 items-center justify-center rounded-lg ${i === 1 ? "bg-clay" : "opacity-50"}`}><Icon size={16} /></span>
        ))}
      </nav>
      <div className="space-y-2 p-4">
        <div className="flex items-baseline justify-between pb-1">
          <p className="text-sm font-semibold">Today&apos;s orders</p>
          <p className="text-xs text-cocoa">Studio workbench</p>
        </div>
        {orders.map(([g, s, bg], i) => (
          <motion.div key={s} {...appear(i)} className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-cocoa">#{2041 + i}</span>
              <span className="text-sm font-medium">{g}</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bg}`}>{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BusinessMock() {
  const teams = [["Front office", 0.92], ["Cabin crew", 0.68], ["Kitchen & service", 0.45]] as const;
  return (
    <div className={`${mockFrame} p-6`}>
      <p className="text-xs font-semibold tracking-widest text-cocoa uppercase">Uniform program</p>
      <p className="mt-1 font-display text-xl font-medium">Fitting progress</p>
      <div className="mt-5 space-y-4">
        {teams.map(([t, v], i) => (
          <div key={t}>
            <div className="flex justify-between text-sm"><span className="font-medium">{t}</span><span className="text-cocoa">{Math.round(v * 100)}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
              <motion.div className="h-full origin-left rounded-full bg-clay" initial={{ scaleX: 0 }} whileInView={{ scaleX: v }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-ink/10 pt-4 text-sm text-cocoa">Hotels · Airlines · Workplaces</p>
    </div>
  );
}

function AppMock() {
  const notes = ["Studio accepted your order", "Fitting completed", "Your order is ready for pickup"];
  return (
    <div className="mx-auto w-[240px] rounded-[40px] bg-ink p-2.5 shadow-float">
      <div className="h-[400px] space-y-3 rounded-[32px] bg-cream p-4">
        <div className="mx-auto mb-6 h-5 w-20 rounded-full bg-ink" />
        <p className="font-display text-2xl font-medium text-ink">Your orders</p>
        {notes.map((n, i) => (
          <motion.div key={n} initial={{ opacity: 0, y: -16, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3 + i * 0.35, type: "spring", stiffness: 260, damping: 22 }} viewport={{ once: true }}
            className="flex items-start gap-2.5 rounded-2xl bg-white p-3 shadow-card">
            <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white ${i === 2 ? "bg-moss" : "bg-clay"}`}>{i === 2 ? <Check size={13} /> : <Bell size={12} />}</span>
            <p className="text-xs leading-snug font-medium text-ink">{n}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const PRODUCTS: Product[] = [
  {
    name: "Raffu",
    status: "Live on web",
    audience: "For customers",
    tagline: "Your clothes, tailored locally and fitted in person.",
    desc: "Our flagship product. Choose an alteration online at a fixed price; Raffu pairs your order with a certified studio 1–3 km away. Drop in for a 5-minute fitting, collect in 24–48 hours.",
    points: ["Fixed upfront pricing", "QR check-in pass", "100% fit guarantee"],
    cta: { label: "Open raffu.com", href: "https://raffu.com" },
    theme: "bg-ink text-cream",
    accent: "text-saffron",
    Mock: RaffuMock,
  },
  {
    name: "Raffu Studio OS",
    status: "Live for partners",
    audience: "For tailor studios",
    tagline: "A digital workbench for neighborhood ateliers.",
    desc: "Partner studios receive allocated bookings, see customer fit notes, manage their price catalog and track earnings with automated payouts. No paperwork, no bargaining.",
    points: ["Orders & fit notes", "Price catalog", "Earnings & payouts"],
    cta: { label: "Partner with us", href: "/contact" },
    theme: "bg-clay text-cream",
    accent: "text-blush",
    Mock: StudioMock,
  },
  {
    name: "Raffu for Business",
    status: "Now partnering",
    audience: "For companies & teams",
    tagline: "Uniform fittings without the logistics.",
    desc: "Turnkey uniform fittings and employee alteration programs for hotels, airlines and corporate workplaces, delivered through our verified studio network.",
    points: ["Uniform fittings", "Employee alteration programs", "Verified studio network"],
    cta: { label: "Talk to our team", href: "/contact" },
    theme: "bg-white text-ink border border-ink/10",
    accent: "text-clay",
    Mock: BusinessMock,
  },
  {
    name: "Raffu Mobile App",
    status: "Coming soon",
    audience: "iOS & Android",
    tagline: "Your wardrobe's fit profile, in your pocket.",
    desc: "Following the web launch, the Raffu app brings 1-tap reorders, saved measurement profiles and live push notifications from your studio.",
    points: ["1-tap reorders", "Fit profiles", "Live studio updates"],
    cta: { label: "Get early access", href: "/contact" },
    theme: "bg-paper text-ink",
    accent: "text-clay",
    Mock: AppMock,
  },
];

function Card({ p, i, total, progress }: { p: Product; i: number; total: number; progress: MotionValue<number> }) {
  const scale = useTransform(progress, [i / total, 1], [1, 1 - (total - 1 - i) * 0.035]);
  const external = p.cta.href.startsWith("http");
  return (
    // Stacking only on desktop: on phones a card is taller than the viewport and would hide the previous CTA.
    <div className="mb-5 lg:sticky lg:top-28 lg:mb-0 lg:flex lg:h-[calc(100vh-8rem)] lg:min-h-[600px] lg:items-start lg:pt-[var(--stack-offset)]" style={{ "--stack-offset": `${i * 20}px` } as React.CSSProperties}>
      <motion.article style={{ scale }} className={`${p.theme} grid w-full origin-top items-center gap-10 rounded-[36px] p-7 shadow-float sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16`}>
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.15em] uppercase">
            <span className="rounded-full bg-current/10 px-3 py-1.5"><span className="opacity-90">{p.status}</span></span>
            <span className={p.accent}>{p.audience}</span>
          </div>
          <h3 className="mt-6 font-display text-[clamp(34px,4.2vw,56px)] leading-none font-medium tracking-[-0.03em]">{p.name}</h3>
          <p className={`mt-4 font-display text-xl italic sm:text-2xl ${p.accent}`}>{p.tagline}</p>
          <p className="mt-5 max-w-lg leading-relaxed opacity-80">{p.desc}</p>
          <ul className="mt-6 space-y-2">
            {p.points.map((pt) => (
              <li key={pt} className="flex items-center gap-2.5 text-sm font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-current/10"><Check size={12} strokeWidth={3} /></span>
                {pt}
              </li>
            ))}
          </ul>
          <a href={p.cta.href} {...(external && { target: "_blank", rel: "noopener noreferrer" })}
            className="group mt-9 inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-semibold">
            {p.cta.label} <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="hidden sm:block">
          <p.Mock />
        </div>
      </motion.article>
    </div>
  );
}

export function Products({ showHeading = true }: { showHeading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="products" className="relative pt-28 pb-16 lg:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {showHeading && (
          <SectionHeading eyebrow="Products" title={<>One network, <em className="font-normal text-clay">four</em> products.</>} desc="Everything we ship serves the same loop: customers, studios and the allocation engine in between." />
        )}
        <div ref={ref} className={`relative ${showHeading ? "mt-14" : ""}`}>
          {PRODUCTS.map((p, i) => (
            <Card key={p.name} p={p} i={i} total={PRODUCTS.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
