'use client'

import React from 'react'

/**
 * High-end, bespoke vector illustrations crafted in pure SVG with the exact TailorGrid palette:
 * Obsidian (#0F1115), Charcoal (#1E2229), Terracotta (#9E593B), Warm Sand (#FAF8F5),
 * Cream Border (#EBE6DF), Gold Accent (#F59E0B), and Emerald (#10B981).
 * Completely crisp, lightweight, infinite scale, and 100% professional non-AI look.
 */

// Hero Graphic: Customer Smartphone with Digital Fitting Pass & Master Atelier Elements
export function HeroTailoringIllustration({ className = 'w-full h-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TailorGrid In-Studio & Digital Pass Illustration"
    >
      <defs>
        <linearGradient id="heroBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF8F5" />
          <stop offset="100%" stopColor="#F3EFEA" />
        </linearGradient>
        <linearGradient id="terragrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B26A4A" />
          <stop offset="100%" stopColor="#9E593B" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FAF8F5" />
        </linearGradient>
        <filter id="heroShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#0F1115" floodOpacity="0.08" />
        </filter>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F1115" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background Frame with Subtle Studio Geometry */}
      <rect width="540" height="420" rx="28" fill="url(#heroBgGrad)" />
      <circle cx="430" cy="110" r="140" fill="#EBE6DF" fillOpacity="0.4" />
      <circle cx="110" cy="340" r="90" fill="#9E593B" fillOpacity="0.05" />

      {/* Decorative Atelier Grid Lines */}
      <path d="M 60 40 L 480 40 M 60 380 L 480 380" stroke="#E5E0D8" strokeWidth="1" strokeDasharray="4 6" />
      <path d="M 120 40 L 120 380 M 420 40 L 420 380" stroke="#E5E0D8" strokeWidth="1" strokeDasharray="4 6" />

      {/* Left Element: Sartorial Tailor Mannequin Silhouette */}
      <g transform="translate(60, 90)">
        {/* Mannequin Stand Base */}
        <ellipse cx="65" cy="270" rx="34" ry="8" fill="#D8D1C7" />
        <rect x="63" y="190" width="4" height="80" rx="2" fill="#1E2229" />
        <circle cx="65" cy="190" r="6" fill="#9E593B" />

        {/* Mannequin Torso with Tailored Wool Texture */}
        <path
          d="M 45 45 C 50 25, 80 25, 85 45 C 96 68, 98 110, 88 175 C 80 185, 50 185, 42 175 C 32 110, 34 68, 45 45 Z"
          fill="#1E2229"
        />
        {/* Neck Cap */}
        <path d="M 54 28 C 54 22, 76 22, 76 28 Z" fill="#9E593B" />
        <ellipse cx="65" cy="23" rx="5" ry="3" fill="#D6C7B2" />

        {/* Tailor's Basting Stitches (White dashed marks) */}
        <path d="M 50 60 Q 65 80 80 60" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M 46 100 Q 65 110 84 100" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M 65 30 L 65 175" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Measuring Tape Draped over Shoulder */}
        <path
          d="M 50 42 C 40 70, 42 120, 52 165 C 54 175, 48 185, 44 195"
          stroke="#F59E0B"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 50 42 C 40 70, 42 120, 52 165 C 54 175, 48 185, 44 195"
          stroke="#0F1115"
          strokeWidth="1"
          strokeDasharray="2 3"
          fill="none"
        />

        {/* Tailor's Shears Pin */}
        <g transform="translate(82, 130) rotate(-25) scale(0.65)">
          <path d="M 10 10 L 40 50 M 40 10 L 10 50" stroke="#FAF8F5" strokeWidth="4" strokeLinecap="round" />
          <circle cx="10" cy="10" r="7" stroke="#9E593B" strokeWidth="3" fill="none" />
          <circle cx="40" cy="10" r="7" stroke="#9E593B" strokeWidth="3" fill="none" />
        </g>
      </g>

      {/* Main Focus: Smartphone with TailorGrid Digital Fitting Pass */}
      <g transform="translate(240, 50)" filter="url(#heroShadow)">
        {/* Phone Body */}
        <rect x="0" y="0" width="220" height="320" rx="36" fill="#0F1115" />
        <rect x="5" y="5" width="210" height="310" rx="32" fill="#18191B" />
        <rect x="8" y="8" width="204" height="304" rx="28" fill="#FFFFFF" />

        {/* Dynamic Island / Speaker */}
        <rect x="75" y="16" width="70" height="14" rx="7" fill="#0F1115" />
        <circle cx="132" cy="23" r="3" fill="#1E2229" />

        {/* App Header Inside Screen */}
        <rect x="20" y="44" width="180" height="42" rx="12" fill="#FAF8F5" />
        <circle cx="38" cy="65" r="10" fill="#0F1115" />
        <path d="M 35 62 L 41 68 M 41 62 L 35 68" stroke="#FAF8F5" strokeWidth="1.5" />
        <rect x="56" y="58" width="70" height="6" rx="3" fill="#0F1115" />
        <rect x="56" y="68" width="45" height="4" rx="2" fill="#9E593B" />
        <circle cx="182" cy="65" r="4" fill="#10B981" />

        {/* Digital Fitting Pass Card Inside Phone */}
        <rect x="20" y="96" width="180" height="160" rx="16" fill="url(#cardGrad)" stroke="#EBE6DF" strokeWidth="1" />
        
        {/* Pass Header */}
        <rect x="32" y="110" width="85" height="5" rx="2.5" fill="#9E593B" />
        <rect x="32" y="120" width="110" height="7" rx="3.5" fill="#0F1115" />

        {/* Studio Info Badge */}
        <rect x="32" y="136" width="156" height="24" rx="6" fill="#F4EFEA" />
        <circle cx="44" cy="148" r="4" fill="#9E593B" />
        <rect x="54" y="144" width="60" height="4" rx="2" fill="#1E2229" />
        <rect x="54" y="151" width="40" height="3" rx="1.5" fill="#7A7E85" />
        <rect x="150" y="143" width="30" height="10" rx="5" fill="#0F1115" />

        {/* QR Code Vector Mockup */}
        <g transform="translate(70, 172)">
          <rect x="0" y="0" width="60" height="60" rx="8" fill="#FAF8F5" stroke="#DDD6CB" strokeWidth="1" />
          {/* Top-Left Finder */}
          <rect x="6" y="6" width="16" height="16" fill="#0F1115" rx="2" />
          <rect x="9" y="9" width="10" height="10" fill="#FAF8F5" />
          <rect x="11" y="11" width="6" height="6" fill="#0F1115" />
          {/* Top-Right Finder */}
          <rect x="38" y="6" width="16" height="16" fill="#0F1115" rx="2" />
          <rect x="41" y="9" width="10" height="10" fill="#FAF8F5" />
          <rect x="43" y="11" width="6" height="6" fill="#0F1115" />
          {/* Bottom-Left Finder */}
          <rect x="6" y="38" width="16" height="16" fill="#0F1115" rx="2" />
          <rect x="9" y="41" width="10" height="10" fill="#FAF8F5" />
          <rect x="11" y="43" width="6" height="6" fill="#0F1115" />
          {/* Central & Scattered Bits */}
          <rect x="26" y="10" width="6" height="6" fill="#9E593B" />
          <rect x="26" y="24" width="8" height="8" fill="#0F1115" />
          <rect x="38" y="26" width="6" height="6" fill="#0F1115" />
          <rect x="26" y="38" width="8" height="6" fill="#9E593B" />
          <rect x="38" y="42" width="10" height="8" fill="#0F1115" />
        </g>

        <rect x="45" y="240" width="130" height="6" rx="3" fill="#D6D1CA" />

        {/* Primary Phone CTA Button */}
        <rect x="20" y="266" width="180" height="34" rx="17" fill="url(#terragrad)" />
        <rect x="65" y="280" width="90" height="6" rx="3" fill="#FAF8F5" />
      </g>
    </svg>
  )
}

