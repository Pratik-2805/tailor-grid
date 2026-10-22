'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  Minimize2,
  Store,
  User,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Tag,
  MousePointer,
  ArrowLeft,
  Eye,
  Check,
  BadgeCheck,
  Clock,
  Lock,
} from 'lucide-react'

export interface FloatingDemoAdProps {
  onStartOnboarding?: () => void
}

type TabType = 'studio' | 'customer'

interface StepData {
  number: string
  title: string
  subtitle: string
  detail: string
  bgImage: string
  mockup: React.ReactNode
}

export function FloatingDemoAd({ onStartOnboarding }: FloatingDemoAdProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('studio')
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(0)

  const STEP_DURATION_MS = 6000

  // ─────────────────────────────────────────────────────────────
  // 1. STUDIO COMPLETE 7 ONBOARDING STEPS (LIGHT THEME + REAL PHOTOS)
  // ─────────────────────────────────────────────────────────────
  const studioSteps: StepData[] = [
    {
      number: '01',
      title: 'Studio Sign Up & Registration',
      subtitle: 'Enter studio email or continue with Google',
      detail: 'Click "Partner Portal" / "Apply as Partner". Enter studio email and password or click Google 1-Tap.',
      bgImage: '/role-studio.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-3.5 text-neutral-900">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-[11px] font-bold">Sign Up as Studio</span>
              <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-[10px]">✕</div>
            </div>
            <span className="text-[8px] text-neutral-500 block mb-2">List yourself on Raffu Partner Network</span>

            <div className="space-y-1.5">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Studio Email</span>
                <div className="w-full px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-[10px] font-mono text-neutral-900">
                  ahmed.atelier@example.com
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Password</span>
                <div className="w-full px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-[10px] text-neutral-900 font-mono tracking-widest">
                  ••••••••••
                </div>
              </div>

              <div className="w-full py-1.5 bg-[#0F1115] text-white text-[10px] font-bold rounded-lg text-center tracking-wider shadow">
                Sign Up as Studio →
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Step 1: "Earn with Raffu" Studio Form',
      subtitle: 'Shop name, master tailor, machines & order limit',
      detail: 'Fill out the "Earn with Raffu" onboarding form with your Atelier Name, Contact Email, Lead Master Tailor, Machines, Operating Hours, and Daily Order Limit.',
      bgImage: '/images/partner_hero_art.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[305px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-3 text-neutral-900">
            {/* Real Studio Card Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <ArrowLeft size={10} />
                </div>
                <div>
                  <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#9E593B] block leading-tight">
                    Studio Onboarding
                  </span>
                  <span className="text-[8px] font-bold text-[#0F1115] block leading-none">
                    Workbench Node
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                Step 1 of 3
              </span>
            </div>

            {/* Earn with Raffu Heading */}
            <div className="mt-1.5 mb-1">
              <h4 className="text-[13px] font-extrabold text-[#0F1115] tracking-tight leading-none">
                Earn with Raffu
              </h4>
              <p className="text-[7px] text-neutral-500 mt-0.5">Register your certified atelier on the network</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-1.5">
              <div>
                <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Atelier / Shop Name *</span>
                <div className="w-full px-2 py-1 bg-neutral-100 rounded-md text-[9px] font-medium text-neutral-900 flex items-center justify-between">
                  <span>Royal Master Tailoring Atelier</span>
                  <Check size={11} className="text-[#10B981]" />
                </div>
              </div>

              <div>
                <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Partner Contact Email *</span>
                <div className="w-full px-2 py-1 bg-[#F3EFEA]/80 border border-[#E8E1D5] rounded-md text-[9px] font-semibold text-neutral-900 flex items-center justify-between">
                  <span>ahmed.atelier@example.com</span>
                  <div className="flex items-center gap-1 text-[7px] text-[#9E593B]">
                    <Lock size={9} />
                    <span className="font-bold">Verified</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Lead Master Tailor *</span>
                  <div className="w-full px-1.5 py-1 bg-neutral-100 rounded-md text-[8.5px] font-medium text-neutral-900">
                    Master Ahmed Khan
                  </div>
                </div>
                <div>
                  <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Operating Hours *</span>
                  <div className="w-full px-1.5 py-1 bg-neutral-100 rounded-md text-[8.5px] font-medium text-neutral-900 flex items-center gap-1">
                    <Clock size={9} className="text-[#9E593B]" />
                    <span>10:00 AM – 8:30 PM</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Sewing Machines *</span>
                  <div className="w-full px-1.5 py-1 bg-neutral-100 rounded-md text-[8.5px] font-medium text-neutral-900">
                    4–6 machines <span className="text-[7px] text-neutral-500">(Mid-sized)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Daily Order Limit *</span>
                  <div className="w-full px-1.5 py-1 bg-neutral-100 rounded-md text-[8.5px] font-bold text-emerald-700">
                    25 orders / day
                  </div>
                </div>
              </div>

              <div className="w-full py-1.5 bg-[#0F1115] text-white text-[9px] font-bold rounded-lg text-center tracking-wide flex items-center justify-center gap-1 mt-1 shadow-sm">
                <span>Continue to Workshop Address</span>
                <ArrowRight size={10} />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Step 2: Shop No. & Location Pinpoint',
      subtitle: 'Manual shop number & interactive map pin',
      detail: 'Type your Shop / Unit number manually, then drop the pin on your exact entrance. Street, Area, and Postcode auto-sync into your Client Delivery Address.',
      bgImage: '/images/atelier_studio.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[305px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-3 text-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <ArrowLeft size={10} />
                </div>
                <div>
                  <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#9E593B] block leading-tight">
                    Studio Onboarding
                  </span>
                  <span className="text-[8px] font-bold text-[#0F1115] block leading-none">
                    Workbench Node
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                Step 2 of 3
              </span>
            </div>

            {/* Studio Location & Address Heading */}
            <div className="mt-1.5 mb-1">
              <h4 className="text-[13px] font-extrabold text-[#0F1115] tracking-tight leading-none">
                Studio Location &amp; Address
              </h4>
              <p className="text-[7px] text-neutral-500 mt-0.5">Pin atelier on map. Only shop/unit number is typed manually.</p>
            </div>

            <div className="space-y-1.5">
              {/* Shop No. / Unit Manual Entry */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[7px] font-semibold text-neutral-700">Shop No. / Workshop Unit *</span>
                  <span className="text-[7px] font-semibold text-[#9E593B] bg-[#FAF3EC] px-1.5 py-0.2 rounded-full border border-[#E8E1D5]">
                    Manual Entry
                  </span>
                </div>
                <div className="w-full px-2 py-1 bg-neutral-100 rounded-md text-[9px] font-medium text-neutral-900 flex items-center justify-between">
                  <span>Shop No. 4, Ground Floor, Gala 12</span>
                  <Check size={11} className="text-[#10B981]" />
                </div>
              </div>

              {/* Map Pin Button */}
              <div>
                <span className="text-[7px] font-semibold text-neutral-700 block mb-0.5">Workshop Map Pin (Compulsory) *</span>
                <div className="w-full flex items-center gap-1.5 px-2 py-1 bg-neutral-100 border border-neutral-300 rounded-md">
                  <div className="relative flex items-center justify-center">
                    <MapPin size={13} className="text-red-500 fill-red-500 animate-bounce" />
                  </div>
                  <span className="text-[8.5px] font-semibold text-neutral-900 truncate flex-1">
                    Hill Road, Bandra West (400050)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Location Pinned" />
                </div>
              </div>

              {/* Auto-synced Map Details (3 cols) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[7px] font-bold text-neutral-500 uppercase tracking-wider">Map-Detected Details</span>
                  <span className="text-[6.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-full">
                    Auto-synced via Pin
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-md bg-neutral-50 border border-neutral-200 text-left">
                  <div>
                    <span className="text-[6.5px] font-bold text-neutral-400 uppercase block">Street</span>
                    <span className="text-[7.5px] font-semibold text-neutral-900 truncate block">Hill Road</span>
                  </div>
                  <div>
                    <span className="text-[6.5px] font-bold text-neutral-400 uppercase block">Area</span>
                    <span className="text-[7.5px] font-semibold text-neutral-900 truncate block">Bandra West</span>
                  </div>
                  <div>
                    <span className="text-[6.5px] font-bold text-neutral-400 uppercase block">PIN</span>
                    <span className="text-[7.5px] font-mono font-bold text-neutral-900 truncate block">400050</span>
                  </div>
                </div>
              </div>

              {/* Client Delivery Preview Banner */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[7.5px] text-emerald-950">
                <MapPin size={10} className="text-emerald-700 shrink-0" />
                <span className="font-bold text-emerald-900 shrink-0">Delivery:</span>
                <span className="truncate font-medium">Shop 4, Ground Floor, Hill Road, Bandra West (400050)</span>
              </div>

              {/* Button */}
              <div className="w-full py-1.5 bg-[#0F1115] text-white text-[9px] font-bold rounded-lg text-center tracking-wide flex items-center justify-center gap-1 mt-0.5 shadow-sm">
                <span>Continue to Phone Verification</span>
                <ArrowRight size={10} />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '04',
      title: 'Step 3: Studio Phone OTP Verification',
      subtitle: 'Verify WhatsApp / SMS number for order alerts',
      detail: 'Provide your WhatsApp/calling phone number to receive instant alteration job notifications and verify via OTP.',
      bgImage: '/images/tailor_measuring.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-3 text-neutral-900">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <span className="text-[10px] font-bold">Studio Phone Verification</span>
              <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">Step 3 of 3</span>
            </div>

            <div className="space-y-1.5 mt-2">
              <div className="p-1.5 bg-neutral-50 border border-neutral-300 rounded-lg">
                <span className="text-[7px] text-neutral-500 block">Studio WhatsApp / Calling Number</span>
                <span className="text-[10px] font-mono font-bold text-neutral-900">+91 98200 12345</span>
              </div>

              <div className="p-2 bg-[#FAF8F5] border border-[#E7C9BA] rounded-xl text-center">
                <span className="text-[8px] text-neutral-600 block mb-1">Enter 6-Digit SMS Verification Code</span>
                <div className="flex justify-center gap-1 font-mono font-bold text-[10px] text-[#9E593B]">
                  {['7', '2', '4', '8', '1', '9'].map((digit, i) => (
                    <span key={i} className="w-5 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center shadow-xs">
                      {digit}
                    </span>
                  ))}
                </div>
                <span className="text-[8px] text-emerald-700 font-bold block mt-1">Phone Verified Successfully ✓</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '05',
      title: 'Step 4: Welcome Aboard Confirmation',
      subtitle: 'Partner profile certified on Raffu network',
      detail: 'Congratulations! Your workshop profile is verified. Click "Set Up Price Catalog" to configure your services.',
      bgImage: '/atelier_welcome_art.jpg',
      mockup: (
        <div className="w-full h-full p-3 text-white flex flex-col justify-between bg-black/60 backdrop-blur-xs rounded-xl">
          <div className="text-center my-auto">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#10B981]/30 border border-[#10B981] flex items-center justify-center mb-1 text-xl">
              🎉
            </div>
            <h3 className="font-serif text-xs font-bold text-white">Welcome Aboard, Master!</h3>
            <p className="text-[9px] text-white/70 mt-0.5">Your tailoring atelier is now certified on the Raffu Partner Network.</p>
          </div>

          <div className="w-full py-1.5 bg-[#9E593B] text-white text-[10px] font-bold rounded-lg text-center shadow">
            Set Initial Alteration Prices →
          </div>
        </div>
      ),
    },
    {
      number: '06',
      title: 'Step 5: Set Catalog Prices in Dashboard',
      subtitle: 'Hemming, tapering & alteration rates',
      detail: 'Open the Catalog tab in your dashboard, review the standard garment alterations, and set your workshop prices.',
      bgImage: '/images/seam_press.jpg',
      mockup: (
        <div className="w-full h-full p-3 text-neutral-900 flex flex-col justify-between bg-white/95 rounded-xl border border-neutral-200 shadow-md">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <div className="flex items-center gap-1">
              <Tag size={11} className="text-[#9E593B]" />
              <span className="text-[10px] font-bold">Studio Workbench — Catalog</span>
            </div>
            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Active &amp; Ready</span>
          </div>

          <div className="space-y-1 my-auto">
            <div className="flex items-center justify-between bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
              <span className="text-[9px] font-medium text-neutral-800">Trouser Hemming</span>
              <span className="text-[9px] font-mono font-bold text-[#9E593B] bg-white px-2 py-0.2 rounded border border-neutral-200">₹150</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
              <span className="text-[9px] font-medium text-neutral-800">Waist / Side Tapering</span>
              <span className="text-[9px] font-mono font-bold text-[#9E593B] bg-white px-2 py-0.2 rounded border border-neutral-200">₹250</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
              <span className="text-[9px] font-medium text-neutral-800">Zip Replacement</span>
              <span className="text-[9px] font-mono font-bold text-[#9E593B] bg-white px-2 py-0.2 rounded border border-neutral-200">₹180</span>
            </div>
          </div>

          <div className="p-1 rounded-lg bg-emerald-100 text-emerald-900 text-[8px] font-bold text-center">
            Prices Published! Ready to receive client bookings
          </div>
        </div>
      ),
    },
    {
      number: '07',
      title: 'Finish! Studio is Live on Raffu',
      subtitle: 'Receiving walk-in fittings & alterations',
      detail: 'Everything is complete! Your studio is visible on the customer map and can receive orders immediately.',
      bgImage: '/images/partner_team_art.jpg',
      mockup: (
        <div className="w-full h-full p-3 text-white flex flex-col justify-between bg-black/60 backdrop-blur-xs rounded-xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/20">
            <span className="text-[11px] font-bold text-white">Partner Workbench Cockpit</span>
            <span className="text-[8px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">Live Status ●</span>
          </div>

          <div className="space-y-1.5 my-auto">
            <div className="p-2 rounded-xl bg-white/95 text-neutral-900 shadow-md border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold block">Active Alteration Bookings</span>
                <span className="text-[8px] text-neutral-500">Ready for fitting &amp; stitching</span>
              </div>
              <span className="text-[12px] font-mono font-bold text-[#10B981]">3 Orders</span>
            </div>

            <div className="p-1.5 rounded-lg bg-black/40 text-[9px] text-white/80">
              Direct customer payout on pickup • Zero commission withholding
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-[#9E593B] text-white text-[9px] font-bold text-center shadow">
            🎉 All Finished! Studio Onboarding Complete
          </div>
        </div>
      ),
    },
  ]

  // ─────────────────────────────────────────────────────────────
  // 2. CUSTOMER COMPLETE 7 STEPS
  // ─────────────────────────────────────────────────────────────
  const customerSteps: StepData[] = [
    {
      number: '01',
      title: 'Click "Sign Up" on Website Header',
      subtitle: 'Located on the top right navigation',
      detail: 'Click the black "Sign Up" button on the top right navigation bar to open the account registration modal.',
      bgImage: '/images/hero_editorial.jpg',
      mockup: (
        <div className="w-full h-full p-3 flex flex-col justify-between text-neutral-900">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-neutral-900 text-[14px]">RAFFU</span>
              <span className="text-[10px] text-neutral-400 border-l border-neutral-300 pl-2">Own Your Fit</span>
            </div>
            <div className="px-3 py-1 bg-[#0F1115] text-white text-[10px] font-bold rounded-full shadow">
              Sign Up
            </div>
          </div>
          <div className="my-auto bg-white/90 backdrop-blur-md p-3 rounded-xl shadow border border-neutral-200/80 text-center">
            <p className="text-[11px] font-serif font-bold text-neutral-900">Customer Alteration Services</p>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Modal: Choose "I\'m a Customer"',
      subtitle: 'Pick Customer role',
      detail: 'When the modal opens with "How are you joining?", click on the "I\'m a Customer" card.',
      bgImage: '/role-customer.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-xl p-3 border border-neutral-200">
            <span className="text-[11px] font-bold block mb-2">How are you joining?</span>
            <div className="p-2.5 rounded-xl border-2 border-[#9E593B] bg-[#9E593B]/5 text-center">
              <span className="text-xl">👩‍🦰</span>
              <span className="text-[10px] font-bold block mt-1">I&apos;m a Customer</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Enter Name & Email',
      subtitle: 'Fill contact details',
      detail: 'Enter your full name and email address into the form.',
      bgImage: '/images/tailor_measuring.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-xl p-3 border border-neutral-200 space-y-2">
            <div className="px-2 py-1.5 bg-neutral-50 border rounded-lg text-[10px]">Pooja Sharma</div>
            <div className="px-2 py-1.5 bg-neutral-50 border rounded-lg text-[10px]">pooja.sharma@gmail.com</div>
          </div>
        </div>
      ),
    },
    {
      number: '04',
      title: 'Verify Email OTP',
      subtitle: 'Enter 6-digit code',
      detail: 'Enter the 6-digit OTP code received in email to confirm your email.',
      bgImage: '/images/garments_rack.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-xl p-3 border border-neutral-200 text-center">
            <span className="text-[9px] text-neutral-600 block mb-1">Email 6-digit OTP</span>
            <span className="text-[12px] font-mono font-bold text-[#9E593B]">4 8 2 1 9 6</span>
            <span className="text-[8px] text-emerald-700 font-bold block mt-1">Email Verified ✓</span>
          </div>
        </div>
      ),
    },
    {
      number: '05',
      title: 'Verify Phone OTP',
      subtitle: 'Enter 4-digit SMS code',
      detail: 'Enter mobile number and verify via 4-digit SMS code.',
      bgImage: '/images/fabric_pins.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-xl p-3 border border-neutral-200 text-center">
            <span className="text-[9px] text-neutral-600 block mb-1">+91 98765 43210</span>
            <span className="text-[12px] font-mono font-bold text-neutral-900">5 3 9 1</span>
            <span className="text-[8px] text-emerald-700 font-bold block mt-1">Phone Verified ✓</span>
          </div>
        </div>
      ),
    },
    {
      number: '06',
      title: 'Password & Submit',
      subtitle: 'Click Sign Up',
      detail: 'Set password and click the black "Sign Up" button.',
      bgImage: '/images/tailor_craft_icon.jpg',
      mockup: (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-[300px] bg-white rounded-2xl shadow-xl p-3 border border-neutral-200 space-y-2">
            <div className="px-2 py-1.5 bg-neutral-50 border rounded-lg text-[10px] font-mono">••••••••••</div>
            <div className="w-full py-1.5 bg-black text-white text-[10px] font-bold rounded-lg text-center">Sign Up</div>
          </div>
        </div>
      ),
    },
    {
      number: '07',
      title: 'Direct Alteration Booking',
      subtitle: 'Book local studio',
      detail: 'Done! Select your garment and confirm alteration fitting.',
      bgImage: '/images/service_trousers.jpg',
      mockup: (
        <div className="w-full h-full p-3 text-white flex flex-col justify-between bg-black/60 rounded-xl">
          <span className="text-[11px] font-bold">Select Alteration &amp; Studio</span>
          <div className="p-2 rounded bg-emerald-500 text-black text-[9px] font-bold text-center shadow">
            Customer Ready to Book!
          </div>
        </div>
      ),
    },
  ]

  const activeSteps = activeTab === 'studio' ? studioSteps : customerSteps
  const totalSteps = activeSteps.length

  // Rock-solid non-skipping timestamp timer
  useEffect(() => {
    if (!isOpen || !isPlaying || isHovered) return

    const startTime = Date.now() - (progress / 100) * STEP_DURATION_MS

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentPct = Math.min((elapsed / STEP_DURATION_MS) * 100, 100)

      if (elapsed >= STEP_DURATION_MS) {
        setCurrentStep((prev) => (prev + 1) % totalSteps)
        setProgress(0)
      } else {
        setProgress(currentPct)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isOpen, isPlaying, isHovered, currentStep, totalSteps, activeTab])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setCurrentStep(0)
    setProgress(0)
  }

  const handlePrevStep = () => {
    setCurrentStep((s) => (s > 0 ? s - 1 : totalSteps - 1))
    setProgress(0)
  }

  const handleNextStep = () => {
    setCurrentStep((s) => (s + 1) % totalSteps)
    setProgress(0)
  }

  const handleSelectStep = (idx: number) => {
    setCurrentStep(idx)
    setProgress(0)
  }

  if (isDismissed) return null

  return (
    <>
      {/* ─── COLLAPSED FLOATING PILL (LIGHT THEME) ─── */}
      {!isOpen && (
        <div
          role="region"
          aria-label="How it works quick demo"
          className="fixed bottom-5 right-5 z-40 transition-all duration-300 ease-out hover:scale-[1.02]"
        >
          <div className="relative group">
            <div className="flex items-center gap-3 bg-white text-neutral-900 px-3.5 py-2.5 rounded-2xl border border-neutral-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.14)]">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-9 h-9 rounded-xl bg-[#9E593B] text-white flex items-center justify-center shrink-0 shadow-md hover:bg-[#B36846] transition-colors"
                title="Play Quick Walkthrough"
              >
                <Play size={15} className="fill-white translate-x-[1px]" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-left cursor-pointer pr-1"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-neutral-900 tracking-tight">
                    How Onboarding Works
                  </span>
                  <span className="text-[9px] font-semibold bg-[#9E593B]/10 text-[#9E593B] px-1.5 py-0.2 rounded font-mono">
                    Step Guide
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Exact form steps, map pin &amp; catalog pricing
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="text-neutral-400 hover:text-neutral-700 p-1 -mr-1 transition-colors rounded-lg hover:bg-neutral-100"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXPANDED FLOATING PLAYER (LIGHT META AD THEME) ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Walkthrough Demo Player"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] max-w-[460px] rounded-3xl bg-white text-neutral-900 border border-neutral-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.22)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Meta Ad Sponsor Header */}
          <div className="px-3.5 pt-3 pb-2 bg-white border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#9E593B] text-white flex items-center justify-center font-serif font-black text-xs shadow-xs">
                R
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-bold text-neutral-900 leading-none">Raffu Partner Network</span>
                  <BadgeCheck size={13} className="text-[#1877F2] fill-[#1877F2]" />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Sponsored • Studio Onboarding Guide</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                title="Minimize"
              >
                <Minimize2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setIsDismissed(true)
                }}
                className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="px-3.5 pt-2 pb-1.5 bg-neutral-50/70 flex items-center justify-between gap-2 border-b border-neutral-100">
            <div className="flex items-center bg-white p-0.5 rounded-xl border border-neutral-200 shadow-xs text-xs flex-1">
              <button
                type="button"
                onClick={() => handleTabChange('studio')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'studio'
                    ? 'bg-[#0F1115] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Store size={12} />
                <span>Studio Onboarding (7 steps)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('customer')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'customer'
                    ? 'bg-[#0F1115] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <User size={12} />
                <span>Customer Modal</span>
              </button>
            </div>
          </div>

          {/* Meta Story Segmented Progress Bars */}
          <div className="px-3.5 pt-2 bg-white">
            <div className="grid grid-cols-7 gap-1">
              {activeSteps.map((step, idx) => {
                const isCurrent = idx === currentStep
                const isPast = idx < currentStep
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    className="group flex flex-col gap-0.5 text-left cursor-pointer"
                  >
                    <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-[#9E593B] rounded-full transition-all duration-75"
                        style={{
                          width: isPast
                            ? '100%'
                            : isCurrent
                            ? `${progress}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Media Screen Container with Real Image */}
          <div className="p-3.5 bg-white">
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-sm transition-all duration-300">
              <Image
                src={activeSteps[currentStep].bgImage}
                alt={activeSteps[currentStep].title}
                fill
                priority
                className="object-cover opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-neutral-900/35 backdrop-blur-[2px]" />

              <div className="relative z-10 w-full h-full pt-7">
                {activeSteps[currentStep].mockup}
              </div>

              <div className="absolute top-2 left-2.5 bg-white/95 backdrop-blur-md border border-neutral-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] text-neutral-900 shadow-sm z-20">
                <span className="font-mono text-[#9E593B] font-bold">
                  {activeSteps[currentStep].number}
                </span>
                <span className="font-semibold text-neutral-800">
                  {activeSteps[currentStep].title}
                </span>
              </div>

              {isHovered && isPlaying && (
                <div className="absolute top-2 right-2.5 bg-white/95 backdrop-blur-md border border-neutral-200 px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-neutral-700 shadow-sm z-20">
                  <Pause size={10} className="fill-neutral-700" />
                  <span>Paused</span>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold text-neutral-900 flex items-center gap-1.5">
                  <span className="text-[#9E593B]">
                    Step {activeSteps[currentStep].number} of {totalSteps}:
                  </span>
                  <span>{activeSteps[currentStep].title}</span>
                </h4>
              </div>
              <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                {activeSteps[currentStep].detail}
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-3.5 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors shadow-xs"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={13} className="fill-neutral-700" />
                ) : (
                  <Play size={13} className="fill-neutral-700 translate-x-[1px]" />
                )}
              </button>
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors shadow-xs"
                title="Previous step"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors shadow-xs"
                title="Next step"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                if (onStartOnboarding) onStartOnboarding()
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F1115] hover:bg-[#232730] text-white py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide shadow-md transition-all active:scale-[0.98]"
            >
              <span>Continue Form Below →</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
