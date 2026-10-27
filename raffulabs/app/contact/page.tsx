"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Building2, Clock, Mail, Newspaper, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui";
import { btnPrimary, card, ease } from "@/components/styles";

const TOPICS = [
  { label: "Studio partnership", email: "studios@raffu.com" },
  { label: "Business & uniforms", email: "hello@raffulabs.in" },
  { label: "App early access", email: "hello@raffulabs.in" },
  { label: "Careers & press", email: "careers@raffulabs.in" },
  { label: "General question", email: "hello@raffulabs.in" },
];

const CHANNELS = [
  { icon: Store, title: "Studio partnerships", email: "studios@raffu.com", desc: "Run a tailoring shop? Join the Raffu partner network." },
  { icon: Mail, title: "General enquiries", email: "hello@raffulabs.in", desc: "Questions about RaffuLabs, Raffu or our products." },
  { icon: Newspaper, title: "Careers & press", email: "careers@raffulabs.in", desc: "Job opportunities, interviews and press kits." },
];

const input = "w-full rounded-2xl border border-ink/10 bg-cream/60 px-4 py-3.5 text-ink outline-none transition placeholder:text-cocoa/50 focus:border-clay focus:bg-white focus:ring-4 focus:ring-clay/10";

export default function ContactPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [opened, setOpened] = useState(false);

  // No backend: hand the message to the visitor's email client, addressed to the right team.
  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${topic.email}?subject=${encodeURIComponent(`[${topic.label}] Message from ${form.name}`)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Contact & partners"
          title={<>Start a conversation with <em className="font-normal text-clay">RaffuLabs.</em></>}
          desc="Whether you run an artisan tailoring studio, lead a team that needs uniform fittings, or have a press enquiry, our team is ready to connect."
        />

        <section className="px-5 pb-28 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              {CHANNELS.map(({ icon: Icon, title, email, desc }, i) => (
                <Reveal key={email} delay={i * 0.08}>
                  <a href={`mailto:${email}`} className={`${card} group flex gap-5 p-6 transition duration-500 hover:-translate-y-0.5 hover:shadow-float`}>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-clay transition duration-500 group-hover:bg-clay group-hover:text-white"><Icon size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold tracking-[0.15em] text-cocoa uppercase">{title}</span>
                      <span className="mt-1 flex items-center justify-between gap-2 text-lg font-semibold">{email} <ArrowUpRight size={18} className="shrink-0 text-cocoa transition group-hover:rotate-45 group-hover:text-clay" /></span>
                      <span className="mt-1 block text-sm text-cocoa">{desc}</span>
                    </span>
                  </a>
                </Reveal>
              ))}
              <Reveal delay={0.3} className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 text-sm text-cocoa"><Clock size={18} className="text-clay" /> Replies within 24 hours</div>
                <div className="flex items-center gap-3 text-sm text-cocoa"><Building2 size={18} className="text-clay" /> RaffuLabs Inc. · Delaware, USA</div>
              </Reveal>
            </div>

            <Reveal delay={0.1} className={`${card} relative overflow-hidden p-7 sm:p-10`}>
              <AnimatePresence mode="wait" initial={false}>
                {opened ? (
                  <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }} className="flex min-h-[420px] flex-col items-start justify-center">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-sage/40 text-moss"><Mail size={24} /></span>
                    <h2 className="mt-6 font-display text-3xl font-medium">Your email app should be open.</h2>
                    <p className="mt-3 max-w-md leading-relaxed text-cocoa">
                      We&apos;ve drafted your message to <strong className="font-semibold text-ink">{topic.email}</strong>. Hit send there and we&apos;ll reply within 24 hours.
                      If nothing opened, email us directly at that address.
                    </p>
                    <button onClick={() => setOpened(false)} className="mt-8 text-sm font-semibold text-clay">← Back to the form</button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }} className="space-y-6">
                    <div>
                      <h2 className="font-display text-3xl font-medium">Send us a message</h2>
                      <p className="mt-2 text-cocoa">Pick a topic so it reaches the right team.</p>
                    </div>

                    <LayoutGroup>
                      <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => {
                          const active = t.label === topic.label;
                          return (
                            <button key={t.label} type="button" role="radio" aria-checked={active} onClick={() => setTopic(t)}
                              className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? "border-ink text-cream" : "border-ink/10 text-cocoa hover:border-ink/30 hover:text-ink"}`}>
                              {active && <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                              <span className="relative">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </LayoutGroup>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium">Full name</span>
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Kumar" className={`${input} mt-2`} />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium">Email</span>
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" className={`${input} mt-2`} />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-medium">Message</span>
                      <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you have in mind…" className={`${input} mt-2 resize-none`} />
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <p className="text-sm text-cocoa">Goes to <motion.span key={topic.email} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-semibold text-ink">{topic.email}</motion.span></p>
                      <button type="submit" className={btnPrimary}>Send message <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
