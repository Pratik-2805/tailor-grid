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
    q: 'What is Raffu?',
    a: 'Raffu connects you with vetted local tailoring studios for clothing alterations and repairs. You get upfront pricing, simple booking, and a fit guarantee on every garment.',
  },
  {
    q: 'Do you offer doorstep tailoring?',
    a: 'No, all work is done in professional partner studios. High-quality alterations need specialized machines—like blindstitchers for cuffs, chainstitch units for denim, and vacuum steam presses—that cannot be brought to a home. You can visit a nearby studio for an in-person fitting or book a courier pickup.',
  },
  {
    q: 'Do I need to measure or pin my clothes before booking?',
    a: 'No. If you visit a studio, the tailor will measure and pin your garments during your fitting. If you prefer courier pickup, you can include a sample garment that fits you well, and the tailor will match its measurements.',
  },
  {
    q: 'How do you preserve original hems on jeans?',
    a: 'Our tailors carefully detach the original factory-finished hem, shorten the jeans to your requested inseam, and reattach the original distressed hem using matching thread so your jeans keep their factory look.',
  },
  {
    q: 'What suit and blazer alterations can I book?',
    a: 'Our partner studios handle sleeve shortening, taking in or letting out the waist, adjusting chest fit, tapering trousers, and correcting collar rolls.',
  },
  {
    q: 'What is invisible darning (Raffu)?',
    a: 'Raffu is the traditional craft of thread-by-thread mending. A skilled artisan weaves matching yarn taken from hidden inner seams directly into fabric tears, moth holes, or worn denim to restore the garment without visible patches.',
  },
  {
    q: 'How does the Fit Guarantee work?',
    a: 'If your altered clothes do not fit properly when you try them on, let us know within 48 hours. The partner studio will make any needed adjustments free of charge.',
  },
  {
    q: 'How does pricing work?',
    a: 'Every service has a fixed price listed on our website before you book. You pay the exact price shown, with no hidden fees or haggling at the counter.',
  },
  {
    q: 'How long do alterations take?',
    a: 'Standard alterations take 2 to 3 days. Express same-day or next-day turnaround is also available at participating studios.',
  },
  {
    q: 'How do you vet partner studios?',
    a: 'We evaluate every tailor and studio in person before they join Raffu. We inspect their machinery, review sample work, and ensure they meet our standards for clean finishing and reliable service.',
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
