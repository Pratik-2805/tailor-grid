'use client'

import React, { useState } from 'react'
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Archive,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  Sparkles,
  Building2,
  FileText,
  User,
  X,
  Filter,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'

export interface ContactInquiryItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  topic: string | null
  category: string | null
  orderNumber: string | null
  message: string
  source: string
  priority: string
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'ARCHIVED' | string
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  linkedUser?: any
  linkedOrder?: any
}

interface InquiriesTabProps {
  inquiries: ContactInquiryItem[]
  statusCounts: {
    ALL: number
    NEW: number
    IN_REVIEW: number
    RESOLVED: number
    ARCHIVED: number
  }
  inquirySearch: string
  setInquirySearch: (val: string) => void
  inquiryStatusFilter: string
  setInquiryStatusFilter: (val: string) => void
  inquirySourceFilter: string
  setInquirySourceFilter: (val: string) => void
  onUpdateInquiryStatus: (id: string, status: string, notes?: string) => Promise<void>
  onDeleteInquiry: (id: string) => Promise<void>
  onRefresh: () => void
  refreshing?: boolean
  onNavigateToOrder?: (orderId: string) => void
}

export function InquiriesTab({
  inquiries,
  statusCounts,
  inquirySearch,
  setInquirySearch,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  inquirySourceFilter,
  setInquirySourceFilter,
  onUpdateInquiryStatus,
  onDeleteInquiry,
  onRefresh,
  refreshing = false,
  onNavigateToOrder,
}: InquiriesTabProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryItem | null>(null)
  const [editingNotes, setEditingNotes] = useState<string>('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Open inquiry detail modal
  const handleOpenDetail = (inquiry: ContactInquiryItem) => {
    setSelectedInquiry(inquiry)
    setEditingNotes(inquiry.adminNotes || '')
  }

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return
    setSavingNotes(true)
    try {
      await onUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status, editingNotes)
      setSelectedInquiry((prev) => prev ? { ...prev, adminNotes: editingNotes } : null)
      toast.success('Admin notes updated successfully')
    } catch {
      toast.error('Failed to update notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleQuickStatusChange = async (inquiryId: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      await onUpdateInquiryStatus(inquiryId, newStatus)
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry((prev) => prev ? { ...prev, status: newStatus } : null)
      }
      toast.success(`Inquiry marked as ${newStatus.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (inquiryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this contact inquiry?')) return
    try {
      await onDeleteInquiry(inquiryId)
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null)
      }
      toast.success('Inquiry removed')
    } catch {
      toast.error('Failed to delete inquiry')
    }
  }

  // Filter client-side
  const filtered = inquiries.filter((item) => {
    // Status
    if (inquiryStatusFilter !== 'ALL' && item.status !== inquiryStatusFilter) {
      return false
    }
    // Source
    if (inquirySourceFilter !== 'ALL') {
      if (inquirySourceFilter === 'CLIENT' && !item.source?.toLowerCase().includes('client') && !item.source?.toLowerCase().includes('concierge')) {
        return false
      }
      if (inquirySourceFilter === 'STUDIO' && !item.source?.toLowerCase().includes('studio') && !item.source?.toLowerCase().includes('atelier')) {
        return false
      }
    }
    // Priority
    if (priorityFilter !== 'ALL' && item.priority?.toUpperCase() !== priorityFilter) {
      return false
    }
    // Search
    const q = inquirySearch.trim().toLowerCase()
    if (q) {
      const match =
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.includes(q) ||
        item.topic?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.orderNumber?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // Relative time helper
  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const ms = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(ms / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 1. TOP KPI SUMMARY METRICS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div
          onClick={() => setInquiryStatusFilter('ALL')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            inquiryStatusFilter === 'ALL'
              ? 'border-[#9E593B] ring-2 ring-[#9E593B]/20'
              : 'border-[#E8E1D5] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">All Inquiries</span>
            <MessageSquare size={16} className="text-[#9E593B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1E2229]">
              {statusCounts?.ALL ?? inquiries.length}
            </span>
            <span className="text-[11px] text-[#78716C]">Total tickets</span>
          </div>
        </div>

        {/* New / Unread */}
        <div
          onClick={() => setInquiryStatusFilter('NEW')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            inquiryStatusFilter === 'NEW'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-[#E8E1D5] hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">New &amp; Unread</span>
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {statusCounts?.NEW ?? inquiries.filter((i) => i.status === 'NEW').length}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">Requires attention</span>
          </div>
        </div>

        {/* In Review */}
        <div
          onClick={() => setInquiryStatusFilter('IN_REVIEW')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            inquiryStatusFilter === 'IN_REVIEW'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-[#E8E1D5] hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Review</span>
            <Clock size={16} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {statusCounts?.IN_REVIEW ?? inquiries.filter((i) => i.status === 'IN_REVIEW').length}
            </span>
            <span className="text-[11px] text-blue-700 font-semibold">Being handled</span>
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setInquiryStatusFilter('RESOLVED')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            inquiryStatusFilter === 'RESOLVED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-[#E8E1D5] hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {statusCounts?.RESOLVED ?? inquiries.filter((i) => i.status === 'RESOLVED').length}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">Closed &amp; answered</span>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER TOOLBAR ── */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 size-4 text-[#A8A29E]" />
            <input
              type="text"
              value={inquirySearch}
              onChange={(e) => setInquirySearch(e.target.value)}
              placeholder="Search by name, email, phone, order #, or message text..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E593B] text-[#1E2229] placeholder-[#A8A29E]"
            />
            {inquirySearch && (
              <button
                onClick={() => setInquirySearch('')}
                className="absolute right-3 top-2.5 text-[#A8A29E] hover:text-[#1E2229]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={inquiryStatusFilter}
            onChange={(e) => setInquiryStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Statuses ({statusCounts?.ALL ?? inquiries.length})</option>
            <option value="NEW">New ({statusCounts?.NEW ?? 0})</option>
            <option value="IN_REVIEW">In Review ({statusCounts?.IN_REVIEW ?? 0})</option>
            <option value="RESOLVED">Resolved ({statusCounts?.RESOLVED ?? 0})</option>
            <option value="ARCHIVED">Archived ({statusCounts?.ARCHIVED ?? 0})</option>
          </select>

          {/* Source Filter */}
          <select
            value={inquirySourceFilter}
            onChange={(e) => setInquirySourceFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Channels</option>
            <option value="CLIENT">Customer Concierge</option>
            <option value="STUDIO">Studio Atelier Desk</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#1E2229] font-medium focus:outline-none focus:ring-2 focus:ring-[#9E593B]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Inquiries"
            className="p-2 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-[#78716C] hover:text-[#1E2229] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#9E593B]' : ''} />
          </button>
        </div>
      </div>

      {/* ── 3. INQUIRIES DATA TABLE ── */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[#78716C] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Contact / Sender</th>
                <th className="py-3 px-4">Channel &amp; Topic</th>
                <th className="py-3 px-4">Order / Reference</th>
                <th className="py-3 px-4">Inquiry Message</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Received</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#78716C]">
                    <div className="size-12 rounded-2xl bg-[#FAF3ED] text-[#9E593B] grid place-items-center mx-auto mb-3">
                      <MessageSquare size={20} />
                    </div>
                    <p className="font-bold text-[#1E2229] text-sm mb-1">No contact inquiries found</p>
                    <p className="text-[11px] text-[#78716C]">
                      {inquirySearch || inquiryStatusFilter !== 'ALL' || inquirySourceFilter !== 'ALL'
                        ? 'Try clearing your filters or search keywords.'
                        : 'Customer and partner concierge tickets will appear here live when submitted.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isStudio = item.source?.toLowerCase().includes('studio') || item.source?.toLowerCase().includes('atelier')
                  const isNew = item.status === 'NEW'

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className={`hover:bg-[#FAF8F5] transition-colors cursor-pointer ${
                        isNew ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Sender / Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`size-9 rounded-full grid place-items-center font-bold text-xs uppercase shrink-0 border ${
                              isStudio
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-[#FAF3ED] text-[#9E593B] border-[#EADBCE]'
                            }`}
                          >
                            {item.name ? item.name[0] : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-[#1E2229] font-semibold text-xs">
                                {item.name || 'Unnamed Sender'}
                              </strong>
                              {isNew && (
                                <span className="size-2 rounded-full bg-amber-500 inline-block" title="Unread ticket" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#78716C] mt-0.5">
                              {item.phone && (
                                <span className="font-mono flex items-center gap-0.5">
                                  <Phone size={10} className="text-[#A8A29E]" />
                                  {item.phone}
                                </span>
                              )}
                              {item.email && (
                                <span className="flex items-center gap-0.5 truncate max-w-[150px]">
                                  <Mail size={10} className="text-[#A8A29E]" />
                                  {item.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Channel & Topic */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isStudio
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-[#FAF3ED] text-[#9E593B] border border-[#EADBCE]'
                            }`}
                          >
                            {isStudio ? <Building2 size={10} /> : <Sparkles size={10} />}
                            <span>{isStudio ? 'Studio Partner' : 'Client Concierge'}</span>
                          </span>
                          <p className="text-[11px] font-semibold text-[#1E2229] line-clamp-1">
                            {item.topic || item.category || 'General Inquiry'}
                          </p>
                        </div>
                      </td>

                      {/* Order / Ref */}
                      <td className="py-3.5 px-4">
                        {item.orderNumber ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#1E2229] px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-md">
                              {item.orderNumber}
                            </span>
                            {onNavigateToOrder && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onNavigateToOrder(item.orderNumber!)
                                }}
                                className="text-[#9E593B] hover:underline"
                                title="Open this order"
                              >
                                <ExternalLink size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#A8A29E]">—</span>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-[#44403C] line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        {item.adminNotes && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#9E593B] font-semibold mt-1">
                            <FileText size={10} />
                            <span>Notes attached</span>
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : item.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : item.priority === 'LOW'
                              ? 'bg-stone-100 text-stone-600 border border-stone-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.priority || 'NORMAL'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'NEW'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : item.status === 'IN_REVIEW'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : item.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-300'
                          }`}
                        >
                          {item.status === 'NEW' && <span className="size-1.5 rounded-full bg-amber-600" />}
                          {item.status === 'IN_REVIEW' && <Clock size={10} />}
                          {item.status === 'RESOLVED' && <CheckCircle2 size={10} />}
                          {item.status === 'ARCHIVED' && <Archive size={10} />}
                          <span>{item.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Received Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-[#1E2229] block">
                          {getRelativeTime(item.createdAt)}
                        </span>
                        <span className="text-[10px] text-[#A8A29E] block">
                          {formatDate(item.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Resolve Button */}
                          {item.status !== 'RESOLVED' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickStatusChange(item.id, 'RESOLVED', e)}
                              title="Mark as Resolved"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              <Check size={13} />
                            </button>
                          )}

                          {/* Quick In-Review Button */}
                          {item.status === 'NEW' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickStatusChange(item.id, 'IN_REVIEW', e)}
                              title="Mark as In Review"
                              className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors"
                            >
                              <Clock size={13} />
                            </button>
                          )}

                          {/* Inspect Detail Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            title="View Full Inquiry Details"
                            className="p-1.5 rounded-lg text-[#9E593B] hover:bg-[#FAF3ED] border border-[#EADBCE] transition-colors"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, e)}
                            title="Delete Inquiry"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. INQUIRY INSPECTOR & RESPONSE DRAWER MODAL ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-2xl w-full p-6 relative max-h-[92vh] overflow-y-auto space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 text-[#A8A29E] hover:text-[#1E2229] p-1.5 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div
                className={`size-12 rounded-2xl grid place-items-center text-lg font-bold uppercase shrink-0 border ${
                  selectedInquiry.source?.toLowerCase().includes('studio')
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-[#FAF3ED] text-[#9E593B] border-[#EADBCE]'
                }`}
              >
                {selectedInquiry.name ? selectedInquiry.name[0] : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#1E2229]">
                    {selectedInquiry.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedInquiry.source?.toLowerCase().includes('studio')
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-[#FAF3ED] text-[#9E593B] border border-[#EADBCE]'
                    }`}
                  >
                    {selectedInquiry.source}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      selectedInquiry.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : selectedInquiry.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {selectedInquiry.priority || 'NORMAL'}
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5 font-mono">
                  Ticket ID: {selectedInquiry.id} • Received: {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>
            </div>

            {/* Direct Contact Action Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8E1D5]">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-[#9E593B]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] block">
                      Phone Number
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1E2229]">
                      {selectedInquiry.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
                {selectedInquiry.phone && (
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="px-2.5 py-1 bg-[#FAF3ED] text-[#9E593B] hover:bg-[#9E593B] hover:text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Phone size={11} />
                    <span>Call</span>
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8E1D5]">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-[#9E593B]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] block">
                      Email Address
                    </span>
                    <span className="text-xs font-medium text-[#1E2229] truncate max-w-[170px] block">
                      {selectedInquiry.email || 'Not provided'}
                    </span>
                  </div>
                </div>
                {selectedInquiry.email && (
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Regarding your Raffu inquiry (${selectedInquiry.topic || 'Garment Request'})`}
                    className="px-2.5 py-1 bg-[#FAF3ED] text-[#9E593B] hover:bg-[#9E593B] hover:text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Mail size={11} />
                    <span>Email</span>
                  </a>
                )}
              </div>
            </div>

            {/* Topic & Order Reference Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  Topic / Inquired Service
                </span>
                <p className="text-sm font-bold text-[#1E2229]">
                  {selectedInquiry.topic || selectedInquiry.category || 'General Consultation'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  Order / Hang Tag Reference
                </span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold font-mono text-[#1E2229]">
                    {selectedInquiry.orderNumber || 'No order reference'}
                  </p>
                  {selectedInquiry.orderNumber && onNavigateToOrder && (
                    <button
                      type="button"
                      onClick={() => onNavigateToOrder(selectedInquiry.orderNumber!)}
                      className="text-xs text-[#9E593B] hover:underline inline-flex items-center gap-0.5"
                    >
                      <ExternalLink size={12} />
                      <span>Open Order</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inquiry Message Body */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229] block">
                Customer Message &amp; Fitting Notes
              </span>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] text-xs text-[#1E2229] leading-relaxed whitespace-pre-wrap font-sans">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status Workflow Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229] block">
                Update Ticket Status
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['NEW', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedInquiry.id, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedInquiry.status === st
                        ? st === 'NEW'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : st === 'IN_REVIEW'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : st === 'RESOLVED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-700 text-white border-stone-700 shadow-xs'
                        : 'bg-white text-[#78716C] border-[#E8E1D5] hover:border-stone-400'
                    }`}
                  >
                    {selectedInquiry.status === st && <Check size={12} />}
                    <span>{st.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Internal Notes Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                  Master Admin Internal Notes &amp; Follow-up Log
                </span>
                <span className="text-[11px] text-[#78716C]">Private to admin</span>
              </div>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Log internal details: e.g. 'Called customer at 11:30 AM, advised 2-inch hem adjustment. Scheduled drop-off for Thursday.'"
                className="w-full p-3 text-xs bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E593B] text-[#1E2229]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-[#9E593B] text-white text-xs font-bold rounded-xl hover:bg-[#8A4C32] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={12} />
                  <span>{savingNotes ? 'Saving...' : 'Save Admin Notes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
