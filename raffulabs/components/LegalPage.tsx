import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageHero } from "./PageHero";
import { Reveal } from "./ui";

type Section = { id: string; title: string; body: React.ReactNode };

export function LegalPage({ title, sections }: { title: string; sections: Section[] }) {
  return (
    <>
      <Navbar />
      <main>
        <PageHero eyebrow="Legal" title={title} desc="Last updated: October 2026 · RaffuLabs Inc. (Delaware, USA)" />
        <section className="px-5 pb-28 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[220px_1fr]">
            <nav aria-label="Sections" className="hidden lg:block">
              <ol className="sticky top-32 space-y-3 border-l border-ink/10 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-cocoa transition hover:border-clay hover:text-ink">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="space-y-12">
              {sections.map((s, i) => (
                <Reveal key={s.id} id={s.id} className="scroll-mt-32">
                  <h2 className="font-display text-2xl font-medium sm:text-3xl">
                    <span className="mr-3 font-mono text-base text-clay">0{i + 1}</span>
                    {s.title}
                  </h2>
                  <div className="mt-4 text-lg leading-relaxed text-cocoa">{s.body}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
