'use client'

import React from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react'

interface StudiosTabProps {
  studios: any[]
  studioSearch: string
  setStudioSearch: (val: string) => void
  studioAreaFilter: string
  setStudioAreaFilter: (val: string) => void
  availableAreas: string[]
  onOpenAddStudio: () => void
  onEditStudio: (studio: any) => void
  onDeleteStudio: (id: string, name: string) => void
}

export function StudiosTab({
  studios,
  studioSearch,
  setStudioSearch,
  studioAreaFilter,
  setStudioAreaFilter,
  availableAreas,
  onOpenAddStudio,
  onEditStudio,
  onDeleteStudio,
}: StudiosTabProps) {
  const filteredStudios = studios.filter((s) => {
    const matchArea = studioAreaFilter === 'ALL' || s.area === studioAreaFilter
    const q = studioSearch.toLowerCase().trim()
    const matchSearch =
      !q ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.area && s.area.toLowerCase().includes(q)) ||
      (s.postcode && s.postcode.toLowerCase().includes(q)) ||
      (s.leadTailor && s.leadTailor.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    return matchArea && matchSearch
  })

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-[#A8A29E]" />
            <input
              type="text"
              value={studioSearch}
              onChange={(e) => setStudioSearch(e.target.value)}
              placeholder="Search by studio name, postcode, lead..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
            />
          </div>

          <select
            value={studioAreaFilter}
            onChange={(e) => setStudioAreaFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Areas</option>
            {availableAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#78716C] font-semibold mr-1">
            {filteredStudios.length} Partner Studios
          </span>
          <button
            onClick={onOpenAddStudio}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#9E593B] text-white text-xs font-bold rounded-xl hover:bg-[#8A4C32] transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Add Studio</span>
          </button>
        </div>
      </div>

      {/* Studios Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudios.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-xs hover:border-[#9E593B]/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Name & Edit button */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E593B] bg-[#FAF3ED] px-2 py-0.5 rounded-full border border-[#EADBCE]">
                    {s.area || 'Studio Partner'}
                  </span>
                  <h3 className="text-sm font-bold text-[#1E2229] mt-1.5 line-clamp-1">
                    {s.name}
                  </h3>
                  <p className="text-[11px] text-[#78716C] line-clamp-1 mt-0.5">
                    {s.address} • {s.postcode}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditStudio(s)}
                    className="p-1.5 text-[#78716C] hover:text-[#1E2229] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                    title="Edit Studio"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteStudio(s.id, s.name)}
                    className="p-1.5 text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Studio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Capacity & Load Bar */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E1D5] mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#78716C]">Active Orders:</span>
                  <span className="text-[#1E2229]">
                    <strong>{s.activeOrdersCount ?? 0}</strong> / {s.dailyCapacity} max
                  </span>
                </div>
                <div className="w-full bg-[#E8E1D5] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (s.utilization ?? 0) > 85 ? 'bg-rose-500' :
                      (s.utilization ?? 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, s.utilization ?? 0)}%` }}
                  />
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-2 rounded-xl">
                  <span className="text-[10px] text-[#78716C] block font-semibold">Machines</span>
                  <strong className="text-[#1E2229] font-bold">{s.machines || 4}</strong>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-2 rounded-xl">
                  <span className="text-[10px] text-[#78716C] block font-semibold">Workers</span>
                  <strong className="text-[#1E2229] font-bold">{s.workers || 3}</strong>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E8E1D5] p-2 rounded-xl">
                  <span className="text-[10px] text-[#78716C] block font-semibold">Rating</span>
                  <strong className="text-amber-700 font-bold">★ {s.rating || 4.9}</strong>
                </div>
              </div>

              <div className="text-[11px] text-[#78716C] space-y-1 mb-2">
                <p className="flex items-center justify-between">
                  <span>Lead Tailor:</span>
                  <strong className="text-[#1E2229] font-semibold">{s.leadTailor || 'Master Tailor'}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Phone:</span>
                  <strong className="text-[#1E2229] font-mono font-semibold">{s.phone || '—'}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Email:</span>
                  <strong className="text-[#1E2229] font-medium truncate max-w-[190px]" title={s.email}>{s.email || '—'}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Hours:</span>
                  <strong className="text-[#1E2229]">{s.openingHours || '09:00 - 19:00'}</strong>
                </p>
              </div>
            </div>

            {/* Specialties Pills */}
            {s.specialties && s.specialties.length > 0 && (
              <div className="pt-2 border-t border-[#E8E1D5] flex flex-wrap gap-1">
                {s.specialties.slice(0, 3).map((spec: string) => (
                  <span
                    key={spec}
                    className="text-[9px] font-semibold bg-[#FAF8F5] text-[#78716C] border border-[#E8E1D5] px-2 py-0.5 rounded-md"
                  >
                    {spec}
                  </span>
                ))}
                {s.specialties.length > 3 && (
                  <span className="text-[9px] text-[#A8A29E] font-semibold px-1">
                    +{s.specialties.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
