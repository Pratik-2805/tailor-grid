"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./ui";
import { ease } from "./styles";

const SERVICES = [
  { title: "Trousers & pants", desc: "Hem shortening, waist tapering, seat adjustments and zip replacements.", img: "service_trousers", group: "Everyday" },
  { title: "Shirts & tops", desc: "Side seam tapering, dart additions, sleeve shortening and collar adjustments.", img: "service_shirt", group: "Everyday" },
  { title: "Suits & blazers", desc: "Sleeve hem, waist suppression, collar contouring and shoulder refitting.", img: "service_suit", group: "Formal" },
  { title: "Jackets & outerwear", desc: "Lining repair, heavy zip replacement, sleeve tapering and length alterations.", img: "service_jacket", group: "Formal" },
  { title: "Traditional & ethnic", desc: "Kurta refitting, lehenga waist adjustments, blouse tailoring and border hemming.", img: "service_ethnic", group: "Occasion" },
  { title: "Dresses & gowns", desc: "Hemline raising, bust & waist contouring, strap adjustment and invisible zips.", img: "service_dress", group: "Occasion" },
];

const FILTERS = ["All", "Everyday", "Formal", "Occasion"];

export function ServicesGallery() {
  const [filter, setFilter] = useState("All");
  const shown = SERVICES.filter((s) => filter === "All" || s.group === filter);

  return (
    <section id="services" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading eyebrow="Services on Raffu" title={<>What you can alter, <em className="font-normal text-clay">today.</em></>} desc="Every garment is handled by certified tailors with fixed pricing and in-studio try-on." />
          <LayoutGroup>
            <div role="tablist" aria-label="Filter services" className="flex rounded-full border border-ink/10 bg-white p-1 shadow-card">
              {FILTERS.map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === f ? "text-cream" : "text-cocoa hover:text-ink"}`}>
                  {filter === f && <motion.span layoutId="service-filter" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{f}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>

        <motion.ul layout className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((s) => (
              <motion.li
                key={s.title}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease }}
                className="group overflow-hidden rounded-3xl border border-ink/[0.07] bg-white shadow-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                  <Image src={`/raffu-images/${s.img}.jpg`} alt={s.title} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur">{s.group}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cocoa">{s.desc}</p>
                  <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-clay">
                    Book on raffu.com <ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
