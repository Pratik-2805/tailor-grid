"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { RaffuLabsLogo } from "./RaffuLabsLogo";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Mission", href: "/mission" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5"
    >
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 h-1 origin-left bg-clay" />
      <div
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border px-4 pl-5 transition-all duration-500 sm:px-5 sm:pl-6 ${
          scrolled ? "border-ink/10 bg-cream/80 shadow-card backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <Link href="/" aria-label="RaffuLabs home">
          <RaffuLabsLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "text-cream" : "text-ink hover:text-clay"}`}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <a
          href="https://raffu.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-sm font-bold text-cream transition hover:-translate-y-0.5 hover:bg-ink md:inline-flex"
        >
          Visit Raffu <ArrowUpRight size={15} />
        </a>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex size-11 items-center justify-center rounded-full border border-ink/15 bg-white md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-2 max-w-7xl rounded-[28px] border border-ink/10 bg-cream p-4 shadow-float md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-lg font-semibold ${pathname === l.href ? "bg-ink text-cream" : "text-ink"}`}
              >
                {l.label}
              </Link>
            ))}
            <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-clay px-4 py-3.5 font-bold text-cream">
              Visit raffu.com <ArrowUpRight size={17} />
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