// Step 1: Getting Started & Service Selection
export function Step1Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      <g transform="translate(30, 25)">
        {/* App Frame */}
        <rect width="260" height="150" rx="14" fill="#FFFFFF" stroke="#E5DFD5" strokeWidth="1.5" />
        {/* Header */}
        <rect x="16" y="14" width="70" height="8" rx="4" fill="#0F1115" />
        <rect x="16" y="26" width="110" height="5" rx="2.5" fill="#9E593B" />
        
        {/* Selected Item 1 */}
        <rect x="16" y="42" width="228" height="38" rx="8" fill="#FAF8F5" stroke="#9E593B" strokeWidth="1.5" />
        <circle cx="36" cy="61" r="10" fill="#9E593B" />
        <path d="M 33 61 L 35 63 L 39 59" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
        <text x="54" y="58" fill="#0F1115" fontSize="10" fontWeight="700" fontFamily="sans-serif">Trouser Hem (Plain)</text>
        <text x="54" y="69" fill="#7A7E85" fontSize="8" fontFamily="sans-serif">Standard clean finish · 48h</text>
        <text x="204" y="64" fill="#0F1115" fontSize="11" fontWeight="700" fontFamily="sans-serif">$20</text>

        {/* Item 2 */}
        <rect x="16" y="88" width="228" height="38" rx="8" fill="#FFFFFF" stroke="#EBE6DF" strokeWidth="1" />
        <circle cx="36" cy="107" r="10" fill="#F3EFEA" />
        <circle cx="36" cy="107" r="4" fill="#DDD6CB" />
        <text x="54" y="104" fill="#1E2229" fontSize="10" fontWeight="600" fontFamily="sans-serif">Blazer Sleeve Adjust</text>
        <text x="54" y="115" fill="#7A7E85" fontSize="8" fontFamily="sans-serif">Relocate buttons & reset cuff</text>
        <text x="204" y="110" fill="#7A7E85" fontSize="11" fontWeight="600" fontFamily="sans-serif">$45</text>
      </g>
    </svg>
  )
}

