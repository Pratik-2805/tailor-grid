'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Mail, MapPin, Phone, ShieldCheck, User as UserIcon, X } from 'lucide-react'
import type { User as UserType } from './data'
import { updateUserProfile } from '@/lib/api'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType
  onUpdateUser: (updated: UserType) => void
}

export function ProfileModal({ isOpen, onClose, user, onUpdateUser }: ProfileModalProps) {
  const [name, setName] = useState(user.name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '18 Kensington Church St')
  const [postcode, setPostcode] = useState(user.postcode || 'W8 4EP')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await updateUserProfile({
        name: name.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
      })
      setSaving(false)
      setSuccess(true)
      if (res?.user) {
        onUpdateUser(res.user)
      } else {
        onUpdateUser({ ...user, name, address, postcode })
      }
      setTimeout(() => {
        setSuccess(false)
      }, 2500)
    } catch (err: any) {
      setSaving(false)
      setError(err.message || 'Failed to update profile.')
    }
  }

  const initial = (user.name || 'U')[0].toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-[420px] rounded-3xl bg-white shadow-2xl border border-[#E8E1D5] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#F3EFEA]">
          <div className="flex items-center gap-2">
            <UserIcon size={16} className="text-[#9E593B]" />
            <h2 className="font-serif text-[18px] font-bold text-[#18191B]">My Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1D5] grid place-items-center text-[#7A7E85] hover:text-[#18191B] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* User Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
            <div className="size-12 rounded-full overflow-hidden shrink-0 bg-[#0F1115] text-white font-bold text-sm grid place-items-center relative border border-[#E8E1D5]">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={48}
                  height={48}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="size-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-[#18191B] truncate">{user.name}</p>
              <p className="text-[12px] text-[#7A7E85] truncate">{user.email || user.contact}</p>
              {user.phone && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] font-semibold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <ShieldCheck size={11} /> {user.phone}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[13px] text-[#18191B] focus:border-[#9E593B] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                Email (Read-Only)
              </label>
              <input
                type="text"
                disabled
                value={user.email || user.contact || ''}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#F5F2EC] px-3.5 py-2.5 text-[13px] text-[#7A7E85] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                Verified Mobile
              </label>
              <input
                type="text"
                disabled
                value={user.phone || 'No phone linked'}
                className="w-full rounded-xl border border-[#E8E1D5] bg-[#F5F2EC] px-3.5 py-2.5 text-[13px] text-[#7A7E85] cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                  Default Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="18 Kensington Church St"
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[13px] text-[#18191B] focus:border-[#9E593B] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5D64] mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="W8 4EP"
                  className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[13px] text-[#18191B] focus:border-[#9E593B] focus:outline-none transition-colors uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#0F1115] hover:bg-[#9E593B] py-3 text-[13px] font-bold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm mt-2"
            >
              {saving ? 'Saving changes…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
