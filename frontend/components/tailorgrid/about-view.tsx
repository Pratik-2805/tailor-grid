'use client'

import Image from 'next/image'
import { ArrowLeft, ArrowRight, CheckCircle2, Leaf, Scissors, Users } from 'lucide-react'
import { type Screen } from './data'

export function AboutView({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="bg-[#FAF8F5]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div
          className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] opacity-25"
          style={{ background: 'radial-gradient(ellipse, #E8C9B4 0%, transparent 70%)', borderRadius: '50%' }}
        />
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <button onClick={() => go('home')} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C8880] hover:text-[#18191B] mb-10 transition-colors">
            <ArrowLeft size={13} /> Back
          </button>

          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="pill bg-[#F3EFEA] border border-[#E2DAD0] text-[#9E593B] w-fit mb-6">Our Manifesto</p>
              <h1 className="font-serif text-4xl sm:text-6xl leading-[1.02] tracking-[-0.04em] text-[#18191B]">
                Making the clothes you already love fit like they were made for you.
              </h1>
              <p className="mt-6 text-[15px] leading-[1.75] text-[#5A5D64] max-w-[540px]">
                Over 60% of off-the-rack garments don&apos;t fit properly. The result? Unworn clothes in wardrobes and landfills. TailorGrid was built to fix that — by reconnecting people with the generational tailoring craft hidden in their neighbourhood.
              </p>
            </div>

            <div
              className="relative h-[420px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
              style={{ borderRadius: '40% 60% 55% 45% / 48% 52% 48% 52%' }}
            >
              <Image src="/images/tailor_measuring.jpg" alt="Tailor at work" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="py-20 bg-[#F3EFEA]">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="text-center max-w-[560px] mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-[-0.04em] text-[#18191B]">
              Built on three foundational beliefs.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { Icon: Leaf, title: 'Circular Wardrobe', body: 'Extending a garment\'s life by just 9 months cuts its carbon, water, and waste by 20–30%. Alteration is climate action.' },
              { Icon: Scissors, title: 'Master Artisan Standards', body: 'Blind-stitch, chainstitch, overlock — we only partner studios equipped with specialist machinery operated by trained craftspeople.' },
              { Icon: Users, title: 'Hyper-Local Economy', body: 'Revenue flows back into beloved independent neighbourhood shops rather than centralised industrial hubs.' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-[#E2DAD0] hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] transition-all">
                <div className="grid size-12 place-items-center rounded-full bg-[#18191B] text-[#E7C9BA] mb-6">
                  <Icon size={20} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#18191B] mb-3">{title}</h3>
                <p className="text-sm text-[#5A5D64] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#18191B]">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-4 text-center">
            {[
              { v: '1,240+', l: 'Garments Tailored' },
              { v: '4.96 ★', l: 'Average Rating' },
              { v: '42',     l: 'Certified Studios' },
              { v: '100%',   l: 'Fit Guarantee' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-serif text-4xl sm:text-5xl font-bold text-white">{s.v}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#B1ACA4]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center bg-[#FAF8F5]">
        <h3 className="font-serif text-2xl sm:text-3xl text-[#18191B] mb-6">Experience tailoring the way it should be.</h3>
        <button onClick={() => go('booking')} className="rounded-full bg-[#18191B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-all inline-flex items-center gap-2">
          Book a Fitting <ArrowRight size={14} />
        </button>
      </section>
    </div>
  )
}
