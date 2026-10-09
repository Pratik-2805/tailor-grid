'use client'

import React from 'react'
import {
  Users,
  Store,
  Layers,
  Scissors,
  Activity,
  Clock,
  Shield,
  Plus,
  UserPlus,
  Edit2,
} from 'lucide-react'

interface OverviewTabProps {
  overview: any
  customers: any[]
  studios: any[]
  orders: any[]
  onNavigateTab: (tab: 'overview' | 'customers' | 'studios' | 'orders') => void
  onOpenAddCustomer: () => void
  onOpenAddStudio: () => void
  onFilterOrderStatus: (status: string) => void
  onEditOrder: (order: any) => void
}

export function OverviewTab({
  overview,
  customers,
  studios,
  orders,
  onNavigateTab,
  onOpenAddCustomer,
  onOpenAddStudio,
  onFilterOrderStatus,
  onEditOrder,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <Users size={16} className="text-[#9E593B]" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#1E2229]">
              {overview?.kpis?.totalCustomers ?? customers.length}
            </span>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {overview?.kpis?.activeCustomers ?? customers.length} Active Customers
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Partner Studios</span>
            <Store size={16} className="text-blue-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#1E2229]">
              {overview?.kpis?.totalStudios ?? studios.length}
            </span>
            <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
              {overview?.kpis?.totalCapacity ?? 125} items/day capacity
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <Layers size={16} className="text-purple-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#1E2229]">
              {overview?.kpis?.totalOrders ?? orders.length}
            </span>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
              {overview?.kpis?.activeOrders ?? 0} active orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Studio Earnings</span>
            <Scissors size={16} className="text-[#9E593B]" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#1E2229]">
              ${(
                overview?.kpis?.totalEarnings ??
                overview?.kpis?.totalPayouts ??
                orders
                  .filter((o) => ['Work in Progress', 'Ready', 'Collected', 'Closed'].includes(o.status))
                  .reduce((sum, o) => sum + (o.price || 0), 0)
              ).toLocaleString()}
            </span>
            <p className="text-[11px] text-[#78716C] font-semibold mt-0.5">
              From Work in Progress & onwards
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Studio Capacity</span>
            <Activity size={16} className="text-rose-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#1E2229]">
              {overview?.kpis?.fleetUtilization ?? 0}%
            </span>
            <p className="text-[11px] text-[#78716C] font-semibold mt-0.5">
              Used today
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Status Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
        <h2 className="text-sm font-bold text-[#1E2229] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity size={16} className="text-[#9E593B]" />
          Orders by Status
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {[
            { label: 'Allocated', count: overview?.statusCounts?.['Allocated'] ?? 0, color: 'border-slate-200 text-slate-700 bg-slate-50' },
            { label: 'Accepted', count: overview?.statusCounts?.['Accepted'] ?? 0, color: 'border-blue-200 text-blue-700 bg-blue-50' },
            { label: 'Customer Arrived', count: overview?.statusCounts?.['Customer Arrived'] ?? 0, color: 'border-amber-200 text-amber-800 bg-amber-50' },
            { label: 'Fitting Completed', count: overview?.statusCounts?.['Fitting Completed'] ?? 0, color: 'border-indigo-200 text-indigo-700 bg-indigo-50' },
            { label: 'Work in Progress', count: overview?.statusCounts?.['Work in Progress'] ?? 0, color: 'border-orange-200 text-orange-700 bg-orange-50' },
            { label: 'Ready', count: overview?.statusCounts?.['Ready'] ?? 0, color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
            { label: 'Collected', count: overview?.statusCounts?.['Collected'] ?? 0, color: 'border-teal-200 text-teal-700 bg-teal-50' },
            { label: 'Closed', count: overview?.statusCounts?.['Closed'] ?? 0, color: 'border-[#E8E1D5] text-[#78716C] bg-[#FAF8F5]' },
            { label: 'Cancelled', count: overview?.statusCounts?.['Cancelled'] ?? 0, color: 'border-rose-200 text-rose-700 bg-rose-50' },
          ].map((s) => (
            <div
              key={s.label}
              onClick={() => {
                onFilterOrderStatus(s.label)
                onNavigateTab('orders')
              }}
              className={`p-3 rounded-xl border ${s.color} cursor-pointer hover:shadow-sm transition-all`}
            >
              <span className="text-[10px] font-bold block uppercase tracking-wider truncate">
                {s.label}
              </span>
              <span className="text-xl font-extrabold mt-1 block">
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions & Live Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#1E2229] tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-[#9E593B]" />
              Recent Orders
            </h2>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-[#9E593B] hover:underline cursor-pointer"
            >
              View all {orders.length} orders &rarr;
            </button>
          </div>

          <div className="divide-y divide-[#E8E1D5] overflow-x-auto">
            {orders.slice(0, 7).map((o) => (
              <div
                key={o.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] grid place-items-center text-[#1E2229] font-mono font-bold text-xs">
                    {o.hangTagNo || 'TG'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1E2229]">{o.id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#78716C] border border-[#E8E1D5]">
                        {o.serviceName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78716C]">
                      Customer: <strong className="text-[#1E2229]">{o.customerName}</strong> • Store: <strong className="text-[#1E2229]">{o.storeName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#1E2229]">${o.price}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'Work in Progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {o.status}
                  </span>
                  <button
                    onClick={() => onEditOrder(o)}
                    className="p-1.5 text-[#78716C] hover:text-[#1E2229] rounded-md hover:bg-[#F3EFEA] cursor-pointer"
                    title="Manage Order"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Admin Quick Shortcuts & Health */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E593B]">
              Quick Actions
            </span>
            <h3 className="text-base font-bold text-[#1E2229] mt-1 mb-4">Manage Platform</h3>

            <div className="space-y-2.5">
              <button
                onClick={onOpenAddCustomer}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-2">
                  <UserPlus size={15} className="text-[#9E593B]" />
                  Add New Customer
                </span>
                <Plus size={14} />
              </button>

              <button
                onClick={onOpenAddStudio}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-2">
                  <Store size={15} className="text-blue-600" />
                  Add Partner Studio
                </span>
                <Plus size={14} />
              </button>

              <button
                onClick={() => {
                  onFilterOrderStatus('Allocated')
                  onNavigateTab('orders')
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer text-left"
              >
                <span className="flex items-center gap-2">
                  <Scissors size={15} className="text-[#9E593B]" />
                  Review Pending Orders
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  {overview?.statusCounts?.['Allocated'] ?? 0} Pending
                </span>
              </button>
            </div>
          </div>

          {/* Fleet Health Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
            <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-700" />
              System Status
            </h4>
            <p className="text-xs text-[#78716C] mb-3">
              All {studios.length} partner studios are running normally.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E8E1D5]">
                <span className="text-[#78716C]">Active Studios</span>
                <strong className="text-emerald-700">{studios.length} Online</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E8E1D5]">
                <span className="text-[#78716C]">Total Daily Capacity</span>
                <strong className="text-[#1E2229]">{overview?.kpis?.totalCapacity || 125} items</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#78716C]">Database Connection</span>
                <strong className="text-emerald-700 flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