// Step 2: Neighborhood Matching & Studio Allocation
export function Step2Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      {/* Abstract Map Grid Lines */}
      <path d="M 30 50 L 290 50 M 30 100 L 290 100 M 30 150 L 290 150" stroke="#E6DFD4" strokeWidth="1" strokeDasharray="3 4" />
      <path d="M 70 20 L 70 180 M 160 20 L 160 180 M 250 20 L 250 180" stroke="#E6DFD4" strokeWidth="1" strokeDasharray="3 4" />

      {/* Radar Wave */}
      <circle cx="160" cy="100" r="65" fill="#9E593B" fillOpacity="0.04" stroke="#9E593B" strokeOpacity="0.2" strokeWidth="1" />
      <circle cx="160" cy="100" r="40" fill="#9E593B" fillOpacity="0.08" stroke="#9E593B" strokeOpacity="0.4" strokeWidth="1" />

      {/* User Origin Pin */}
      <circle cx="90" cy="130" r="6" fill="#0F1115" />
      <circle cx="90" cy="130" r="14" stroke="#0F1115" strokeWidth="1" strokeDasharray="2 2" />

      {/* Route Line */}
      <path d="M 90 130 Q 120 75 180 85" stroke="#9E593B" strokeWidth="2.5" strokeDasharray="5 4" fill="none" />

      {/* Matched Studio Card Node */}
      <g transform="translate(145, 45)">
        <rect width="145" height="62" rx="12" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.5" />
        <circle cx="22" cy="22" r="10" fill="#9E593B" />
        <path d="M 19 22 L 25 22 M 22 19 L 22 25" stroke="#FFFFFF" strokeWidth="1.5" />
        <text x="38" y="20" fill="#0F1115" fontSize="10" fontWeight="700" fontFamily="sans-serif">Atelier SoHo</text>
        <text x="38" y="30" fill="#10B981" fontSize="8" fontWeight="600" fontFamily="sans-serif">★ 4.96 · 0.4 mi away</text>
        <rect x="14" y="40" width="118" height="14" rx="4" fill="#FAF8F5" />
        <text x="20" y="50" fill="#7A7E85" fontSize="7.5" fontFamily="sans-serif">Equipped with OEM blindstitch</text>
      </g>
    </svg>
  )
}

