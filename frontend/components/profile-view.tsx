'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Edit2,
  MapPin,
  Navigation,
  User as UserIcon,
} from 'lucide-react'
import type { FittingBooking, Screen, User as UserType } from './data'
import { fetchOrders, updateUserProfile } from '@/lib/api'
import { getStorageCookie, setStorageCookie } from '@/lib/cookies'

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

  const isLegacyAddress = (addr?: string | null) => !addr || addr === '18 Kensington Church St'
  const isLegacyPin = (pin?: string | null) => !pin || pin === 'W8 4EP'

  // Edit Mode toggle for Personal Details & Bespoke Fit Vault
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingVault, setIsEditingVault] = useState(false)

  // Profile Form States
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState(isLegacyAddress(user?.address) ? '' : user!.address!)
  const [postcode, setPostcode] = useState(isLegacyPin(user?.postcode) ? '' : user!.postcode!)
  const [isLocating, setIsLocating] = useState(false)

  const handleDetectLiveLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          if (res.ok) {
            const data = await res.json()
            const addr = data.address || {}
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.residential || ''
            const city = addr.city || addr.town || addr.village || addr.county || addr.state || ''
            const pin = addr.postcode || ''
            const fullAddr = [road, city].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || ''

            if (fullAddr) setAddress(fullAddr)
            if (pin) setPostcode(pin)
          } else {
            throw new Error('Fallback to BigDataCloud')
          }
        } catch {
          try {
            const res2 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            if (res2.ok) {
              const data2 = await res2.json()
              const locality = data2.locality || data2.city || data2.principalSubdivision || ''
              const pin2 = data2.postcode || ''
              if (locality) setAddress(locality)
              if (pin2) setPostcode(pin2)
            }
          } catch { }
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err)
        setIsLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

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
      const validAddr = isLegacyAddress(user.address) ? '' : user.address!
      const validPin = isLegacyPin(user.postcode) ? '' : user.postcode!
      setAddress(validAddr)
      setPostcode(validPin)

      if (!validAddr || !validPin) {
        handleDetectLiveLocation()
      }

      if (typeof window !== 'undefined') {
        const savedMeasure = getStorageCookie(`tg_measurements_${user.id || user.email || 'guest'}`)
        if (savedMeasure) {
          try {
            const parsed = JSON.parse(savedMeasure)
            if (parsed.fit) setFitPreference(parsed.fit)
            if (parsed.waist) setWaist(parsed.waist)
            if (parsed.inseam) setInseam(parsed.inseam)
            if (parsed.chest) setChest(parsed.chest)
            if (parsed.sleeve) setSleeve(parsed.sleeve)
          } catch { }
        }
      }

      const contactQuery = user.email || user.phone || user.contact
      if (contactQuery) {
        setIsLoadingOrders(true)
        fetchOrders(contactQuery)
          .then((ords) => {
            if (ords) setOrders(ords)
          })
          .catch(() => { })
          .finally(() => setIsLoadingOrders(false))
      }
    }
  }, [user])

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return

    const cleanPin = postcode.trim().replace(/\D/g, '')
    if (cleanPin.length < 5 || cleanPin.length > 10) {
      setSaveError('Please enter a valid postal / ZIP code.')
      return
    }

    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const res = await updateUserProfile({
        name: name.trim(),
        address: address.trim(),
        postcode: cleanPin,
      })

      if (typeof window !== 'undefined') {
        setStorageCookie(
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
      setIsEditingVault(false)
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
      setAddress(isLegacyAddress(user.address) ? '' : user.address!)
      setPostcode(isLegacyPin(user.postcode) ? '' : user.postcode!)
    }
    setIsEditingPersonal(false)
    setSaveError('')
  }

  const handleCancelVaultEdit = () => {
    if (user && typeof window !== 'undefined') {
      const savedMeasure = getStorageCookie(`tg_measurements_${user.id || user.email || 'guest'}`)
      if (savedMeasure) {
        try {
          const parsed = JSON.parse(savedMeasure)
          if (parsed.waist) setWaist(parsed.waist)
          if (parsed.inseam) setInseam(parsed.inseam)
          if (parsed.chest) setChest(parsed.chest)
          if (parsed.sleeve) setSleeve(parsed.sleeve)
        } catch { }
      }
    }
    setIsEditingVault(false)
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
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#9E593B]">Personal Details</h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDetectLiveLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                  title="Detect actual street address & pincode via GPS"
                >
                  <Navigation size={12} className={`text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Detect Live Location'}</span>
                </button>

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
                      placeholder="Street name, area / house no."
                      className="w-full bg-transparent border-b border-[#D5CDC2] focus:border-[#18191B] py-1.5 text-sm text-[#18191B] outline-none transition-colors"
                    />
                  ) : (
                    <p className="py-1.5 text-sm text-[#18191B] border-b border-transparent truncate">
                      {address || <span className="text-gray-400 italic font-normal">Click Detect Live Location above</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A7E85] mb-1">Postcode / ZIP / PIN</label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.replace(/[^\d\-]/g, '').slice(0, 10))}
                      placeholder="PIN / Postcode"
                      className="w-full bg-transparent font-mono font-bold border-b border-[#D5CDC2] focus:border-[#18191B] py-1.5 text-sm text-[#18191B] outline-none transition-colors"
                    />
                  ) : (
                    <p className="py-1.5 text-sm font-semibold text-[#18191B] border-b border-transparent">
                      {postcode || <span className="text-gray-400 italic font-normal font-sans">PIN Code</span>}
                    </p>
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
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#9E593B]">Bespoke Fit Vault</h2>
                <span className="text-[11px] text-[#7A7E85]">Auto-applies to bookings</span>
              </div>

              {!isEditingVault ? (
                <button
                  type="button"
                  onClick={() => setIsEditingVault(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18191B] hover:text-[#9E593B] transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelVaultEdit}
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
                  {isEditingVault ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={m.val}
                      onChange={(e) => m.setter(e.target.value.replace(/[^\d.]/g, ''))}
                      className="w-full bg-transparent text-sm font-bold text-[#18191B] outline-none pt-0.5"
                    />
                  ) : (
                    <p className="py-0.5 text-sm font-bold text-[#18191B] border-b border-transparent">
                      {m.val || '—'}
                    </p>
                  )}
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
