"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { MousePointerClick, PackageCheck, Ruler, Route } from "lucide-react";
import { SectionHeading } from "./ui";
import { ease } from "./styles";

const STEPS = [
  { icon: MousePointerClick, title: "Choose your service", desc: "Browse garments and alterations on raffu.com. Fixed, transparent pricing with no surprises." },
  { icon: Route, title: "Get allocated", desc: "Our engine matches you to a certified studio 1–3 km away with the right machines and availability." },
  { icon: Ruler, title: "5-minute fitting", desc: "A master tailor measures, chalks and pins your garment in person. No home tape guesswork." },
  { icon: PackageCheck, title: "Collect, guaranteed", desc: "Ready in 24–48h. Try it on in the studio mirror; free tweaks within 48 hours." },
];

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 60%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  return (
    <section id="how-it-works" className="bg-paper/60 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="How Raffu works" title={<>Four steps, <em className="font-normal text-clay">one</em> neighborhood.</>} />

        <ol ref={ref} className="relative mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Progress line that fills as you scroll (desktop) */}
          <div className="absolute top-7 right-[12%] left-[4%] hidden h-px bg-ink/10 lg:block">
            <motion.div style={{ scaleX: draw }} className="h-full origin-left bg-clay" />
          </div>
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease }}
              className="group relative"
            >
              <span className="relative flex size-14 items-center justify-center rounded-2xl bg-white text-clay shadow-card transition duration-500 group-hover:-translate-y-1 group-hover:bg-clay group-hover:text-white">
                <Icon size={22} />
              </span>
              <p className="mt-8 font-mono text-xs text-cocoa">0{i + 1}</p>
              <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">{title}</h3>
              <p className="mt-3 leading-relaxed text-cocoa">{desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