// Step 3: In-Studio Pinning & Measuring
export function Step3Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      
      {/* Fitting Room Arch Background */}
      <path d="M 80 180 L 80 50 C 80 25, 240 25, 240 50 L 240 180" stroke="#E2DDD5" strokeWidth="1.5" fill="#FAF8F5" />

      {/* Tailor Mannequin */}
      <g transform="translate(130, 30)">
        <ellipse cx="30" cy="145" rx="20" ry="5" fill="#D6CFC4" />
        <rect x="28.5" y="100" width="3" height="45" fill="#1E2229" />
        {/* Torso */}
        <path d="M 16 25 C 20 12, 40 12, 44 25 C 50 40, 52 70, 44 95 C 40 100, 20 100, 16 95 C 8 70, 10 40, 16 25 Z" fill="#1E2229" />
        {/* Wooden Top */}
        <ellipse cx="30" cy="14" rx="4" ry="2.5" fill="#9E593B" />
        
        {/* Yellow Measuring Tape Coiled */}
        <path d="M 12 55 Q 30 70 48 55" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 12 55 Q 30 70 48 55" stroke="#0F1115" strokeWidth="0.8" strokeDasharray="1.5 2" fill="none" />

        {/* Tailor Chalk Lines */}
        <path d="M 18 35 L 26 43 M 34 43 L 42 35" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 30 20 L 30 95" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="3 3" />
      </g>

      {/* Tailor Fitting Pass Badge */}
      <g transform="translate(30, 70)">
        <rect width="85" height="60" rx="10" fill="#FFFFFF" stroke="#E5DFD5" strokeWidth="1" />
        <rect x="10" y="12" width="65" height="5" rx="2.5" fill="#0F1115" />
        <rect x="10" y="22" width="45" height="4" rx="2" fill="#9E593B" />
        <rect x="10" y="34" width="65" height="16" rx="4" fill="#FAF8F5" />
        <text x="16" y="45" fill="#1E2229" fontSize="7" fontWeight="600" fontFamily="sans-serif">5-Min Pinning</text>
      </g>

      {/* Shears Icon */}
      <g transform="translate(225, 75)">
        <circle cx="25" cy="25" r="22" fill="#0F1115" />
        <path d="M 18 18 L 32 32 M 32 18 L 18 32" stroke="#FAF8F5" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" stroke="#9E593B" strokeWidth="2" fill="none" />
        <circle cx="34" cy="16" r="4" stroke="#9E593B" strokeWidth="2" fill="none" />
      </g>
    </svg>
  )
}

