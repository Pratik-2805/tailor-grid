'use client'

import React from 'react'
import {
  Search,
  Scissors,
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
}: OrdersTabProps) {
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter
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

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-[#A8A29E]" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search Order ID, Hang Tag, Customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
            />
          </div>

          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Statuses</option>
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

          <select
            value={orderStoreFilter}
            onChange={(e) => setOrderStoreFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Stores</option>
            {studios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={orderRetailFilter}
            onChange={(e) => setOrderRetailFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Products</option>
            <option value="RETAIL_ONLY">🛍️ Retail Purchased</option>
            <option value="ALTERATION_ONLY">✂️ Alterations Only</option>
          </select>
        </div>

        <div className="text-xs text-[#78716C] font-semibold">
          Showing {filteredOrders.length} of {orders.length} Orders
        </div>
      </div>

      {/* Orders Table */}
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
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#1E2229] block">{o.id}</span>
                    <span className="text-[10px] font-semibold text-[#78716C] bg-[#FAF8F5] border border-[#E8E1D5] px-1.5 py-0.5 rounded">
                      Tag: {o.hangTagNo || 'UNTAGGED'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <strong className="text-[#1E2229] font-semibold block">{o.customerName}</strong>
                    <span className="text-[11px] text-[#78716C]">{o.customerPhone || o.customerEmail || '—'}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-[#1E2229] block">{o.serviceName}</span>
                    <span className="text-[11px] text-[#78716C]">{o.garmentName || 'Standard Item'}</span>
                    {o.retailSold ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1">
                        🛍️ Purchased: {o.retailCategory || 'Retail Item'} (+${o.retailValue || 15})
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#A8A29E] block mt-0.5">
                        No retail product
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <strong className="text-[#1E2229] font-semibold block">{o.storeName}</strong>
                    <span className="text-[10px] text-[#A8A29E] font-mono">ID: {o.storeId || 'None'}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-[#1E2229] text-sm block">${o.price}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      o.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                      o.status === 'Work in Progress' ? 'bg-orange-100 text-orange-800' :
                      o.status === 'Fitting Completed' ? 'bg-indigo-100 text-indigo-800' :
                      o.status === 'Collected' ? 'bg-teal-100 text-teal-800' :
                      o.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#78716C]">
                    <span className="text-[#1E2229] font-medium">{o.date}</span>
                    <span className="text-[10px] text-[#A8A29E] block">{o.timeSlot}</span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onEditOrder(o)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#9E593B] hover:bg-[#8A4C32] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Scissors size={12} />
                      <span>Reassign / Edit</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#78716C] text-xs">
                    No orders match the selected filters.
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
