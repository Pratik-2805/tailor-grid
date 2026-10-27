"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { ease } from "./styles";

/** Fades content up once it scrolls into view. */
export function Reveal({ delay = 0, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease }}
      {...props}
    />
  );
}

export function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase ${dark ? "text-saffron" : "text-clay"}`}>
      <span className="h-px w-8 bg-current" />
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, desc, dark, className = "" }: { eyebrow: string; title: React.ReactNode; desc?: string; dark?: boolean; className?: string }) {
  return (
    <Reveal className={className}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 max-w-3xl font-display text-[clamp(34px,4.6vw,58px)] leading-[1.04] font-medium tracking-[-0.025em]">{title}</h2>
      {desc && <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${dark ? "text-cream/70" : "text-cocoa"}`}>{desc}</p>}
    </Reveal>
  );
}
