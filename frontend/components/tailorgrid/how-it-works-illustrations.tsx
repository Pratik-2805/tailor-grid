'use client'

import React from 'react'

/**
 * High-end, bespoke vector illustrations crafted in pure SVG with the exact TailorGrid palette:
 * Obsidian (#0F1115), Charcoal (#1E2229), Terracotta (#9E593B), Warm Sand (#FAF8F5),
 * Cream Border (#EBE6DF), Gold Accent (#F59E0B), and Emerald (#10B981).
 * Completely crisp, lightweight, legible, and directly communicates each tailoring milestone.
 */

// =========================================================================
// Hero Graphic: Tailor's Atelier Mannequin + Digital Fitting Pass Mobile
// =========================================================================
export function HeroTailoringIllustration({ className = 'w-full h-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Darzi In-Studio Fitting & Digital Pass"
    >
      <defs>
        <linearGradient id="heroBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF8F5" />
          <stop offset="100%" stopColor="#F4EFEA" />
        </linearGradient>
        <linearGradient id="terragrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B26A4A" />
          <stop offset="100%" stopColor="#9E593B" />
        </linearGradient>
        <linearGradient id="phoneCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FAF8F5" />
        </linearGradient>
        <filter id="heroShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0F1115" floodOpacity="0.09" />
        </filter>
        <filter id="badgeShadow" x="-15%" y="-15%" width="130%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0F1115" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Frame Background */}
      <rect width="540" height="380" rx="24" fill="url(#heroBgGrad)" />
      
      {/* Studio Atmosphere Geometry */}
      <circle cx="420" cy="100" r="130" fill="#EBE6DF" fillOpacity="0.45" />
      <circle cx="100" cy="300" r="80" fill="#9E593B" fillOpacity="0.05" />
      <path d="M 40 50 L 500 50 M 40 330 L 500 330" stroke="#E5E0D8" strokeWidth="1" strokeDasharray="4 6" />

      {/* LEFT: Sartorial Mannequin & Tailoring Accents */}
      <g transform="translate(45, 50)">
        {/* Stand Base */}
        <ellipse cx="75" cy="270" rx="36" ry="8" fill="#D6CFC4" />
        <rect x="73" y="180" width="4" height="90" rx="2" fill="#1E2229" />
        <circle cx="75" cy="180" r="7" fill="#9E593B" />

        {/* Tailored Wool Torso */}
        <path
          d="M 52 45 C 58 24, 92 24, 98 45 C 110 68, 112 110, 102 175 C 94 185, 56 185, 48 175 C 38 110, 40 68, 52 45 Z"
          fill="#1E2229"
        />
        {/* Wooden Finial Cap */}
        <path d="M 64 27 C 64 20, 86 20, 86 27 Z" fill="#9E593B" />
        <ellipse cx="75" cy="22" rx="6" ry="3.5" fill="#D6C7B2" />

        {/* Tailor's Basting Stitches */}
        <path d="M 58 65 Q 75 80 92 65" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M 54 105 Q 75 115 96 105" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M 75 30 L 75 175" stroke="#FAF8F5" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Measuring Tape Draped over Shoulder */}
        <path
          d="M 58 44 C 44 75, 48 125, 60 170 C 62 180, 56 190, 50 200"
          stroke="#F59E0B"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 58 44 C 44 75, 48 125, 60 170 C 62 180, 56 190, 50 200"
          stroke="#0F1115"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          fill="none"
        />

        {/* Floating Tailor Shears Icon Badge */}
        <g transform="translate(100, 110)" filter="url(#badgeShadow)">
          <circle cx="22" cy="22" r="22" fill="#FFFFFF" stroke="#EBE6DF" strokeWidth="1.5" />
          <path d="M 14 14 L 30 30 M 30 14 L 14 30" stroke="#0F1115" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="13" cy="13" r="4.5" stroke="#9E593B" strokeWidth="2" fill="none" />
          <circle cx="31" cy="13" r="4.5" stroke="#9E593B" strokeWidth="2" fill="none" />
        </g>
      </g>

      {/* RIGHT: Clear Smartphone with Digital Fitting Pass */}
      <g transform="translate(260, 35)" filter="url(#heroShadow)">
        {/* Phone Chassis */}
        <rect x="0" y="0" width="220" height="310" rx="34" fill="#0F1115" />
        <rect x="5" y="5" width="210" height="300" rx="30" fill="#1E2229" />
        <rect x="7" y="7" width="206" height="296" rx="28" fill="#FFFFFF" />

        {/* Dynamic Island */}
        <rect x="75" y="14" width="70" height="12" rx="6" fill="#0F1115" />

        {/* App Top Bar */}
        <g transform="translate(18, 36)">
          <text x="0" y="12" fill="#0F1115" fontSize="11" fontWeight="800" fontFamily="sans-serif">DARZI</text>
          <rect x="150" y="2" width="34" height="14" rx="7" fill="#ECFDF5" />
          <circle cx="157" cy="9" r="2.5" fill="#10B981" />
          <text x="163" y="12" fill="#10B981" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">LIVE</text>
        </g>

        {/* Digital Fitting Pass Card */}
        <g transform="translate(18, 62)">
          <rect width="184" height="162" rx="14" fill="url(#phoneCardGrad)" stroke="#EBE6DF" strokeWidth="1.2" />
          
          {/* Header */}
          <rect x="12" y="12" width="60" height="14" rx="4" fill="#9E593B" fillOpacity="0.12" />
          <text x="18" y="22" fill="#9E593B" fontSize="8" fontWeight="700" fontFamily="sans-serif">FITTING PASS</text>
          
          <text x="12" y="42" fill="#0F1115" fontSize="12" fontWeight="800" fontFamily="sans-serif">Trouser Hemming</text>
          <text x="12" y="53" fill="#7A7E85" fontSize="8" fontFamily="sans-serif">Atelier SoHo · 0.4 mi away</text>

          {/* Direct QR Code */}
          <g transform="translate(56, 64)">
            <rect x="0" y="0" width="72" height="72" rx="8" fill="#FAF8F5" stroke="#DDD6CB" strokeWidth="1" />
            {/* Top-Left */}
            <rect x="7" y="7" width="18" height="18" fill="#0F1115" rx="2" />
            <rect x="10" y="10" width="12" height="12" fill="#FAF8F5" />
            <rect x="13" y="13" width="6" height="6" fill="#0F1115" />
            {/* Top-Right */}
            <rect x="47" y="7" width="18" height="18" fill="#0F1115" rx="2" />
            <rect x="50" y="10" width="12" height="12" fill="#FAF8F5" />
            <rect x="53" y="13" width="6" height="6" fill="#0F1115" />
            {/* Bottom-Left */}
            <rect x="7" y="47" width="18" height="18" fill="#0F1115" rx="2" />
            <rect x="10" y="50" width="12" height="12" fill="#FAF8F5" />
            <rect x="13" y="53" width="6" height="6" fill="#0F1115" />
            {/* Center pattern */}
            <rect x="31" y="12" width="8" height="8" fill="#9E593B" />
            <rect x="31" y="28" width="10" height="10" fill="#0F1115" />
            <rect x="47" y="31" width="8" height="8" fill="#0F1115" />
            <rect x="31" y="47" width="10" height="8" fill="#9E593B" />
            <rect x="47" y="51" width="12" height="10" fill="#0F1115" />
          </g>

          <text x="92" y="150" textAnchor="middle" fill="#7A7E85" fontSize="7.5" fontWeight="600" fontFamily="sans-serif">Scan in studio · No app needed</text>
        </g>

        {/* Bottom CTA Button */}
        <g transform="translate(18, 236)">
          <rect width="184" height="34" rx="17" fill="url(#terragrad)" />
          <text x="92" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" letterSpacing="0.5" fontFamily="sans-serif">EXPRESS DROP-OFF</text>
        </g>
      </g>
    </svg>
  )
}

