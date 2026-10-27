import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RaffuLabsLogo } from "./RaffuLabsLogo";

const COMPANY = [
  { label: "About RaffuLabs", href: "/about" },
  { label: "Products & tech", href: "/products" },
  { label: "Mission & values", href: "/mission" },
  { label: "Contact & partners", href: "/contact" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink pt-20 font-sans text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <RaffuLabsLogo theme="dark" />
          <p className="mt-6 max-w-sm leading-relaxed text-cream/60">
            Parent company and product studio behind{" "}
            <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-saffron hover:underline">Raffu</a>
            , the certified neighborhood studio allocation &amp; tailoring network.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-cream/40 uppercase">Company</p>
          <ul className="mt-5 space-y-3">
            {COMPANY.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-cream/80 transition hover:text-saffron">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-cream/40 uppercase">Ecosystem</p>
          <ul className="mt-5 space-y-3 text-cream/80">
            <li>
              <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-saffron">
                Raffu <span className="rounded-full bg-sage/25 px-2 py-0.5 text-[10px] font-bold text-sage">LIVE</span> <ArrowUpRight size={14} />
              </a>
            </li>
            <li><Link href="/products" className="transition hover:text-saffron">Raffu Studio OS</Link></li>
            <li><Link href="/products" className="transition hover:text-saffron">Raffu for Business</Link></li>
            <li className="inline-flex items-center gap-2">
              Raffu Mobile App <span className="rounded-full bg-saffron/20 px-2 py-0.5 text-[10px] font-bold text-saffron">SOON</span>
            </li>
          </ul>
        </div>
      </div>

      <p aria-hidden className="mt-16 text-center font-display text-[19vw] leading-[0.8] font-semibold tracking-[-0.05em] text-cream/[0.06] select-none">
        RaffuLabs
      </p>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-sm text-cream/50 sm:px-8">
          <p>© {new Date().getFullYear()} RaffuLabs Inc. Incorporated in Delaware, USA.</p>
          <div className="flex gap-6">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-cream">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
