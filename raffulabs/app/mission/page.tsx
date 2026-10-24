import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Mission } from "@/components/Mission";
import { Contact } from "@/components/Contact";
import { Counter } from "@/components/About";
import { Reveal } from "@/components/ui";

const IMPACT = [
  { value: <Counter prefix="" to={40} suffix="%+" />, title: "Average partner income increase", desc: "Studios on the Raffu network receive steady customer flow, cutting dependence on seasonal bridal peaks." },
  { value: "Zero", title: "Shipping & packaging waste", desc: "No plastic courier bags, bubble wrap or delivery vans. Everything happens within walking distance." },
  { value: <Counter prefix="" to={100} suffix="%" />, title: "Fit accuracy guarantee", desc: "In-person pinning and in-studio try-ons make sure the garment fits before it leaves the atelier." },
];

export default function MissionPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Mission & values"
          title={<>Championing craft. Empowering <em className="font-normal text-clay">local ateliers.</em></>}
          desc="Master tailoring belongs in the hands of skilled craftspeople, not couriers. We allocate customers to audited local ateliers for transparent in-person fitting, standardized pricing and sustainable garment care."
          image={{ src: "/raffu-images/garments_rack.jpg", alt: "A rack of tailored garments in natural light" }}
        />

        <section className="px-5 sm:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[36px] border border-ink/[0.07] bg-white shadow-card md:grid-cols-3 md:divide-x md:divide-ink/10">
            {IMPACT.map(({ value, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.1} className="border-b border-ink/10 p-8 last:border-b-0 md:border-b-0 lg:p-12">
                <p className="font-display text-[clamp(44px,5vw,68px)] leading-none font-medium tracking-tight text-clay">{value}</p>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-cocoa">{desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <Mission showLink={false} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