// =========================================================================
// Step 1: Getting Started (Service Selection & Fixed Standard Upfront Price)
// =========================================================================
export function Step1Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      
      {/* Interactive Selection Card 1: Active */}
      <g transform="translate(24, 22)">
        <rect width="272" height="66" rx="12" fill="#FFFFFF" stroke="#9E593B" strokeWidth="2" />
        
        {/* Selected Checkmark Badge */}
        <circle cx="28" cy="33" r="14" fill="#9E593B" />
        <path d="M 22 33 L 26 37 L 34 29" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Item Title & Details */}
        <text x="52" y="28" fill="#0F1115" fontSize="12" fontWeight="700" fontFamily="sans-serif">Trouser & Jeans Hemming</text>
        <text x="52" y="44" fill="#7A7E85" fontSize="9" fontFamily="sans-serif">Original hem / Plain finish · 48h</text>

        {/* Upfront Price Tag */}
        <rect x="218" y="20" width="44" height="26" rx="6" fill="#FAF8F5" stroke="#E5DFD5" strokeWidth="1" />
        <text x="240" y="37" textAnchor="middle" fill="#0F1115" fontSize="13" fontWeight="800" fontFamily="sans-serif">$20</text>
      </g>

      {/* Item 2: Secondary Option */}
      <g transform="translate(24, 98)">
        <rect width="272" height="60" rx="12" fill="#FFFFFF" stroke="#E8E2D8" strokeWidth="1.2" />
        
        <circle cx="28" cy="30" r="12" fill="#F3EFEA" />
        <circle cx="28" cy="30" r="4" fill="#DDD6CB" />

        <text x="52" y="26" fill="#1E2229" fontSize="11" fontWeight="600" fontFamily="sans-serif">Blazer Sleeve Resets</text>
        <text x="52" y="40" fill="#7A7E85" fontSize="9" fontFamily="sans-serif">Shorten from cuff & button reposition</text>

        <text x="240" y="34" textAnchor="middle" fill="#7A7E85" fontSize="12" fontWeight="700" fontFamily="sans-serif">$45</text>
      </g>

      {/* Upfront Transparency Pill */}
      <g transform="translate(80, 168)">
        <rect width="160" height="20" rx="10" fill="#ECFDF5" stroke="#A7F3D0" />
        <text x="80" y="14" textAnchor="middle" fill="#10B981" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">✓ Fixed Rates · Zero Hidden Surcharges</text>
      </g>
    </svg>
  )
}

