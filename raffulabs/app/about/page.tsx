import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Ruler, ShieldCheck, Sparkles, Store, Timer } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { HowItWorks } from "@/components/HowItWorks";
import { Contact } from "@/components/Contact";
import { Eyebrow, Reveal, SectionHeading } from "@/components/ui";
import { btnPrimary, btnSecondary, card } from "@/components/styles";

const PROMISES = [
  { icon: MapPin, title: "Nearby tailoring studios", desc: "You're matched to a vetted studio within 1 to 3 kilometers of your location." },
  { icon: Ruler, title: "Real in-person fittings", desc: "An experienced tailor pins and chalks your clothes so you get a truly custom fit." },
  { icon: Timer, title: "24 to 48 hour turnaround", desc: "No long shipping waits or lost parcels. Drop off and pick up locally." },
];

const HOW_WE_WORK = [
  { icon: Sparkles, title: "Smart studio matching", desc: "Our system matches your alteration with nearby shops that have the right sewing machines and availability." },
  { icon: ShieldCheck, title: "Vetted quality standards", desc: "We review stitch quality, thread matching and finishing so you always receive store-grade work." },
  { icon: Store, title: "Supporting local ateliers", desc: "We help local craftspeople grow their earnings with predictable digital bookings and automated payouts." },
];

const FACTS = [
  ["Company", "RaffuLabs Inc."],
  ["Incorporated", "Delaware, USA"],
  ["Flagship", "Raffu · live at raffu.com"],
  ["Next release", "Raffu for iOS & Android"],
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="About RaffuLabs"
          title={<>A simpler way to get clothes <em className="font-normal text-clay">fitted.</em></>}
          desc={<>RaffuLabs is the parent company behind <strong className="font-semibold text-ink">Raffu</strong>. We started with a simple observation: buying clothes online is easy, but getting them altered is still frustrating.</>}
          image={{ src: "/raffu-images/atelier_studio.jpg", alt: "Inside a bright tailoring atelier", caption: "Live on web · app coming next" }}
        >
          <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className={btnPrimary}>Visit raffu.com <ArrowUpRight size={16} /></a>
          <Link href="/products" className={btnSecondary}>Our products</Link>
        </PageHero>

        <section className="py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <Eyebrow>Why we do this</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(32px,4vw,52px)] leading-[1.05] font-medium tracking-[-0.025em]">
                Real fittings beat home <em className="font-normal text-clay">guesswork</em>, every time.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cocoa">
                Many tailoring apps try to solve fittings by asking you to hold a phone camera in front of a mirror or pull
                a measuring tape around your waist. In reality, tailoring is hands-on: trousers and suits need to be pinned,
                draped and checked while you stand naturally.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-cocoa">
                That&apos;s why Raffu connects you with certified tailoring shops near your home or office. Pick what you want
                fixed online at a fixed price, walk in for a 5-minute fitting, and get your clothes back in 24 to 48 hours.
              </p>
            </Reveal>

            <div className="grid gap-4">
              {PROMISES.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.1} className={`${card} flex gap-5 p-6 transition duration-500 hover:translate-x-1`}>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-clay"><Icon size={20} /></span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 leading-relaxed text-cocoa">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 sm:px-8">
          <Reveal className="relative mx-auto aspect-[21/9] max-w-7xl overflow-hidden rounded-[36px] shadow-float">
            <Image src="/raffu-images/atelier_panoramic_banner.jpg" alt="A partner atelier with fabrics, mannequins and machinery" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-r from-ink/75 via-ink/30 to-transparent" />
            <dl className="absolute inset-y-0 left-0 hidden flex-col justify-center gap-6 p-12 text-cream md:flex">
              {FACTS.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs tracking-[0.2em] text-cream/60 uppercase">{k}</dt>
                  <dd className="mt-1 font-display text-2xl">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <dl className="mx-auto mt-6 grid max-w-7xl grid-cols-2 gap-4 md:hidden">
            {FACTS.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs tracking-[0.2em] text-cocoa uppercase">{k}</dt>
                <dd className="mt-1 font-display text-lg">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading eyebrow="How we work" title={<>Software, sewn into neighborhood <em className="font-normal text-clay">tailor shops.</em></>} desc="We give local tailors modern tools and steady customers, and give customers an easy, reliable way to get great fits." />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {HOW_WE_WORK.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.1} className={`${card} group p-8 transition duration-500 hover:-translate-y-1 hover:shadow-float`}>
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-paper text-clay transition duration-500 group-hover:bg-clay group-hover:text-white"><Icon size={20} /></span>
                  <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-cocoa">{desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        <div className="pt-28" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
