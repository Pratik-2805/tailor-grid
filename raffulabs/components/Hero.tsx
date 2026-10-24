"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, MapPin, ShieldCheck } from "lucide-react";
import { btnPrimary, btnSecondary, ease } from "./styles";

const WORDS = ["local", "trusted", "nearest", "favorite"];
const STEPS = ["Allocated to studio", "In-person fitting", "Stitching", "Ready for pickup"];

function useCycle(length: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms]);
  return i;
}

function Float({ x, y, depth, className, delay, children }: { x: MotionValue<number>; y: MotionValue<number>; depth: number; className: string; delay: number; children: React.ReactNode }) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay, ease }}
      className={`absolute ${className}`}
    >
      <motion.div style={{ x: tx, y: ty }}>{children}</motion.div>
    </motion.div>
  );
}

function OrderCard() {
  const step = useCycle(STEPS.length, 1900);
  return (
    <div className="w-[290px] rounded-3xl border border-ink/[0.07] bg-white/95 p-5 shadow-float backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-cocoa uppercase">Order RF-2043</p>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-moss">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-moss/60" />
            <span className="relative size-2 rounded-full bg-moss" />
          </span>
          Live
        </span>
      </div>
      <p className="mt-2 font-display text-lg font-medium">Navy suit · Sleeve hem</p>
      <ul className="mt-4 space-y-1">
        {STEPS.map((s, i) => (
          <li key={s} className="relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
            {i === step && <motion.span layoutId="hero-step" className="absolute inset-0 rounded-xl bg-paper" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className={`relative flex size-5 items-center justify-center rounded-full transition-colors duration-500 ${i <= step ? "bg-clay text-white" : "border border-ink/15 bg-white"}`}>
              {i < step && <Check size={11} strokeWidth={3} />}
            </span>
            <span className={`relative transition-colors duration-500 ${i <= step ? "font-semibold text-ink" : "text-cocoa"}`}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchCard() {
  return (
    <div className="flex w-[230px] items-center gap-4 rounded-3xl border border-ink/[0.07] bg-white/95 p-4 shadow-float backdrop-blur">
      <div className="relative flex size-14 shrink-0 items-center justify-center">
        {[0, 1].map((r) => (
          <motion.span
            key={r}
            className="absolute inset-0 rounded-full border border-clay/40"
            animate={{ scale: [0.4, 1.2], opacity: [0.9, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: r * 1.2, ease: "easeOut" }}
          />
        ))}
        <span className="relative flex size-8 items-center justify-center rounded-full bg-clay text-white">
          <MapPin size={15} />
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold">Studio matched</p>
        <p className="text-xs leading-snug text-cocoa">Certified atelier within 1–3 km</p>
      </div>
    </div>
  );
}

export function Hero() {
  const word = useCycle(WORDS.length, 2600);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 50, damping: 20 });
  const y = useSpring(my, { stiffness: 50, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 24);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 24);
  };

  return (
    <section id="hero" onMouseMove={onMove} className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="pointer-events-none absolute -top-40 right-[-10%] size-[640px] rounded-full bg-blush/60 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-[-10%] size-[420px] rounded-full bg-saffron/20 blur-[120px]" />
      <div className="bg-grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/70 py-1.5 pr-4 pl-1.5 text-xs font-semibold text-cocoa backdrop-blur"
          >
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] tracking-wider text-cream uppercase">RaffuLabs Inc.</span>
            The company behind Raffu
          </motion.span>

          <h1 className="mt-8 font-display text-[clamp(46px,6.6vw,88px)] leading-[0.98] font-medium tracking-[-0.035em]">
            {["The technology", "behind your"].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease }} className="block">
                  {line}
                </motion.span>
              </span>
            ))}
            <span className="block overflow-hidden pb-2">
              <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease }} className="block">
                <motion.span layout transition={{ duration: 0.45, ease }} className="relative inline-flex">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.em
                      key={WORDS[word]}
                      initial={{ opacity: 0, y: "40%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "-40%" }}
                      transition={{ duration: 0.3, ease }}
                      className="inline-block font-normal text-clay"
                    >
                      {WORDS[word]}
                    </motion.em>
                  </AnimatePresence>
                </motion.span>{" "}
                <motion.span layout transition={{ duration: 0.45, ease }} className="inline-block">tailor.</motion.span>
              </motion.span>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease }} className="mt-7 max-w-xl text-lg leading-relaxed text-cocoa">
            RaffuLabs builds the allocation engine, studio software and booking experience behind <strong className="font-semibold text-ink">Raffu</strong>,
            pairing people with certified neighborhood ateliers. Fitted in person, priced upfront, ready in 24–48 hours.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }} className="mt-10 flex flex-wrap gap-3">
            <a href="#products" className={btnPrimary}>
              Explore our products <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </a>
            <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              Visit raffu.com <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mt-14 grid max-w-lg grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 pt-6">
            {[["1–3 km", "Studio radius"], ["5 min", "Fitting"], ["100%", "Fit guarantee"]].map(([v, l]) => (
              <div key={l} className="px-4 first:pl-0">
                <dt className="font-display text-2xl font-medium sm:text-3xl">{v}</dt>
                <dd className="mt-1 text-xs font-medium tracking-wide text-cocoa uppercase">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
          <motion.div
            initial={{ clipPath: "inset(12% 12% 12% 12% round 40px)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 32px)", opacity: 1 }}
            transition={{ duration: 1.3, delay: 0.2, ease }}
            className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-float"
          >
            <motion.div initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 1.8, delay: 0.2, ease }} className="absolute inset-0">
              <Image src="/raffu-images/atelier_panoramic_banner.jpg" alt="A certified Raffu partner atelier" fill priority sizes="(max-width: 1024px) 90vw, 520px" className="object-cover object-[30%_50%]" />
            </motion.div>
            <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/0 to-ink/0" />
            <p className="absolute right-6 bottom-6 left-6 text-right text-sm font-medium text-cream/90">
              Certified partner atelier
              <span className="block text-xs text-cream/60">Industrial machinery · master tailors</span>
            </p>
          </motion.div>

          <Float x={x} y={y} depth={-0.8} delay={0.9} className="bottom-16 -left-4 sm:-left-16">
            <OrderCard />
          </Float>
          <Float x={x} y={y} depth={0.6} delay={1.1} className="top-10 -right-3 hidden sm:block lg:-right-10">
            <MatchCard />
          </Float>
          <Float x={x} y={y} depth={1} delay={1.3} className="-top-5 left-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/[0.07] bg-white/95 px-4 py-2.5 text-sm font-semibold shadow-float">
              <ShieldCheck size={16} className="text-moss" /> 100% fit guarantee
            </span>
          </Float>
        </div>
      </div>
    </section>
  );
}