// =========================================================================
// Step 2: Matching Customer & Master Atelier (Proximity & Machinery Match)
// =========================================================================
export function Step2Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      
      {/* Clean Grid Lines */}
      <path d="M 20 60 L 300 60 M 20 120 L 300 120 M 20 160 L 300 160" stroke="#E8E2D8" strokeWidth="1" strokeDasharray="3 4" />
      <path d="M 80 20 L 80 180 M 160 20 L 160 180 M 240 20 L 240 180" stroke="#E8E2D8" strokeWidth="1" strokeDasharray="3 4" />

      {/* Radar Reach */}
      <circle cx="80" cy="120" r="50" fill="#9E593B" fillOpacity="0.05" stroke="#9E593B" strokeOpacity="0.2" strokeWidth="1" />

      {/* User Origin Pin */}
      <g transform="translate(80, 120)">
        <circle cx="0" cy="0" r="10" fill="#0F1115" />
        <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
        <rect x="-35" y="14" width="70" height="18" rx="4" fill="#0F1115" />
        <text x="0" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="sans-serif">Your Location</text>
      </g>

      {/* Connected Routing Arc */}
      <path d="M 80 120 C 110 50, 150 50, 175 65" stroke="#9E593B" strokeWidth="2.5" strokeDasharray="5 4" fill="none" />

      {/* Matched Master Atelier Card */}
      <g transform="translate(165, 30)">
        <rect width="135" height="100" rx="12" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.5" />
        
        {/* Badge Header */}
        <circle cx="20" cy="22" r="10" fill="#9E593B" />
        <path d="M 16 22 L 24 22 M 20 18 L 20 26" stroke="#FFFFFF" strokeWidth="1.5" />
        <text x="36" y="20" fill="#0F1115" fontSize="10" fontWeight="700" fontFamily="sans-serif">Atelier SoHo</text>
        <text x="36" y="30" fill="#10B981" fontSize="8" fontWeight="600" fontFamily="sans-serif">★ 4.98 · 0.4 mi away</text>

        <line x1="12" y1="40" x2="123" y2="40" stroke="#EBE6DF" strokeWidth="1" />

        {/* Verification Checks */}
        <text x="14" y="55" fill="#1E2229" fontSize="8" fontWeight="700" fontFamily="sans-serif">Machinery Verified:</text>
        
        <g transform="translate(14, 63)">
          <rect width="107" height="14" rx="3" fill="#FAF8F5" />
          <text x="6" y="10" fill="#7A7E85" fontSize="7.5" fontWeight="600" fontFamily="sans-serif">✓ OEM Blindstitch</text>
        </g>
        
        <g transform="translate(14, 80)">
          <rect width="107" height="14" rx="3" fill="#FAF8F5" />
          <text x="6" y="10" fill="#7A7E85" fontSize="7.5" fontWeight="600" fontFamily="sans-serif">✓ Heavy Denim Chainstitch</text>
        </g>
      </g>
    </svg>
  )
}

