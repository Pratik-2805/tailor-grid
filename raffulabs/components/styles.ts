// Plain values (not in a "use client" module) so server components get real strings.
export const ease = [0.16, 1, 0.3, 1] as const;

export const btnPrimary =
  "inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/90 cursor-pointer";
export const btnSecondary =
  "inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-300/80 bg-white/70 px-5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 cursor-pointer";
export const card =
  "rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:shadow-sm";
