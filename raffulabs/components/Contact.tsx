"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Eyebrow, Reveal } from "./ui";

const CHANNELS = [
  { title: "Studio partnerships", email: "studios@raffu.com" },
  { title: "General enquiries", email: "hello@raffulabs.in" },
  { title: "Careers & press", email: "careers@raffulabs.in" },
];

export function Contact() {
  return (
    <section id="contact" className="px-5 pb-28 sm:px-8">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-ink p-8 text-cream sm:p-14 lg:p-20">
        <div className="pointer-events-none absolute -top-32 -right-24 size-[460px] rounded-full bg-clay/40 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 size-[360px] rounded-full bg-saffron/15 blur-[120px]" />

        <div className="relative grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow dark>Get in touch</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(38px,5vw,68px)] leading-[1] font-medium tracking-[-0.03em]">
              Let&apos;s build the future of <em className="font-normal text-saffron">fit</em>, together.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/70">
              Run a tailoring studio, lead a team that needs uniform fittings, or writing about us? We reply within 24 hours.
            </p>
            <Link href="/contact" className="group mt-10 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-saffron">
              Send us a message <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="divide-y divide-cream/10 border-y border-cream/10">
            {CHANNELS.map(({ title, email }) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="group flex items-center justify-between gap-4 py-5">
                  <span>
                    <span className="block text-xs tracking-[0.15em] text-cream/50 uppercase">{title}</span>
                    <span className="mt-1 block text-lg font-medium transition group-hover:text-saffron">{email}</span>
                  </span>
                  <ArrowUpRight size={20} className="text-cream/40 transition group-hover:rotate-45 group-hover:text-saffron" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