// =========================================================================
// Step 3: In-Studio Fitting & 5-Min Pinning
// =========================================================================
export function Step3Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />

      {/* Trouser Leg Hem Pinning Visual */}
      <g transform="translate(45, 20)">
        {/* Trouser Cuff Silhouette */}
        <path d="M 20 15 L 80 15 L 85 140 L 15 140 Z" fill="#1E2229" rx="4" />
        
        {/* Chalk Adjustment Line */}
        <line x1="15" y1="105" x2="85" y2="105" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 3" />
        <text x="92" y="108" fill="#9E593B" fontSize="9" fontWeight="800" fontFamily="sans-serif">-1.5″ Hem Break</text>

        {/* Tailor's Pin Visuals */}
        <circle cx="28" cy="105" r="3" fill="#F59E0B" />
        <line x1="28" y1="105" x2="38" y2="115" stroke="#FFFFFF" strokeWidth="1.5" />

        <circle cx="68" cy="105" r="3" fill="#F59E0B" />
        <line x1="68" y1="105" x2="78" y2="115" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Measuring Tape along Inseam */}
        <rect x="8" y="25" width="8" height="110" rx="2" fill="#F59E0B" />
        <line x1="8" y1="40" x2="16" y2="40" stroke="#0F1115" strokeWidth="1" />
        <line x1="8" y1="60" x2="16" y2="60" stroke="#0F1115" strokeWidth="1" />
        <line x1="8" y1="80" x2="16" y2="80" stroke="#0F1115" strokeWidth="1" />
        <line x1="8" y1="100" x2="16" y2="100" stroke="#0F1115" strokeWidth="1" />
        <line x1="8" y1="120" x2="16" y2="120" stroke="#0F1115" strokeWidth="1" />
      </g>

      {/* 5-Minute In-Studio Fitting Card */}
      <g transform="translate(170, 45)">
        <rect width="125" height="105" rx="12" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.5" />
        
        <rect x="12" y="14" width="28" height="28" rx="8" fill="#FAF8F5" stroke="#E5DFD5" strokeWidth="1" />
        <path d="M 21 21 L 31 31 M 31 21 L 21 31" stroke="#0F1115" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="20" r="3" stroke="#9E593B" strokeWidth="1.5" fill="none" />
        <circle cx="32" cy="20" r="3" stroke="#9E593B" strokeWidth="1.5" fill="none" />

        <text x="46" y="25" fill="#9E593B" fontSize="8" fontWeight="700" fontFamily="sans-serif">EXPRESS FITTING</text>
        <text x="46" y="38" fill="#0F1115" fontSize="12" fontWeight="800" fontFamily="sans-serif">5 Minutes</text>

        <line x1="12" y1="52" x2="113" y2="52" stroke="#EBE6DF" strokeWidth="1" />

        <text x="12" y="68" fill="#1E2229" fontSize="8" fontWeight="700" fontFamily="sans-serif">Private Fitting Room</text>
        <text x="12" y="80" fill="#7A7E85" fontSize="7.5" fontFamily="sans-serif">Bring shoes for exact break</text>

        <rect x="12" y="88" width="101" height="12" rx="3" fill="#ECFDF5" />
        <text x="18" y="97" fill="#10B981" fontSize="7" fontWeight="700" fontFamily="sans-serif">✓ Digital Fit Passport Saved</text>
      </g>
    </svg>
  )
}

