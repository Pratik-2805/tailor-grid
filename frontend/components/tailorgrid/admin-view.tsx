'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronRight, DollarSign, Download, Filter, RefreshCw, Scissors, ShieldAlert, ShoppingBag, Store, TrendingUp, Users } from 'lucide-react'
import { PARTNER_STORES, type Screen } from './data'

export function AdminView({ go }: { go: (s: Screen) => void }) {
  const [filterStatus, setFilterStatus] = useState('All Orders')
  const [reportExported, setReportExported] = useState(false)
  const [selectedStudioOverride, setSelectedStudioOverride] = useState<string | null>(null)

  const rows = [
    { id: 'TG-1048', customer: 'Camilla H.', store: 'Atelier North', garment: 'Jeans Hemming', status: 'Work in Progress', price: '£26.00', payout: '£20.00', retail: 'Yes (£45)' },
    { id: 'TG-1047', customer: 'David K.', store: 'Stitch & Form', garment: 'Shirt Slimming', status: 'Customer Arrived', price: '£22.00', payout: '£16.00', retail: 'Pending' },
    { id: 'TG-1046', customer: 'Sarah L.', store: 'The Hem Room', garment: 'Dress Bodice Fit', status: 'Ready for Pick-Up', price: '£38.00', payout: '£29.00', retail: 'Yes (£80)' },
    { id: 'TG-1045', customer: 'Julian S.', store: 'Soho Craft Tailors', garment: 'Blazer Sleeves', status: 'Completed & Closed', price: '£35.00', payout: '£27.00', retail: 'Yes (£120)' },
    { id: 'TG-1044', customer: 'Elena R.', store: 'Atelier North', garment: 'Suit Overhaul', status: 'Completed & Closed', price: '£85.00', payout: '£65.00', retail: 'No' },
  ]

  return (
    <div className="py-10 lg:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
        
        {/* Navigation */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7E85] hover:text-[#18191B] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Overview
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#DDD6CB]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E593B]">
              Network Operations &amp; Reconciliation
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#18191B]">
              Admin Workspace.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#5A5D64]">
              Real-time alteration pipeline, partner dispatch allocations, and retail purchase conversions.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setReportExported(true)
                setTimeout(() => setReportExported(false), 3000)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#DDD6CB] bg-white px-5 py-2.5 text-xs font-semibold text-[#18191B] hover:bg-[#FAF8F5] shadow-2xs"
            >
              <Download size={13} />
              <span>{reportExported ? 'CSV Exported!' : 'Export Financial Reconcile'}</span>
            </button>
          </div>
        </div>

        {/* Top KPIs (Tech Brief Specified metrics) */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#DDD6CB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#7A7E85]">
              <span>Alteration GMV</span>
              <DollarSign size={16} className="text-[#9E593B]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#18191B]">£32,450</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold">+18% this month</p>
          </div>

          <div className="rounded-2xl border border-[#DDD6CB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#7A7E85]">
              <span>Platform Net Revenue</span>
              <TrendingUp size={16} className="text-[#9E593B]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#18191B]">£8,112</p>
            <p className="mt-1 text-[11px] text-[#7A7E85]">Avg take-rate: 25.0%</p>
          </div>

          <div className="rounded-2xl border border-[#DDD6CB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#7A7E85]">
              <span>Partner Studio Payouts</span>
              <Store size={16} className="text-[#9E593B]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#18191B]">£24,338</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold">100% reconciled on-time</p>
          </div>

          <div className="rounded-2xl border border-[#DDD6CB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#7A7E85]">
              <span>Retail Cross-Sell Conv.</span>
              <ShoppingBag size={16} className="text-[#9E593B]" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-emerald-700">38.4%</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold">£14,680 merchandise sold</p>
          </div>
        </div>

        {/* Live Orders Table */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="font-serif text-2xl font-semibold text-[#18191B]">Live Order Dispatches</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7E85]">Filter status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-[#DDD6CB] bg-white px-3 py-1.5 text-xs font-medium focus:outline-none"
              >
                <option>All Orders</option>
                <option>Customer Arrived</option>
                <option>Work in Progress</option>
                <option>Ready for Pick-Up</option>
                <option>Completed &amp; Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DDD6CB] bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DDD6CB] bg-[#FAF8F5] text-[11px] uppercase tracking-wider text-[#7A7E85]">
                <tr>
                  <th className="py-4 px-5">Ref ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Allocated Studio</th>
                  <th className="py-4 px-4">Service</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Gross / Payout</th>
                  <th className="py-4 px-4">In-Store Retail</th>
                  <th className="py-4 px-5 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE3]">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#18191B]">{r.id}</td>
                    <td className="py-4 px-4 font-semibold text-[#18191B]">{r.customer}</td>
                    <td className="py-4 px-4 text-[#5A5D64]">{r.store}</td>
                    <td className="py-4 px-4 text-[#5A5D64]">{r.garment}</td>
                    <td className="py-4 px-4">
                      <span className="rounded-full bg-[#F4EFEA] px-2.5 py-1 text-[10px] font-bold text-[#9E593B]">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#18191B]">
                      {r.price} <span className="text-[#7A7E85] text-[10px]">({r.payout})</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-emerald-700">{r.retail}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedStudioOverride(r.id)}
                        className="text-[11px] font-semibold text-[#9E593B] hover:underline"
                      >
                        Reassign Store
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reassignment Modal */}
        {selectedStudioOverride && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[480px] rounded-3xl border border-[#DDD6CB] bg-white p-7 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#DDD6CB] pb-4">
                <span className="font-serif text-lg font-bold text-[#18191B]">
                  Manual Dispatch Override ({selectedStudioOverride})
                </span>
                <button
                  onClick={() => setSelectedStudioOverride(null)}
                  className="text-xs font-bold text-[#7A7E85]"
                >
                  ✕
                </button>
              </div>

              <div className="my-5 space-y-2">
                <label className="block text-xs font-semibold text-[#18191B]">Reallocate to Partner Studio:</label>
                {PARTNER_STORES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudioOverride(null)}
                    className="w-full text-left p-3 rounded-xl border border-[#DDD6CB] hover:border-[#9E593B] hover:bg-[#F4EFEA] transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#18191B]">{st.name}</p>
                      <p className="text-[11px] text-[#7A7E85]">{st.area} · Capacity: {st.dailyCapacity}/day</p>
                    </div>
                    <ChevronRight size={14} className="text-[#9E593B]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
