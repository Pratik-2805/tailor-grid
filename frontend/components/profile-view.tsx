'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Edit2,
  Headphones,
  Lock,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import type { FittingBooking, Screen, User as UserType } from './data'
import { fetchOrders, updateUserProfile } from '@/lib/api'
import { getStorageCookie, setStorageCookie } from '@/lib/cookies'

interface ProfileViewProps {
  go: (s: Screen | string) => void
  user: UserType | null
  onUpdateUser: (u: UserType) => void
  onOpenAuth: (authType?: 'signin' | 'signup') => void
  onSignOut: () => void
}

export function ProfileView({ go, user, onUpdateUser, onOpenAuth, onSignOut }: ProfileViewProps) {
  const [orders, setOrders] = useState<FittingBooking[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  const isLegacyAddress = (addr?: string | null) => !addr || addr === '18 Kensington Church St'
  const isLegacyPin = (pin?: string | null) => !pin || pin === 'W8 4EP'

  // Edit Mode toggle for Personal Details & Bespoke Fit Vault
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)

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
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
          if (apiKey && typeof window !== 'undefined') {
            const w = window as any
            if (!w.__googleMapsOptionsConfiguredCustomerProfile) {
              try {
                setOptions({ key: apiKey, v: 'weekly' })
                w.__googleMapsOptionsConfiguredCustomerProfile = true
              } catch { }
            }
          }

          const { Geocoder } = (await importLibrary('geocoding')) as any
          const geocoder = new Geocoder()
          const res = await geocoder.geocode({ location: { lat: latitude, lng: longitude } })

          if (res.results && res.results.length > 0) {
            const best = res.results[0]
            let streetNumber = ''
            let route = ''
            let sublocality = ''
            let city = ''
            let postalCode = ''

            for (const comp of best.address_components) {
              const types = comp.types
              if (types.includes('street_number')) streetNumber = comp.long_name
              if (types.includes('route')) route = comp.long_name
              if (types.includes('sublocality_level_1') || types.includes('sublocality')) sublocality = comp.long_name
              if (types.includes('locality') && !city) city = comp.long_name
              if (types.includes('postal_code') && !postalCode) postalCode = comp.long_name
            }

            const street = [streetNumber, route].filter(Boolean).join(' ') || sublocality || city
            const fullAddr = [street, city || sublocality].filter(Boolean).join(', ') || best.formatted_address.split(',').slice(0, 2).join(',')

            if (fullAddr) setAddress(fullAddr)
            if (postalCode) setPostcode(postalCode)
          }
        } catch (err) {
          console.warn('Google Maps Geocoding failed:', err)
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
  const [waist, setWaist] = useState('')
  const [inseam, setInseam] = useState('')
  const [chest, setChest] = useState('')
  const [sleeve, setSleeve] = useState('')

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
        const candidateKeys = [
          user.id ? `tg_measurements_${user.id}` : null,
          user.email ? `tg_measurements_${user.email}` : null,
          `tg_measurements_${user.id || user.email || 'guest'}`,
          'tg_measurements_guest',
        ].filter(Boolean) as string[]

        let loaded = false
        for (const k of candidateKeys) {
          const savedMeasure = getStorageCookie(k) || (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null)
          if (savedMeasure) {
            try {
              const parsed = JSON.parse(savedMeasure)
              if (parsed && typeof parsed === 'object') {
                if (parsed.fit) setFitPreference(parsed.fit)
                if (parsed.waist) setWaist(parsed.waist)
                if (parsed.inseam) setInseam(parsed.inseam)
                if (parsed.chest) setChest(parsed.chest)
                if (parsed.sleeve) setSleeve(parsed.sleeve)
                break
              }
            } catch { }
          }
        }
      }

      const contactQuery = user.email || user.phone || user.contact
      if (contactQuery) {
        setIsLoadingOrders(true)
        fetchOrders(contactQuery)
          .then((ords) => {
            if (ords) {
              setOrders(ords)
              // Auto-sync profile measurements from user's orders if vault is empty
              const profileKey = `tg_measurements_${user.id || user.email || 'guest'}`
              const savedMeasure = getStorageCookie(profileKey) || (typeof localStorage !== 'undefined' ? localStorage.getItem(profileKey) : null)
              let currentVault: Record<string, string> = {}
              try {
                if (savedMeasure) currentVault = JSON.parse(savedMeasure)
              } catch { }

              let updatedVault = { ...currentVault }
              ords.forEach((order) => {
                const meas = order.measurements || order.pinnedAdjustment
                if (meas) {
                  let measObj: Record<string, string> = {}
                  if (typeof meas === 'object') measObj = meas
                  else if (typeof meas === 'string' && meas.startsWith('{')) {
                    try { measObj = JSON.parse(meas) } catch { }
                  }
                  Object.entries(measObj).forEach(([k, v]) => {
                    if (v && v !== 'To be Measured by Tailor') {
                      const str = String(v).trim()
                      const matchNum = str.match(/(\d+(?:\.\d+)?)/)
                      if (k.toLowerCase().includes('waist') && matchNum && !updatedVault.waist) {
                        updatedVault.waist = matchNum[1]
                      }
                      if (k.toLowerCase().includes('inseam') && matchNum && !updatedVault.inseam) {
                        updatedVault.inseam = matchNum[1]
                      }
                      if ((k.toLowerCase().includes('chest') || k.toLowerCase().includes('bust')) && matchNum && !updatedVault.chest) {
                        updatedVault.chest = matchNum[1]
                      }
                      if (k.toLowerCase().includes('sleeve') && matchNum && !updatedVault.sleeve) {
                        updatedVault.sleeve = matchNum[1]
                      }
                    }
                  })
                }
              })

              if (updatedVault.waist) setWaist((prev) => prev || updatedVault.waist)
              if (updatedVault.inseam) setInseam((prev) => prev || updatedVault.inseam)
              if (updatedVault.chest) setChest((prev) => prev || updatedVault.chest)
              if (updatedVault.sleeve) setSleeve((prev) => prev || updatedVault.sleeve)

              if (Object.keys(updatedVault).length > 0) {
                setStorageCookie(profileKey, JSON.stringify(updatedVault))
                try { localStorage.setItem(profileKey, JSON.stringify(updatedVault)) } catch { }
              }
            }
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
      const measObj = {
        fit: fitPreference,
        waist,
        inseam,
        chest,
        sleeve,
      }

      const res = await updateUserProfile({
        name: name.trim(),
        address: address.trim(),
        postcode: cleanPin,
        measurements: JSON.stringify(measObj),
      } as any)

      if (typeof window !== 'undefined') {
        const payload = JSON.stringify(measObj)
        const keys = [
          user.id ? `tg_measurements_${user.id}` : null,
          user.email ? `tg_measurements_${user.email}` : null,
          `tg_measurements_${user.id || user.email || 'guest'}`,
          'tg_measurements_guest',
        ].filter(Boolean) as string[]

        keys.forEach((k) => {
          setStorageCookie(k, payload)
          try {
            localStorage.setItem(k, payload)
          } catch { }
        })
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
      setAddress(isLegacyAddress(user.address) ? '' : user.address!)
      setPostcode(isLegacyPin(user.postcode) ? '' : user.postcode!)
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
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="w-full rounded-full border border-[#E8E1D5] bg-white hover:bg-[#F3EFEA] hover:border-[#0F1115] text-[#18191B] py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="w-full rounded-full bg-[#18191B] hover:bg-[#9E593B] text-white py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              Sign Up
            </button>
            <button
              type="button"
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
                    <span className="text-xs font-bold text-[#18191B]">${order.price}</span>
                    <span className="text-[10px] font-semibold text-[#9E593B]">{order.status || 'Active'}</span>
                    <ChevronRight size={13} className="text-[#A1A4AB] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Concierge, Support & Legal Policies */}
        <div className="pt-6 border-t border-[#E8E1D5] space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#9E593B]">Client Concierge &amp; Legal</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => go('contact')}
              className="p-3.5 rounded-2xl bg-white border border-[#EBE6DF] hover:border-[#9E593B] text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="size-7 rounded-lg bg-[#FAF8F5] text-[#9E593B] grid place-items-center group-hover:scale-110 transition-transform">
                  <Headphones size={14} />
                </span>
                <ChevronRight size={13} className="text-[#A1A4AB] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-[#18191B]">Contact Concierge</p>
              <p className="text-[10px] text-[#7A7E85]">Fitting advice &amp; studio inquiries</p>
            </button>

            <button
              type="button"
              onClick={() => go('support')}
              className="p-3.5 rounded-2xl bg-white border border-[#EBE6DF] hover:border-[#10B981] text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="size-7 rounded-lg bg-[#ECFDF5] text-[#10B981] grid place-items-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={14} />
                </span>
                <ChevronRight size={13} className="text-[#A1A4AB] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-[#18191B]">100% Fit Guarantee</p>
              <p className="text-[10px] text-[#7A7E85]">Help center &amp; drop-off FAQs</p>
            </button>

            <button
              type="button"
              onClick={() => go('privacy')}
              className="p-3.5 rounded-2xl bg-white border border-[#EBE6DF] hover:border-[#3B82F6] text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="size-7 rounded-lg bg-[#EFF6FF] text-[#3B82F6] grid place-items-center group-hover:scale-110 transition-transform">
                  <Lock size={14} />
                </span>
                <ChevronRight size={13} className="text-[#A1A4AB] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-[#18191B]">Privacy Policy</p>
              <p className="text-[10px] text-[#7A7E85]">Measurement vault &amp; data rights</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
