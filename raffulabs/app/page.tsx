import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TapeMarquee } from "@/components/TapeMarquee";
import { About } from "@/components/About";
import { Products } from "@/components/Products";
import { HowItWorks } from "@/components/HowItWorks";
import { Mission } from "@/components/Mission";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <TapeMarquee />
        <About />
        <Products />
        <HowItWorks />
        <Mission />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
