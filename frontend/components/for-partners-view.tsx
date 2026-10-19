'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  FileText,
  HelpCircle,
  Laptop,
  Lock,
  MessageSquare,
  QrCode,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Users
} from 'lucide-react'
import { type Screen } from './data'
import { getStudioUrl } from '@/lib/api'
import { getAuthToken, getAuthRole, getRefreshToken } from '@/lib/cookies'
import { triggerStudioGoogleAuth } from '@/lib/google-auth'

interface ForPartnersViewProps {
  go: (s: Screen) => void
  onOpenAuth?: (role: 'CUSTOMER' | 'STUDIO', authType?: 'signin' | 'signup') => void
  onPartnerRegistered?: (user: any) => void
}

const PARTNER_REQUIREMENTS_DATA = {
  tailors: {
    categoryLabel: 'For Independent Master Tailors & Alteration Ateliers',
    summary:
      'Clear, straightforward standards to certify your workshop and start welcoming nearby alteration and fitting appointments.',
    cards: [
      {
        step: '01 / SPACE & SKILL',
        title: 'Requirements',
        icon: Scissors,
        badge: 'Craftsmanship Check',
        points: [
          'Dedicated, clean fitting space or private changing cabin with full-length mirrors',
          'Minimum 2+ years professional garment tailoring, alteration, or pattern-making experience',
          'Pass a brief craftsmanship quality screening audit (hemming, tapering & finishing standards)',
        ],
      },
      {
        step: '02 / TOOLS & SPECS',
        title: 'Documents & Equipment',
        icon: FileText,
        badge: 'Standard Studio Kit',
        points: [
          'Industrial single-needle lockstitch sewing machine in active working order',
          'Overlock / serger or blind-stitch hemming capability for refined garment edges',
          'Proof of business address or studio lease / shop establishment certificate',
        ],
      },
      {
        step: '03 / FAST ONBOARDING',
        title: 'Signup process',
        icon: CheckCircle2,
        badge: 'Active in 24–48h',
        points: [
          'Submit quick online studio enrollment below with workshop photos & details',
          'Brief studio verification visit and machine calibration check by our artisan lead',
          'Go live on the Raffu network and immediately receive walk-in fitting bookings',
        ],
      },
    ],
  },
  retailers: {
    categoryLabel: 'For Fashion Boutiques, Apparel Retailers & Bridal Stores',
    summary:
      'Turn garment alteration from a return liability into a high-margin in-store service with zero factory setup or overhead.',
    cards: [
      {
        step: '01 / STORE CRITERIA',
        title: 'Storefront Requirements',
        icon: Store,
        badge: 'Physical Storefront',
        points: [
          'Commercial apparel storefront, multi-brand boutique, or designer bridal showroom',
          'Clean, private in-store trial rooms or fitting lounges with customer mirrors',
          'Valid commercial business registration (GSTIN / Trade License / Company ID)',
        ],
      },
      {
        step: '02 / SETUP & TECH',
        title: 'In-Store Setup & Tech',
        icon: ShoppingBag,
        badge: 'No Machinery Needed',
        points: [
          'Tablet, smartphone, or desktop web browser to access the Raffu Partner Portal',
          'Dedicated garment holding rail or staging zone for alteration drop-offs & collections',
          'Designated store associate or alteration desk contact for customer handoffs',
        ],
      },
      {
        step: '03 / LAUNCH & INTEGRATION',
        title: 'Partnership Process',
        icon: Laptop,
        badge: 'Turnkey Retail Service',
        points: [
          'Submit retailer partnership application with store count, location & average traffic',
          'Configure workflow: connect your in-house tailors or route jobs to Raffu master ateliers',
          'Staff onboarding session, customized digital alteration menu, and store QR signage kit',
        ],
      },
    ],
  },
}

