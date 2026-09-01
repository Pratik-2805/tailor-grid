export type Screen = 'partner' | 'intake' | 'pipeline' | 'capacity' | 'payouts'

export type OrderStatus =
  | 'Allocated'
  | 'Accepted'
  | 'Customer Arrived'
  | 'Fitting Completed'
  | 'Work in Progress'
  | 'Ready'
  | 'Collected'
  | 'Closed'

export type User = {
  id?: string
  name: string
  contact: string
  email?: string
  phone?: string
  avatar?: string
  address?: string
  postcode?: string
  method: 'google' | 'apple' | 'email' | 'mobile' | 'guest'
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
  studioId?: string
  studioName?: string
}

export type StoreOption = {
  id: string
  name: string
  area: string
  address: string
  postcode: string
  distance: string
  distanceMiles: number
  rating: number
  reviewCount: number
  openingHours: string
  dailyCapacity: number
  machines: number
  workers: number
  leadTailor: string
  specialties: string[]
  retailSold: boolean
  coords: { lat: number; lng: number }
}

export type FittingBooking = {
  id: string
  userId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  postcode: string
  garmentId: string
  garmentName?: string
  serviceId: string
  serviceName?: string
  storeId: string
  storeName?: string
  date: string
  timeSlot: string
  garmentBrand?: string
  fitNotes?: string
  pinnedAdjustment?: string
  sewingNotes?: string
  slaHours?: number
  partnerPayout?: number
  retailSold?: boolean
  retailValue?: number
  retailCategory?: string
  assignedWorker?: string
  machineNo?: string
  hangTagNo?: string
  intakePhotoUrl?: string
  fabricConditionNotes?: string
  fittingType?: 'PRE_PINNED' | 'NEED_STUDIO_FITTING'
  measurements?: {
    waist?: string
    inseam?: string
    sleeve?: string
    shoulder?: string
    hem?: string
    chest?: string
    custom?: string
  }
  distanceMiles?: number
  priceAdjustment?: number
  priceAdjustmentReason?: string
  priceAdjustmentStatus?: 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED'
  slaStartedAt?: string
  rating?: number
  ratingFeedback?: string
  status: OrderStatus
  price: number
  otp: string
  createdAt?: string
}

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
