const SERVICES = [
  "Hem shortening", "Waist tapering", "Sleeve refits", "Kurta refitting", "Lehenga waist",
  "Blouse tailoring", "Invisible zips", "Suit suppression", "Lining repair", "Collar contouring",
];

export function TapeMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-ink/10 bg-white/60 py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {SERVICES.map((s) => (
              <li key={s} className="flex items-center gap-10 pr-10 font-display text-2xl text-ink/80 italic">
                {s} <span className="size-1.5 rounded-full bg-clay" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
