"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { ease } from "./styles";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-cream pt-32 pb-8 sm:pt-36 sm:pb-12 lg:pt-40 lg:pb-14"
    >
      {/* Subtle organic grain overlay for tactile paper texture */}
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-30" />

      {/* Ambient warm light glow */}
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-sand/35 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        
        {/* Top Editorial Pre-title Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/80 px-4 py-1.5 backdrop-blur-md shadow-xs mb-8"
        >
          <span className="flex size-2 rounded-full bg-clay animate-pulse" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            RaffuLabs · Parent Company & Fashion Services Platform
          </span>
        </motion.div>

        {/* Hero Main Grid: Left Narrative + Right Clean Full-Background Image */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          
          {/* Left Column: Human Editorial Manifesto */}
          <div className="flex flex-col items-start">
            
            <h1 className="font-display text-[42px] sm:text-5xl lg:text-[62px] leading-[1.03] font-semibold tracking-[-0.035em] text-ink">
              <span className="block">Clothes are made</span>
              <span className="block">to fit. We build the</span>
              <span className="block">
                systems that{" "}
                <em className="font-serif font-normal italic text-clay underline decoration-clay/30 decoration-2 underline-offset-6">
                  make sure they do.
                </em>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
              className="mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-cocoa font-normal"
            >
              RaffuLabs is the parent technology company behind <strong className="font-semibold text-ink">Raffu</strong>. We engineer the hyper-local allocation engine, studio operating system, and seamless fitting workflows that connect everyday wardrobes with certified master tailors.
            </motion.p>

            {/* Dual Action CTAs inspired by SOJO */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <a
                href="#products"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-sm font-semibold text-cream transition-all hover:bg-clay hover:shadow-card cursor-pointer"
              >
                Explore our platforms
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="https://raffu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 bg-white/80 px-6 text-sm font-semibold text-ink backdrop-blur-xs transition-all hover:border-ink hover:bg-white hover:shadow-xs cursor-pointer"
              >
                Visit consumer app (raffu.com)
                <ArrowUpRight size={16} className="text-cocoa transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </motion.div>

            {/* Credibility / Standards Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease }}
              className="mt-12 w-full border-t border-ink/10 pt-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    1–3 km
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cocoa/90">
                    Neighborhood radius
                  </div>
                </div>

                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    24–48h
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cocoa/90">
                    Doorstep return
                  </div>
                </div>

                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    100%
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cocoa/90">
                    Fit guarantee
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Whole Background with One Clean Image for That Text Just That */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="relative w-full"
          >
            {/* Clean Full-Height Image Card Container */}
            <div className="group relative w-full h-[420px] sm:h-[480px] lg:h-[530px] overflow-hidden rounded-[28px] sm:rounded-[36px] border border-ink/12 bg-neutral-900 shadow-[0_24px_50px_-15px_rgba(31,23,18,0.16)]">
              
              {/* Full Background Clean Editorial Photography */}
              <Image
                src="/raffu-images/atelier_hero_craft.jpg"
                alt="Master tailor in atelier pinning and measuring a bespoke camel wool garment with tailor chalk and brass shears"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center filter contrast-[1.02] transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Natural gradient overlay ensuring text legibility while keeping photo luminous */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/10" />

              {/* Top Corner Certification Badge */}
              <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-cream/90 px-3.5 py-1.5 text-xs font-semibold text-ink backdrop-blur-md border border-white/40 shadow-xs">
                <ShieldCheck size={14} className="text-clay" />
                <span>Master Atelier Certified</span>
              </div>

              {/* Top Right Fabric / Standard Stamp */}
              <div className="absolute top-5 right-5 hidden sm:flex items-center gap-1.5 rounded-full bg-ink/75 px-3.5 py-1 font-mono text-[10.5px] tracking-wider text-cream/90 backdrop-blur-md border border-white/10">
                <Sparkles size={12} className="text-amber-300" />
                <span>REF. M-01 / RAW SUITING</span>
              </div>

              {/* Bottom Clean Text Overlay */}
              <div className="absolute bottom-6 inset-x-6 sm:bottom-8 sm:inset-x-8 text-cream">
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-cream/75 font-medium">
                  RaffuLabs Architecture
                </p>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] leading-snug font-bold tracking-tight text-white mt-1.5 max-w-md">
                  Physical Master Craft meets Digital Operating System
                </h2>
              </div>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
