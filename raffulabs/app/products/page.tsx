import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Products } from "@/components/Products";
import { ServicesGallery } from "@/components/ServicesGallery";
import { HowItWorks } from "@/components/HowItWorks";
import { Contact } from "@/components/Contact";
import { btnPrimary, btnSecondary } from "@/components/styles";

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Products by RaffuLabs"
          title={<>Software built for real, local <em className="font-normal text-clay">craftsmanship.</em></>}
          desc={<>From our flagship consumer platform <strong className="font-semibold text-ink">Raffu</strong> to studio partner software and the upcoming mobile app, we build tools that connect people directly with certified neighborhood tailors.</>}
          image={{ src: "/raffu-images/seam_press.jpg", alt: "A steam press finishing a seam", caption: "Live on web · app in pipeline" }}
        >
          <a href="https://raffu.com" target="_blank" rel="noopener noreferrer" className={btnPrimary}>Open raffu.com <ArrowUpRight size={16} /></a>
          <a href="#services" className={btnSecondary}>Browse services <ArrowDown size={16} /></a>
        </PageHero>

        <Products showHeading={false} />
        <ServicesGallery />
        <HowItWorks />
        <div className="pt-28" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
