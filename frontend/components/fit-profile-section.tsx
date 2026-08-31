'use client'

import Image from 'next/image'
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Sparkles } from 'lucide-react'
import { type Screen } from './data'

export function FitProfileSection({ go }: { go: (s: Screen) => void }) {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

          {/* Left Column: Visual Card Showcase */}
          <div className="lg:col-span-6 relative">
            {/* Main Atelier Image Card */}
            <div className="relative h-[360px] sm:h-[440px] rounded-3xl overflow-hidden shadow-lg border border-[#E5E7EB]">
              <Image
                src="/images/tailor_measuring.jpg"
                alt="Master tailor taking measurements"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/80 via-[#0F1115]/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
                  <Sparkles size={12} className="text-[#F59E0B]" />
                  Zero-Re-Measuring Engine
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold">
                  Measure once, fit forever.
                </h3>
              </div>
            </div>

            {/* Floating Live Fit Passport Card (Uber/Rapido style profile badge) */}
            <div className="absolute -bottom-6 sm:-bottom-8 right-4 sm:right-6 bg-white p-5 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-[#E5E7EB] max-w-[240px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9E593B] tracking-wider block">Fit Passport</span>
                  <span className="text-xs font-bold text-[#0F1115]">#TG-7892-F</span>
                </div>
                <div className="size-7 rounded-lg bg-[#0F1115] text-white grid place-items-center">
                  <QrCode size={14} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Trouser Inseam', val: '29.0" (Slight Break)' },
                  { label: 'Waist Taper', val: '28.5" (High-Rise)' },
                  { label: 'Sleeve Length', val: '23.5" (Wrist Bone)' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#6B7280]">{item.label}</span>
                    <span className="font-bold text-[#0F1115]">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F3F4F6] flex items-center gap-1.5 text-[10px] font-semibold text-[#10B981]">
                <ShieldCheck size={12} />
                <span>Synced across 42 Ateliers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Value props */}
          <div className="lg:col-span-6 lg:pl-6">
            <span className="pill-badge bg-[#FAF8F5] text-[#9E593B] border border-[#EBE6DF] mb-3">
              Digital Fit Passport
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1115] tracking-tight leading-[1.1]">
              Never explain your hem length again.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#4B5563]">
              Every alteration pinned by our Doorstep Darzi or partner studios is automatically saved into your reusable Digital Fit Passport.
            </p>

            <div className="mt-6 space-y-3.5">
              {[
                { title: 'Automatic Measurement Sync', desc: 'Saved automatically after every fitting session—zero forms.' },
                { title: 'Brand & Cut Memory', desc: 'Remembers how your Levi\'s, Suitsupply, Zara or Totême pieces sit.' },
                { title: 'Portable Across All 42 Studios', desc: 'Walk into any partner atelier in London and collect with zero guessing.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-[#FAF8F5] border border-[#EBE6DF] grid place-items-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-[#9E593B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F1115]">{item.title}</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => go('orders')}
                className="flex items-center gap-2 rounded-full bg-[#0F1115] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#9E593B] active:scale-95 shadow-2xs"
              >
                <span>View My Orders &amp; Passport</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

