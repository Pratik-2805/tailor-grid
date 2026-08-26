'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  HelpCircle,
  Laptop,
  Lock,
  Percent,
  QrCode,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users
} from 'lucide-react'
import { type Screen } from './data'

export function ForPartnersView({ go }: { go: (s: Screen) => void }) {
  const [partnerTypeTab, setPartnerTypeTab] = useState<'tailors' | 'retailers'>('tailors')
  const [capacity, setCapacity] = useState(12)
  const [avgPrice, setAvgPrice] = useState(28)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [postcode, setPostcode] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [machines, setMachines] = useState('4-6')

  const estimatedMonthlyPayout = Math.round(capacity * avgPrice * 24 * 0.76) // ~76% partner payout
  const estimatedRetailAddOn = Math.round(capacity * 24 * 0.38 * 65) // 38% conversion with $65 basket

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Sub-Header Navigation (Uber style) */}
      <div className="sticky top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 text-xs font-semibold">
          <div className="flex items-center gap-2 text-[#0F1115]">
            <Store size={16} className="text-[#9E593B]" />
            <span className="font-extrabold text-sm tracking-tight">Studio Partner</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-[#4B5563]">
            <a href="#why-partner" className="hover:text-[#0F1115] transition-colors">Why partner</a>
            <a href="#requirements" className="hover:text-[#0F1115] transition-colors">Requirements</a>
            <a href="#earnings" className="hover:text-[#0F1115] transition-colors">Earnings Calculator</a>
            <a href="#portal" className="hover:text-[#0F1115] transition-colors">Studio Portal</a>
            <a href="#safety" className="hover:text-[#0F1115] transition-colors">Standards</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => go('partner')}
              className="text-xs font-bold text-[#0F1115] hover:text-[#9E593B] transition-colors"
            >
              Log in to Portal
            </button>
            <a
              href="#apply-form"
              className="rounded-full bg-[#0F1115] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>

      {/* 2. Hero Section (Uber Drive Dark Aesthetic) */}
      <section className="bg-[#0F1115] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Copy */}
            <div className="lg:col-span-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.1] text-white">
                Stitch when you want, make what you need
              </h1>
              
              <p className="mt-5 text-base sm:text-lg text-white/70 font-normal leading-relaxed max-w-[480px]">
                Earn on your own schedule. Join our network of certified partner studios to fill idle machine capacity and drive in-store retail footfall.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#apply-form"
                  className="rounded-full bg-white text-[#0F1115] px-8 py-4 text-xs font-extrabold uppercase tracking-wider transition-all hover:bg-[#FAF8F5] active:scale-95 shadow-md"
                >
                  Get started
                </a>

                <button
                  onClick={() => go('partner')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
                >
                  <span>Launch Portal Demo</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-6 text-xs text-white/60">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#10B981]" /> 100% Pre-paid</span>
                <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-[#F59E0B]" /> Weekly Settlement</span>
                <span className="flex items-center gap-1.5"><ShoppingBag size={14} className="text-[#10B981]" /> 38% Retail Upsell</span>
              </div>
            </div>

            {/* Right Column Modern Vector Character Illustration */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-[560px] h-[340px] sm:h-[400px] lg:h-[440px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-[#18191B]">
                <Image
                  src="/images/partner_hero_art.jpg"
                  alt="Master tailor artisan at workstation"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Section: Why partner with us (Uber Style 3 Pillars + Team Illustration) */}
      <section id="why-partner" className="py-20 sm:py-28 bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Why partner with us
            </h2>
            <div className="h-1.5 w-16 bg-[#F9C933] mt-2.5 rounded-full" />
          </div>

          {/* Centered Graphic Illustration */}
          <div className="relative w-full max-w-[800px] h-[240px] sm:h-[320px] mx-auto rounded-3xl overflow-hidden mb-16 bg-[#FAF8F5] border border-[#E5E7EB] shadow-xs">
            <Image
              src="/images/partner_team_art.jpg"
              alt="Tailoring artisans collaborating in studio"
              fill
              className="object-cover object-center"
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>

          {/* 3 Clean Columns matching Uber */}
          <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
            <div>
              <div className="size-11 rounded-2xl bg-[#F8F9FD] border border-[#E5E7EB] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Set your own capacity
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                You decide when you want to take orders and how many garments per day your machines can handle. Accept or pause bookings in real-time.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-[#F8F9FD] border border-[#E5E7EB] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <CreditCard size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Get paid fast
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Guaranteed 75% to 80% partner share on every alteration ticket, paid via automatic direct deposit into your bank account every single week.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-[#F8F9FD] border border-[#E5E7EB] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <ShoppingBag size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Retail footfall cross-sell
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                38% of customers visiting your studio for alterations purchase in-store merchandise (fabrics, ties, shirts, accessories) during their fitting.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Interactive Earnings & Cross-Sell Calculator */}
      <section id="earnings" className="py-20 sm:py-24 bg-[#0F1115] text-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-[700px] mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F9C933] block mb-2">
              Interactive Income Model
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Estimate your monthly studio earnings
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              Adjust the sliders below to see your potential alteration revenue and retail cross-sell boost.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Box */}
            <div className="lg:col-span-7 rounded-3xl bg-[#1A1D24] p-6 sm:p-8 border border-white/10 space-y-6">
              
              {/* Slider 1: Capacity */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-white/80">Daily Alterations Completed:</span>
                  <span className="font-mono text-base text-[#F9C933]">{capacity} items / day</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="35"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full accent-[#F9C933] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>3 (Boutique)</span>
                  <span>15 (Mid-size atelier)</span>
                  <span>35+ (Full factory capacity)</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-white/80">Average Alteration Service Price:</span>
                  <span className="font-mono text-base text-[#F9C933]">${avgPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(Number(e.target.value))}
                  className="w-full accent-[#F9C933] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>$20 (Trousers/Hems)</span>
                  <span>$35 (Jackets/Dresses)</span>
                  <span>$60+ (Suits/Bespoke)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-white/60">
                💡 Calculated based on 24 working days/month at ~76% partner take-home rate.
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="rounded-3xl bg-[#1A1D24] p-6 border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 block">
                  Estimated Monthly Alteration Payout
                </span>
                <p className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-white">
                  ${estimatedMonthlyPayout.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#10B981] font-semibold">Weekly direct bank settlement</p>
              </div>

              <div className="rounded-3xl bg-[#1A1D24] p-6 border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 block">
                  Estimated Added In-Store Retail Revenue
                </span>
                <p className="mt-2 font-serif text-3xl font-bold text-[#F9C933]">
                  +${estimatedRetailAddOn.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-white/60">Based on 38% fitting customer retail conversion</p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. Section: Here's what you need to sign up (Uber Tabs & Requirements) */}
      <section id="requirements" className="py-20 sm:py-28 bg-[#F8F9FD] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Here&apos;s what you need to partner
            </h2>
            <div className="h-1.5 w-16 bg-[#F9C933] mt-2.5 rounded-full" />
          </div>

          {/* Type Selector Tabs (Uber style: To drive / To deliver) */}
          <div className="flex border-b border-[#E5E7EB] gap-8 mb-10 text-sm font-bold">
            <button
              onClick={() => setPartnerTypeTab('tailors')}
              className={`pb-3 transition-colors ${
                partnerTypeTab === 'tailors'
                  ? 'border-b-2 border-[#0F1115] text-[#0F1115]'
                  : 'text-[#6B7280] hover:text-[#0F1115]'
              }`}
            >
              Independent Tailor Studios
            </button>
            <button
              onClick={() => setPartnerTypeTab('retailers')}
              className={`pb-3 transition-colors ${
                partnerTypeTab === 'retailers'
                  ? 'border-b-2 border-[#0F1115] text-[#0F1115]'
                  : 'text-[#6B7280] hover:text-[#0F1115]'
              }`}
            >
              Fashion Boutiques &amp; Retailers
            </button>
          </div>

          {/* 3 Columns Requirements (Uber style) */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Col 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs">
              <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center mb-4">
                <Star size={18} className="text-[#F9C933]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                Studio Requirements
              </h3>
              <ul className="space-y-3 text-xs text-[#4B5563]">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>Dedicated, clean fitting space or private changing room with mirrors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>Minimum 2+ years professional garment alteration experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>Commitment to standard 24h/48h turnaround times</span>
                </li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs">
              <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center mb-4">
                <Scissors size={18} className="text-[#F9C933]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                Equipment &amp; Machinery
              </h3>
              <ul className="space-y-3 text-xs text-[#4B5563]">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>Industrial single-needle lockstitch sewing machine</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>Overlock / serger and blind-stitch hemming capability</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>Professional gravity-feed steam press station</span>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs">
              <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center mb-4">
                <FileText size={18} className="text-[#F9C933]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                Onboarding Process
              </h3>
              <ul className="space-y-3 text-xs text-[#4B5563]">
                <li className="flex items-start gap-2">
                  <span className="size-4 rounded-full bg-[#0F1115] text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">1</span>
                  <span>Submit studio application form with location &amp; machine details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-4 rounded-full bg-[#0F1115] text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">2</span>
                  <span>Brief studio visit &amp; craftsmanship quality audit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-4 rounded-full bg-[#0F1115] text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">3</span>
                  <span>Go live on network and receive walk-in fitting orders</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Section: Standards & Partner Safety (Uber Style 3 Pillars) */}
      <section id="safety" className="py-20 sm:py-28 bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Safety and Quality Standards
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Our standards protect both your time and your craftsmanship reputation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="size-11 rounded-2xl bg-[#F8F9FD] border border-[#E5E7EB] text-[#0F1115] grid place-items-center mb-4">
                <ShieldCheck size={20} className="text-[#10B981]" />
              </div>
              <h3 className="text-base font-bold text-[#0F1115] mb-2">
                Protection on every order
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Every ticket is 100% pre-paid via TailorGrid. If a customer fails to collect, your full studio payout is settled automatically.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-[#F8F9FD] border border-[#E5E7EB] text-[#0F1115] grid place-items-center mb-4">
                <HelpCircle size={20} className="text-[#9E593B]" />
              </div>
              <h3 className="text-base font-bold text-[#0F1115] mb-2">
                Help whenever you need it
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Dedicated Partner Support hotline available 6 days a week for customer rescheduling, complex fit specs, or payment questions.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-[#F8F9FD] border border-[#E5E7EB] text-[#0F1115] grid place-items-center mb-4">
                <Users size={20} className="text-[#0F1115]" />
              </div>
              <h3 className="text-base font-bold text-[#0F1115] mb-2">
                Network Community Standards
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Our 100% Free Re-fit Guarantee is backed by the platform. If any adjustment is ever requested, we subsidize the additional artisan time.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Section: The Studio Portal (Uber Driver App Preview) */}
      <section id="portal" className="py-20 sm:py-24 bg-[#F8F9FD] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
                The Partner Studio Portal
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-[540px]">
                Easy to use and reliable, the portal was built for tailors, with tailors. Scan QR passes at the counter, view precision pinning specs, monitor SLA turnaround timers, and log in-store retail purchases with 1 click.
              </p>

              {/* QR Download Mock (Uber style) */}
              <div className="mt-8 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs max-w-[460px] flex items-center gap-5">
                <div className="size-16 rounded-2xl bg-[#0F1115] text-white grid place-items-center shrink-0">
                  <QrCode size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F1115]">Access Studio Portal</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">Works on any tablet, iPad, or desktop</p>
                  <button
                    onClick={() => go('partner')}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#9E593B] hover:text-[#0F1115] transition-colors"
                  >
                    <span>Launch Interactive Demo</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Portal Tablet Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#0F1115] text-white p-6 sm:p-7 shadow-xl border border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-xs font-bold">Studio Portal · Live</span>
                  </div>
                  <span className="font-mono text-xs text-[#F9C933] font-bold">Today: $185.00</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>#TG-1048 · Jeans Hemming</span>
                      <span className="text-[#10B981]">$21.00 Payout</span>
                    </div>
                    <p className="text-[11px] text-white/60">Fitting Window: 11:30 AM · Camilla H.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>#TG-1049 · Shirt Slimming</span>
                      <span className="text-[#10B981]">$19.00 Payout</span>
                    </div>
                    <p className="text-[11px] text-white/60">Fitting Window: 02:00 PM · David K.</p>
                  </div>
                </div>

                <button
                  onClick={() => go('partner')}
                  className="mt-5 w-full rounded-2xl bg-white text-[#0F1115] py-3 text-xs font-extrabold uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors"
                >
                  Open Studio Portal
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Partner Application Form */}
      <section id="apply-form" className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6">
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9E593B] block mb-2">
              Get Started in 48 Hours
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Apply to partner your studio
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Complete the details below. Our partner operations team audits and activates your studio within 48 hours.
            </p>
          </div>

          {formSubmitted ? (
            <div className="rounded-3xl bg-[#F8F9FD] p-8 sm:p-12 text-center border border-[#10B981]/30 shadow-xs">
              <div className="size-16 rounded-full bg-[#ECFDF5] text-[#065F46] grid place-items-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0F1115]">Application Received</h3>
              <p className="mt-2 text-sm text-[#4B5563] max-w-[480px] mx-auto">
                Thank you, <strong className="text-[#0F1115]">{contactName}</strong>. Our partner onboarding director will contact <strong className="text-[#0F1115]">{email}</strong> within 24 hours to schedule a brief studio visit and machine calibration check.
              </p>
              <button
                onClick={() => go('partner')}
                className="mt-6 rounded-full bg-[#0F1115] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
              >
                Launch Studio Portal Demo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#F8F9FD] p-6 sm:p-10 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Studio / Business Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. West Broadway Tailors"
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">ZIP Code / Location</label>
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. 10012 or 90210"
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Lead Tailor / Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Marco Rossi"
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. marco@ateliersoho.com"
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Number of Machines</label>
                  <select
                    value={machines}
                    onChange={(e) => setMachines(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none cursor-pointer"
                  >
                    <option value="2-3">2 – 3 Machines</option>
                    <option value="4-6">4 – 6 Machines</option>
                    <option value="7+">7+ Machines</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Daily Garment Capacity</label>
                  <select
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none cursor-pointer"
                  >
                    <option>5 – 15 items/day</option>
                    <option>15 – 30 items/day</option>
                    <option>30+ items/day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Do you sell retail goods?</label>
                  <select
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-medium focus:border-[#0F1115] focus:outline-none cursor-pointer"
                  >
                    <option>Yes (Fabrics, Shirts, Goods)</option>
                    <option>No (Alterations Only)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-2xl bg-[#0F1115] hover:bg-[#9E593B] py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                Submit Partner Application
              </button>
              
              <p className="text-[11px] text-[#6B7280] text-center mt-2">
                By submitting, you agree to TailorGrid partner studio quality standards and audit terms.
              </p>
            </form>
          )}

        </div>
      </section>

      {/* 9. Bottom Fixed Bar (Uber Drive style) */}
      <div className="bg-[#0F1115] text-white py-4 px-4 sm:px-8 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-[#10B981]" />
          <span className="text-xs font-bold text-white">Partner your studio with TailorGrid</span>
        </div>
        <a
          href="#apply-form"
          className="rounded-full bg-white text-[#0F1115] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors"
        >
          Sign up to partner
        </a>
      </div>

    </div>
  )
}
