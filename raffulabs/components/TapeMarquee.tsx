const SERVICES = [
  { name: "Trouser & Denim Hemming", detail: "Original Hem Kept", inch: 28, cm: 71 },
  { name: "Waist & Seat Tapering", detail: "Inseam & Outseam", inch: 30, cm: 76 },
  { name: "Sleeve Shortening & Cuffs", detail: "Surgeon Cuffs", inch: 32, cm: 81 },
  { name: "Kurta & Sherwani Refitting", detail: "Ethnic Tailoring", inch: 34, cm: 86 },
  { name: "Lehenga Waist & Length", detail: "Border Adjustments", inch: 36, cm: 91 },
  { name: "Blouse & Choli Tailoring", detail: "Precision Fit", inch: 38, cm: 96 },
  { name: "Invisible Raffu & Mending", detail: "Hand Reweaving", inch: 40, cm: 101 },
  { name: "Suit Jacket Suppression", detail: "Torso Contouring", inch: 42, cm: 106 },
  { name: "Invisible Zip Replacement", detail: "Dresses & Skirts", inch: 44, cm: 111 },
  { name: "Collar & Shoulder Reset", detail: "Bespoke Outerwear", inch: 46, cm: 116 },
  { name: "Coat & Jacket Relining", detail: "Silk & Cupro", inch: 48, cm: 121 },
  { name: "Chainstitch Denim Taper", detail: "Raw & Selvedge", inch: 50, cm: 127 },
];

/**
 * Top edge ruler markings for 2 inches (400px width segment).
 * Graduated in 1/16th inch intervals, with prominent inch numerals.
 */
function TopInchTicks({ inch }: { inch: number }) {
  return (
    <svg
      viewBox="0 0 400 20"
      className="w-full h-[18px] sm:h-[20px] select-none block"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Inch 1 (0 to 200px) */}
      <line x1="0" y1="0" x2="0" y2="18" stroke="#1F1712" strokeWidth="2.5" />
      <text
        x="6"
        y="14"
        fill="#1F1712"
        fontSize="12"
        fontFamily="var(--font-display), monospace"
        fontWeight="800"
      >
        {inch}&quot;
      </text>

      {/* 1/16th fractional ticks */}
      <line x1="12.5" y1="0" x2="12.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="25" y1="0" x2="25" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="37.5" y1="0" x2="37.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="50" y1="0" x2="50" y2="9.5" stroke="#1F1712" strokeWidth="1.2" opacity="0.9" />
      <line x1="62.5" y1="0" x2="62.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="75" y1="0" x2="75" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="87.5" y1="0" x2="87.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="100" y1="0" x2="100" y2="13" stroke="#C9502F" strokeWidth="1.6" />
      <line x1="112.5" y1="0" x2="112.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="125" y1="0" x2="125" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="137.5" y1="0" x2="137.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="150" y1="0" x2="150" y2="9.5" stroke="#1F1712" strokeWidth="1.2" opacity="0.9" />
      <line x1="162.5" y1="0" x2="162.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="175" y1="0" x2="175" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="187.5" y1="0" x2="187.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />

      {/* Inch 2 (200px mark) */}
      <line x1="200" y1="0" x2="200" y2="18" stroke="#1F1712" strokeWidth="2.5" />
      <text
        x="206"
        y="14"
        fill="#1F1712"
        fontSize="12"
        fontFamily="var(--font-display), monospace"
        fontWeight="800"
      >
        {inch + 1}&quot;
      </text>

      {/* 2nd inch fractional ticks */}
      <line x1="212.5" y1="0" x2="212.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="225" y1="0" x2="225" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="237.5" y1="0" x2="237.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="250" y1="0" x2="250" y2="9.5" stroke="#1F1712" strokeWidth="1.2" opacity="0.9" />
      <line x1="262.5" y1="0" x2="262.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="275" y1="0" x2="275" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="287.5" y1="0" x2="287.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="300" y1="0" x2="300" y2="13" stroke="#C9502F" strokeWidth="1.6" />
      <line x1="312.5" y1="0" x2="312.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="325" y1="0" x2="325" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="337.5" y1="0" x2="337.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="350" y1="0" x2="350" y2="9.5" stroke="#1F1712" strokeWidth="1.2" opacity="0.9" />
      <line x1="362.5" y1="0" x2="362.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
      <line x1="375" y1="0" x2="375" y2="6.5" stroke="#1F1712" strokeWidth="1" opacity="0.75" />
      <line x1="387.5" y1="0" x2="387.5" y2="4" stroke="#1F1712" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

/**
 * Bottom edge metric millimeter / centimeter graduations (400px segment).
 */
function BottomMetricTicks({ cm }: { cm: number }) {
  return (
    <svg
      viewBox="0 0 400 16"
      className="w-full h-[14px] sm:h-[16px] select-none block"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Centimeter ticks every 80px */}
      {[0, 80, 160, 240, 320].map((x, idx) => (
        <g key={x}>
          <line x1={x} y1="16" x2={x} y2="3" stroke="#1F1712" strokeWidth="1.75" />
          <text
            x={x + 3}
            y="9"
            fill="#1F1712"
            fontSize="9"
            fontFamily="var(--font-display), monospace"
            fontWeight="700"
            opacity="0.85"
          >
            {cm + idx}
          </text>
        </g>
      ))}

      {/* Millimeter ticks */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = i * 8;
        if (x % 80 === 0) return null; // already drawn major tick
        const isHalf = x % 40 === 0;
        return (
          <line
            key={i}
            x1={x}
            y1="16"
            x2={x}
            y2={isHalf ? "8" : "12"}
            stroke="#1F1712"
            strokeWidth={isHalf ? "1.2" : "0.75"}
            opacity={isHalf ? "0.7" : "0.4"}
          />
        );
      })}
    </svg>
  );
}

