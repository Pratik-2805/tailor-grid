'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Tag,
  Search,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Scissors,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Coins,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'
import type { User } from '@/components/data'
import {
  fetchStudioCatalog,
  saveStudioCatalog,
  type StudioCatalogItemData,
  type BaseServiceCategory,
} from '@/lib/api'

interface PriceCatalogViewProps {
  user?: User | null
  onSaved?: (items: StudioCatalogItemData[], currency?: string, currencySymbol?: string) => void
  isModal?: boolean
  onClose?: () => void
}

const TURNAROUND_OPTIONS = [
  { days: 1, label: '24 hours (1-day express)' },
  { days: 2, label: '48 hours (2 days standard)' },
  { days: 3, label: '72 hours (3 days)' },
  { days: 4, label: '4 business days' },
  { days: 5, label: '5 business days' },
  { days: 7, label: '7 days (1 week)' },
]

export const AVAILABLE_CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'GBP (£) · British Pound' },
  { code: 'USD', symbol: '$', name: 'USD ($) · US Dollar' },
  { code: 'EUR', symbol: '€', name: 'EUR (€) · Euro' },
  { code: 'INR', symbol: '₹', name: 'INR (₹) · Indian Rupee' },
  { code: 'CAD', symbol: '$', name: 'CAD ($) · Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'AUD ($) · Australian Dollar' },
  { code: 'AED', symbol: 'AED', name: 'AED · UAE Dirham' },
  { code: 'SGD', symbol: '$', name: 'SGD ($) · Singapore Dollar' },
]

export function getCurrencySymbol(code?: string): string {
  if (!code) return '£'
  const found = AVAILABLE_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase())
  if (found) return found.symbol
  if (code === 'INR') return '₹'
  if (code === 'USD') return '$'
  if (code === 'EUR') return '€'
  if (code === 'GBP') return '£'
  return code
}

const CATEGORY_PRESET_SUGGESTIONS = [
  'Bridal & Formalwear',
  'Leather & Suede',
  'Curtains & Home Textiles',
  'Uniforms & Workwear',
]

const SERVICE_PRESET_SUGGESTIONS = [
  'Full Relining (Silk / Viscose)',
  'Taper Inseam & Outseam',
  'Shorten Sleeves with Split Vent',
  'Replace Metal Zipper',
  'Gusset Insertion / Let Out Waist',
]

