'use client'

import { useState, useRef, useEffect } from 'react'
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
} from 'lucide-react'
import type { User as UserType } from './data'
import { updateUserProfile } from '@/lib/api'

interface StudioProfileViewProps {
  user: UserType
  onUpdateUser?: (updated: UserType) => void
  onBack?: () => void
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

export function StudioProfileView({
  user,
  onUpdateUser,
  onBack,
  onSignOut,
}: StudioProfileViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'capacity'>('profile')

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

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name)
      if (user.studioName) setStudioName(user.studioName)
      if (user.phone) setPhone(user.phone)
      if (user.address) setAddress(user.address)
      if (user.postcode) setPostcode(user.postcode)
      if (user.avatar) {
        setAvatar(user.avatar)
      } else if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`tg_studio_avatar_${user.email || user.id}`)
        if (cached) setAvatar(cached)
      }
    }
  }, [user])

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
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

      const mergedUser: UserType = {
        ...user,
        ...updates,
        ...(res?.user || {}),
      }

      if (onUpdateUser) {
        onUpdateUser(mergedUser)
      }

      if (avatar && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`tg_studio_avatar_${user.email || user.id}`, avatar)
        } catch { }
      }

      setTimeout(() => {
        setSuccess(false)
      }, 3500)
    } catch (err: any) {
      setSaving(false)
      setError(err?.message || 'Failed to save changes. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1D5] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-[#9E593B]" />
            <span className="text-[11px] font-bold tracking-widest text-[#9E593B] uppercase">
              Partner Workbench
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1E2229]">
            Studio Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Manage your atelier identity, master tailor credentials, craft capabilities, and daily capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1E2229] hover:text-black bg-white hover:bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Back to Cockpit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#9E593B] hover:bg-[#8A4C32] rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <span>Saving...</span>
            ) : success ? (
              <>
                <Check size={14} />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Feedback Banners ── */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Atelier profile successfully saved to database! Updates are live across the Darzi Grid.
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 animate-in fade-in">
          {error}
        </div>
      )}

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D5] pb-px">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'border-[#9E593B] text-[#9E593B]'
              : 'border-transparent text-[#6B7280] hover:text-[#1E2229]'
          }`}
        >
          <Store size={14} />
          <span>Atelier Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('capacity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'capacity'
              ? 'border-[#9E593B] text-[#9E593B]'
              : 'border-transparent text-[#6B7280] hover:text-[#1E2229]'
          }`}
        >
          <Sliders size={14} />
          <span>Capacity & Craft</span>
          <span className="size-4 rounded-full bg-[#FAF3EC] text-[#9E593B] text-[10px] font-extrabold grid place-items-center">
            {specialties.length}
          </span>
        </button>
      </div>

      {/* ── Form View ── */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeSubTab === 'profile' ? (
          <div className="space-y-6">
            {/* Atelier Identity & Branding Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative size-20 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Studio Avatar" className="size-full object-cover" />
                    ) : (
                      <div className="size-full bg-[#FAF3EC] text-[#9E593B] flex items-center justify-center text-2xl font-bold font-serif">
                        {studioName ? studioName.charAt(0) : 'A'}
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1E2229]">
                        {studioName || 'Your Atelier Name'}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Verified Atelier
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Lead Craftsman: <strong className="text-[#1E2229]">{name || 'Master Tailor'}</strong>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-1">
                      <span className="bg-[#FAF3EC] text-[#9E593B] px-1.5 py-0.5 rounded font-bold text-[10px]">
                        80% Escrow
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-[200px]">{address || 'Studio Address'}</span>
                    </div>
                  </div>
                </div>

                {/* Photo Actions */}
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1D5] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer shadow-2xs"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1D5] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer shadow-2xs"
                  >
                    <ImageIcon size={13} className="text-[#9E593B]" />
                    <span>Presets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlInput(!showUrlInput)
                      setShowPresets(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1D5] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1E2229] transition-colors cursor-pointer shadow-2xs"
                  >
                    <LinkIcon size={13} className="text-[#9E593B]" />
                    <span>URL</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 text-[#6B7280] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Reset Photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Drawer */}
              {showPresets && (
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280]">
                    <span>Choose Atelier Atmosphere:</span>
                    <button
                      type="button"
                      onClick={() => setShowPresets(false)}
                      className="text-[#9E593B] hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ATELIER_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(p.url)}
                        className="group relative rounded-xl overflow-hidden aspect-4/3 border border-[#E8E1D5] hover:border-[#9E593B] transition-all text-left cursor-pointer"
                      >
                        <img src={p.url} alt={p.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-white font-bold truncate">{p.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Drawer */}
              {showUrlInput && (
                <div className="flex gap-2 animate-in fade-in">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2 bg-[#1E2229] text-white text-xs font-semibold rounded-xl hover:bg-[#9E593B] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#1E2229] border-b border-[#E8E1D5] pb-2">
                Atelier & Master Tailor Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Atelier / Studio Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-[#1E2229] bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Lead Master Tailor *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-[#1E2229] bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B] transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Workshop Physical Address *
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs text-[#1E2229] bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Postcode / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-[#1E2229] bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B] transition-colors uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    SMS Alert Phone (Dispatch) *
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs text-[#1E2229] bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Partner Email (Read-Only)
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="email"
                      readOnly
                      value={user.email || user.contact || ''}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs text-[#6B7280] bg-[#FAF8F5] border border-[#E8E1D5] rounded-xl cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between pt-2">
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out of Atelier</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveSubTab('capacity')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1E2229] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ml-auto"
              >
                <span>Next: Capacity & Craft</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* TAB 2: CAPACITY & CRAFT */
          <div className="space-y-6">
            {/* Daily Capacity Section */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-2">
                <div>
                  <h3 className="font-bold text-sm text-[#1E2229]">Daily Alteration Intake Limit</h3>
                  <p className="text-xs text-[#6B7280]">
                    Maximum garments your atelier can receive per business day.
                  </p>
                </div>
                <span className="text-sm font-bold text-[#9E593B] font-mono">{capacity} pcs/day</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['15', '25', '40', '50'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCapacity(preset)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      capacity === preset
                        ? 'bg-[#9E593B] text-white border-[#9E593B] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#1E2229] border-[#E8E1D5] hover:bg-white'
                    }`}
                  >
                    {preset} pcs/day
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Primary Node Territory (Radius)
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Kensington & Chelsea, London (5-mile radius)"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs text-[#1E2229] bg-white border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#9E593B] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Machine Specialties & Capabilities */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-2xs space-y-4">
              <div className="border-b border-[#E8E1D5] pb-2">
                <h3 className="font-bold text-sm text-[#1E2229]">Workshop Specialisms & Machinery</h3>
                <p className="text-xs text-[#6B7280]">
                  Select the services your sewing bench and pressers support.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SPECIALTIES.map((spec) => {
                  const selected = specialties.includes(spec)
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between ${
                        selected
                          ? 'bg-[#FAF3EC] border-[#9E593B] text-[#9E593B] font-bold shadow-2xs'
                          : 'bg-white border-[#E8E1D5] text-[#1E2229] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span className="truncate">{spec}</span>
                      {selected && <Check size={13} className="shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stripe Escrow Card */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-[#E8E1D5] text-[#9E593B] grid place-items-center shadow-2xs">
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E2229]">Stripe Connect Direct Escrow</div>
                  <div className="text-[11px] text-[#6B7280]">80% net payout deposited on standard 15-day rolling cycle.</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                Connected & Verified
              </span>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('profile')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2229] hover:text-[#9E593B] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Profile</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#9E593B] hover:bg-[#8A4C32] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving Atelier Profile...</span>
                ) : success ? (
                  <>
                    <Check size={14} />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <span>Save Atelier Profile</span>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
