'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Scissors } from 'lucide-react'

const ROUTE = 'M44 214 C 120 196, 130 120, 210 116 S 320 92, 360 46'

/** Stylized, dependency-free map that animates a courier marker along a fixed route. */
export function LiveMap({
  progress,
  originLabel,
  destLabel,
  etaLabel,
}: {
  progress: number
  originLabel: string
  destLabel: string
  etaLabel?: string
}) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const [point, setPoint] = useState({ x: 44, y: 214 })

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    const p = path.getPointAtLength(Math.min(Math.max(progress, 0), 1) * total)
    setPoint({ x: p.x, y: p.y })
  }, [progress])

  return (
    <div className="relative overflow-hidden border border-[#d9d5cd] bg-[#e7e4db]">
      <svg viewBox="0 0 400 260" className="h-full w-full" role="img" aria-label="Live pickup map">
        {/* faint street grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={260} stroke="#d3cfc5" strokeWidth={1} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 52} x2={400} y2={i * 52} stroke="#d3cfc5" strokeWidth={1} />
        ))}
        {/* a couple of thicker roads */}
        <line x1={0} y1={158} x2={400} y2={158} stroke="#cfc9bd" strokeWidth={7} />
        <line x1={150} y1={0} x2={150} y2={260} stroke="#cfc9bd" strokeWidth={7} />
        {/* planned route */}
        <path ref={pathRef} d={ROUTE} fill="none" stroke="#a6593b" strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
        {/* origin (store) */}
        <circle cx={44} cy={214} r={7} fill="#202b38" />
        {/* destination (customer) */}
        <circle cx={360} cy={46} r={7} fill="#a6593b" />
      </svg>

      {/* moving courier marker */}
      <div
        className="pointer-events-none absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#202b38] text-[#f8f7f3] shadow-[0_4px_14px_rgba(32,43,56,.35)] transition-[left,top] duration-700 ease-linear"
        style={{ left: `${(point.x / 400) * 100}%`, top: `${(point.y / 260) * 100}%` }}
      >
        <Scissors size={15} />
      </div>

      {/* labels */}
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-[#f8f7f3]/95 px-2.5 py-1 text-[11px] font-medium">
        <Scissors size={12} className="text-[#202b38]" /> {originLabel}
      </span>
      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-[#f8f7f3]/95 px-2.5 py-1 text-[11px] font-medium">
        <MapPin size={12} className="text-[#a6593b]" /> {destLabel}
      </span>
      {etaLabel && (
        <span className="absolute right-3 bottom-3 bg-[#202b38] px-2.5 py-1 text-[11px] font-medium text-[#f8f7f3]">{etaLabel}</span>
      )}
    </div>
  )
}