export function PriceCatalogView({
  user,
  onSaved,
  isModal = false,
  onClose,
}: PriceCatalogViewProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [baseCategories, setBaseCategories] = useState<BaseServiceCategory[]>([])
  const [catalogItems, setCatalogItems] = useState<StudioCatalogItemData[]>([])
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string }[]>([])

  // Workshop Currency
  const [selectedCurrency, setSelectedCurrency] = useState('GBP')
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState('£')

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Add Custom Service Form Modal
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [targetCategoryIdForAdd, setTargetCategoryIdForAdd] = useState<string>('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceTurnaround, setNewServiceTurnaround] = useState(2)

  // Add Custom Category Form Modal
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const effectiveStudioId = user?.studioId || (user as any)?.id || 'atelier-studio'

  // Load catalog on mount
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchStudioCatalog(effectiveStudioId)
      .then((data) => {
        if (!isMounted) return
        setBaseCategories(data.baseCategories || [])

        // Initialize currency from server
        if (data.currency) {
          setSelectedCurrency(data.currency)
          setSelectedCurrencySymbol(
            data.currencySymbol ||
              (data.currency === 'USD'
                ? '$'
                : data.currency === 'EUR'
                ? '€'
                : data.currency === 'INR'
                ? '₹'
                : '£')
          )
        } else if ((user as any)?.currency) {
          setSelectedCurrency((user as any).currency)
          setSelectedCurrencySymbol((user as any).currencySymbol || '£')
        }

        if (data.items && data.items.length > 0) {
          setCatalogItems(data.items)

          // Extract custom categories
          const baseCatIds = new Set((data.baseCategories || []).map((c) => c.id))
          const customs: { id: string; name: string }[] = []
          for (const item of data.items) {
            if (!baseCatIds.has(item.categoryId)) {
              if (!customs.some((c) => c.id === item.categoryId)) {
                customs.push({ id: item.categoryId, name: item.categoryName })
              }
            }
          }
          setCustomCategories(customs)
        } else {
          // Pre-populate defaults
          const initialItems: StudioCatalogItemData[] = []
          for (const cat of data.baseCategories || []) {
            for (const svc of cat.services) {
              initialItems.push({
                categoryId: cat.id,
                categoryName: cat.name,
                serviceId: svc.id,
                name: svc.name,
                description: svc.description,
                price: Number(svc.customerPrice) || 16,
                currency: data.currency || 'GBP',
                currencySymbol: data.currencySymbol || '£',
                partnerPayout: Number(svc.partnerPayout) || Number(svc.customerPrice) * 0.75,
                turnaroundDays: svc.turnaroundDays || 2,
                avgTurnaround: `${svc.turnaroundDays || 2} days`,
                enabled: true,
                isCustom: false,
              })
            }
          }
          setCatalogItems(initialItems)
        }

        // Expand all categories initially
        const initExpanded: Record<string, boolean> = {}
        for (const cat of data.baseCategories || []) {
          initExpanded[cat.id] = true
        }
        setExpandedCategories(initExpanded)
      })
      .catch((err) => {
        console.error('Failed to load studio catalog:', err)
        toast.error('Could not load price catalog. Using defaults.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [effectiveStudioId])

  // Combine standard + custom categories
  const allCategories = useMemo(() => {
    const list: { id: string; name: string; tagline?: string; isCustom?: boolean }[] = []
    for (const b of baseCategories) {
      list.push({ id: b.id, name: b.name, tagline: b.tagline, isCustom: false })
    }
    for (const c of customCategories) {
      if (!list.some((item) => item.id === c.id)) {
        list.push({ id: c.id, name: c.name, tagline: 'Custom Atelier Category', isCustom: true })
      }
    }
    return list
  }, [baseCategories, customCategories])

  // Items grouped by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, StudioCatalogItemData[]> = {}
    for (const cat of allCategories) {
      grouped[cat.id] = []
    }
    for (const item of catalogItems) {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = []
      }
      grouped[item.categoryId].push(item)
    }
    return grouped
  }, [allCategories, catalogItems])

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      if (selectedCategoryFilter !== 'ALL' && cat.id !== selectedCategoryFilter) {
        return false
      }
      if (!searchQuery.trim()) return true

      const q = searchQuery.toLowerCase()
      if (cat.name.toLowerCase().includes(q)) return true

      const catItems = itemsByCategory[cat.id] || []
      return catItems.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      )
    })
  }, [allCategories, selectedCategoryFilter, searchQuery, itemsByCategory])

  const enabledServicesCount = useMemo(() => {
    return catalogItems.filter((i) => i.enabled && Number(i.price) > 0).length
  }, [catalogItems])

  const isCatalogValid = enabledServicesCount > 0

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }))
  }

  const handleUpdateItemField = (
    itemIdentifier: { categoryId: string; name: string; id?: string },
    field: keyof StudioCatalogItemData,
    value: any
  ) => {
    setCatalogItems((prev) =>
      prev.map((item) => {
        const isMatch =
          (item.id && itemIdentifier.id && item.id === itemIdentifier.id) ||
          (item.categoryId === itemIdentifier.categoryId && item.name === itemIdentifier.name)

        if (isMatch) {
          const updated = { ...item, [field]: value }
          if (field === 'turnaroundDays') {
            updated.avgTurnaround = `${value} days`
          }
          return updated
        }
        return item
      })
    )
  }

  const handleRemoveItem = (itemIdentifier: { categoryId: string; name: string; id?: string }) => {
    setCatalogItems((prev) =>
      prev.filter((item) => {
        if (item.id && itemIdentifier.id && item.id === itemIdentifier.id) {
          return false
        }
        if (item.categoryId === itemIdentifier.categoryId && item.name === itemIdentifier.name) {
          return false
        }
        return true
      })
    )
    toast.info('Service removed from catalog')
  }

  const handleApplyRecommendedRates = () => {
    const updated = catalogItems.map((item) => {
      const baseCat = baseCategories.find((c) => c.id === item.categoryId)
      const baseSvc = baseCat?.services.find((s) => s.id === item.serviceId || s.name === item.name)

      if (baseSvc) {
        return {
          ...item,
          price: Number(baseSvc.customerPrice) || 16,
          partnerPayout: Number(baseSvc.partnerPayout) || Number(baseSvc.customerPrice) * 0.75,
          turnaroundDays: baseSvc.turnaroundDays || 2,
          avgTurnaround: `${baseSvc.turnaroundDays || 2} days`,
          enabled: true,
        }
      }
      return { ...item, enabled: true, price: item.price > 0 ? item.price : 18 }
    })

    setCatalogItems(updated)
    toast.success('Applied platform recommended rates.')
  }

  const handleCurrencyChange = (newCode: string) => {
    const found = AVAILABLE_CURRENCIES.find((c) => c.code === newCode)
    if (found) {
      setSelectedCurrency(found.code)
      setSelectedCurrencySymbol(found.symbol)
      setCatalogItems((prev) =>
        prev.map((item) => ({
          ...item,
          currency: found.code,
          currencySymbol: found.symbol,
        }))
      )
      toast.info(`Currency set to ${found.name}`)
    }
  }

  const handleAddCustomService = () => {
    if (!targetCategoryIdForAdd) {
      toast.error('Please select a category.')
      return
    }
    if (!newServiceName.trim()) {
      toast.error('Please enter a service name.')
      return
    }
    const priceNum = parseFloat(newServicePrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error(`Please enter a valid price greater than ${selectedCurrencySymbol}0.`)
      return
    }

    const targetCategory = allCategories.find((c) => c.id === targetCategoryIdForAdd)
    const categoryName = targetCategory?.name || 'Custom Category'

    const newItem: StudioCatalogItemData = {
      categoryId: targetCategoryIdForAdd,
      categoryName: categoryName,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || null,
      price: priceNum,
      currency: selectedCurrency,
      currencySymbol: selectedCurrencySymbol,
      partnerPayout: priceNum * 0.75,
      turnaroundDays: newServiceTurnaround,
      avgTurnaround: `${newServiceTurnaround} days`,
      enabled: true,
      isCustom: true,
    }

    setCatalogItems((prev) => [...prev, newItem])
    setExpandedCategories((prev) => ({ ...prev, [targetCategoryIdForAdd]: true }))

    setNewServiceName('')
    setNewServiceDesc('')
    setNewServicePrice('')
    setNewServiceTurnaround(2)
    setShowAddServiceModal(false)
    toast.success(`Added "${newItem.name}" to ${categoryName}.`)
  }

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name.')
      return
    }

    const catSlug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    const catId = `custom-${catSlug}-${Date.now().toString().slice(-4)}`

    setCustomCategories((prev) => [...prev, { id: catId, name: newCategoryName.trim() }])
    setExpandedCategories((prev) => ({ ...prev, [catId]: true }))
    setTargetCategoryIdForAdd(catId)
    setNewCategoryName('')
    setShowAddCategoryModal(false)
    setShowAddServiceModal(true)
    toast.success(`Category "${newCategoryName.trim()}" created.`)
  }

  const handleSaveCatalog = async () => {
    if (!isCatalogValid) {
      toast.error(
        `Please enable at least 1 alteration service with a price greater than ${selectedCurrencySymbol}0.`
      )
      return
    }

    setSaving(true)
    try {
      const res = await saveStudioCatalog({
        studioId: effectiveStudioId,
        currency: selectedCurrency,
        currencySymbol: selectedCurrencySymbol,
        items: catalogItems.map((item) => ({
          ...item,
          currency: selectedCurrency,
          currencySymbol: selectedCurrencySymbol,
        })),
      })

      if (res.success) {
        toast.success('Price catalog saved successfully.')
        if (onSaved) {
          onSaved(res.items || catalogItems, selectedCurrency, selectedCurrencySymbol)
        }
      } else {
        throw new Error(res.message || 'Failed to save price catalog')
      }
    } catch (err: any) {
      console.error('Save catalog error:', err)
      toast.error(err.message || 'Failed to save price catalog.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-14 space-y-3">
        <RefreshCw className="w-5 h-5 text-[#9E593B] animate-spin" />
        <p className="text-xs text-[#5A5D64] font-medium">Loading catalog…</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col space-y-4 text-[#0F1115] font-sans">
      {/* Top Controls Card - Warm Atelier Ivory Card */}
      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FAF1EC] text-[#9E593B] flex items-center justify-center shrink-0">
              <Scissors className="w-4 h-4 rotate-45" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#0F1115] tracking-tight">
              Workshop Alteration Rates
            </h2>
            {isCatalogValid ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active ({enabledServicesCount} services)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Setup required
              </span>
            )}
          </div>
          <p className="text-xs text-[#5A5D64] max-w-xl leading-relaxed">
            These rates determine the exact bill presented to customers when you accept their orders. Customers pay you directly at your studio counter at pickup.
          </p>
        </div>

        {/* Currency & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Currency Select */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl px-3 py-1.5 shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-[#B45309]" />
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="text-xs font-bold text-[#0F1115] bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              {AVAILABLE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Rates Button */}
          <button
            onClick={handleApplyRecommendedRates}
            type="button"
            className="py-1.5 px-3 rounded-xl border border-[#E0D5C5] bg-[#FAF8F5] hover:bg-[#F2ECE1] text-xs font-semibold text-[#78543E] transition-colors cursor-pointer"
          >
            Use Darzi Rates
          </button>

          {/* Add Category */}
          <button
            onClick={() => setShowAddCategoryModal(true)}
            type="button"
            className="py-1.5 px-3 rounded-xl border border-[#E0D5C5] bg-white hover:bg-[#FAF8F5] text-xs font-medium text-[#4A4B4D] transition-colors cursor-pointer flex items-center gap-1"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#7A7E85]" />
            <span>+ Category</span>
          </button>

          {/* Add Service */}
          <button
            onClick={() => {
              if (allCategories.length > 0) {
                setTargetCategoryIdForAdd(allCategories[0].id)
                setShowAddServiceModal(true)
              }
            }}
            type="button"
            className="py-1.5 px-3.5 rounded-xl bg-[#9E593B] hover:bg-[#854529] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Service</span>
          </button>
        </div>
      </div>

      {/* Validation Warning Alert if 0 items are configured */}
      {!isCatalogValid && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5 flex items-start gap-3 text-[#92400E] text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-[#78350F]">
              Please enable at least one service with a valid rate.
            </p>
            <p className="text-[#92400E] mt-0.5">
              Click <strong>"Use Darzi Rates"</strong> above to auto-fill with standard market prices, or set custom rates below.
            </p>
          </div>
        </div>
      )}

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#7A7E85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garment or alteration (hem, waist, sleeves, zip)…"
            className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#E8E1D5] bg-white text-xs font-medium focus:outline-hidden focus:border-[#9E593B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7E85] hover:text-[#0F1115] text-xs font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[#9E593B] text-white shadow-xs'
                : 'bg-white border border-[#E8E1D5] text-[#5A4B41] hover:bg-[#FAF8F5]'
            }`}
          >
            All ({allCategories.length})
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryFilter === cat.id
                  ? 'bg-[#9E593B] text-white shadow-xs'
                  : 'bg-white border border-[#E8E1D5] text-[#5A4B41] hover:bg-[#FAF8F5]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="bg-white border border-[#E8E1D5] rounded-2xl p-8 text-center space-y-2">
            <p className="text-[#5A5D64] text-xs">No alteration services found matching "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#9E593B] font-bold underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const items = itemsByCategory[category.id] || []
            const isExpanded = expandedCategories[category.id] ?? true
            const categoryActiveCount = items.filter((i) => i.enabled && Number(i.price) > 0).length

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden"
              >
                {/* Category Header */}
                <div
                  onClick={() => toggleCategoryExpand(category.id)}
                  className="px-4.5 py-3.5 bg-[#F8F4EE]/90 hover:bg-[#F5EFE6] flex items-center justify-between cursor-pointer border-b border-[#E8E1D5]/70 select-none transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#FAF1EC] text-[#9E593B] flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-serif text-xs sm:text-sm font-bold text-[#0F1115] truncate">
                      {category.name}
                    </h3>
                    {category.isCustom && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#FAF1EC] text-[#9E593B] border border-[#F3DFD5]">
                        Custom
                      </span>
                    )}
                    <span className="text-xs text-[#7A7E85]">
                      ({categoryActiveCount} of {items.length} active)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTargetCategoryIdForAdd(category.id)
                        setShowAddServiceModal(true)
                      }}
                      className="text-xs text-[#9E593B] font-bold px-2 py-0.5 rounded bg-[#9E593B]/10 hover:bg-[#9E593B]/15 transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                    <div className="text-[#7A7E85]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Service Rows */}
                {isExpanded && (
                  <div className="divide-y divide-[#F0EAE1]">
                    {items.length === 0 ? (
                      <div className="p-6 text-center space-y-1.5">
                        <p className="text-xs text-[#7A7E85]">No services added under {category.name}.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetCategoryIdForAdd(category.id)
                            setShowAddServiceModal(true)
                          }}
                          className="text-xs font-bold text-[#9E593B] hover:underline cursor-pointer"
                        >
                          + Add the first service
                        </button>
                      </div>
                    ) : (
                      items.map((item, idx) => {
                        return (
                          <div
                            key={item.id || `${item.categoryId}-${item.name}-${idx}`}
                            className={`p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                              item.enabled ? 'bg-white' : 'bg-[#FAF8F5]/60 opacity-50'
                            }`}
                          >
                            {/* Toggle & Title */}
                            <div className="flex items-start gap-3 min-w-0 md:max-w-md">
                              <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                                <input
                                  type="checkbox"
                                  checked={item.enabled}
                                  onChange={(e) =>
                                    handleUpdateItemField(item, 'enabled', e.target.checked)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4.5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#9E593B]"></div>
                              </label>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs sm:text-sm font-bold ${
                                      item.enabled ? 'text-[#0F1115]' : 'text-[#7A7E85] line-through'
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                  {item.isCustom && (
                                    <span className="text-[9px] font-semibold bg-[#FAF1EC] text-[#9E593B] px-1 py-0.2 rounded border border-[#F3DFD5]">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-[#5A5D64] mt-0.5 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                              {/* Price */}
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9E593B] font-bold text-xs pointer-events-none">
                                  {selectedCurrencySymbol}
                                </span>
                                <input
                                  type="number"
                                  step="0.50"
                                  min="1"
                                  disabled={!item.enabled}
                                  value={item.price}
                                  onChange={(e) =>
                                    handleUpdateItemField(
                                      item,
                                      'price',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 pl-6 pr-2 py-1.5 rounded-lg border border-[#E8E1D5] text-xs font-bold text-[#0F1115] focus:outline-hidden focus:border-[#9E593B] disabled:bg-neutral-100 disabled:text-[#7A7E85]"
                                />
                              </div>

                              {/* Turnaround */}
                              <select
                                disabled={!item.enabled}
                                value={item.turnaroundDays || 2}
                                onChange={(e) =>
                                  handleUpdateItemField(
                                    item,
                                    'turnaroundDays',
                                    parseInt(e.target.value) || 2
                                  )
                                }
                                className="py-1.5 px-2 rounded-lg border border-[#E8E1D5] text-xs font-medium text-[#0F1115] bg-white focus:outline-hidden focus:border-[#9E593B] disabled:bg-neutral-100 disabled:text-[#7A7E85] cursor-pointer"
                              >
                                {TURNAROUND_OPTIONS.map((opt) => (
                                  <option key={opt.days} value={opt.days}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              {/* Delete custom service */}
                              {item.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item)}
                                  className="p-1.5 rounded-md text-[#7A7E85] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Remove service"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Floating Save Footer */}
      <div className="sticky bottom-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E8E1D5] shadow-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#5A5D64]">
          <CheckCircle2
            className={`w-4 h-4 ${isCatalogValid ? 'text-emerald-600' : 'text-amber-500'}`}
          />
          <span>
            <strong>{enabledServicesCount} services active</strong> in{' '}
            <span className="font-bold text-[#0F1115]">{selectedCurrency}</span> across{' '}
            {allCategories.length} categories.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="py-2 px-3.5 rounded-xl border border-[#E0D5C5] text-xs font-semibold text-[#5A5D64] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Close
            </button>
          )}

          <button
            onClick={handleSaveCatalog}
            disabled={saving || !isCatalogValid}
            type="button"
            className={`flex-1 sm:flex-initial py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              isCatalogValid
                ? 'bg-[#9E593B] hover:bg-[#854529] text-white shadow-[#9E593B]/20'
                : 'bg-neutral-200 text-[#7A7E85] cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Catalog</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ──────────────── Add Custom Service Modal ──────────────── */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-md w-full p-5 space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-2.5">
              <h3 className="font-serif text-sm font-bold text-[#0F1115]">
                Add Bespoke Alteration Service
              </h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-[#7A7E85] hover:text-[#0F1115] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5A5D64] block mb-1">
                  Garment Category
                </label>
                <select
                  value={targetCategoryIdForAdd}
                  onChange={(e) => setTargetCategoryIdForAdd(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl border border-[#E8E1D5] bg-white text-xs font-semibold focus:outline-hidden focus:border-[#9E593B]"
                >
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A5D64] block mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Relining, Take in waist, Shorten sleeves"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl border border-[#E8E1D5] bg-white text-xs font-semibold focus:outline-hidden focus:border-[#9E593B]"
                />
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-1">
                {SERVICE_PRESET_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewServiceName(preset)}
                    className="text-[10px] font-semibold bg-white border border-[#E8E1D5] hover:border-[#9E593B] hover:text-[#9E593B] text-[#5A5D64] px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A5D64] block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Craftsmanship details or fabric scope..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-[#E8E1D5] bg-white text-xs focus:outline-hidden focus:border-[#9E593B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#5A5D64] block mb-1">
                    Price ({selectedCurrencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="25.00"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl border border-[#E8E1D5] bg-white text-xs font-bold focus:outline-hidden focus:border-[#9E593B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A5D64] block mb-1">
                    Turnaround Time
                  </label>
                  <select
                    value={newServiceTurnaround}
                    onChange={(e) => setNewServiceTurnaround(parseInt(e.target.value) || 2)}
                    className="w-full py-2 px-2 rounded-xl border border-[#E8E1D5] bg-white text-xs font-semibold focus:outline-hidden focus:border-[#9E593B]"
                  >
                    {TURNAROUND_OPTIONS.map((opt) => (
                      <option key={opt.days} value={opt.days}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDE6DC]">
              <button
                type="button"
                onClick={() => setShowAddServiceModal(false)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#5A5D64] hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomService}
                className="py-1.5 px-4 rounded-xl text-xs font-bold bg-[#9E593B] hover:bg-[#854529] text-white cursor-pointer transition-colors shadow-xs"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Add Custom Category Modal ──────────────── */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8E1D5] max-w-sm w-full p-5 space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE6DC] pb-2.5">
              <h3 className="font-serif text-sm font-bold text-[#0F1115]">
                Add Custom Category
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-[#7A7E85] hover:text-[#0F1115] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-[#5A5D64] block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bridal & Formalwear"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl border border-[#E8E1D5] bg-white text-xs font-semibold focus:outline-hidden focus:border-[#9E593B]"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {CATEGORY_PRESET_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewCategoryName(preset)}
                    className="text-[10px] font-semibold bg-white border border-[#E8E1D5] hover:border-[#9E593B] hover:text-[#9E593B] text-[#5A5D64] px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDE6DC]">
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#5A5D64] hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="py-1.5 px-4 rounded-xl text-xs font-bold bg-[#9E593B] hover:bg-[#854529] text-white cursor-pointer transition-colors shadow-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
