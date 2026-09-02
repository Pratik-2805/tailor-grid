'use client'

import { useState } from 'react'
import {
  Check,
  CreditCard,
  Layers,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  User as UserIcon,
  X,
  Zap,
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

export function StudioProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
}: StudioProfileModalProps) {
  const [name, setName] = useState(user.name || 'Master Tailor')
  const [studioName, setStudioName] = useState(user.studioName || 'Atelier Studio')
  const [phone, setPhone] = useState(user.phone || '+44 7700 900123')
  const [address, setAddress] = useState(user.address || '18 Kensington Church St')
  const [postcode, setPostcode] = useState(user.postcode || 'W8 4EP')
  const [area, setArea] = useState('SoHo & Central London')
  const [capacity, setCapacity] = useState('25')
  const [machines, setMachines] = useState('3 Active Benches (Juki)')
  const [specialties, setSpecialties] = useState<string[]>([
    'Suit Tailoring',
    'Dress Hemming',
    'Denim Chainstitch',
    'Silk & Gowns',
  ])

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updates: Partial<UserType> = {
        name: name.trim(),
        studioName: studioName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
      }

      const res = await updateUserProfile(updates)
      setSaving(false)
      setSuccess(true)

      const updatedUser = res?.user ? res.user : { ...user, ...updates }
      onUpdateUser(updatedUser)

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setSaving(false)
      setError(err.message || 'Failed to update studio profile.')
    }
  }

  const initial = (name || studioName || 'S')[0].toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[540px] rounded-3xl bg-white shadow-2xl border border-[#E8E1D5] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E8E1D5] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-[#9E593B] text-white grid place-items-center shadow-xs">
              <Store size={15} />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1E2229] leading-tight">
                Studio Partner Profile
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Workbench Node &amp; Atelier Configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#6B7280] hover:text-[#1E2229] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Studio Profile Card Summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] shadow-2xs">
            <div className="size-14 rounded-2xl overflow-hidden shrink-0 bg-[#0F1115] text-white font-bold text-lg grid place-items-center relative border border-[#E8E1D5] shadow-xs">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-white font-mono">{initial}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[14px] font-bold text-[#1E2229] truncate">
                  {studioName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Atelier Node
                </span>
              </div>
              <p className="text-xs font-medium text-[#6B7280] truncate">
                {name} · Master Tailor
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#9E593B] font-semibold mt-1">
                <span>80% Net Escrow</span>
                <span>•</span>
                <span>{area}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Check size={15} className="text-emerald-700 shrink-0" />
              <span>Studio profile and workbench details updated successfully!</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Atelier & Master Tailor Names */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Atelier / Studio Name
                </label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Atelier SoHo Tailors"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-medium focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Master Tailor Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marco Rossi"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-medium focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Partner Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || user.contact || ''}
                  className="w-full rounded-xl border border-[#E8E1D5] bg-[#F3EFEA] px-3.5 py-2.5 text-xs text-[#6B7280] font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  SMS Alert Phone (Dispatch)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-medium focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Address & Postcode */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Workshop Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="18 Kensington Church St"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-medium focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="W8 4EP"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-semibold focus:border-[#9E593B] focus:outline-none transition-colors uppercase"
                />
              </div>
            </div>

            {/* Capacity & Bench Details */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Daily Piece Capacity Limit
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-semibold focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Neighborhood / Node Area
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="SoHo, Central London"
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-xs text-[#1E2229] font-medium focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-2">
                Certified Alteration Capabilities
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALTIES.map((s) => {
                  const on = specialties.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                        on
                          ? 'bg-[#9E593B] text-white border-[#9E593B] shadow-2xs'
                          : 'bg-white text-[#1E2229] border-[#E8E1D5] hover:border-[#9E593B]'
                      }`}
                    >
                      {on && <Check size={10} className="inline mr-1" />}
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Escrow & Banking Ribbon */}
            <div className="p-3.5 rounded-2xl bg-[#F3EFEA]/80 border border-[#E8E1D5] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CreditCard size={16} className="text-[#9E593B]" />
                <div>
                  <div className="font-bold text-[#1E2229]">Stripe Connect Escrow</div>
                  <div className="text-[11px] text-[#6B7280]">80% Net Payout · 15-Day Rolling Release</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-xs font-bold text-white transition-all shadow-xs active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Saving changes…' : 'Save Atelier Profile'}
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onSignOut()
                  }}
                  className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