// Step 4: Master Crafting & 48-Hour Turnaround
export function Step4Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      
      {/* Industrial Sewing Machine Vector Silhouette */}
      <g transform="translate(60, 40)">
        {/* Machine Base */}
        <rect x="10" y="95" width="180" height="12" rx="4" fill="#1E2229" />
        {/* Machine Body Pillar */}
        <path d="M 145 95 L 145 35 C 145 25, 135 20, 125 20 L 40 20 C 30 20, 25 28, 25 40 L 25 60 L 50 60 L 50 35 L 125 35 L 125 95 Z" fill="#1E2229" />
        
        {/* Needle Head */}
        <rect x="34" y="60" width="8" height="20" rx="1" fill="#9E593B" />
        <line x1="38" y1="80" x2="38" y2="95" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        
        {/* Thread Spool */}
        <rect x="110" y="8" width="12" height="12" rx="2" fill="#F59E0B" />
        <path d="M 116 8 Q 80 0 38 65" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />

        {/* Handwheel */}
        <circle cx="145" cy="55" r="14" fill="#0F1115" stroke="#9E593B" strokeWidth="2" />
        <circle cx="145" cy="55" r="4" fill="#FAF8F5" />

        {/* Fabric Cloth Under Needle */}
        <path d="M 15 94 Q 70 88 135 94" stroke="#9E593B" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 15 94 Q 70 88 135 94" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" fill="none" />
      </g>

      {/* 48h Timer Milestone Badge */}
      <g transform="translate(195, 30)">
        <rect width="95" height="48" rx="10" fill="#FFFFFF" stroke="#E5DFD5" strokeWidth="1" />
        <text x="12" y="20" fill="#9E593B" fontSize="8" fontWeight="700" fontFamily="sans-serif">TURNAROUND</text>
        <text x="12" y="36" fill="#0F1115" fontSize="13" fontWeight="800" fontFamily="sans-serif">48 Hours</text>
      </g>

      {/* Progress Track Line */}
      <g transform="translate(50, 155)">
        <rect width="220" height="6" rx="3" fill="#E8E2D8" />
        <rect width="180" height="6" rx="3" fill="#0F1115" />
        <circle cx="180" cy="3" r="6" fill="#10B981" />
        <text x="0" y="22" fill="#7A7E85" fontSize="8" fontWeight="600" fontFamily="sans-serif">Cutting & Basting</text>
        <text x="120" y="22" fill="#0F1115" fontSize="8" fontWeight="700" fontFamily="sans-serif">Finishing & Steam Press</text>
      </g>
    </svg>
  )
}

// Step 5: Try-On, 100% Fit Guarantee & Compliments
export function Step5Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />

      {/* Hanging Garment Bag / Tailored Suit */}
      <g transform="translate(60, 20)">
        {/* Hanger Hook */}
        <path d="M 50 15 C 50 5, 60 5, 60 15 C 60 25, 45 25, 45 32" stroke="#9E593B" strokeWidth="2.5" fill="none" />
        {/* Hanger Triangle */}
        <path d="M 15 50 L 50 32 L 85 50 Z" fill="#1E2229" />

        {/* Tailored Jacket / Suit Silhouette */}
        <path d="M 20 50 L 10 135 L 35 140 L 40 85 L 50 140 L 60 85 L 65 140 L 90 135 L 80 50 Z" fill="#0F1115" />
        {/* Lapels */}
        <path d="M 38 50 L 50 95 L 62 50 Z" fill="#FAF8F5" />
        <path d="M 46 65 L 54 65" stroke="#9E593B" strokeWidth="2" />
      </g>

      {/* 5-Star Rating & Fit Guarantee Box */}
      <g transform="translate(160, 45)">
        <rect width="135" height="105" rx="14" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.5" />
        
        {/* Rating Stars */}
        <g transform="translate(16, 18)">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d="M 6 0 L 7.8 3.8 L 12 4.4 L 9 7.3 L 9.7 11.5 L 6 9.5 L 2.3 11.5 L 3 7.3 L 0 4.4 L 4.2 3.8 Z"
              transform={`translate(${i * 21}, 0) scale(1)`}
              fill="#F59E0B"
            />
          ))}
        </g>

        <rect x="16" y="42" width="103" height="1" fill="#EBE6DF" />

        {/* Fit Guarantee Status */}
        <circle cx="28" cy="62" r="10" fill="#ECFDF5" />
        <path d="M 24 62 L 27 65 L 32 60" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <text x="44" y="59" fill="#0F1115" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">100% Fit Guarantee</text>
        <text x="44" y="69" fill="#7A7E85" fontSize="7.5" fontFamily="sans-serif">Free in-store adjustment</text>

        <rect x="16" y="80" width="103" height="16" rx="4" fill="#FAF8F5" />
        <text x="24" y="91" fill="#9E593B" fontSize="8" fontWeight="600" fontFamily="sans-serif">Fit Passport Recorded ✓</text>
      </g>
    </svg>
  )
}

