"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Eyebrow } from "./ui";
import { ease } from "./styles";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  desc: React.ReactNode;
  image?: { src: string; alt: string; caption?: string };
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, desc, image, children }: Props) {
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 600], [0, 80]);

  return (
    <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-28">
      <div className="pointer-events-none absolute -top-48 right-[-10%] size-[600px] rounded-full bg-blush/50 blur-[140px]" />

      <div className={`relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 ${image ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : ""}`}>
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </motion.div>
          <h1 className="mt-6 overflow-hidden pb-2 font-display text-[clamp(42px,6vw,80px)] leading-[1] font-medium tracking-[-0.035em]">
            <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease }} className="block">
              {title}
            </motion.span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35, ease }} className="mt-7 max-w-xl text-lg leading-relaxed text-cocoa">
            {desc}
          </motion.div>
          {children && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease }} className="mt-10 flex flex-wrap gap-3">
              {children}
            </motion.div>
          )}
        </div>

        {image && (
          <motion.figure
            initial={{ clipPath: "inset(10% 10% 10% 10% round 40px)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 32px)", opacity: 1 }}
            transition={{ duration: 1.3, delay: 0.2, ease }}
            className="relative aspect-[5/4] overflow-hidden rounded-[32px] shadow-float"
          >
            <motion.div style={{ y: imgY }} className="absolute -inset-y-16 inset-x-0">
              <Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 1024px) 90vw, 560px" className="object-cover" />
            </motion.div>
            {image.caption && (
              <figcaption className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-ink backdrop-blur">{image.caption}</figcaption>
            )}
          </motion.figure>
        )}
      </div>
    </section>
  );
}
