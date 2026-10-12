export type User = {
  id?: string
  name: string
  contact: string
  email?: string | null
  phone?: string | null
  avatar?: string | null
  address?: string | null
  postcode?: string | null
  method: 'google' | 'apple' | 'email' | 'mobile'
  role?: 'CUSTOMER' | 'TEMP_STUDIO' | 'STUDIO' | 'ADMIN'
  status?: 'ACTIVE' | 'INACTIVE'
  studioId?: string | null
  studioName?: string | null
  currency?: string | null
  currencySymbol?: string | null
}

export type StoreOption = {
  id: string
  name: string
  area: string
  address: string
  postcode: string
  phone?: string
  email?: string
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
  image?: string
}

export type OrderStatus =
  | 'Allocated'
  | 'Accepted'
  | 'Customer Arrived'
  | 'Fitting Completed'
  | 'Work in Progress'
  | 'Ready'
  | 'Collected'
  | 'Closed'
  | 'Cancelled'

export type FittingBooking = {
  id: string
  userId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  postcode: string
  garmentId: string
  garmentName?: string
  quantity?: number
  serviceId: string
  serviceName?: string
  storeId: string
  storeName?: string
  storeAddress?: string
  slotDate: string
  slotTime: string
  notes?: string
  status: OrderStatus
  price: number
  originalPrice?: number
  payout?: number
  platformFee?: number
  turnaroundDays: number
  timeline: { step: string; done: boolean; date?: string; note?: string }[]
  messages: { sender: 'customer' | 'partner'; text: string; time: string }[]
  createdAt: string
  pickupDate?: string
  deliveryAddress?: string
  alterationItems?: any[]
  garments?: any[]
  pin?: string
  rating?: number
  review?: string
  paymentStatus?: string
  paymentMethod?: string
}