export function TapeMarquee() {
  return (
    <section
      aria-label="Tailoring services measuring tape"
      className="relative w-full overflow-hidden py-10 sm:py-14 select-none"
    >
      {/* Background shadow layer to give 3D depth to the tape */}
      <div
        className="pointer-events-none absolute inset-x-[-10%] top-1/2 -translate-y-1/2 h-16 rotate-[1.2deg] bg-[#1F1712]/5 blur-xl"
        aria-hidden="true"
      />

      {/* Slanted Tape Container - rotates gently down to the right (rotate-[1.2deg]) */}
      <div className="relative w-[116%] -left-[8%] transform rotate-[1.2deg] origin-center">
        {/* Physical Tape Ribbon - Warm Vintage Tailor Ochre */}
        <div className="group relative border-y border-[#B8922A]/60 bg-gradient-to-b from-[#F9E596] via-[#F2D46F] to-[#E5C155] shadow-[0_10px_24px_-6px_rgba(31,23,18,0.18),0_3px_8px_rgba(31,23,18,0.08)]">
          
          {/* Subtle tape fabric texture sheen */}
          <div
            className="pointer-events-none absolute inset-0 opacity-12 mix-blend-overlay bg-[radial-gradient(#1F1712_1px,transparent_1px)] [background-size:8px_8px]"
            aria-hidden="true"
          />

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-stretch"
              >
                {SERVICES.map((s) => (
                  <li
                    key={s.name}
                    className="relative flex w-[370px] sm:w-[430px] shrink-0 flex-col justify-between border-r border-[#A88020]/35 px-4 py-2 transition-colors hover:bg-white/10"
                  >
                    {/* Top Inch Graduations */}
                    <TopInchTicks inch={s.inch} />

                    {/* Center Service Content - Clean, elegant & legible */}
                    <div className="my-1.5 flex items-center justify-between gap-3 px-2">
                      <div className="flex items-center gap-2.5">
                        {/* Brass Tailor Eyelet / Rivet */}
                        <span
                          className="size-2 rounded-full border border-[#6B4B06] bg-[#FFF9DC] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] shrink-0"
                          title="Master tailor stitch point"
                        />

                        {/* Proper Service Title */}
                        <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#1F1712] whitespace-nowrap">
                          {s.name}
                        </span>
                      </div>

                      {/* Clean Craftsmanship Subtitle */}
                      <span className="font-serif text-xs italic text-[#5C3D04] opacity-80 whitespace-nowrap">
                        {s.detail}
                      </span>
                    </div>

                    {/* Bottom Metric Graduations */}
                    <BottomMetricTicks cm={s.cm} />
                  </li>
                ))}
              </ul>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

