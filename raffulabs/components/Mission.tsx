"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Award, Globe, Leaf, Route, Shield, Zap } from "lucide-react";
import { Eyebrow, Reveal } from "./ui";
import { card } from "./styles";

const STATEMENT =
  "We make expert tailoring transparent, accessible and predictable, by allocating every order to a verified neighborhood atelier and giving those artisans modern digital tools.";

const VALUES = [
  { icon: Zap, title: "Move fast & iterate", desc: "We listen closely to studios and customers and ship improvements continuously." },
  { icon: Shield, title: "Absolute transparency", desc: "Fixed upfront pricing, clear turnaround times, zero counter bargaining." },
  { icon: Award, title: "In-person precision", desc: "Master tailors pin and chalk in person, with accuracy home tape can't match." },
  { icon: Leaf, title: "Zero shipping waste", desc: "Walking-distance studios mean no courier bags, bubble wrap or delivery vans." },
  { icon: Globe, title: "Global tech, local craft", desc: "US-incorporated software that empowers neighborhood artisans everywhere." },
  { icon: Route, title: "Smart studio routing", desc: "Orders go to ateliers verified for the exact machinery a job needs." },
];

function Word({ word, i, total, progress }: { word: string; i: number; total: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / total, (i + 1) / total], [0.15, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">{word}</motion.span>;
}

export function Mission({ showLink = true }: { showLink?: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = STATEMENT.split(" ");

  return (
    <section id="mission" className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Eyebrow>Mission</Eyebrow>
        <p ref={ref} className="mt-6 max-w-5xl font-display text-[clamp(28px,3.8vw,50px)] leading-[1.18] tracking-[-0.02em]">
          {words.map((w, i) => <Word key={i} word={w} i={i} total={words.length} progress={scrollYProgress} />)}
        </p>
        <p className="mt-8 max-w-2xl text-lg text-cocoa">
          <strong className="font-semibold text-ink">Our vision:</strong> a world where perfectly fitted clothes take zero
          guesswork, zero shipping waste and zero courier anxiety.
        </p>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className={`${card} group p-8 transition duration-500 hover:-translate-y-1 hover:shadow-float`}>
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-paper text-clay transition duration-500 group-hover:bg-clay group-hover:text-white">
                  <Icon size={20} />
                </span>
                <span className="font-mono text-xs text-cocoa/60">0{i + 1}</span>
              </div>
              <h3 className="mt-8 text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-cocoa">{desc}</p>
            </Reveal>
          ))}
        </div>

        {showLink && (
          <Link href="/mission" className="group mt-12 inline-flex items-center gap-2 font-semibold text-clay">
            Read our full mission <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </section>
  );
}
