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
  Sparkles,
  Star,
  Store,
  Users
} from 'lucide-react'
import { type Screen } from './data'
import { toast } from 'react-toastify'
import { signUpUser, getStudioUrl } from '@/lib/api'

interface ForPartnersViewProps {
  go: (s: Screen) => void
  onOpenAuth?: (role: 'CUSTOMER' | 'STUDIO', authType?: 'signin' | 'signup') => void
  onPartnerRegistered?: (user: any) => void
}

export function ForPartnersView({ go, onOpenAuth, onPartnerRegistered }: ForPartnersViewProps) {
  const [partnerTypeTab, setPartnerTypeTab] = useState<'tailors' | 'retailers'>('tailors')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [postcode, setPostcode] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [machines, setMachines] = useState('4-6')

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await signUpUser({
        name: contactName.trim() || 'Master Tailor',
        email: email.trim(),
        storeName: storeName.trim(),
        postcode: postcode.trim(),
        machines,
        role: 'STUDIO',
      })
      if (res && res.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tg_user', JSON.stringify(res.user))
          localStorage.setItem('tg_user_role', 'STUDIO')
          window.location.href = '/partner/onboarding'
          return
        }
        if (onPartnerRegistered) {
          onPartnerRegistered(res.user)
        }
      }
      toast.success('Partner application submitted successfully!', { position: 'top-center' })
    } catch (err) {
      console.warn('Registration notice:', err)
      toast.success('Application received! Our team will contact you within 24 hours.', { position: 'top-center' })
    }
    setSubmitting(false)
    setFormSubmitted(true)
  }

  const FAQS = [
    {
      q: 'How do partner payouts and settlements work?',
      a: 'All partner alteration payouts are automatically calculated and deposited directly into your bank account every week via direct bank transfer with zero invoicing or chasing.',
    },
    {
      q: 'Do I have to do any marketing or payment processing?',
      a: 'No. Darzi handles 100% of customer acquisition, SEO, digital booking, and secure upfront online payment processing. Customers arrive at your studio with a pre-paid Fitting Pass.',
    },
    {
      q: 'How does the 5-minute walk-in fitting process work?',
      a: 'When a customer arrives, you scan their 4-digit OTP or QR pass on the Studio Portal tablet app. Their digital tailoring instructions and garment specifications load instantly. You pin the garment in 5 minutes and hand them a confirmation receipt.',
    },
    {
      q: 'What happens if a customer needs an adjustment after pick-up?',
      a: 'Darzi protects partner studios with our 100% Free Re-fit Guarantee. In the rare event of a minor adjustment, Darzi subsidizes the additional artisan labor so your shop is always fairly compensated.',
    },
    {
      q: 'Can I track in-store retail merchandise purchases?',
      a: 'Yes. Our Studio Portal features a 1-click retail cross-sell logger. Studies across our network show 38% of alteration customers purchase in-store retail products (fabrics, ties, shirts, accessories) during their fitting.',
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

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenAuth?.('STUDIO', 'signup')}
                  className="rounded-full bg-white text-[#0F1115] px-8 py-4 text-xs font-extrabold uppercase tracking-wider transition-all hover:bg-[#FAF8F5] active:scale-95 shadow-md cursor-pointer"
                >
                  Get started
                </button>

                <button
                  onClick={() => {
                    const role = typeof window !== 'undefined' ? localStorage.getItem('tg_user_role') : null
                    const token = typeof window !== 'undefined' && role === 'STUDIO' ? localStorage.getItem('tg_token') : null
                    window.location.href = getStudioUrl('/', token)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span>Studio Log in ↗</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-6 text-xs text-white/60">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#10B981]" /> 100% Pre-paid</span>
                <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#F59E0B]" /> Weekly Settlements</span>
                <span className="flex items-center gap-1.5"><ShoppingBag size={14} className="text-[#10B981]" /> 38% Retail Upsell</span>
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
                Get paid fast
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D64] leading-relaxed">
                Guaranteed high partner margin on every alteration ticket, paid via automatic direct deposit into your bank account every week.
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
          <div className="flex border-b border-[#DDD6CB] gap-8 mb-10 text-sm font-bold">
            <button
              onClick={() => setPartnerTypeTab('tailors')}
              className={`pb-3 transition-colors ${
                partnerTypeTab === 'tailors'
                  ? 'border-b-2 border-[#0F1115] text-[#0F1115]'
                  : 'text-[#7A7E85] hover:text-[#0F1115]'
              }`}
            >
              Independent Tailor Studios
            </button>
            <button
              onClick={() => setPartnerTypeTab('retailers')}
              className={`pb-3 transition-colors ${
                partnerTypeTab === 'retailers'
                  ? 'border-b-2 border-[#0F1115] text-[#0F1115]'
                  : 'text-[#7A7E85] hover:text-[#0F1115]'
              }`}
            >
              Fashion Boutiques &amp; Retailers
            </button>
          </div>

          {/* 3 Columns Requirements matching Uber */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Col 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-xs">
              <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center mb-4">
                <Star size={18} className="text-[#F9C933]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                Requirements
              </h3>
              <ul className="space-y-3 text-xs text-[#5A5D64]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Dedicated, clean fitting space or private changing cabin with mirrors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Minimum 2+ years professional garment tailoring or alteration experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Clear a brief craftsmanship quality screening audit</span>
                </li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-xs">
              <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center mb-4">
                <FileText size={18} className="text-[#F9C933]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                Documents &amp; Equipment
              </h3>
              <ul className="space-y-3 text-xs text-[#5A5D64]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Industrial single-needle lockstitch sewing machine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Overlock / serger or blind-stitch hemming capability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Proof of business address or studio lease / registration</span>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-xs">
              <div className="size-10 rounded-2xl bg-[#0F1115] text-white grid place-items-center mb-4">
                <CheckCircle2 size={18} className="text-[#F9C933]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1115] mb-4">
                Signup process
              </h3>
              <ul className="space-y-3 text-xs text-[#5A5D64]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Submit online partner application below with studio details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Brief studio visit and machine calibration check</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F1115] font-bold">•</span>
                  <span>Go live on network and receive walk-in fitting orders</span>
                </li>
              </ul>
            </div>

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
                Protection on every order
              </h3>
              <p className="text-xs text-[#5A5D64] leading-relaxed">
                Every alteration ticket is 100% pre-paid via Darzi. If a customer cancels late or fails to pick up, your full payout is guaranteed and settled automatically.
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
                Our standards help create safe connections and positive fittings with every customer. Our 100% Free Re-fit Guarantee is backed and subsidized by the platform.
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

      {/* 8. Partner Application Form (Warm Theme) */}
      <section id="apply-form" className="py-20 sm:py-28 bg-[#F4EFEA]">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6">
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9E593B] block mb-2">
              Fast Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1115] tracking-tight">
              Apply to partner your studio
            </h2>
            <p className="mt-2 text-sm text-[#5A5D64]">
              Complete the details below. Our team audits and activates your studio within 48 hours.
            </p>
          </div>

          {formSubmitted ? (
            <div className="rounded-3xl bg-white p-8 sm:p-12 text-center border border-[#10B981]/30 shadow-xs">
              <div className="size-16 rounded-full bg-[#ECFDF5] text-[#065F46] grid place-items-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0F1115]">Application Received</h3>
              <p className="mt-2 text-sm text-[#5A5D64] max-w-[480px] mx-auto">
                Thank you, <strong className="text-[#0F1115]">{contactName}</strong>. Our partner onboarding director will contact <strong className="text-[#0F1115]">{email}</strong> within 24 hours to schedule a brief studio visit and machine calibration check.
              </p>
              <button
                onClick={() => {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
                  window.location.href = getStudioUrl('/', token)
                }}
                className="mt-6 rounded-full bg-[#0F1115] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#9E593B] transition-colors"
              >
                Launch Studio Portal Demo ↗
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-4">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Studio / Business Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. West Broadway Tailors"
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none transition-colors"
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
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none transition-colors"
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
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none transition-colors"
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
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-4 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Number of Machines</label>
                  <select
                    value={machines}
                    onChange={(e) => setMachines(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-3 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="2-3">2 – 3 Machines</option>
                    <option value="4-6">4 – 6 Machines</option>
                    <option value="7+">7+ Machines</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Daily Garment Capacity</label>
                  <select
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-3 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option>5 – 15 items/day</option>
                    <option>15 – 30 items/day</option>
                    <option>30+ items/day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F1115] mb-1.5">Do you sell retail goods?</label>
                  <select
                    className="w-full rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] px-3 py-3 text-sm font-medium focus:border-[#0F1115] focus:bg-white focus:outline-none cursor-pointer"
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
              
              <p className="text-[11px] text-[#7A7E85] text-center mt-2">
                By submitting, you agree to Darzi partner studio quality standards and audit terms.
              </p>
            </form>
          )}

        </div>
      </section>

      {/* 9. Bottom Fixed Bar (Uber Drive style) */}
      <div className="bg-[#0F1115] text-white py-4 px-4 sm:px-8 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-[#10B981]" />
          <span className="text-xs font-bold text-white">Sign up to partner your studio</span>
        </div>
        <button
          onClick={() => onOpenAuth?.('STUDIO', 'signup')}
          className="rounded-full bg-white text-[#0F1115] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          Sign up to partner
        </button>
      </div>

    </div>
  )
}