// =========================================================================
// Step 4: Precision Crafting & 48-Hour Completion
// =========================================================================
export function Step4Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />
      
      {/* Industrial Machine & Stitching Visual */}
      <g transform="translate(30, 25)">
        {/* Machine Head */}
        <path d="M 130 90 L 130 35 C 130 22, 118 18, 105 18 L 30 18 C 20 18, 15 25, 15 35 L 15 55 L 42 55 L 42 32 L 108 32 L 108 90 Z" fill="#1E2229" />
        <rect x="0" y="90" width="150" height="10" rx="3" fill="#1E2229" />

        {/* Needle & Presser Foot */}
        <rect x="25" y="55" width="8" height="22" rx="1" fill="#9E593B" />
        <line x1="29" y1="77" x2="29" y2="92" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

        {/* Thread Spool */}
        <rect x="95" y="8" width="10" height="10" rx="2" fill="#F59E0B" />
        <path d="M 100 8 Q 65 0 29 60" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />

        {/* Fabric Passing Through */}
        <path d="M 5 88 Q 60 82 140 88" stroke="#9E593B" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 5 88 Q 60 82 140 88" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 3" fill="none" />
      </g>

      {/* 48h Turnaround Status Card */}
      <g transform="translate(170, 30)">
        <rect width="125" height="110" rx="12" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.5" />
        
        <text x="14" y="20" fill="#9E593B" fontSize="8" fontWeight="700" fontFamily="sans-serif">GUARANTEED TURNAROUND</text>
        <text x="14" y="38" fill="#0F1115" fontSize="16" fontWeight="800" fontFamily="sans-serif">48 Hours</text>

        <line x1="14" y1="48" x2="111" y2="48" stroke="#EBE6DF" strokeWidth="1" />

        {/* Tracker Steps */}
        <circle cx="20" cy="62" r="4" fill="#10B981" />
        <text x="30" y="65" fill="#0F1115" fontSize="8" fontWeight="700" fontFamily="sans-serif">1. Precision Stitching</text>

        <circle cx="20" cy="78" r="4" fill="#10B981" />
        <text x="30" y="81" fill="#0F1115" fontSize="8" fontWeight="700" fontFamily="sans-serif">2. Steam Pressing</text>

        <circle cx="20" cy="94" r="4" fill="#10B981" />
        <text x="30" y="97" fill="#0F1115" fontSize="8" fontWeight="700" fontFamily="sans-serif">3. SMS Ready Notice</text>
      </g>

      {/* Progress Bar Bottom */}
      <g transform="translate(30, 160)">
        <rect width="260" height="8" rx="4" fill="#E8E2D8" />
        <rect width="260" height="8" rx="4" fill="#0F1115" />
        <circle cx="256" cy="4" r="6" fill="#10B981" />
      </g>
    </svg>
  )
}

