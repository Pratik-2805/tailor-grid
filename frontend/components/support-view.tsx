'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  KeyRound,
  MessageCircle,
  RefreshCw,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { Screen } from './data'

interface FaqItem {
  q: string
  a: string
  category: 'guarantee' | 'process' | 'measuring' | 'pricing'
}

const FAQS: FaqItem[] = [
  {
    category: 'guarantee',
    q: 'How does the 100% Fit Guarantee work?',
    a: 'Every alteration booked through Darzi is fully guaranteed. Once your tailored garment is completed and collected at the partner atelier, you are invited to try it on in our private fitting room. If anything is not completely true to your booked measurements or silhouette expectations, the studio performs complimentary micro-adjustments within 24–48 hours at zero additional cost.',
  },
  {
    category: 'guarantee',
    q: 'What if I am still not satisfied after a second fitting?',
    a: 'In the extremely rare event that an alteration cannot be perfected to the booked specifications, our master tailor concierge will either reassign the garment to a senior specialist atelier or issue a full refund to your original payment method under our Zero-Risk Fit Assurance policy.',
  },
  {
    category: 'process',
    q: 'What is the 4-digit PIN and why is it needed at drop-off?',
    a: 'When your booking is confirmed, a unique 4-digit PIN (e.g. 4821) is generated in your Digital Order Passport. When you drop off your garment at the partner atelier, the craftsman verifies this PIN on their workbench terminal. This ensures full garment custody, links your exact fabric condition notes, and prevents any order mix-ups.',
  },
  {
    category: 'process',
    q: 'What are the standard turnaround times for alterations?',
    a: 'Standard alterations (trouser hems, waistband adjustments, jean tapering, basic repairs) have a 48-hour SLA. Express turnaround (24-hour service) is available on selected everyday garments. Luxury bespoke suits, intricate evening gowns, and heavy leather pieces typically require 72 hours for meticulous industrial finishing.',
  },
  {
    category: 'measuring',
    q: 'How do I provide my measurements if I don’t know them?',
    a: 'You have three simple options: (1) Use our guided visual measurement tutorial during booking; (2) Pin the garment yourself at home using standard safety pins at the exact fold line; or (3) Select "Studio Fitting" during checkout and our master tailor will pin and measure your garment in person at the atelier.',
  },
  {
    category: 'pricing',
    q: 'Are the prices shown on Darzi fixed or will the atelier charge extra?',
    a: 'All prices on Darzi are 100% upfront and standardized across all 500+ certified partner studios. The price you see at checkout includes the alteration, matching OEM industrial thread, pressing, and our 100% Fit Guarantee. No hidden workshop surcharges or surprise fees are permitted.',
  },
  {
    category: 'process',
    q: 'How do I track the progress of my garment?',
    a: 'You can track your alteration in real time from your Orders screen or Order Status link. The workbench updates through stages: "Allocated", "Accepted", "Work in Progress", "Ready for Fitting", and "Collected". You also receive instant SMS and email notifications at each milestone.',
  },
]

export function SupportView({ go }: { go: (s: Screen | string) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18191B] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A5D64] hover:text-[#18191B] mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#059669] text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={13} />
            <span>Customer Care &amp; Fit Help Center</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F1115] mb-4">
            How Can We Assist Your Wardrobe?
          </h1>
          <p className="text-sm sm:text-base text-[#5A5D64] leading-relaxed">
            Find immediate answers on the 100% Fit Guarantee, atelier drop-offs, turnaround times, and garment care.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7E85]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic (e.g. Fit guarantee, PIN, turnaround, pricing)..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-[#0F1115] bg-white border border-[#E0D9CF] rounded-full shadow-xs focus:outline-none focus:border-[#9E593B] transition-all"
            />
          </div>
        </div>

        {/* 3 Core Trust Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="bg-white rounded-3xl p-6 border border-[#EBE6DF] shadow-xs space-y-3">
            <div className="size-11 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] grid place-items-center text-[#10B981]">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-[#0F1115]">100% Fit Guarantee</h3>
            <p className="text-xs text-[#5A5D64] leading-relaxed">
              Try on your garment at the atelier. Any fit adjustments needed are performed free of charge within 24–48 hours.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#EBE6DF] shadow-xs space-y-3">
            <div className="size-11 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] grid place-items-center text-[#3B82F6]">
              <KeyRound size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-[#0F1115]">PIN Drop-off Protocol</h3>
            <p className="text-xs text-[#5A5D64] leading-relaxed">
              Your 4-digit PIN guarantees secure handover, ensuring your exact garment instructions are matched to the master tailor.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#EBE6DF] shadow-xs space-y-3">
            <div className="size-11 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] grid place-items-center text-[#D97706]">
              <Clock size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-[#0F1115]">48-Hour Standard SLA</h3>
            <p className="text-xs text-[#5A5D64] leading-relaxed">
              Clear upfront turnaround times. Real-time SMS and dashboard updates as your garment progresses across workbench stages.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'guarantee', label: 'Fit Guarantee' },
            { id: 'process', label: 'Drop-off & Tracking' },
            { id: 'measuring', label: 'Measurements & Pinning' },
            { id: 'pricing', label: 'Pricing & Fees' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#18191B] text-white shadow-xs'
                  : 'bg-white text-[#5A5D64] border border-[#E0D9CF] hover:border-[#18191B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE6DF] shadow-xs mb-12 divide-y divide-[#EBE6DF]">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-[#7A7E85]">
              <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No questions matched your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="mt-3 text-xs font-bold text-[#9E593B] underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 py-1 cursor-pointer group"
                  >
                    <span className="text-sm font-bold text-[#0F1115] group-hover:text-[#9E593B] transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`size-7 rounded-full bg-[#FAF8F5] border border-[#EBE6DF] grid place-items-center shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 bg-[#18191B] text-white' : 'text-[#7A7E85]'
                      }`}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 pr-8 text-xs sm:text-sm text-[#5A5D64] leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Still Need Assistance Banner */}
        <div className="rounded-3xl bg-[#0F1115] text-[#FAF8F5] p-6 sm:p-10 border border-[#272B33] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Still Need Personal Fitting Guidance?
            </h3>
            <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-lg">
              Our master tailor concierge can review your garment photos, check partner studio availability, or schedule a fitting room session.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => go('contact')}
              className="px-6 py-3 rounded-full bg-white text-[#0F1115] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs"
            >
              Contact Concierge
            </button>
            <button
              onClick={() => go('book')}
              className="px-6 py-3 rounded-full bg-[#9E593B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8A4C32] transition-all cursor-pointer shadow-xs"
            >
              Book Alteration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
