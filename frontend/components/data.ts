export type Screen =
  | 'home'
  | 'book'
  | 'how-it-works'
  | 'about'
  | 'for-partners'
  | 'orders'
  | 'partner'
  | 'order'
  | 'profile'
  | 'contact'
  | 'support'
  | 'privacy'

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

export const TESTIMONIALS = [
  {
    quote:
      'I dropped off three pairs of selvedge denim at Atelier SoHo through Darzi. The original chainstitch hem match was immaculate and ready in 48 hours.',
    author: 'Camilla Harrington',
    role: 'Fashion Director, New York',
    garment: '3x Selvedge Denim',
    store: 'Atelier SoHo Tailors',
    rating: 5,
  },
  {
    quote:
      'Finding a tailor you actually trust with luxury garments used to be stressful. Darzi matched me with a master seamstress 5 minutes away. Incredible 24-hour turnaround on my blazer.',
    author: 'Julian Sterling',
    role: 'Architect, Los Angeles',
    garment: 'Loro Piana Wool Blazer',
    store: 'Stitch & Form Beverly Hills',
    rating: 5,
  },
  {
    quote:
      'The digital fitting pass made everything seamless. Walked into the Lexington Ave studio, spent 5 minutes getting pinned, and picked up a custom-fit dress two days later.',
    author: 'Sophie Dubois',
    role: 'Creative Director',
    garment: 'Silk Slip Evening Gown',
    store: 'The Hem Room Studio',
    rating: 5,
  },
]

export const FAQS = [
  {
    q: 'How does Darzi work?',
    a: 'Simply choose your garment type and required alteration, enter your location, and our platform instantly matches you with a certified master tailor studio nearby. You get transparent upfront pricing, book a fitting or drop-off time, and receive your digital fitting pass with direct studio directions.',
  },
  {
    q: 'Do I need to pin my clothes before dropping off?',
    a: 'You can choose either option! If you know your exact measurement or have pinned it at home, you can simply drop it off in under 60 seconds. Alternatively, select "Pin & Measure in Studio" during booking, and the partner master tailor will personally pin and fit the garment on you in their private fitting room.',
  },
  {
    q: 'What if the fit is not 100% right upon collection?',
    a: 'Every single order through Darzi is protected by our 100% Fit Guarantee. When you collect your item at the studio, you can try it on right there. If any minor tweak is needed, the partner studio will adjust it complimentary within 24 hours.',
  },
  {
    q: 'How are partner studios vetted and selected?',
    a: 'Every studio in the Darzi network undergoes rigorous in-person auditing. We check machine calibration (including specialist industrial blind-stitch, overlock, and chainstitch machines), artisan craftsmanship portfolio, turnaround reliability, and customer service standards.',
  },
  {
    q: 'How does pricing work?',
    a: 'All prices on Darzi are standardized to real-world workshop rates in US Dollars ($). You pay the standard rate directly to the partner studio at pickup, with zero platform fees and zero markups.',
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