// =========================================================================
// Step 5: Try-On & 100% Fit Guarantee
// =========================================================================
export function Step5Illustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="320" height="200" rx="16" fill="#F8F5F0" />

      {/* Tailored Garment On Hanger */}
      <g transform="translate(45, 18)">
        {/* Hanger Hook */}
        <path d="M 45 15 C 45 5, 55 5, 55 15 C 55 24, 40 24, 40 30" stroke="#9E593B" strokeWidth="2.5" fill="none" />
        {/* Hanger Body */}
        <path d="M 10 48 L 45 30 L 80 48 Z" fill="#9E593B" />

        {/* Tailored Blazer Silhouette */}
        <path d="M 16 48 L 6 125 L 30 130 L 35 80 L 45 130 L 55 80 L 60 130 L 84 125 L 74 48 Z" fill="#0F1115" />
        {/* Lapel V-Neck & Gold Pin */}
        <path d="M 32 48 L 45 90 L 58 48 Z" fill="#FAF8F5" />
        <circle cx="45" cy="62" r="2.5" fill="#F59E0B" />
      </g>

      {/* 100% Fit Guarantee Card */}
      <g transform="translate(155, 30)">
        <rect width="140" height="140" rx="14" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.5" />
        
        {/* 5 Golden Stars */}
        <g transform="translate(18, 18)">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d="M 6 0 L 7.8 3.8 L 12 4.4 L 9 7.3 L 9.7 11.5 L 6 9.5 L 2.3 11.5 L 3 7.3 L 0 4.4 L 4.2 3.8 Z"
              transform={`translate(${i * 21}, 0)`}
              fill="#F59E0B"
            />
          ))}
        </g>

        <line x1="16" y1="38" x2="124" y2="38" stroke="#EBE6DF" strokeWidth="1" />

        {/* Green Guarantee Shield */}
        <g transform="translate(16, 48)">
          <circle cx="16" cy="16" r="16" fill="#ECFDF5" />
          <path d="M 10 16 L 14 20 L 22 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          <text x="38" y="14" fill="#0F1115" fontSize="10.5" fontWeight="800" fontFamily="sans-serif">100% Fit Guarantee</text>
          <text x="38" y="26" fill="#7A7E85" fontSize="8" fontFamily="sans-serif">Complimentary tweaks</text>
        </g>

        {/* Studio Badge */}
        <rect x="16" y="92" width="108" height="34" rx="6" fill="#FAF8F5" stroke="#E5DFD5" strokeWidth="1" />
        <text x="24" y="106" fill="#1E2229" fontSize="8" fontWeight="700" fontFamily="sans-serif">In-Studio Try On</text>
        <text x="24" y="118" fill="#9E593B" fontSize="7.5" fontWeight="600" fontFamily="sans-serif">Walk out with perfect fit ✓</text>
      </g>
    </svg>
  )
}