// Split Section: Online Booking / Multi-Device Illustration
export function OnlineBookingIllustration({ className = 'w-full h-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Laptop Mockup */}
      <g transform="translate(30, 30)">
        {/* Screen Bezel */}
        <rect width="320" height="200" rx="14" fill="#0F1115" />
        <rect x="6" y="6" width="308" height="188" rx="10" fill="#FFFFFF" />

        {/* Top Navbar */}
        <rect x="6" y="6" width="308" height="28" fill="#FAF8F5" />
        <circle cx="22" cy="20" r="4" fill="#EF4444" />
        <circle cx="34" cy="20" r="4" fill="#F59E0B" />
        <circle cx="46" cy="20" r="4" fill="#10B981" />
        <rect x="80" y="14" width="160" height="12" rx="6" fill="#E8E2D8" />
        <text x="100" y="23" fill="#7A7E85" fontSize="7" fontFamily="sans-serif">darzi.com/book</text>

        {/* Left Side: Services List */}
        <rect x="20" y="46" width="110" height="135" rx="8" fill="#FAF8F5" stroke="#EBE6DF" strokeWidth="1" />
        <rect x="30" y="58" width="60" height="6" rx="3" fill="#0F1115" />
        <rect x="30" y="74" width="90" height="24" rx="4" fill="#FFFFFF" stroke="#9E593B" strokeWidth="1" />
        <text x="36" y="86" fill="#0F1115" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">Trouser Alterations</text>
        <text x="36" y="93" fill="#9E593B" fontSize="6.5" fontFamily="sans-serif">From $20 · 48h</text>
        
        <rect x="30" y="104" width="90" height="20" rx="4" fill="#FFFFFF" />
        <rect x="30" y="130" width="90" height="20" rx="4" fill="#FFFFFF" />

        {/* Right Side: Map & Studio Match */}
        <rect x="140" y="46" width="160" height="135" rx="8" fill="#F3EFEA" />
        <path d="M 150 70 L 290 70 M 150 110 L 290 110 M 150 150 L 290 150" stroke="#E5DFD5" strokeDasharray="3 3" />
        <circle cx="210" cy="90" r="16" fill="#9E593B" fillOpacity="0.15" />
        <circle cx="210" cy="90" r="5" fill="#9E593B" />
        <rect x="160" y="120" width="120" height="30" rx="6" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1" />
        <text x="170" y="133" fill="#0F1115" fontSize="7" fontWeight="700" fontFamily="sans-serif">Atelier SoHo (0.4 mi)</text>
        <text x="170" y="142" fill="#10B981" fontSize="6.5" fontFamily="sans-serif">Instant Pass Available</text>

        {/* Laptop Keyboard Base */}
        <path d="M -20 200 L 340 200 L 360 215 L -40 215 Z" fill="#D6D1CA" />
        <rect x="120" y="202" width="80" height="5" rx="2" fill="#FAF8F5" />
      </g>

      {/* Overlapping Smartphone */}
      <g transform="translate(290, 110)">
        <rect width="140" height="210" rx="24" fill="#0F1115" />
        <rect x="4" y="4" width="132" height="202" rx="20" fill="#FFFFFF" />
        <rect x="45" y="10" width="50" height="8" rx="4" fill="#0F1115" />

        {/* Phone Content: QR Pass */}
        <rect x="16" y="28" width="108" height="165" rx="12" fill="#FAF8F5" stroke="#EBE6DF" strokeWidth="1" />
        <circle cx="30" cy="44" r="7" fill="#0F1115" />
        <text x="44" y="46" fill="#0F1115" fontSize="8" fontWeight="700" fontFamily="sans-serif">Fitting Pass</text>
        <rect x="35" y="60" width="70" height="70" rx="8" fill="#FFFFFF" stroke="#DDD6CB" strokeWidth="1" />
        {/* Mini QR Bits */}
        <rect x="42" y="67" width="16" height="16" fill="#0F1115" />
        <rect x="45" y="70" width="10" height="10" fill="#FFFFFF" />
        <rect x="74" y="67" width="16" height="16" fill="#0F1115" />
        <rect x="42" y="99" width="16" height="16" fill="#0F1115" />
        <rect x="65" y="85" width="10" height="10" fill="#9E593B" />

        <rect x="25" y="145" width="90" height="22" rx="11" fill="#9E593B" />
        <text x="45" y="159" fill="#FAF8F5" fontSize="8" fontWeight="700" fontFamily="sans-serif">Show in Studio</text>
      </g>
    </svg>
  )
}

