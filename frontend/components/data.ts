export type Screen =
  | 'home'
  | 'book'
  | 'how-it-works'
  | 'about'
  | 'for-partners'
  | 'orders'
  | 'profile'
  | 'contact'
  | 'privacy'
  | 'terms'
  // Legacy aliases (normalized automatically to canonical routes)
  | 'order'
  | 'support'

export type GarmentCategory = {
  id: string
  name: string
  tagline: string
  startingPrice: number
  avgTurnaround: string
  popularServices: AlterationService[]
}

export type AlterationService = {
  id: string
  name: string
  description: string
  customerPrice: number
  partnerPayout: number
  platformFee: number
  turnaroundDays: number
  popular?: boolean
}

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
  storePhone?: string
  store?: StoreOption
  city?: string
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
  currency?: string
  currencySymbol?: string
  otp: string
  pickupOtpGenerated?: boolean
  createdAt?: string
}

// Garment categories are fetched dynamically from the database via /api/services
export const GARMENT_CATEGORIES: GarmentCategory[] = []

export const PARTNER_STORES: StoreOption[] = []

/** Calculate real-time distance in miles between two coordinates using Haversine formula */
export function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Radius of earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

/** Returns partner tailor studios near the requested location */
export function getStoresForLocation(location?: string, customStores?: StoreOption[]): StoreOption[] {
  return customStores && customStores.length > 0 ? customStores : []
}

/** Automatically finds and assigns the closest partner tailor studio for the user's location */
export function getClosestStoreForLocation(location?: string, customStores?: StoreOption[]): StoreOption | null {
  if (!customStores || customStores.length === 0) return null
  return customStores[0] || null
}

export const TESTIMONIALS: Array<{ quote: string; author: string; role: string; garment: string; store: string; rating: number }> = []

export const FAQS = [
  {
    q: 'How does Raffu work?',
    a: 'Pick the service you need, choose a vetted local studio or book a courier pickup, and hand over your clothes. Your tailor completes the alteration with upfront fixed pricing, and your clothes are returned ready to wear.',
  },
  {
    q: 'Do I need to measure or pin my clothes before booking?',
    a: 'No measuring tape required! If you visit the studio, the tailor pins and measures your garments in person during your fitting. If you prefer courier pickup, you can include a sample garment that already fits you well, and the tailor will match its dimensions.',
  },
  {
    q: 'What if the fit is not right when I try it on?',
    a: 'Every order is backed by our 100% Fit Guarantee. Try on your altered clothes when you receive them. If anything feels loose, tight, or uneven, let us know within 48 hours and the partner studio will adjust it for free.',
  },
  {
    q: 'Can you shorten jeans and keep the original hem?',
    a: 'Yes. Our tailors detach the factory-finished hem, trim the jeans to your desired length, and reattach the original hem with matching thread. The original wash, fading, and authentic stitching stay intact.',
  },
  {
    q: 'How long do alterations take?',
    a: 'Most standard alterations are completed in 2 to 3 days. If you need something urgently for an event or travel, same-day and next-day express options are available at select studios.',
  },
  {
    q: 'Are prices fixed, or are there surprise charges?',
    a: 'The price you see when you book is the exact price you pay. There is no counter haggling and no surprise add-ons when you pick up your clothes.',
  },
  {
    q: 'How do you choose and vet your partner tailors?',
    a: 'We personally visit every studio before adding them to our network. We inspect their workspace, verify their machinery, and review their stitch quality so your clothes are always in experienced, trusted hands.',
  },
  {
    q: 'What types of garments and repairs do you handle?',
    a: 'We handle everything from everyday trousers, shirts, and jeans to dresses, suits, and delicate fabrics. Services include hemming, waist adjustments, tapering, zipper replacements, and traditional raffu (invisible mending) for tears and holes.',
  },
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

export function getDefaultGarmentImage(garmentNameOrId?: string, serviceName?: string): string {
  const str = `${garmentNameOrId || ''} ${serviceName || ''}`.toLowerCase()
  if (str.includes('shirt') || str.includes('blouse') || str.includes('top') || str.includes('tee') || str.includes('polo') || str.includes('cuff') || str.includes('collar')) {
    return '/images/service_shirt.jpg'
  }
  if (str.includes('dress') || str.includes('gown') || str.includes('jumpsuit') || str.includes('skirt') || str.includes('slit')) {
    return '/images/service_dress.jpg'
  }
  if (str.includes('jacket') || str.includes('coat') || str.includes('outerwear') || str.includes('blouson') || str.includes('zipper') || str.includes('lining')) {
    return '/images/service_jacket.jpg'
  }
  if (str.includes('suit') || str.includes('blazer') || str.includes('tux') || str.includes('tuxedo')) {
    return '/images/service_suit.jpg'
  }
  if (str.includes('ethnic') || str.includes('sherwani') || str.includes('lehenga') || str.includes('kurta') || str.includes('saree') || str.includes('occasion') || str.includes('bridal') || str.includes('embroidery')) {
    return '/images/service_ethnic.jpg'
  }
  if (str.includes('trouser') || str.includes('jean') || str.includes('pant') || str.includes('chino') || str.includes('denim') || str.includes('hem') || str.includes('inseam') || str.includes('waist')) {
    return '/images/service_trousers.jpg'
  }
  return '/images/service_trousers.jpg'
}

export function getGarmentPhoto(order?: Partial<FittingBooking> | { intakePhotoUrl?: string; imageUrl?: string; garmentName?: string; garmentId?: string; serviceName?: string } | null): string | null {
  if (!order) return null
  const photo = order.intakePhotoUrl || (order as any)?.imageUrl
  if (photo && typeof photo === 'string') {
    const trimmed = photo.trim()
    if (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('/') || trimmed.startsWith('/uploads')) return trimmed
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          const first = parsed[0].trim()
          if (first.startsWith('http') || first.startsWith('data:') || first.startsWith('/') || first.startsWith('/uploads')) {
            return first
          }
        }
      } catch {}
    }
  }
  return null
}

export function getAllGarmentPhotos(order?: Partial<FittingBooking> | null): string[] {
  if (!order) return []
  const raw = order.intakePhotoUrl || (order as any)?.imageUrl || (order as any)?.images
  let photos: string[] = []

  if (Array.isArray(raw)) {
    photos = raw.filter((p) => typeof p === 'string' && (p.startsWith('http') || p.startsWith('data:') || p.startsWith('/') || p.startsWith('/uploads')))
  } else if (typeof raw === 'string') {
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          photos = parsed.filter((p) => typeof p === 'string' && (p.startsWith('http') || p.startsWith('data:') || p.startsWith('/') || p.startsWith('/uploads')))
        }
      } catch {}
    }
    if (photos.length === 0 && raw.includes('||')) {
      photos = raw.split('||').map((s) => s.trim()).filter((p) => p.startsWith('http') || p.startsWith('data:') || p.startsWith('/') || p.startsWith('/uploads'))
    }
    if (photos.length === 0 && (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/') || raw.startsWith('/uploads'))) {
      photos = [raw]
    }
  }

  return photos
}
