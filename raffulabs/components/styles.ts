// Plain values (not in a "use client" module) so server components get real strings.
export const ease = [0.16, 1, 0.3, 1] as const;

export const btnPrimary =
  "group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-clay";
export const btnSecondary =
  "group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink/40";
export const card = "rounded-3xl border border-ink/[0.07] bg-white shadow-card";