// Crisp Vector Graphic Badges for Suggestion Cards
export function TrousersSilhouette({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 16 8 L 48 8 L 52 56 L 36 56 L 32 26 L 28 56 L 12 56 Z" fill="#1E2229" />
      <path d="M 12 52 L 28 52 M 36 52 L 52 52" stroke="#9E593B" strokeWidth="2" />
      <path d="M 32 8 L 32 22" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="32" cy="11" r="2" fill="#F59E0B" />
    </svg>
  )
}

export function SuitSilhouette({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 14 16 L 8 54 L 22 56 L 26 30 L 32 56 L 38 30 L 42 56 L 56 54 L 50 16 L 38 10 L 26 10 Z" fill="#0F1115" />
      <path d="M 26 10 L 32 32 L 38 10 Z" fill="#FAF8F5" />
      <path d="M 29 20 L 35 20" stroke="#9E593B" strokeWidth="1.5" />
      <circle cx="32" cy="38" r="1.5" fill="#D6C7B2" />
      <circle cx="32" cy="46" r="1.5" fill="#D6C7B2" />
    </svg>
  )
}

export function DressSilhouette({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 24 10 L 22 24 L 10 56 L 54 56 L 42 24 L 40 10 L 34 14 L 30 14 Z" fill="#9E593B" />
      <path d="M 22 24 L 42 24" stroke="#0F1115" strokeWidth="2.5" />
      <path d="M 28 10 L 36 10" stroke="#FAF8F5" strokeWidth="2" />
      <path d="M 12 53 Q 32 48 52 53" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
    </svg>
  )
}

export function OccasionSilhouette({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 20 12 L 14 30 L 22 30 L 16 56 L 48 56 L 42 30 L 50 30 L 44 12 Z" fill="#1E2229" />
      <path d="M 32 12 L 32 36" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2 2" />
      <path d="M 16 52 L 48 52" stroke="#9E593B" strokeWidth="3" />
      <circle cx="32" cy="20" r="2" fill="#F59E0B" />
      <circle cx="32" cy="28" r="2" fill="#F59E0B" />
    </svg>
  )
}

export function RepairSilhouette({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="26" fill="#F4EFEA" />
      {/* Zipper Track */}
      <line x1="32" y1="12" x2="32" y2="52" stroke="#0F1115" strokeWidth="4" strokeDasharray="3 3" />
      {/* Zipper Pull Slider */}
      <path d="M 26 28 L 38 28 L 35 40 L 29 40 Z" fill="#9E593B" />
      <circle cx="32" cy="45" r="4" stroke="#9E593B" strokeWidth="2" fill="none" />
      {/* Cross Needle */}
      <line x1="16" y1="20" x2="48" y2="44" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
