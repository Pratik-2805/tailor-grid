export type Screen = 'home' | 'booking' | 'orders' | 'partner' | 'admin'

export type User = {
  name: string
  contact: string
  avatar?: string
  address?: string
  postcode?: string
  method: 'google' | 'apple' | 'email' | 'mobile' | 'guest'
}


export type StoreOption = {
  id: string
  name: string
  area: string
  distance: string
  km: number
  rating: string
  jobs: string
}

export type Tier = {
  id: string
  label: string
  window: string
  note: string
  surcharge: number
  /** SLA duration in seconds, used for the countdown once the item is collected. */
  slaSeconds: number
}

export const STORES: StoreOption[] = [
  { id: 'north', name: 'Atelier North', area: 'Kensington', distance: '0.8 mi', km: 0.8, rating: '4.9', jobs: '2.1k alterations' },
  { id: 'stitch', name: 'Stitch & Form', area: 'Hammersmith', distance: '1.6 mi', km: 1.6, rating: '4.8', jobs: '1.7k alterations' },
  { id: 'hem', name: 'The Hem Room', area: 'Fulham', distance: '2.4 mi', km: 2.4, rating: '4.7', jobs: '980 alterations' },
]

export const GARMENTS = ['Trousers', 'Jacket', 'Shirt', 'Dress', 'Coat', 'Skirt']

export const SERVICES = ['Shorten the hem', 'Adjust the waist', 'Repair a zip', 'Alter the sleeves', 'Take in the sides', 'Something else']

export const TIERS: Tier[] = [
  { id: 'express', label: 'Express', window: 'Under 2 hours', note: 'Priority pickup, fastest turnaround', surcharge: 15, slaSeconds: 2 * 60 * 60 },
  { id: 'priority', label: 'Priority', window: 'Under 24 hours', note: 'Same-day where possible', surcharge: 6, slaSeconds: 24 * 60 * 60 },
  { id: 'standard', label: 'Standard', window: 'Under 48 hours', note: 'Best value, no rush', surcharge: 0, slaSeconds: 48 * 60 * 60 },
]

export function makeOtp() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
