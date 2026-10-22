'use client'

import React from 'react'
import {
  Search,
  Scissors,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
} from 'lucide-react'

interface OrdersTabProps {
  orders: any[]
  studios: any[]
  orderSearch: string
  setOrderSearch: (val: string) => void
  orderStatusFilter: string
  setOrderStatusFilter: (val: string) => void
  orderStoreFilter: string
  setOrderStoreFilter: (val: string) => void
  orderRetailFilter: string
  setOrderRetailFilter: (val: string) => void
  onEditOrder: (order: any) => void
  onQuickStatusChange?: (orderId: string, newStatus: string) => void
}

export function OrdersTab({
  orders,
  studios,
  orderSearch,
  setOrderSearch,
  orderStatusFilter,
  setOrderStatusFilter,
  orderStoreFilter,
  setOrderStoreFilter,
  orderRetailFilter,
  setOrderRetailFilter,
  onEditOrder,
  onQuickStatusChange,
}: OrdersTabProps) {
  // Compute clean operational counts
  const actionableCount = orders.filter((o) =>
    ['Allocated', 'Accepted', 'Customer Arrived'].includes(o.status)
  ).length

  const inProgressCount = orders.filter((o) =>
    ['Fitting Completed', 'Work in Progress'].includes(o.status)
  ).length

  const readyCount = orders.filter((o) => o.status === 'Ready').length
  const completedCount = orders.filter((o) => ['Collected', 'Closed'].includes(o.status)).length

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    let matchStatus = true
    if (orderStatusFilter === 'ACTION_NEEDED') {
      matchStatus = ['Allocated', 'Accepted', 'Customer Arrived'].includes(o.status)
    } else if (orderStatusFilter === 'IN_PROGRESS') {
      matchStatus = ['Fitting Completed', 'Work in Progress'].includes(o.status)
    } else if (orderStatusFilter === 'READY') {
      matchStatus = o.status === 'Ready'
    } else if (orderStatusFilter === 'COMPLETED') {
      matchStatus = ['Collected', 'Closed'].includes(o.status)
    } else if (orderStatusFilter !== 'ALL') {
      matchStatus = o.status === orderStatusFilter
    }

    const matchStore = orderStoreFilter === 'ALL' || o.storeId === orderStoreFilter
    const matchRetail =
      orderRetailFilter === 'ALL' ||
      (orderRetailFilter === 'RETAIL_ONLY' && Boolean(o.retailSold)) ||
      (orderRetailFilter === 'ALTERATION_ONLY' && !o.retailSold)

    const q = orderSearch.toLowerCase().trim()
    const matchSearch =
      !q ||
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q)) ||
      (o.storeName && o.storeName.toLowerCase().includes(q)) ||
      (o.hangTagNo && o.hangTagNo.toLowerCase().includes(q)) ||
      (o.serviceName && o.serviceName.toLowerCase().includes(q)) ||
      (o.retailCategory && o.retailCategory.toLowerCase().includes(q))

    return matchStatus && matchStore && matchRetail && matchSearch
  })

  // Export to CSV function (simple, zero dependencies)
  const handleExportCSV = () => {
    if (!filteredOrders.length) return
    const headers = [
      'Order ID',
      'Hang Tag',
      'Customer Name',
      'Phone',
      'Email',
      'Service',
      'Garment',
      'Store',
      'Price',
      'Status',
      'Date',
      'Time Slot',
    ]

    const rows = filteredOrders.map((o) => [
      `"${o.id || ''}"`,
      `"${o.hangTagNo || ''}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${(o.serviceName || '').replace(/"/g, '""')}"`,
      `"${(o.garmentName || '').replace(/"/g, '""')}"`,
      `"${(o.storeName || '').replace(/"/g, '""')}"`,
      o.price || 0,
      `"${o.status || ''}"`,
      `"${o.date || ''}"`,
      `"${o.timeSlot || ''}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `raffu_orders_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* ── 1. CLEAN MICRO-METRICS STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setOrderStatusFilter('ALL')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            orderStatusFilter === 'ALL'
              ? 'bg-white border-[#9E593B] shadow-xs ring-1 ring-[#9E593B]'
              : 'bg-white border-[#E8E1D5] hover:border-stone-400'
          }`}
        >
          <span className="text-[11px] text-[#78716C] font-semibold block">Total Orders</span>
          <span className="text-lg font-bold text-[#1E2229] mt-0.5 block">{orders.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderStatusFilter('ACTION_NEEDED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            orderStatusFilter === 'ACTION_NEEDED'
              ? 'bg-[#FAF3ED] border-[#9E593B] shadow-xs ring-1 ring-[#9E593B]'
              : 'bg-white border-[#E8E1D5] hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-800 font-semibold">Needs Action</span>
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-lg font-bold text-amber-900 mt-0.5 block">{actionableCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderStatusFilter('IN_PROGRESS')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            orderStatusFilter === 'IN_PROGRESS'
              ? 'bg-orange-50 border-orange-400 shadow-xs ring-1 ring-orange-400'
              : 'bg-white border-[#E8E1D5] hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-orange-800 font-semibold">In Progress</span>
            <span className="size-2 rounded-full bg-orange-500" />
          </div>
          <span className="text-lg font-bold text-orange-900 mt-0.5 block">{inProgressCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderStatusFilter('READY')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            orderStatusFilter === 'READY'
              ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
              : 'bg-white border-[#E8E1D5] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-800 font-semibold">Ready for Pickup</span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-lg font-bold text-emerald-900 mt-0.5 block">{readyCount}</span>
        </button>
      </div>

      {/* ── 2. FILTER & ACTION TOOLBAR ── */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs space-y-3">
        {/* Segmented Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setOrderStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
              orderStatusFilter === 'ALL'
                ? 'bg-[#1E2229] text-white'
                : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1E2229] border border-[#E8E1D5]'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setOrderStatusFilter('ACTION_NEEDED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
              orderStatusFilter === 'ACTION_NEEDED'
                ? 'bg-amber-700 text-white'
                : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1E2229] border border-[#E8E1D5]'
            }`}
          >
            Needs Action ({actionableCount})
          </button>
          <button
            onClick={() => setOrderStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
              orderStatusFilter === 'IN_PROGRESS'
                ? 'bg-orange-700 text-white'
                : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1E2229] border border-[#E8E1D5]'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setOrderStatusFilter('READY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
              orderStatusFilter === 'READY'
                ? 'bg-emerald-700 text-white'
                : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1E2229] border border-[#E8E1D5]'
            }`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setOrderStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
              orderStatusFilter === 'COMPLETED'
                ? 'bg-stone-800 text-white'
                : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1E2229] border border-[#E8E1D5]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Detailed Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1 border-t border-[#E8E1D5]/60">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 size-4 text-[#A8A29E]" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID, tag, customer..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
              />
            </div>

            {/* Exact Status Filter */}
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
            >
              <option value="ALL">Status: All</option>
              <option value="Allocated">Allocated</option>
              <option value="Accepted">Accepted</option>
              <option value="Customer Arrived">Customer Arrived</option>
              <option value="Fitting Completed">Fitting Completed</option>
              <option value="Work in Progress">Work in Progress</option>
              <option value="Ready">Ready</option>
              <option value="Collected">Collected</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Studio Filter */}
            <select
              value={orderStoreFilter}
              onChange={(e) => setOrderStoreFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
            >
              <option value="ALL">All Studios</option>
              {studios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Product Type Filter */}
            <select
              value={orderRetailFilter}
              onChange={(e) => setOrderRetailFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
            >
              <option value="ALL">All Items</option>
              <option value="RETAIL_ONLY">Retail Purchased</option>
              <option value="ALTERATION_ONLY">Alterations Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-[#78716C] font-semibold">
              Showing {filteredOrders.length} of {orders.length}
            </span>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1E2229] border border-[#E8E1D5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Download filtered orders as CSV spreadsheet"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. ORDERS DATA TABLE ── */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[#78716C] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order ID & Tag</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service & Garment</th>
                <th className="py-3 px-4">Assigned Studio</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date / Slot</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                  {/* Order ID & Tag */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#1E2229] block">{o.id}</span>
                    <span className="text-[10px] font-semibold text-[#78716C] bg-[#FAF8F5] border border-[#E8E1D5] px-1.5 py-0.5 rounded">
                      Tag: {o.hangTagNo || 'UNTAGGED'}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <strong className="text-[#1E2229] font-semibold block">{o.customerName}</strong>
                    <span className="text-[11px] text-[#78716C]">
                      {o.customerPhone || o.customerEmail || '—'}
                    </span>
                  </td>

                  {/* Service & Garment */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#1E2229] block">{o.serviceName}</span>
                    <span className="text-[11px] text-[#78716C]">{o.garmentName || 'Standard Item'}</span>
                    {o.retailSold && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded mt-0.5">
                        Retail: {o.retailCategory || 'Item'} (+£{o.retailValue || 15})
                      </span>
                    )}
                  </td>

                  {/* Studio */}
                  <td className="py-3 px-4">
                    <strong className="text-[#1E2229] font-semibold block">{o.storeName}</strong>
                    <span className="text-[10px] text-[#A8A29E] font-mono">
                      ID: {o.storeId || 'None'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#1E2229] text-sm block">£{o.price}</span>
                  </td>

                  {/* Clean Status Badge (Read-Only) */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        o.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : o.status === 'Work in Progress'
                          ? 'bg-orange-50 text-orange-800 border-orange-200'
                          : o.status === 'Fitting Completed'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : o.status === 'Customer Arrived'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : o.status === 'Collected'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : o.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          o.status === 'Ready'
                            ? 'bg-emerald-500'
                            : o.status === 'Work in Progress'
                            ? 'bg-orange-500'
                            : o.status === 'Fitting Completed'
                            ? 'bg-indigo-500'
                            : o.status === 'Customer Arrived'
                            ? 'bg-amber-500'
                            : o.status === 'Collected'
                            ? 'bg-teal-500'
                            : o.status === 'Cancelled'
                            ? 'bg-rose-500'
                            : 'bg-stone-400'
                        }`}
                      />
                      {o.status}
                    </span>
                  </td>

                  {/* Date / Slot */}
                  <td className="py-3 px-4 text-[#78716C]">
                    <span className="text-[#1E2229] font-medium">{o.date}</span>
                    <span className="text-[10px] text-[#A8A29E] block">{o.timeSlot}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onEditOrder(o)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#9E593B] hover:bg-[#8A4C32] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Scissors size={12} />
                      <span>Edit / Reassign</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#78716C] text-xs">
                    No orders match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