export function ForPartnersView({ go, onOpenAuth, onPartnerRegistered }: ForPartnersViewProps) {
  const [partnerTypeTab, setPartnerTypeTab] = useState<'tailors' | 'retailers'>('tailors')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const FAQS = [
    {
      q: 'How do partner payments work?',
      a: 'Customers pay you directly at your studio. When a customer brings in their garments for their booking, you collect payment directly at your counter via card, cash, or UPI. You keep 100% of your earnings immediately with zero platform settlement delays or payout deductions.',
    },
    {
      q: 'Do I have to do any marketing or payment processing?',
      a: 'No marketing required. Raffu handles customer acquisition, SEO, and appointment bookings, sending qualified local alteration clients straight to your studio door. You simply provide the fitting and tailoring service, and collect payment directly from the customer.',
    },
    {
      q: 'How does the in-studio walk-in fitting process work?',
      a: 'When the customer arrives, look up their booking by name, phone, or reference on your Studio Portal. You review their requested alterations, inspect or pin the garment, confirm the timeline and pricing directly with the customer, and update their order status.',
    },
    {
      q: 'What happens if a customer needs an adjustment after pick-up?',
      a: 'If a customer needs a minor fit adjustment, they return directly to your studio for a complimentary re-fitting check. This direct tailor-to-customer connection builds trust and transforms first-time alteration visitors into loyal, repeat store clients.',
    },
    {
      q: 'Can I sell in-store retail merchandise and additional services?',
      a: 'Yes. Every Raffu booking drives physical footfall into your store. Any retail items you sell—such as fabrics, bespoke suiting, accessories, or dry cleaning—are 100% yours, paid directly by the customer to your shop.',
    },
  ]

  return (
    <div className="bg-[#FAF8F5] min-h-screen">

      {/* Hero Section (Dark Luxury Atelier Theme) */}
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

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  onClick={() => {
                    const role = getAuthRole()
                    if (role === 'STUDIO') {
                      const token = getRefreshToken() || getAuthToken()
                      window.location.href = getStudioUrl('/dashboard', token)
                    } else {
                      onOpenAuth?.('STUDIO', 'signup')
                    }
                  }}
                  className="rounded-full bg-white text-[#0F1115] px-8 py-4 text-xs font-extrabold uppercase tracking-wider transition-all hover:bg-[#FAF8F5] active:scale-95 shadow-md cursor-pointer"
                >
                  Enroll Your Studio
                </button>

                <button
                  onClick={() => {
                    const role = getAuthRole()
                    if (role === 'STUDIO') {
                      const token = getRefreshToken() || getAuthToken()
                      window.location.href = getStudioUrl('/dashboard', token)
                    } else {
                      onOpenAuth?.('STUDIO', 'signin')
                    }
                  }}
                  className="text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-2"
                >
                  <span>Already an atelier partner? <span className="underline underline-offset-4 text-white">Log in</span></span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-6 text-xs text-white/60">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#10B981]" /> Direct Customer Payment</span>
                <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#F59E0B]" /> Zero Commission Delays</span>
                <span className="flex items-center gap-1.5"><ShoppingBag size={14} className="text-[#10B981]" /> Keep 100% In-Store Retail</span>
              </div>
            </div>

            {/* Right Column Illustration */}
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

      {/* 3. Section: Why partner with us (Warm Cream Theme) */}
      <section id="why-partner" className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Why partner with us
            </h2>
          </div>

          {/* Clean Curved Capsule Illustration (Uber Driver Windshield style) */}
          <div className="relative w-full max-w-[760px] h-[280px] sm:h-[360px] mx-auto rounded-[36px] overflow-hidden mb-16 bg-white border border-[#E8E1D5] shadow-xs">
            <Image
              src="/images/partner_team_art.jpg"
              alt="Tailoring artisans collaborating in workshop"
              fill
              className="object-cover object-center"
              sizes="(max-width: 760px) 100vw, 760px"
            />
          </div>

          {/* 3 Clean Columns matching Uber */}
          <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Set your own hours
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                You decide when and how often you accept alteration orders. Accept or pause bookings in real-time from your studio portal.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <CreditCard size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Direct customer payments
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                Customers pay you directly at your shop via cash, card terminal, or UPI. No waiting for platform payouts, deductions, or third-party payout delays.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4 shadow-2xs">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-2">
                Get support at every turn
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                If there&apos;s anything you need, you can reach our dedicated studio partner team anytime via phone, chat, or WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <a href="#requirements" className="text-xs font-bold text-[#0F1115] hover:text-[#9E593B] transition-colors inline-flex items-center gap-1.5 underline">
              <span>How studio partnering works</span>
              <ArrowRight size={13} />
            </a>
          </div>

        </div>
      </section>

      {/* 4. Section: Here's what you need to sign up (Warm Cream Theme) */}
      <section id="requirements" className="py-20 sm:py-28 bg-[#F4EFEA] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Here&apos;s what you need to sign up
            </h2>
          </div>

          {/* Type Selector Tabs (Uber style: To drive / To deliver) */}
          <div className="flex border-b border-[#DDD6CB] gap-3 sm:gap-8 mb-6 text-sm font-bold overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setPartnerTypeTab('tailors')}
              className={`pb-3.5 pt-1 px-1 transition-all flex items-center gap-2 cursor-pointer relative ${
                partnerTypeTab === 'tailors'
                  ? 'text-[#0F1115] border-b-2 border-[#0F1115] -mb-px font-extrabold'
                  : 'text-[#7A7E85] hover:text-[#0F1115] border-b-2 border-transparent -mb-px'
              }`}
            >
              <Scissors size={16} className={partnerTypeTab === 'tailors' ? 'text-[#9E593B]' : 'text-[#A0A4AB]'} />
              <span>Independent Tailor Studios</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                  partnerTypeTab === 'tailors' ? 'bg-[#0F1115] text-white' : 'bg-[#EFE9E0] text-[#7A7E85]'
                }`}
              >
                Artisans
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPartnerTypeTab('retailers')}
              className={`pb-3.5 pt-1 px-1 transition-all flex items-center gap-2 cursor-pointer relative ${
                partnerTypeTab === 'retailers'
                  ? 'text-[#0F1115] border-b-2 border-[#0F1115] -mb-px font-extrabold'
                  : 'text-[#7A7E85] hover:text-[#0F1115] border-b-2 border-transparent -mb-px'
              }`}
            >
              <Store size={16} className={partnerTypeTab === 'retailers' ? 'text-[#9E593B]' : 'text-[#A0A4AB]'} />
              <span>Fashion Boutiques &amp; Retailers</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                  partnerTypeTab === 'retailers' ? 'bg-[#0F1115] text-white' : 'bg-[#EFE9E0] text-[#7A7E85]'
                }`}
              >
                Retail
              </span>
            </button>
          </div>

          {/* Dynamic Summary Banner */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-[#5A5D64]">
            <p className="max-w-2xl leading-relaxed">
              {PARTNER_REQUIREMENTS_DATA[partnerTypeTab].summary}
            </p>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E593B] bg-[#9E593B]/10 px-3 py-1 rounded-full w-fit">
              <Check size={12} className="stroke-[3]" />
              {PARTNER_REQUIREMENTS_DATA[partnerTypeTab].categoryLabel}
            </span>
          </div>

          {/* 3 Columns Requirements matching Active Partner Track */}
          <div key={partnerTypeTab} className="grid md:grid-cols-3 gap-8 animate-in fade-in-50 duration-300">
            {PARTNER_REQUIREMENTS_DATA[partnerTypeTab].cards.map((card, idx) => {
              const IconComponent = card.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center shadow-xs">
                        <IconComponent size={18} className="text-[#F9C933]" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E1D5] text-[#5A5D64]">
                        {card.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                      {card.title}
                    </h3>

                    <ul className="space-y-3.5 text-xs text-[#5A5D64] leading-relaxed">
                      {card.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5">
                          <span className="text-[#0F1115] font-black text-sm leading-none mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F0EBE3] flex items-center justify-between text-[11px] text-[#7A7E85]">
                    <span className="inline-flex items-center gap-1 font-medium text-[#9E593B]">
                      <Check size={12} className="stroke-[3]" />
                      {card.badge}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 5. Section: Safety & Quality Standards (Warm Cream Theme) */}
      <section id="safety" className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Safety on the network
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64]">
              Your craftsmanship drives us to continuously raise the bar.
            </p>
            <div className="mt-3">
              <a href="#faq" className="text-xs font-bold text-[#0F1115] underline hover:text-[#9E593B] transition-colors">
                Learn more
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4">
                <ShieldCheck size={20} className="text-[#10B981]" />
              </div>
              <h3 className="text-base font-bold text-[#0F1115] mb-2">
                Direct in-store transactions
              </h3>
              <p className="text-xs text-[#5A5D64] leading-relaxed">
                Customers book their fitting time online and pay you directly at your shop. You maintain full control over your pricing, receipts, and customer relationships.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4">
                <MessageSquare size={20} className="text-[#9E593B]" />
              </div>
              <h3 className="text-base font-bold text-[#0F1115] mb-2">
                Help if you need it
              </h3>
              <p className="text-xs text-[#5A5D64] leading-relaxed">
                The Partner Support button in your app connects you directly to our artisan hotline. We display full customer ticket specs so you can easily clarify adjustments.
              </p>
            </div>

            <div>
              <div className="size-11 rounded-2xl bg-white border border-[#E8E1D5] text-[#0F1115] grid place-items-center mb-4">
                <Users size={20} className="text-[#0F1115]" />
              </div>
              <h3 className="text-base font-bold text-[#0F1115] mb-2">
                Community Guidelines
              </h3>
              <p className="text-xs text-[#5A5D64] leading-relaxed">
                Our standards create trustworthy fittings with verified local customers. Direct master tailor communication ensures perfect fit precision and repeat studio footfall.
              </p>
            </div>
          </div>

        </div>
      </section>



      {/* 7. Section: Frequently Asked Questions (Warm Theme) */}
      <section id="faq" className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E8E1D5]">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6">
          
          <div className="mb-10 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="divide-y divide-[#E8E1D5] border-t border-b border-[#E8E1D5]">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="py-5">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between text-left text-base sm:text-lg font-bold text-[#0F1115] hover:text-[#9E593B] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 text-[#7A7E85]">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-[#5A5D64] leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 8. Partner CTA Banner */}
      <section className="py-20 sm:py-24 bg-[#F4EFEA] border-t border-[#E8E1D5]">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9E593B] block mb-3">
            Fast Onboarding
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
            Ready to partner your studio?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5A5D64] max-w-[540px] mx-auto leading-relaxed">
            Join Raffu&apos;s network of master tailors. Register your atelier in minutes or sign in to your workbench.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                const role = getAuthRole()
                if (role === 'STUDIO') {
                  const token = getRefreshToken() || getAuthToken()
                  window.location.href = getStudioUrl('/dashboard', token)
                } else {
                  onOpenAuth?.('STUDIO', 'signup')
                }
              }}
              className="rounded-full bg-[#0F1115] hover:bg-[#9E593B] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Enroll Your Studio
            </button>

            <button
              onClick={() => {
                const role = getAuthRole()
                if (role === 'STUDIO') {
                  const token = getRefreshToken() || getAuthToken()
                  window.location.href = getStudioUrl('/dashboard', token)
                } else {
                  onOpenAuth?.('STUDIO', 'signin')
                }
              }}
              className="rounded-full border border-[#0F1115]/30 hover:border-[#0F1115] bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0F1115] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            >
              <span>Studio Log in ↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. Bottom Fixed Bar (Uber Drive style) */}
      <div className="bg-[#0F1115] text-white py-4 px-4 sm:px-8 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-[#10B981]" />
          <span className="text-xs font-bold text-white">Enroll your partner studio</span>
        </div>
        <button
          onClick={() => {
            const role = getAuthRole()
            if (role === 'STUDIO') {
              const token = getRefreshToken() || getAuthToken()
              window.location.href = getStudioUrl('/dashboard', token)
            } else {
              onOpenAuth?.('STUDIO', 'signup')
            }
          }}
          className="rounded-full bg-white text-[#0F1115] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          Enroll studio
        </button>
      </div>

    </div>
  )
}
