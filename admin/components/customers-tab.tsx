'use client'

import React from 'react'
import {
  Search,
  UserPlus,
  ExternalLink,
  ShoppingBag,
  Edit2,
  Download,
} from 'lucide-react'

interface CustomersTabProps {
  customers: any[]
  customerSearch: string
  setCustomerSearch: (val: string) => void
  customerStatusFilter: string
  setCustomerStatusFilter: (val: string) => void
  onOpenAddCustomer: () => void
  onEditCustomer: (customer: any) => void
  onViewCustomerOrders: (customer: any) => void
}

export function CustomersTab({
  customers,
  customerSearch,
  setCustomerSearch,
  customerStatusFilter,
  setCustomerStatusFilter,
  onOpenAddCustomer,
  onEditCustomer,
  onViewCustomerOrders,
}: CustomersTabProps) {
  const activeCount = customers.filter(
    (c) => (c.role || 'CUSTOMER') === 'CUSTOMER' && c.status === 'ACTIVE'
  ).length

  const totalSpend = customers
    .filter((c) => (c.role || 'CUSTOMER') === 'CUSTOMER')
    .reduce((sum, c) => sum + (c.totalSpend || 0), 0)

  const filteredCustomers = customers.filter((c) => {
    if ((c.role || 'CUSTOMER') !== 'CUSTOMER') return false
    const matchStatus = customerStatusFilter === 'ALL' || c.status === customerStatusFilter
    const q = customerSearch.toLowerCase().trim()
    const matchSearch =
      !q ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q)) ||
      (c.postcode && c.postcode.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredCustomers.length) return
    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Email',
      'Postcode',
      'Address',
      'Orders Count',
      'Total Spent',
      'Status',
      'Joined Date',
    ]

    const rows = filteredCustomers.map((c) => [
      `"${c.id || ''}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.postcode || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.ordersCount || 0,
      c.totalSpend || 0,
      `"${c.status || 'ACTIVE'}"`,
      `"${c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : ''}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `raffu_customers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* ── 1. CLEAN MICRO-METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#E8E1D5] rounded-2xl p-3 shadow-2xs">
          <span className="text-[11px] text-[#78716C] font-semibold block">Total Customers</span>
          <span className="text-lg font-bold text-[#1E2229] mt-0.5 block">{customers.length}</span>
        </div>
        <div className="bg-white border border-[#E8E1D5] rounded-2xl p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-800 font-semibold">Active Profiles</span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-lg font-bold text-emerald-900 mt-0.5 block">{activeCount}</span>
        </div>
        <div className="bg-white border border-[#E8E1D5] rounded-2xl p-3 shadow-2xs">
          <span className="text-[11px] text-[#78716C] font-semibold block">Cumulative Spend</span>
          <span className="text-lg font-bold text-[#1E2229] mt-0.5 block">£{totalSpend.toFixed(2)}</span>
        </div>
      </div>

      {/* ── 2. FILTER & ACTION TOOLBAR ── */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-[#A8A29E]" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by name, phone, email, postcode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
            />
          </div>

          <select
            value={customerStatusFilter}
            onChange={(e) => setCustomerStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#78716C] font-semibold mr-1">
            Showing {filteredCustomers.length} of {customers.length}
          </span>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1E2229] border border-[#E8E1D5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Export filtered customers to CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddCustomer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#9E593B] text-white text-xs font-bold rounded-xl hover:bg-[#8A4C32] transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus size={14} />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* ── 3. CUSTOMERS DATA TABLE ── */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[#78716C] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Postcode / City</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-[#FAF3ED] text-[#9E593B] border border-[#EADBCE] grid place-items-center font-bold text-xs uppercase shrink-0">
                        {c.name ? c.name[0] : 'U'}
                      </div>
                      <div>
                        <strong className="text-[#1E2229] block font-semibold">{c.name}</strong>
                        <span className="text-[10px] text-[#A8A29E] font-mono">ID: {c.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-[#1E2229]">
                      <p className="font-medium">{c.email || '—'}</p>
                      <p className="text-[11px] text-[#78716C] font-mono">{c.phone || '—'}</p>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div>
                      <span className="font-mono font-medium text-[#1E2229] block">
                        {c.postcode || '—'}
                      </span>
                      {c.address && (
                        <span
                          className="text-[10px] text-[#78716C] line-clamp-1 block max-w-[200px]"
                          title={c.address}
                        >
                          {c.address}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onViewCustomerOrders(c)}
                      className="text-left group cursor-pointer"
                      title="Click to view all purchased services & retail items"
                    >
                      <span className="font-bold text-[#1E2229] group-hover:text-[#9E593B] group-hover:underline flex items-center gap-1">
                        {c.ordersCount ?? 0} orders
                        <ExternalLink
                          size={11}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9E593B]"
                        />
                      </span>
                      {c.activeOrdersCount > 0 && (
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          ({c.activeOrdersCount} active)
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 font-bold text-[#1E2229]">
                    £{c.totalSpend ?? 0}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#78716C] font-mono text-[11px]">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewCustomerOrders(c)}
                        className="p-1.5 text-[#78716C] hover:text-[#9E593B] hover:bg-[#FAF3ED] rounded-lg transition-colors cursor-pointer"
                        title="View Customer Purchases & History"
                      >
                        <ShoppingBag size={14} />
                      </button>
                      <button
                        onClick={() => onEditCustomer(c)}
                        className="p-1.5 text-[#78716C] hover:text-[#9E593B] hover:bg-[#FAF3ED] rounded-lg transition-colors cursor-pointer"
                        title="View / Edit Customer Details"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#78716C] text-xs">
                    No customer profiles match your search criteria.
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
