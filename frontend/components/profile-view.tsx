'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Edit2,
  Lock,
  LogOut,
  MapPin,
  Package,
  Phone,
  Ruler,
  Save,
  Scissors,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react'
import type { FittingBooking, Screen, User as UserType } from './data'
import { fetchOrders, updateUserProfile } from '@/lib/api'

interface ProfileViewProps {
  go: (s: Screen | string) => void
  user: UserType | null
  onUpdateUser: (u: UserType) => void
  onOpenAuth: () => void
  onSignOut: () => void
}

export function ProfileView({ go, user, onUpdateUser, onOpenAuth, onSignOut }: ProfileViewProps) {
  const [orders, setOrders] = useState<FittingBooking[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // Edit Mode toggle for Personal Details
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)

  // Profile Form States
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState(user?.address || '18 Kensington Church St')
  const [postcode, setPostcode] = useState(user?.postcode || 'W8 4EP')
  const [phone, setPhone] = useState(user?.phone || '')

  // Measurements
  const [fitPreference, setFitPreference] = useState<'Slim' | 'Tailored' | 'Regular' | 'Relaxed'>('Tailored')
  const [waist, setWaist] = useState('32')
  const [inseam, setInseam] = useState('30')
  const [chest, setChest] = useState('38')
  const [sleeve, setSleeve] = useState('33')

  // Feedback states
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAddress(user.address || '18 Kensington Church St')
      setPostcode(user.postcode || 'W8 4EP')
      setPhone(user.phone || '')

      if (typeof window !== 'undefined') {
        const savedMeasure = localStorage.getItem(`tg_measurements_${user.id || user.email || 'guest'}`)
        if (savedMeasure) {
          try {
            const parsed = JSON.parse(savedMeasure)
            if (parsed.fit) setFitPreference(parsed.fit)
            if (parsed.waist) setWaist(parsed.waist)
            if (parsed.inseam) setInseam(parsed.inseam)
            if (parsed.chest) setChest(parsed.chest)
            if (parsed.sleeve) setSleeve(parsed.sleeve)
          } catch {}
        }
      }

      const contactQuery = user.email || user.phone || user.contact
      if (contactQuery) {
        setIsLoadingOrders(true)
        fetchOrders(contactQuery)
          .then((ords) => {
            if (ords) setOrders(ords)
          })
          .catch(() => {})
          .finally(() => setIsLoadingOrders(false))
      }
    }
  }, [user])

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const res = await updateUserProfile({
        name: name.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `tg_measurements_${user.id || user.email || 'guest'}`,
          JSON.stringify({
            fit: fitPreference,
            waist,
            inseam,
            chest,
            sleeve,
          })
        )
      }

      setIsSaving(false)
      setSaveSuccess(true)
      setIsEditingPersonal(false)
      if (res?.user) {
        onUpdateUser(res.user)
      } else {
        onUpdateUser({ ...user, name, address, postcode })
      }

      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (err: any) {
      setIsSaving(false)
      setSaveError(err.message || 'Failed to update profile.')
    }
  }

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || '')
      setAddress(user.address || '18 Kensington Church St')
      setPostcode(user.postcode || 'W8 4EP')
    }
    setIsEditingPersonal(false)
    setSaveError('')
  }

  // Guest State
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[360px] text-center space-y-5 animate-in fade-in">
          <div className="size-12 rounded-full bg-[#EBE6DE] grid place-items-center mx-auto text-[#18191B]">
            <UserIcon size={20} />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-[#18191B]">Account</h1>
            <p className="text-xs text-[#7A7E85] mt-1">Sign in to view your profile and saved fits.</p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full rounded-full bg-[#18191B] hover:bg-[#9E593B] text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => go('home')}
              className="w-full text-xs font-semibold text-[#7A7E85] hover:text-[#18191B] py-2 transition-colors cursor-pointer"
            >
              Return to Atelier Grid
            </button>
          </div>
        </div>
      </div>
    )
  }

  const initial = (user.name || 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-[620px] mx-auto space-y-10">

        {/* Back link */}
        <button
          onClick={() => go('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A7E85] hover:text-[#18191B] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Atelier Grid</span>
        </button>

        {/* Minimal Identity Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-[#E8E1D5]">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full overflow-hidden shrink-0 bg-[#18191B] text-white font-serif text-lg font-bold grid place-items-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={56}
                  height={56}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="size-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-[#18191B] leading-tight">{user.name}</h1>
              <p className="text-xs text-[#7A7E85] mt-0.5">{user.email || user.contact}</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>

        {/* Toast Alerts */}
        {saveSuccess && (
          <div className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-4 py-2.5 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>Profile saved successfully.</span>
          </div>
        )}

        {saveError && (
          <div className="rounded-xl bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 text-xs font-medium animate-in fade-in">
            {saveError}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSaveProfile} className="space-y-10">

          {/* Section 1: Personal Details (Name + Address together with Edit button in front) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#9E593B]">Personal Details</h2>
              
              {!isEditingPersonal ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18191B] hover:text-[#9E593B] transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-semibold text-[#7A7E85] hover:text-[#18191B] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProfile()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#065F46] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Check size={12} />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Full Name & Address grouped together */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#7A7E85] mb-1">Full Name</label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b border-[#D5CDC2] focus:border-[#18191B] py-1.5 text-sm text-[#18191B] outline-none transition-colors"
                  />
                ) : (
                  <p className="py-1.5 text-sm font-semibold text-[#18191B] border-b border-transparent">{name}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-1">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-[#7A7E85] mb-1">Delivery & Fitting Address</label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="18 Kensington Church St"
                      className="w-full bg-transparent border-b border-[#D5CDC2] focus:border-[#18191B] py-1.5 text-sm text-[#18191B] outline-none transition-colors"
                    />
                  ) : (
                    <p className="py-1.5 text-sm text-[#18191B] border-b border-transparent truncate">{address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A7E85] mb-1">Postcode</label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="W8 4EP"
                      className="w-full bg-transparent border-b border-[#D5CDC2] focus:border-[#18191B] py-1.5 text-sm text-[#18191B] outline-none transition-colors"
                    />
                  ) : (
                    <p className="py-1.5 text-sm text-[#18191B] border-b border-transparent">{postcode || 'W8 4EP'}</p>
                  )}
                </div>
              </div>

              {/* Email & Mobile Meta */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A7E85] mb-1">Email</label>
                  <p className="py-1.5 text-xs sm:text-sm text-[#5A5D64] truncate border-b border-[#E8E1D5]">{user.email || user.contact}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A7E85] mb-1">Verified Mobile</label>
                  <p className="py-1.5 text-xs sm:text-sm text-[#5A5D64] truncate border-b border-[#E8E1D5]">{user.phone || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Saved Measurements Vault */}
          <div className="space-y-4 pt-4 border-t border-[#E8E1D5]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#9E593B]">Bespoke Fit Vault</h2>
              <span className="text-[11px] text-[#7A7E85]">Auto-applies to bookings</span>
            </div>

            {/* Fit selector */}
            <div className="flex items-center gap-2 pt-1">
              {(['Slim', 'Tailored', 'Regular', 'Relaxed'] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitPreference(fit)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    fitPreference === fit
                      ? 'bg-[#18191B] text-white'
                      : 'bg-transparent text-[#7A7E85] hover:text-[#18191B]'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>

            {/* Measurements row */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {[
                { label: 'Waist (in)', val: waist, setter: setWaist },
                { label: 'Inseam (in)', val: inseam, setter: setInseam },
                { label: 'Chest (in)', val: chest, setter: setChest },
                { label: 'Sleeve (in)', val: sleeve, setter: setSleeve },
              ].map((m) => (
                <div key={m.label} className="border-b border-[#D5CDC2] py-1.5">
                  <span className="block text-[10px] uppercase text-[#7A7E85] font-semibold">{m.label}</span>
                  <input
                    type="number"
                    value={m.val}
                    onChange={(e) => m.setter(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#18191B] outline-none pt-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E8E1D5]">
            <button
              type="button"
              onClick={() => go('orders')}
              className="text-xs font-semibold text-[#18191B] hover:text-[#9E593B] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Order History ({orders.length})</span>
              <ChevronRight size={13} />
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#18191B] hover:bg-[#9E593B] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>

        {/* Section 3: Recent Alterations (Minimal List) */}
        {orders.length > 0 && (
          <div className="pt-6 border-t border-[#E8E1D5] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#9E593B]">Recent Alterations</h2>
            
            <div className="space-y-1 divide-y divide-[#EAE6DF]">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  onClick={() => go(`/order/${order.id}`)}
                  className="py-3 flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#18191B] group-hover:text-[#9E593B] transition-colors">
                      {order.garmentName} &middot; <span className="font-normal text-[#7A7E85]">{order.serviceName}</span>
                    </p>
                    <p className="text-[11px] text-[#7A7E85]">#{order.id} &middot; {order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18191B]">£{order.price}</span>
                    <span className="text-[10px] font-semibold text-[#9E593B]">{order.status || 'Active'}</span>
                    <ChevronRight size={13} className="text-[#A1A4AB] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
