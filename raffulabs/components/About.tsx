"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, useInView } from "framer-motion";
import { Leaf, MapPin, Store } from "lucide-react";
import { Eyebrow, Reveal } from "./ui";
import { card } from "./styles";

const STATS = [
  { prefix: "1–", to: 3, suffix: " km", label: "Every order goes to a studio nearby" },
  { prefix: "", to: 5, suffix: " min", label: "In-person fitting by a master tailor" },
  { prefix: "24–", to: 48, suffix: "h", label: "From fitting to ready-to-wear" },
  { prefix: "", to: 100, suffix: "%", label: "Fit guarantee, free 48h adjustments" },
];

const PILLARS = [
  { icon: MapPin, title: "Hyper-local by design", desc: "No couriers. Our software routes each request to a vetted atelier within walking distance." },
  { icon: Store, title: "Artisan-first", desc: "Predictable demand, upfront pricing and simple digital tools for independent tailors." },
  { icon: Leaf, title: "Zero shipping waste", desc: "No polybags, no cardboard, no delivery vans. Just a short walk to the studio." },
];

export function Counter({ prefix, to, suffix }: { prefix: string; to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (node.textContent = `${prefix}${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, prefix, to, suffix]);

  return <span ref={ref}>{`${prefix}${to}${suffix}`}</span>;
}

export function About() {
  return (
    <section id="about" className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <Eyebrow>The lab</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(34px,4.6vw,58px)] leading-[1.04] font-medium tracking-[-0.025em]">
              A small lab for one of the <em className="font-normal text-clay">oldest</em> crafts.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cocoa">
              Shopping for clothes online is easy. Getting them altered still isn&apos;t: people guess measurements with a
              home tape or risk sending garments by courier. Tailoring is hands-on. It needs pinning, draping and checking
              while you stand naturally.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-cocoa">
              <strong className="font-semibold text-ink">RaffuLabs Inc.</strong>, incorporated in Delaware, USA, builds the
              software that makes that simple: book online at a fixed price, walk into a certified studio nearby, collect
              your clothes ready to wear.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-2 border-t border-l border-ink/10">
            {STATS.map((s) => (
              <div key={s.label} className="border-r border-b border-ink/10 p-6 sm:p-8">
                <p className="font-display text-[clamp(34px,4vw,52px)] leading-none font-medium tracking-tight">
                  <Counter prefix={s.prefix} to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm leading-snug text-cocoa">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <Reveal className="relative min-h-[260px] overflow-hidden rounded-3xl shadow-card">
            <Image src="/raffu-images/fabric_pins.jpg" alt="Pins, chalk and tape on fabric" fill unoptimized sizes="(max-width: 1024px) 100vw, 400px" className="object-cover transition duration-1000 hover:scale-105" />
          </Reveal>
          {PILLARS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={0.08 * (i + 1)} className={`${card} group p-7 transition duration-500 hover:-translate-y-1`}>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-paper text-clay transition duration-500 group-hover:bg-clay group-hover:text-white">
                <Icon size={20} />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-cocoa">{desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
