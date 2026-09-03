'use client'

import { useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CreditCard,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Scissors,
  Sliders,
  Sparkles,
  Store,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react'
import type { User as UserType } from './data'
import { updateUserProfile } from '@/lib/api'

interface StudioProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType
  onUpdateUser: (updated: UserType) => void
  onSignOut?: () => void
}

const SPECIALTIES = [
  'Suit Tailoring',
  'Dress Hemming',
  'Denim Chainstitch',
  'Silk & Gowns',
  'Leather & Outerwear',
  'Zip Replacements',
  'Waist Suppression',
  'Cuff Relinking',
]

const ATELIER_PRESETS = [
  {
    name: 'Mayfair Sartoria',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Savile Row Suite',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Milan Workshop',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Craft Denim Bench',
    url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=600&auto=format&fit=crop',
  },
]

export function StudioProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
}: StudioProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'capacity'>('profile')

  const [name, setName] = useState(user.name || 'Master Tailor')
  const [studioName, setStudioName] = useState(user.studioName || 'Atelier Studio')
  const [phone, setPhone] = useState(user.phone || '+44 7700 900123')
  const [address, setAddress] = useState(user.address || '18 Kensington Church St')
  const [postcode, setPostcode] = useState(user.postcode || 'W8 4EP')
  const [area, setArea] = useState('SoHo & Central London')
  const [capacity, setCapacity] = useState('25')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [showPresets, setShowPresets] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([
    'Suit Tailoring',
    'Dress Hemming',
    'Denim Chainstitch',
    'Silk & Gowns',
  ])

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  // Handle local image file upload (auto-compressed via Canvas to <60KB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).')
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onload = (loadEvt) => {
      const rawData = loadEvt.target?.result as string
      if (!rawData) return

      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 600
        let width = img.width
        let height = img.height

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL('image/jpeg', 0.82)
          setAvatar(compressed)
          setShowPresets(false)
        } else {
          setAvatar(rawData)
          setShowPresets(false)
        }
      }
      img.onerror = () => {
        setAvatar(rawData)
        setShowPresets(false)
      }
      img.src = rawData
    }
    reader.readAsDataURL(file)
  }

  const applyPreset = (url: string) => {
    setAvatar(url)
    setShowPresets(false)
    setError('')
  }

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return
    setAvatar(customUrl.trim())
    setCustomUrl('')
    setShowUrlInput(false)
    setError('')
  }

  const handleRemoveImage = () => {
    setAvatar('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updates: Partial<UserType> = {
        id: user.id,
        email: user.email,
        name: name.trim(),
        studioName: studioName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
        avatar: avatar || null,
      }

      const res = await updateUserProfile(updates)
      setSaving(false)
      setSuccess(true)

      const updatedUser = res?.user ? res.user : { ...user, ...updates }
      onUpdateUser(updatedUser)

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 700)
    } catch (err: any) {
      setSaving(false)
      setError(err.message || 'Failed to update studio profile.')
    }
  }

  const initial = (name || studioName || 'S')[0].toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]/55 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[620px] rounded-3xl bg-[#FAF8F5] shadow-[0_32px_80px_rgba(0,0,0,0.22)] border border-[#EAE3D6] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ── Minimal Header ── */}
        <div className="px-7 pt-6 pb-4 border-b border-[#EAE3D6] bg-white/80 backdrop-blur-xs flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full bg-[#9E593B]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9E593B]">
                Partner Workbench
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#18191B] tracking-tight">
              Studio Configuration
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-[#F5EFE6] hover:bg-[#EBE3D7] grid place-items-center text-[#736B63] hover:text-[#18191B] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Clean Tab Navigation ── */}
        <div className="flex items-center px-7 border-b border-[#EAE3D6] bg-[#F7F4EE] shrink-0 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#9E593B] text-[#9E593B]'
                : 'border-transparent text-[#766F66] hover:text-[#18191B]'
            }`}
          >
            <Store size={14} />
            <span>Atelier Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('capacity')}
            className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'capacity'
                ? 'border-[#9E593B] text-[#9E593B]'
                : 'border-transparent text-[#766F66] hover:text-[#18191B]'
            }`}
          >
            <Sliders size={14} />
            <span>Capacity & Craft</span>
            {specialties.length > 0 && (
              <span className="size-5 rounded-full bg-[#EAE3D6] text-[#71695F] text-[10px] grid place-items-center font-bold">
                {specialties.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="p-7 space-y-6 overflow-y-auto flex-1">

          {/* Feedback Alerts */}
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2.5 animate-in fade-in">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <Check size={16} className="text-emerald-700 shrink-0" />
              <span>Studio configuration saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: ATELIER PROFILE                                         */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* ── Spacious Atelier Hero Card ── */}
                <div className="rounded-2xl bg-white p-5 border border-[#EAE3D6] shadow-xs">
                  <div className="flex items-center gap-5">
                    
                    {/* Portrait Avatar */}
                    <div className="relative group shrink-0">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-[#18191B] text-white grid place-items-center relative border border-[#E0D8CB] shadow-xs cursor-pointer group-hover:border-[#9E593B] transition-all"
                        title="Click to change photo"
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={studioName}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="font-serif text-4xl font-light text-[#E8E1D5]">{initial}</span>
                        )}

                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[1px]">
                          <Camera size={18} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                        </div>
                      </div>

                      <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Live Atelier" />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-2xl font-bold text-[#18191B] tracking-tight truncate">
                          {studioName || 'Atelier Studio'}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Verified Atelier
                        </span>
                      </div>

                      <p className="text-xs text-[#766F66] font-medium truncate">
                        Lead Craftsman: <strong className="text-[#18191B] font-semibold">{name || 'Master Tailor'}</strong>
                      </p>

                      <div className="pt-1 flex items-center gap-2 text-xs text-[#9E593B] font-semibold">
                        <span className="bg-[#FAF3EC] px-2.5 py-0.5 rounded-md border border-[#F2E5D8] text-[11px]">
                          80% Escrow
                        </span>
                        <span className="text-[#C4BCB1]">·</span>
                        <span className="text-[#766F66] truncate text-[11px]">{address || 'Kensington'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Action Row */}
                  <div className="pt-4 mt-4 border-t border-[#F2EBE0] flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] border border-[#E0D8CB] text-xs font-semibold text-[#18191B] transition-colors cursor-pointer"
                    >
                      <Upload size={13} className="text-[#9E593B]" />
                      <span>Upload Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPresets(!showPresets)
                        setShowUrlInput(false)
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        showPresets
                          ? 'bg-[#9E593B] text-white border-[#9E593B]'
                          : 'bg-[#FAF7F2] hover:bg-[#F2ECE3] border-[#E0D8CB] text-[#18191B]'
                      }`}
                    >
                      <ImageIcon size={13} className={showPresets ? 'text-white' : 'text-[#9E593B]'} />
                      <span>Presets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUrlInput(!showUrlInput)
                        setShowPresets(false)
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        showUrlInput
                          ? 'bg-[#18191B] text-white border-[#18191B]'
                          : 'bg-[#FAF7F2] hover:bg-[#F2ECE3] border-[#E0D8CB] text-[#717680]'
                      }`}
                    >
                      <LinkIcon size={12} />
                      <span>URL</span>
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#A34343] hover:text-red-700 transition-colors ml-auto cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Presets Grid Drawer */}
                  {showPresets && (
                    <div className="pt-3.5 mt-3.5 border-t border-[#F2EBE0] animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className="text-[10px] font-bold text-[#8C8275] uppercase tracking-wider mb-2.5">
                        Choose Bespoke Photography Preset:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {ATELIER_PRESETS.map((p) => {
                          const isSelected = avatar === p.url
                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => applyPreset(p.url)}
                              className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-[#9E593B] border-transparent shadow-xs'
                                  : 'border-[#EAE3D6] hover:border-[#9E593B]'
                              }`}
                            >
                              <div className="h-16 w-full bg-[#F5EFE6] overflow-hidden">
                                <img
                                  src={p.url}
                                  alt={p.name}
                                  className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="p-2 bg-white flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#18191B] truncate">
                                  {p.name}
                                </span>
                                {isSelected && <Check size={11} className="text-[#9E593B] shrink-0" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* URL Input Drawer */}
                  {showUrlInput && (
                    <div className="pt-3.5 mt-3.5 border-t border-[#F2EBE0] flex items-center gap-2 animate-in fade-in duration-150">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 rounded-xl border border-[#E0D8CB] bg-[#FAF8F5] px-3.5 py-2 text-xs text-[#18191B] focus:border-[#9E593B] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        className="px-3.5 py-2 rounded-xl bg-[#18191B] text-white text-xs font-bold hover:bg-[#9E593B] transition-colors cursor-pointer shrink-0"
                      >
                        Set Image
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* ── Form Inputs ── */}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66] mb-1.5">
                        Atelier / Studio Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        placeholder="e.g. Atelier SoHo Tailors"
                        className="w-full rounded-xl border border-[#E0D8CB] bg-white px-3.5 py-2.5 text-xs text-[#18191B] font-semibold focus:border-[#9E593B] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66] mb-1.5">
                        Lead Master Tailor *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Marco Rossi"
                        className="w-full rounded-xl border border-[#E0D8CB] bg-white px-3.5 py-2.5 text-xs text-[#18191B] font-semibold focus:border-[#9E593B] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66] mb-1.5">
                        Workshop Address
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="18 Kensington Church St"
                          className="w-full rounded-xl border border-[#E0D8CB] bg-white px-3.5 py-2.5 text-xs text-[#18191B] font-medium focus:border-[#9E593B] focus:outline-none transition-colors pl-8"
                        />
                        <MapPin size={13} className="absolute left-2.5 text-[#9E593B]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66] mb-1.5">
                        Postcode
                      </label>
                      <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="W8 4EP"
                        className="w-full rounded-xl border border-[#E0D8CB] bg-white px-3.5 py-2.5 text-xs text-[#18191B] font-bold uppercase focus:border-[#9E593B] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66] mb-1.5">
                        SMS Alert Phone (Dispatch) *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+44 7700 900123"
                          className="w-full rounded-xl border border-[#E0D8CB] bg-white px-3.5 py-2.5 text-xs text-[#18191B] font-semibold focus:border-[#9E593B] focus:outline-none transition-colors pl-8"
                        />
                        <Phone size={13} className="absolute left-2.5 text-[#9E593B]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66] mb-1.5">
                        Partner Email (Read-Only)
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="email"
                          disabled
                          value={user.email || user.contact || ''}
                          className="w-full rounded-xl border border-[#E8E1D5] bg-[#F3EDE3] px-3.5 py-2.5 text-xs text-[#7A7269] font-medium cursor-not-allowed pl-8"
                        />
                        <Lock size={13} className="absolute left-2.5 text-[#9E968D]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: CAPACITY & CRAFT                                        */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'capacity' && (
              <div className="space-y-6 animate-in fade-in duration-150">

                {/* Daily Capacity Control */}
                <div className="rounded-2xl bg-white p-5 border border-[#EAE3D6] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#18191B]">
                        Daily Alteration Piece Limit
                      </label>
                      <p className="text-[11px] text-[#766F66]">Maximum garments assigned to your workbench per day.</p>
                    </div>
                    <span className="font-mono text-base font-extrabold text-[#9E593B] bg-[#FAF3EC] px-3 py-1 rounded-xl border border-[#F2E5D8]">
                      {capacity} pcs/day
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {['15', '25', '40', '50'].map((val) => {
                      const isSelected = capacity === val
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCapacity(val)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#18191B] text-white border-[#18191B] shadow-xs'
                              : 'bg-[#FAF8F5] text-[#766F66] border-[#E0D8CB] hover:border-[#9E593B]'
                          }`}
                        >
                          {val} pcs
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Node Territory */}
                <div className="rounded-2xl bg-white p-5 border border-[#EAE3D6] space-y-1.5">
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#766F66]">
                    Neighborhood / Node Territory
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. SoHo & Lower Manhattan"
                    className="w-full rounded-xl border border-[#E0D8CB] bg-[#FAF8F5] px-3.5 py-2.5 text-xs text-[#18191B] font-semibold focus:border-[#9E593B] focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10.5px] text-[#8C8275]">Used for customer distance matching on the Darzi Grid.</p>
                </div>

                {/* Certified Machine Specialties */}
                <div className="rounded-2xl bg-white p-5 border border-[#EAE3D6] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#18191B]">
                        Certified Workshop Capabilities
                      </label>
                      <p className="text-[11px] text-[#766F66]">Select the tailoring specialisms active in your studio.</p>
                    </div>
                    <span className="text-[10.5px] font-bold text-[#9E593B]">
                      {specialties.length} active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {SPECIALTIES.map((s) => {
                      const on = specialties.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecialty(s)}
                          className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                            on
                              ? 'bg-[#FAF4ED] text-[#9E593B] border-[#9E593B] shadow-2xs'
                              : 'bg-[#FAF8F5] text-[#57534E] border-[#E5DFD4] hover:border-[#9E593B]'
                          }`}
                        >
                          <span>{s}</span>
                          <span
                            className={`size-4 rounded-md grid place-items-center transition-colors ${
                              on ? 'bg-[#9E593B] text-white' : 'bg-[#EAE3D6] text-transparent'
                            }`}
                          >
                            <Check size={10} />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Stripe Escrow Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-[#FAF3EC] grid place-items-center text-[#9E593B]">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#18191B]">Stripe Connect Escrow Settlement</div>
                      <div className="text-[11px] text-[#766F66]">80% Net Payout · 15-Day Rolling Release</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>

              </div>
            )}

            {/* ── Footer Actions ── */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#EAE3D6]">
              {activeTab === 'profile' ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-3 rounded-2xl border border-[#E0D8CB] bg-white hover:bg-[#FAF6F0] text-xs font-bold text-[#18191B] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save & Close'}
                    </button>
                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          onSignOut()
                        }}
                        className="px-3.5 py-3 rounded-2xl border border-transparent hover:bg-rose-50 text-[#71695F] hover:text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Sign out of Studio Workbench"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('capacity')}
                    className="flex-1 max-w-[240px] rounded-2xl bg-[#18191B] hover:bg-[#9E593B] py-3 text-xs font-bold text-white transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2 ml-auto"
                  >
                    <span>Next: Capacity & Craft</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-4 py-3 rounded-2xl border border-[#E0D8CB] bg-white hover:bg-[#FAF6F0] text-xs font-bold text-[#71695F] hover:text-[#18191B] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Profile</span>
                  </button>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 max-w-[260px] rounded-2xl bg-[#18191B] hover:bg-[#9E593B] py-3 text-xs font-bold text-white transition-all shadow-sm active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      <span>{saving ? 'Saving atelier…' : 'Save Atelier Profile'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