// =========================================================================
// Online Booking Split Feature
// =========================================================================
export function OnlineBookingIllustration({ className = 'w-full h-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Laptop Mockup */}
      <g transform="translate(25, 20)">
        <rect width="320" height="200" rx="14" fill="#0F1115" />
        <rect x="6" y="6" width="308" height="188" rx="10" fill="#FFFFFF" />

        {/* Browser Chrome */}
        <rect x="6" y="6" width="308" height="26" fill="#FAF8F5" />
        <circle cx="20" cy="19" r="3.5" fill="#EF4444" />
        <circle cx="30" cy="19" r="3.5" fill="#F59E0B" />
        <circle cx="40" cy="19" r="3.5" fill="#10B981" />
        <rect x="65" y="13" width="180" height="12" rx="6" fill="#E8E2D8" />
        <text x="85" y="22" fill="#7A7E85" fontSize="7" fontWeight="600" fontFamily="sans-serif">darzi.com/book-tailoring</text>

        {/* Left Side: Services List */}
        <rect x="18" y="44" width="115" height="138" rx="8" fill="#FAF8F5" stroke="#EBE6DF" strokeWidth="1" />
        <text x="28" y="60" fill="#0F1115" fontSize="8.5" fontWeight="800" fontFamily="sans-serif">Choose Service</text>
        
        <rect x="26" y="70" width="99" height="26" rx="4" fill="#FFFFFF" stroke="#9E593B" strokeWidth="1.2" />
        <text x="32" y="82" fill="#0F1115" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">Trouser Alterations</text>
        <text x="32" y="90" fill="#9E593B" fontSize="6.5" fontFamily="sans-serif">From $20 · 48h</text>
        
        <rect x="26" y="102" width="99" height="22" rx="4" fill="#FFFFFF" stroke="#EBE6DF" strokeWidth="1" />
        <text x="32" y="116" fill="#7A7E85" fontSize="7.5" fontFamily="sans-serif">Suit & Blazer Adjust</text>

        <rect x="26" y="128" width="99" height="22" rx="4" fill="#FFFFFF" stroke="#EBE6DF" strokeWidth="1" />
        <text x="32" y="142" fill="#7A7E85" fontSize="7.5" fontFamily="sans-serif">Dress & Gown Resets</text>

        {/* Right Side: Map & Atelier Selection */}
        <rect x="145" y="44" width="158" height="138" rx="8" fill="#F3EFEA" />
        <path d="M 155 70 L 295 70 M 155 110 L 295 110 M 155 150 L 295 150" stroke="#E5DFD5" strokeDasharray="3 3" />
        
        <circle cx="215" cy="85" r="16" fill="#9E593B" fillOpacity="0.15" />
        <circle cx="215" cy="85" r="5" fill="#9E593B" />
        
        <rect x="160" y="115" width="128" height="38" rx="6" fill="#FFFFFF" stroke="#0F1115" strokeWidth="1.2" />
        <text x="170" y="130" fill="#0F1115" fontSize="8" fontWeight="800" fontFamily="sans-serif">Atelier SoHo (0.4 mi)</text>
        <text x="170" y="140" fill="#10B981" fontSize="7" fontWeight="600" fontFamily="sans-serif">Instant Fitting Pass Ready ✓</text>

        {/* Laptop Base Plate */}
        <path d="M -15 200 L 335 200 L 355 212 L -35 212 Z" fill="#D6D1CA" />
      </g>

      {/* Smartphone Overlap */}
      <g transform="translate(300, 90)">
        <rect width="145" height="215" rx="26" fill="#0F1115" />
        <rect x="4" y="4" width="137" height="207" rx="22" fill="#FFFFFF" />
        
        {/* Dynamic Island */}
        <rect x="48" y="10" width="50" height="7" rx="3.5" fill="#0F1115" />

        {/* Mobile Pass Content */}
        <rect x="14" y="26" width="117" height="175" rx="12" fill="#FAF8F5" stroke="#EBE6DF" strokeWidth="1" />
        <text x="24" y="44" fill="#0F1115" fontSize="9" fontWeight="800" fontFamily="sans-serif">Digital Fitting Pass</text>
        <text x="24" y="54" fill="#9E593B" fontSize="7" fontWeight="600" fontFamily="sans-serif">Atelier SoHo</text>

        {/* QR Core */}
        <rect x="36" y="66" width="72" height="72" rx="6" fill="#FFFFFF" stroke="#DDD6CB" strokeWidth="1" />
        <rect x="42" y="72" width="16" height="16" fill="#0F1115" />
        <rect x="86" y="72" width="16" height="16" fill="#0F1115" />
        <rect x="42" y="116" width="16" height="16" fill="#0F1115" />
        <rect x="65" y="94" width="14" height="14" fill="#9E593B" />

        {/* Pass Button */}
        <rect x="24" y="152" width="97" height="24" rx="12" fill="#9E593B" />
        <text x="72" y="167" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">Show in Studio</text>
      </g>
    </svg>
  )
}

// =========================================================================
// Category Silhouette Icons (Clean & Recognizable)
// =========================================================================
export function TrousersSilhouette({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 16 8 L 48 8 L 52 56 L 36 56 L 32 26 L 28 56 L 12 56 Z" fill="#1E2229" />
      <path d="M 12 52 L 28 52 M 36 52 L 52 52" stroke="#9E593B" strokeWidth="2.5" />
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
      <line x1="32" y1="12" x2="32" y2="52" stroke="#0F1115" strokeWidth="4" strokeDasharray="3 3" />
      <path d="M 26 28 L 38 28 L 35 40 L 29 40 Z" fill="#9E593B" />
      <circle cx="32" cy="45" r="4" stroke="#9E593B" strokeWidth="2" fill="none" />
      <line x1="16" y1="20" x2="48" y2="44" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

