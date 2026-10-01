'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Ruler,
  Scissors,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  fetchAdminOverview,
  fetchAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  fetchAdminStudios,
  createAdminStudio,
  updateAdminStudio,
  deleteAdminStudio,
  fetchAdminOrders,
  updateAdminOrder,
  searchAdminGlobal,
  loginSuperAdmin,
  checkSuperAdminSession,
  logoutSuperAdmin,
  CUSTOMER_SITE_URL,
} from '@/lib/api'

type AdminTab = 'overview' | 'customers' | 'studios' | 'orders'

export default function SuperAdminPage() {
  // Authentication states
  const [adminUser, setAdminUser] = useState<any | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  // Login form states — NOT PREFETCHED: initialized clean & empty
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Data states
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [overview, setOverview] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [studios, setStudios] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // Search & Filter states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [globalSearchResults, setGlobalSearchResults] = useState<any>(null)
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false)

  // Customers filter
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerStatusFilter, setCustomerStatusFilter] = useState('ALL')

  // Studios filter
  const [studioSearch, setStudioSearch] = useState('')
  const [studioAreaFilter, setStudioAreaFilter] = useState('ALL')

  // Orders filter
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [orderStoreFilter, setOrderStoreFilter] = useState('ALL')
  const [orderRetailFilter, setOrderRetailFilter] = useState('ALL')

  // Modals & Edit States
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [viewingCustomerOrders, setViewingCustomerOrders] = useState<any | null>(null)

  const [editingStudio, setEditingStudio] = useState<any | null>(null)
  const [showAddStudioModal, setShowAddStudioModal] = useState(false)

  const [editingOrder, setEditingOrder] = useState<any | null>(null)

  // Load all foundational data
  const loadAllData = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)

    try {
      const [overviewData, customersData, studiosData, ordersData] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminCustomers('', 'ALL', 'CUSTOMER'),
        fetchAdminStudios(),
        fetchAdminOrders(),
      ])

      if (overviewData) setOverview(overviewData)
      if (customersData) setCustomers(customersData)
      if (studiosData) setStudios(studiosData)
      if (ordersData) setOrders(ordersData)
    } catch (err) {
      console.error('Failed to load admin data:', err)
      toast.error('Failed to connect to backend service.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Check persistent session on mount
  useEffect(() => {
    async function initSession() {
      try {
        const user = await checkSuperAdminSession()
        if (user && user.role === 'ADMIN') {
          setAdminUser(user)
          loadAllData()
        }
      } catch (err) {
        console.warn('Session check notice:', err)
      } finally {
        setAuthChecking(false)
      }
    }
    initSession()
  }, [])

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both Admin ID and Password.')
      return
    }

    setLoginLoading(true)
    setLoginError(null)

    const res = await loginSuperAdmin(loginId, loginPassword)
    if (res.success && res.user) {
      toast.success('Super Admin session authenticated successfully')
      setAdminUser(res.user)
      loadAllData()
    } else {
      setLoginError(res.error || 'Invalid Super Admin credentials')
      toast.error(res.error || 'Authentication failed')
    }
    setLoginLoading(false)
  }

  const handleLogout = () => {
    logoutSuperAdmin()
    setAdminUser(null)
    setLoginId('')
    setLoginPassword('')
    toast.info('Super Admin session ended')
  }

  // Omnichannel Global Search Debounce
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setGlobalSearchResults(null)
      setIsSearchingGlobal(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true)
      const res = await searchAdminGlobal(globalSearchQuery)
      setGlobalSearchResults(res)
      setIsSearchingGlobal(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [globalSearchQuery])

  // Filtered Lists
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Customer Master strictly only shows actual CUSTOMERS (never Admin or Studio accounts)
      if ((c.role || 'CUSTOMER') !== 'CUSTOMER') return false
      const matchStatus = customerStatusFilter === 'ALL' || c.status === customerStatusFilter
      const q = customerSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.postcode && c.postcode.toLowerCase().includes(q))
      return matchStatus && matchSearch
    })
  }, [customers, customerSearch, customerStatusFilter])

  const filteredStudios = useMemo(() => {
    return studios.filter((s) => {
      const matchArea = studioAreaFilter === 'ALL' || s.area === studioAreaFilter
      const q = studioSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.area && s.area.toLowerCase().includes(q)) ||
        (s.postcode && s.postcode.toLowerCase().includes(q)) ||
        (s.leadTailor && s.leadTailor.toLowerCase().includes(q))
      return matchArea && matchSearch
    })
  }, [studios, studioSearch, studioAreaFilter])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
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
  }, [orders, orderStatusFilter, orderStoreFilter, orderRetailFilter, orderSearch])

  // Distinct Areas
  const availableAreas = useMemo(() => {
    const set = new Set<string>()
    studios.forEach((s) => {
      if (s.area) set.add(s.area)
    })
    return Array.from(set)
  }, [studios])

  // ==========================================
  // HANDLERS: CUSTOMER MANAGEMENT
  // ==========================================
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return

    try {
      const res = await updateAdminCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        status: editingCustomer.status,
        role: 'CUSTOMER',
        address: editingCustomer.address,
        postcode: editingCustomer.postcode,
        measurements: editingCustomer.measurements,
      })

      if (res.success) {
        toast.success(`Customer profile updated successfully`)
        setEditingCustomer(null)
        loadAllData(true)
      } else {
        toast.error(res.error || 'Failed to update customer')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving customer')
    }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      postcode: formData.get('postcode') as string,
      status: formData.get('status') as string,
    }

    const res = await createAdminCustomer(payload)
    if (res.success) {
      toast.success('New customer profile registered successfully')
      setShowAddCustomerModal(false)
      loadAllData(true)
    } else {
      toast.error(res.error || 'Failed to create customer')
    }
  }

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove customer "${name}"? This action cannot be undone.`)) {
      return
    }

    const ok = await deleteAdminCustomer(id)
    if (ok) {
      toast.success('Customer removed from records')
      loadAllData(true)
    } else {
      toast.error('Failed to remove customer')
    }
  }

  // ==========================================
  // HANDLERS: STUDIO MANAGEMENT
  // ==========================================
  const handleSaveStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudio) return

    try {
      const res = await updateAdminStudio(editingStudio.id, {
        name: editingStudio.name,
        area: editingStudio.area,
        address: editingStudio.address,
        postcode: editingStudio.postcode,
        phone: editingStudio.phone,
        leadTailor: editingStudio.leadTailor,
        dailyCapacity: editingStudio.dailyCapacity,
        machines: editingStudio.machines,
        workers: editingStudio.workers,
        openingHours: editingStudio.openingHours,
        specialties: editingStudio.specialties,
      })

      if (res.success) {
        toast.success(`Studio "${editingStudio.name}" updated successfully`)
        setEditingStudio(null)
        loadAllData(true)
      } else {
        toast.error(res.error || 'Failed to update studio')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating studio')
    }
  }

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = {
      name: formData.get('name') as string,
      area: formData.get('area') as string,
      address: formData.get('address') as string,
      postcode: formData.get('postcode') as string,
      phone: formData.get('phone') as string,
      leadTailor: formData.get('leadTailor') as string,
      dailyCapacity: parseInt(formData.get('dailyCapacity') as string || '25', 10),
      machines: parseInt(formData.get('machines') as string || '6', 10),
      workers: parseInt(formData.get('workers') as string || '4', 10),
      openingHours: formData.get('openingHours') as string || '09:00 - 19:00',
    }

    const res = await createAdminStudio(payload)
    if (res.success) {
      toast.success('New partner studio onboarded successfully')
      setShowAddStudioModal(false)
      loadAllData(true)
    } else {
      toast.error(res.error || 'Failed to onboard studio')
    }
  }

  const handleDeleteStudio = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove studio "${name}"?`)) {
      return
    }

    const ok = await deleteAdminStudio(id)
    if (ok) {
      toast.success('Studio partner removed')
      loadAllData(true)
    } else {
      toast.error('Failed to remove studio')
    }
  }

  // ==========================================
  // HANDLERS: ORDER & DISPATCH REASSIGNMENT
  // ==========================================
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    try {
      const res = await updateAdminOrder(editingOrder.id, {
        status: editingOrder.status,
        storeId: editingOrder.storeId,
        hangTagNo: editingOrder.hangTagNo,
        price: editingOrder.price,
        partnerPayout: editingOrder.partnerPayout,
        retailSold: Boolean(editingOrder.retailSold),
        retailValue: editingOrder.retailValue,
        retailCategory: editingOrder.retailCategory,
        assignedWorker: editingOrder.assignedWorker,
        machineNo: editingOrder.machineNo,
        fitNotes: editingOrder.fitNotes,
        sewingNotes: editingOrder.sewingNotes,
      })

      if (res.success) {
        toast.success(`Order ${editingOrder.id} updated and dispatched`)
        setEditingOrder(null)
        loadAllData(true)
      } else {
        toast.error(res.error || 'Failed to update order')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating order')
    }
  }

  // ── 1. LOADING SESSION GATE ──
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-[#1E2229] p-6 font-sans">
        <div className="size-12 rounded-2xl bg-[#9E593B] text-white grid place-items-center mb-4 shadow-sm animate-pulse">
          <ShieldCheck size={24} />
        </div>
        <p className="text-xs font-semibold tracking-wide text-[#78716C]">
          Verifying Super Admin Authorization Gate...
        </p>
      </div>
    )
  }

  // ── 2. SUPER ADMIN LOGIN SCREEN (LIGHT & PROPER ATELIER UI) ──
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1E2229] flex flex-col justify-between font-sans selection:bg-[#9E593B]/20 selection:text-[#9E593B] relative">
        {/* Top Minimal Bar */}
        <div className="max-w-7xl w-full mx-auto p-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#9E593B] to-[#7B3F26] flex items-center justify-center font-bold text-white text-sm shadow-xs">
              TG
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1E2229] block leading-tight">
                TailorGrid Atelier
              </span>
              <span className="text-[10px] text-[#78716C] font-semibold">
                Super Admin Master Control
              </span>
            </div>
          </div>

          <a
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1E2229] hover:text-[#9E593B] bg-white border border-[#E8E1D5] hover:border-[#9E593B]/40 shadow-2xs transition-colors"
          >
            <ArrowLeft size={13} className="text-[#9E593B]" />
            <span>Studio Workbench</span>
          </a>
        </div>

        {/* Center Light Login Card */}
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="max-w-md w-full bg-white border border-[#E8E1D5] rounded-3xl p-8 sm:p-9 shadow-xl shadow-stone-900/5 space-y-6">
            <div className="text-center space-y-2">
              <div className="size-13 rounded-2xl bg-gradient-to-br from-[#9E593B] to-[#7B3F26] text-white grid place-items-center mx-auto shadow-md">
                <Lock size={22} />
              </div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-[#FAF3ED] border border-[#EADBCE] text-[#9E593B] text-[10px] font-extrabold uppercase tracking-widest">
                Master Security Gate
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1E2229]">
                Super Admin Login
              </h1>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto leading-relaxed">
                Enter your administrative ID and password to access the platform fleet control console.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span className="font-medium">{loginError}</span>
              </div>
            )}

            {/* Login Form: Clean, NOT pre-fetched */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1E2229] block mb-1.5">
                  Super Admin ID / Email
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 size-4 text-[#A8A29E] pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. admin_7087@tailorgrid.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8E1D5] rounded-xl text-[#1E2229] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#9E593B] focus:border-transparent transition-all font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 size-4 text-[#A8A29E] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter master password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E8E1D5] rounded-xl text-[#1E2229] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#9E593B] focus:border-transparent transition-all text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#A8A29E] hover:text-[#1E2229] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#9E593B] hover:bg-[#8A4C32] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    <span>Authenticate & Access Console</span>
                  </>
                )}
              </button>
            </form>

            {/* Clean CLI Generator Guidance */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E1D5] space-y-1.5 text-[11px] text-[#78716C]">
              <div className="flex items-center gap-1.5 font-bold text-[#1E2229]">
                <Sparkles size={13} className="text-[#9E593B]" />
                <span>Need New Super Admin Credentials?</span>
              </div>
              <p className="text-[11px] text-[#78716C]">
                To create a fresh Super Admin with a new secure password, run in your terminal:
              </p>
              <div className="p-2 bg-white rounded-lg border border-[#E8E1D5] font-mono text-[10px] text-[#9E593B] font-semibold select-all">
                npm run admin:create
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Minimal Footer */}
        <div className="p-6 text-center text-xs text-[#78716C] relative z-10">
          TailorGrid Operational Master Administration Node • Secure Session Protocol
        </div>

        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </div>
    )
  }

  // ── 3. SUPER ADMIN CONSOLE (AUTHENTICATED - LIGHT & PROPER THEME) ──
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2229] font-sans flex flex-col selection:bg-[#9E593B]/20 selection:text-[#9E593B]">
      {/* ── TOP MASTER BAR (LIGHT ATELIER THEME) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Super Admin badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#9E593B] to-[#7B3F26] flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-xs">
              TG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-[#1E2229] text-base">TailorGrid</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FAF3ED] text-[#9E593B] border border-[#EADBCE] tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] hidden sm:block">
                Master Control • Omnichannel Studio & Customer Fleet
              </p>
            </div>
          </div>

          {/* Omnichannel Global Search */}
          <div className="relative flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-[#A8A29E] pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Global search: Customer name, phone, Order ID, Hang Tag, Studio postcode..."
                className="w-full bg-[#FAF8F5] border border-[#E8E1D5] rounded-full pl-10 pr-9 py-2 text-xs text-[#1E2229] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#9E593B] focus:border-transparent transition-all"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3 text-[#A8A29E] hover:text-[#1E2229]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Global Search Results Dropdown */}
            {globalSearchResults && (
              <div className="absolute top-12 left-0 right-0 bg-white text-[#1E2229] rounded-2xl shadow-xl border border-[#E8E1D5] overflow-hidden z-50 max-h-[460px] overflow-y-auto">
                <div className="p-2 border-b border-[#E8E1D5] flex items-center justify-between bg-[#FAF8F5] text-[11px] text-[#78716C] font-semibold uppercase tracking-wider">
                  <span>Search Matches for "{globalSearchQuery}"</span>
                  <button
                    onClick={() => setGlobalSearchResults(null)}
                    className="hover:text-[#1E2229]"
                  >
                    Close
                  </button>
                </div>

                {/* Customers matches */}
                {globalSearchResults.customers?.length > 0 && (
                  <div className="p-2 border-b border-[#E8E1D5]">
                    <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block px-2 mb-1">
                      Customers ({globalSearchResults.customers.length})
                    </span>
                    {globalSearchResults.customers.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setEditingCustomer(c)
                          setGlobalSearchResults(null)
                        }}
                        className="flex items-center justify-between p-2 hover:bg-[#FAF3ED] rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#1E2229]">{c.name}</p>
                          <p className="text-[11px] text-[#78716C]">
                            {c.email || 'No email'} • {c.phone || 'No phone'}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Studios matches */}
                {globalSearchResults.studios?.length > 0 && (
                  <div className="p-2 border-b border-[#E8E1D5]">
                    <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block px-2 mb-1">
                      Partner Studios ({globalSearchResults.studios.length})
                    </span>
                    {globalSearchResults.studios.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setEditingStudio(s)
                          setGlobalSearchResults(null)
                        }}
                        className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#1E2229]">{s.name}</p>
                          <p className="text-[11px] text-[#78716C]">
                            {s.area} • {s.postcode} • Lead: {s.leadTailor}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Cap: {s.dailyCapacity}/day
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Orders matches */}
                {globalSearchResults.orders?.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block px-2 mb-1">
                      Orders ({globalSearchResults.orders.length})
                    </span>
                    {globalSearchResults.orders.map((o: any) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setEditingOrder(o)
                          setGlobalSearchResults(null)
                        }}
                        className="flex items-center justify-between p-2 hover:bg-[#FAF3ED] rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#1E2229]">{o.id}</span>
                            <span className="text-[10px] bg-[#FAF8F5] text-[#78716C] px-1.5 py-0.2 rounded font-semibold border border-[#E8E1D5]">
                              Tag: {o.hangTagNo || 'N/A'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#78716C]">
                            {o.customerName} • {o.serviceName} • Store: {o.storeName}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(!globalSearchResults.customers?.length &&
                  !globalSearchResults.studios?.length &&
                  !globalSearchResults.orders?.length) && (
                  <div className="p-6 text-center text-xs text-[#78716C]">
                    No matching records found across customers, studios, or orders.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Links & Refresh & Admin Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              title="Refresh live data"
              className="p-2 text-[#78716C] hover:text-[#1E2229] rounded-lg hover:bg-[#F3EFEA] transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#9E593B]' : ''} />
            </button>

            {/* Admin identity badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white border border-[#E8E1D5] rounded-full text-xs shadow-2xs">
              <ShieldCheck size={14} className="text-[#9E593B]" />
              <span className="font-semibold text-[#1E2229]">{adminUser.email}</span>
            </div>

            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E2229] hover:text-black rounded-lg hover:bg-[#F3EFEA] border border-[#E8E1D5] transition-colors"
            >
              <Scissors size={13} className="text-[#9E593B]" />
              <span className="hidden sm:inline">Workbench</span>
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              title="Sign Out of Super Admin"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Light Atelier) */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto border-t border-[#E8E1D5] bg-[#FAF8F5]/80 text-xs font-semibold py-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#9E593B] text-white shadow-xs font-bold'
                : 'text-[#1E2229] hover:text-black hover:bg-[#F3EFEA]'
            }`}
          >
            <Activity size={14} />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#9E593B] text-white shadow-xs font-bold'
                : 'text-[#1E2229] hover:text-black hover:bg-[#F3EFEA]'
            }`}
          >
            <Users size={14} />
            <span>Customer Master</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-[#E8E1D5] text-[#1E2229]'
            }`}>
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('studios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'studios'
                ? 'bg-[#9E593B] text-white shadow-xs font-bold'
                : 'text-[#1E2229] hover:text-black hover:bg-[#F3EFEA]'
            }`}
          >
            <Store size={14} />
            <span>Studio Fleet</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'studios' ? 'bg-white/20 text-white' : 'bg-[#E8E1D5] text-[#1E2229]'
            }`}>
              {studios.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#9E593B] text-white shadow-xs font-bold'
                : 'text-[#1E2229] hover:text-black hover:bg-[#F3EFEA]'
            }`}
          >
            <Layers size={14} />
            <span>Orders & Dispatch</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#E8E1D5] text-[#1E2229]'
            }`}>
              {orders.length}
            </span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Actual Customers</span>
                  <Users size={16} className="text-[#9E593B]" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#1E2229]">
                    {overview?.kpis?.totalCustomers ?? customers.length}
                  </span>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {overview?.kpis?.activeCustomers ?? customers.length} Active Accounts
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
                    {overview?.kpis?.totalCapacity ?? 125} slots/day capacity
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
                    {overview?.kpis?.activeOrders ?? 0} in active pipeline
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total GMV</span>
                  <TrendingUp size={16} className="text-emerald-700" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#1E2229]">
                    ${overview?.kpis?.totalGMV?.toLocaleString() ?? '0'}
                  </span>
                  <p className="text-[11px] text-[#78716C] font-semibold mt-0.5">
                    Platform Volume
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Partner Payouts</span>
                  <Scissors size={16} className="text-amber-700" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#1E2229]">
                    ${overview?.kpis?.totalPayouts?.toLocaleString() ?? '0'}
                  </span>
                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                    Studio Earnings
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Fleet Load</span>
                  <Activity size={16} className="text-rose-600" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#1E2229]">
                    {overview?.kpis?.fleetUtilization ?? 0}%
                  </span>
                  <p className="text-[11px] text-[#78716C] font-semibold mt-0.5">
                    Capacity Utilization
                  </p>
                </div>
              </div>
            </div>

            {/* Pipeline Status Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E1D5] shadow-xs">
              <h2 className="text-sm font-bold text-[#1E2229] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={16} className="text-[#9E593B]" />
                Live Order Pipeline by Status
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
                      setOrderStatusFilter(s.label)
                      setActiveTab('orders')
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
                    Recent Live Order Dispatches
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#9E593B] hover:underline"
                  >
                    View All {orders.length} Orders &rarr;
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
                          onClick={() => setEditingOrder(o)}
                          className="p-1.5 text-[#78716C] hover:text-[#1E2229] rounded-md hover:bg-[#F3EFEA]"
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
                    Master Console Quick Ops
                  </span>
                  <h3 className="text-base font-bold text-[#1E2229] mt-1 mb-4">Master Administration Actions</h3>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => setShowAddCustomerModal(true)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus size={15} className="text-[#9E593B]" />
                        Register New Customer
                      </span>
                      <Plus size={14} />
                    </button>

                    <button
                      onClick={() => setShowAddStudioModal(true)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        <Store size={15} className="text-blue-600" />
                        Onboard Partner Studio
                      </span>
                      <Plus size={14} />
                    </button>

                    <button
                      onClick={() => {
                        setOrderStatusFilter('Allocated')
                        setActiveTab('orders')
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        <Scissors size={15} className="text-[#9E593B]" />
                        Review Unaccepted Orders
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
                    Fleet Health & Safety
                  </h4>
                  <p className="text-xs text-[#78716C] mb-3">
                    All {studios.length} partner stores are monitored with automated SLA and geolocation tracking.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-[#E8E1D5]">
                      <span className="text-[#78716C]">Active Studio Nodes</span>
                      <strong className="text-emerald-700">{studios.length} Online</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#E8E1D5]">
                      <span className="text-[#78716C]">Daily Fleet Capacity</span>
                      <strong className="text-[#1E2229]">{overview?.kpis?.totalCapacity || 125} items</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#78716C]">Platform Database</span>
                      <strong className="text-emerald-700 flex items-center gap-1">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        PostgreSQL Active
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: CUSTOMER MASTER MANAGEMENT ── */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Header / Filter Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-2.5 size-4 text-[#A8A29E]" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name, phone, email..."
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
                  Showing {filteredCustomers.length} Customers
                </span>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9E593B] text-white text-xs font-bold rounded-xl hover:bg-[#8A4C32] transition-colors shadow-xs cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>+ Add Customer</span>
                </button>
              </div>
            </div>

            {/* Customers Data Table */}
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
                          <span className="font-mono font-medium text-[#1E2229]">
                            {c.postcode || '—'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setViewingCustomerOrders(c)}
                            className="text-left group cursor-pointer"
                            title="Click to view all purchased services & retail items"
                          >
                            <span className="font-bold text-[#1E2229] group-hover:text-[#9E593B] group-hover:underline flex items-center gap-1">
                              {c.ordersCount ?? 0} orders
                              <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9E593B]" />
                            </span>
                            {c.activeOrdersCount > 0 && (
                              <span className="text-[10px] text-amber-700 font-semibold block">
                                ({c.activeOrdersCount} active)
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 font-bold text-[#1E2229]">
                          ${c.totalSpend ?? 0}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#78716C] font-mono text-[11px]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingCustomerOrders(c)}
                              className="p-1.5 text-[#78716C] hover:text-[#9E593B] hover:bg-[#FAF3ED] rounded-lg transition-colors cursor-pointer"
                              title="View Customer Purchases & History"
                            >
                              <ShoppingBag size={14} />
                            </button>
                            <button
                              onClick={() => setEditingCustomer(c)}
                              className="p-1.5 text-[#78716C] hover:text-[#9E593B] hover:bg-[#FAF3ED] rounded-lg transition-colors cursor-pointer"
                              title="Edit Customer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c.id, c.name)}
                              className="p-1.5 text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Customer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#78716C] text-xs">
                          No customer profiles match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: STUDIO FLEET MANAGEMENT ── */}
        {activeTab === 'studios' && (
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
                  onClick={() => setShowAddStudioModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9E593B] text-white text-xs font-bold rounded-xl hover:bg-[#8A4C32] transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Onboard Studio</span>
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
                          onClick={() => setEditingStudio(s)}
                          className="p-1.5 text-[#78716C] hover:text-[#1E2229] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                          title="Edit Studio"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudio(s.id, s.name)}
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
                        <span className="text-[#78716C]">Active Load:</span>
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
                      <p>Lead Tailor: <strong className="text-[#1E2229]">{s.leadTailor || 'Master Tailor'}</strong></p>
                      <p>Phone: <strong className="text-[#1E2229]">{s.phone || '—'}</strong></p>
                      <p>Hours: <strong className="text-[#1E2229]">{s.openingHours || '09:00 - 19:00'}</strong></p>
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
        )}

        {/* ── TAB 4: ORDERS & DISPATCH CONSOLE ── */}
        {activeTab === 'orders' && (
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
                      <th className="py-3 px-4">Price / Payout</th>
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
                          <span className="font-bold text-[#1E2229] block">${o.price}</span>
                          <span className="text-[10px] text-amber-800">Payout: ${o.partnerPayout || o.price}</span>
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
                            onClick={() => setEditingOrder(o)}
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
        )}
      </main>

      {/* ── MODAL: EDIT CUSTOMER (MASTER ADMIN CAPABILITY) ── */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingCustomer(null)}
              className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1E2229]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-[#FAF3ED] text-[#9E593B]">
                <Edit2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E2229]">Master Admin Customer Editor</h3>
                <p className="text-xs text-[#78716C]">Edit customer account records and saved measurements</p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingCustomer.name || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  required
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Account Role</label>
                  <div className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl text-xs font-semibold text-[#78716C] flex items-center justify-between">
                    <span>CUSTOMER</span>
                    <span className="text-[10px] text-[#A8A29E]">(Fixed)</span>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Account Status</label>
                  <select
                    value={editingCustomer.status || 'ACTIVE'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-semibold text-[#1E2229]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editingCustomer.address || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editingCustomer.postcode || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, postcode: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Saved Measurements */}
              <div>
                <label className="font-bold text-[#1E2229] block mb-1">
                  Saved Measurements (JSON or Notes)
                </label>
                <textarea
                  rows={3}
                  value={
                    typeof editingCustomer.measurements === 'object'
                      ? JSON.stringify(editingCustomer.measurements, null, 2)
                      : (editingCustomer.measurements || '')
                  }
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, measurements: e.target.value })}
                  placeholder='e.g. {"waist": "32", "inseam": "30"}'
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-[#E8E1D5] rounded-xl text-[#1E2229] hover:bg-[#FAF8F5] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9E593B] text-white rounded-xl hover:bg-[#8A4C32] font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW CUSTOMER ── */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1E2229]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#1E2229] mb-1">Create Customer Record</h3>
            <p className="text-xs text-[#78716C] mb-4">Register a new customer profile into the database.</p>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Full Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Phone</label>
                <input
                  name="phone"
                  placeholder="+44 7700 900123"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Postcode</label>
                  <input
                    name="postcode"
                    placeholder="SW1A 1AA"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue="ACTIVE"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Address</label>
                <input
                  name="address"
                  placeholder="Flat 4, 12 Kensington High St"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-[#E8E1D5] rounded-xl text-[#1E2229] hover:bg-[#FAF8F5] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9E593B] text-white rounded-xl hover:bg-[#8A4C32] font-bold shadow-xs cursor-pointer"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT STUDIO (MASTER ADMIN CAPABILITY) ── */}
      {editingStudio && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStudio(null)}
              className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1E2229]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Store size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E2229]">Master Studio Fleet Editor</h3>
                <p className="text-xs text-[#78716C]">Configure studio partner capacity, lead tailor, and parameters</p>
              </div>
            </div>

            <form onSubmit={handleSaveStudio} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Studio Name</label>
                <input
                  type="text"
                  value={editingStudio.name || ''}
                  onChange={(e) => setEditingStudio({ ...editingStudio, name: e.target.value })}
                  required
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-semibold text-[#1E2229]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Area / Borough</label>
                  <input
                    type="text"
                    value={editingStudio.area || ''}
                    onChange={(e) => setEditingStudio({ ...editingStudio, area: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editingStudio.postcode || ''}
                    onChange={(e) => setEditingStudio({ ...editingStudio, postcode: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Full Address</label>
                <input
                  type="text"
                  value={editingStudio.address || ''}
                  onChange={(e) => setEditingStudio({ ...editingStudio, address: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Lead Tailor</label>
                  <input
                    type="text"
                    value={editingStudio.leadTailor || ''}
                    onChange={(e) => setEditingStudio({ ...editingStudio, leadTailor: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingStudio.phone || ''}
                    onChange={(e) => setEditingStudio({ ...editingStudio, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Daily Capacity</label>
                  <input
                    type="number"
                    value={editingStudio.dailyCapacity || 25}
                    onChange={(e) => setEditingStudio({ ...editingStudio, dailyCapacity: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-bold text-[#1E2229]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Machines</label>
                  <input
                    type="number"
                    value={editingStudio.machines || 4}
                    onChange={(e) => setEditingStudio({ ...editingStudio, machines: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Workers</label>
                  <input
                    type="number"
                    value={editingStudio.workers || 3}
                    onChange={(e) => setEditingStudio({ ...editingStudio, workers: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={editingStudio.openingHours || ''}
                  onChange={(e) => setEditingStudio({ ...editingStudio, openingHours: e.target.value })}
                  placeholder="Mon–Sat: 09:00 – 19:00"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setEditingStudio(null)}
                  className="px-4 py-2 border border-[#E8E1D5] rounded-xl text-[#1E2229] hover:bg-[#FAF8F5] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9E593B] text-white rounded-xl hover:bg-[#8A4C32] font-bold shadow-xs cursor-pointer"
                >
                  Save Studio Specs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ONBOARD NEW STUDIO ── */}
      {showAddStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddStudioModal(false)}
              className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1E2229]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#1E2229] mb-1">Onboard New Partner Atelier</h3>
            <p className="text-xs text-[#78716C] mb-4">Register a partner studio workshop into TailorGrid fleet.</p>

            <form onSubmit={handleCreateStudio} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Studio Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Mayfair Bespoke Alterations"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Area / Neighborhood</label>
                  <input
                    name="area"
                    placeholder="Mayfair"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Postcode *</label>
                  <input
                    name="postcode"
                    required
                    placeholder="W1K 4QG"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Address *</label>
                <input
                  name="address"
                  required
                  placeholder="14 Savile Row, London"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Lead Tailor</label>
                  <input
                    name="leadTailor"
                    placeholder="Master Ahmed"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Phone</label>
                  <input
                    name="phone"
                    placeholder="+44 20 7946 0912"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Daily Cap</label>
                  <input
                    name="dailyCapacity"
                    type="number"
                    defaultValue={25}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Machines</label>
                  <input
                    name="machines"
                    type="number"
                    defaultValue={6}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Workers</label>
                  <input
                    name="workers"
                    type="number"
                    defaultValue={4}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setShowAddStudioModal(false)}
                  className="px-4 py-2 border border-[#E8E1D5] rounded-xl text-[#1E2229] hover:bg-[#FAF8F5] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9E593B] text-white rounded-xl hover:bg-[#8A4C32] font-bold shadow-xs cursor-pointer"
                >
                  Onboard Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ORDER REASSIGNMENT & DISPATCH MASTER CONTROL ── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1E2229]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-[#FAF3ED] text-[#9E593B]">
                <Scissors size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E2229]">
                  Dispatch & Order Control: {editingOrder.id}
                </h3>
                <p className="text-xs text-[#78716C]">
                  Re-assign workshop node, override status, or update garment specifications
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
              {/* STUDIO REASSIGNMENT DROPDOWN */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D5]">
                <label className="font-bold text-[#1E2229] block mb-1">
                  Assigned Partner Studio Workshop
                </label>
                <select
                  value={editingOrder.storeId || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, storeId: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-semibold text-[#1E2229]"
                >
                  <option value="">— Unassigned —</option>
                  {studios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.area || s.postcode}) — Cap: {s.dailyCapacity}/day
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#78716C] mt-1.5">
                  Re-assigning will automatically update store contacts and transfer the dispatch pipeline.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Pipeline Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-bold text-[#1E2229]"
                  >
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
                </div>

                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Physical Hang Tag No</label>
                  <input
                    type="text"
                    value={editingOrder.hangTagNo || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, hangTagNo: e.target.value })}
                    placeholder="e.g. HT-104"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Customer Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingOrder.price || 0}
                    onChange={(e) => setEditingOrder({ ...editingOrder, price: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-bold text-[#1E2229]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Assigned Worker / Machine</label>
                  <input
                    type="text"
                    value={editingOrder.assignedWorker || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, assignedWorker: e.target.value })}
                    placeholder="e.g. Tailor Marco"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Retail / Purchased Product Add-on */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={15} className="text-[#9E593B]" />
                    <span className="font-bold text-xs text-[#1E2229]">Retail Product Purchased (Add-on)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingOrder.retailSold)}
                      onChange={(e) => setEditingOrder({ ...editingOrder, retailSold: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E8E1D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9E593B]"></div>
                  </label>
                </div>

                {editingOrder.retailSold && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-[#78716C] block mb-1">Purchased Product / Category</label>
                      <input
                        type="text"
                        value={editingOrder.retailCategory || ''}
                        onChange={(e) => setEditingOrder({ ...editingOrder, retailCategory: e.target.value })}
                        placeholder="e.g. Garment Bag, Premium Hanger, Fabric Spray"
                        className="w-full p-2 bg-white border border-[#E8E1D5] rounded-lg text-xs focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#78716C] block mb-1">Retail Price ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingOrder.retailValue || 0}
                        onChange={(e) => setEditingOrder({ ...editingOrder, retailValue: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 bg-white border border-[#E8E1D5] rounded-lg text-xs focus:ring-2 focus:ring-[#9E593B] focus:outline-none font-bold text-[#1E2229]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-[#1E2229] block mb-1">Sewing / Alteration Instructions</label>
                <textarea
                  rows={2}
                  value={editingOrder.sewingNotes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, sewingNotes: e.target.value })}
                  placeholder="Master tailor stitch guidance..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl focus:ring-2 focus:ring-[#9E593B] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D5]">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-[#E8E1D5] rounded-xl text-[#1E2229] hover:bg-[#FAF8F5] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9E593B] text-white rounded-xl hover:bg-[#8A4C32] font-bold shadow-xs cursor-pointer"
                >
                  Update & Reassign Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOMER PURCHASES & HISTORY MODAL ── */}
      {viewingCustomerOrders && (
        <div className="fixed inset-0 z-50 bg-[#1E2229]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E1D5] rounded-3xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5]">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#FAF3ED] text-[#9E593B] border border-[#EADBCE] grid place-items-center font-bold text-sm uppercase">
                  {viewingCustomerOrders.name ? viewingCustomerOrders.name[0] : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E2229]">{viewingCustomerOrders.name} — Purchases & Order History</h3>
                  <p className="text-xs text-[#78716C]">
                    {viewingCustomerOrders.email || 'No email'} • {viewingCustomerOrders.phone || 'No phone'} • Total Spent: <strong className="text-[#1E2229]">${viewingCustomerOrders.totalSpend || 0}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomerOrders(null)}
                className="p-1.5 text-[#78716C] hover:text-[#1E2229] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-3 flex-1">
              {viewingCustomerOrders.orders && viewingCustomerOrders.orders.length > 0 ? (
                viewingCustomerOrders.orders.map((ord: any) => (
                  <div key={ord.id} className="p-3.5 bg-[#FAF8F5] border border-[#E8E1D5] rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-[#1E2229]">{ord.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'Work in Progress' ? 'bg-orange-100 text-orange-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1E2229]">
                        {ord.serviceName || 'Alteration Service'} — <span className="text-[#78716C] font-normal">{ord.garmentName || 'Standard Item'}</span>
                      </p>
                      {ord.retailSold ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            🛍️ Retail Purchased: {ord.retailCategory || 'Accessory / Product'} (+${ord.retailValue || 15})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#A8A29E] block mt-0.5">No retail product added</span>
                      )}
                      <p className="text-[11px] text-[#A8A29E] mt-1 font-mono">
                        {ord.date ? `${ord.date}` : (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-GB') : '')} • Workshop: {ord.storeName || 'Assigned Studio'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#1E2229] block">${ord.price}</span>
                      <button
                        onClick={() => {
                          const fullOrder = orders.find(o => o.id === ord.id)
                          if (fullOrder) {
                            setViewingCustomerOrders(null)
                            setEditingOrder(fullOrder)
                          }
                        }}
                        className="mt-1.5 text-[11px] text-[#9E593B] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        Inspect Order <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#78716C]">
                  No past orders or purchases on record for this customer.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E1D5] flex justify-end">
              <button
                onClick={() => setViewingCustomerOrders(null)}
                className="px-4 py-2 bg-[#9E593B] text-white text-xs font-bold rounded-xl hover:bg-[#8A4C32] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}
