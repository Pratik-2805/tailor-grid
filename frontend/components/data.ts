export type Screen =
  | 'home'
  | 'book'
  | 'how-it-works'
  | 'about'
  | 'for-partners'
  | 'orders'
  | 'partner'
  | 'admin'
  | 'order'
  | 'profile'

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
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
  studioId?: string | null
  studioName?: string | null
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
  storeAddress?: string
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
  createdAt?: string
}

// 7 Categories strictly matching US Tailor Market Benchmark Rates & Tech Brief
export const GARMENT_CATEGORIES: GarmentCategory[] = [
  {
    id: 'trousers',
    name: 'Trousers & Jeans',
    tagline: 'Precision hem lengths, waist shaping, and leg tapers',
    startingPrice: 20,
    avgTurnaround: '48 hours',
    popularServices: [
      {
        id: 'trouser-hem-plain',
        name: 'Shorten Hem (Plain)',
        description: 'Clean classic hem adjustment measured to your exact break preference',
        customerPrice: 20,
        partnerPayout: 15,
        platformFee: 5,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'trouser-hem-original',
        name: 'Shorten with Original Jean Hem',
        description: 'Preserves the distressed factory wash and chainstitch on denim',
        customerPrice: 28,
        partnerPayout: 21,
        platformFee: 7,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'trouser-waist',
        name: 'Take In / Let Out Waist',
        description: 'Reshape waistband through the rear rise for a gap-free fit',
        customerPrice: 32,
        partnerPayout: 24,
        platformFee: 8,
        turnaroundDays: 2,
      },
      {
        id: 'trouser-taper',
        name: 'Taper Trouser Legs',
        description: 'Slimming from knee to ankle for a modern tailored silhouette',
        customerPrice: 35,
        partnerPayout: 26,
        platformFee: 9,
        turnaroundDays: 2,
      },
      {
        id: 'trouser-zip',
        name: 'Replace Zip / Fly Repair',
        description: 'New durable heavy-duty YKK metal or nylon zipper installation',
        customerPrice: 24,
        partnerPayout: 18,
        platformFee: 6,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'shirts',
    name: 'Shirts & Tops',
    tagline: 'Streamlined torsos, shortened sleeves, and collar adjustments',
    startingPrice: 22,
    avgTurnaround: '48 hours',
    popularServices: [
      {
        id: 'shirt-sleeves',
        name: 'Shorten Sleeves with Placket Reset',
        description: 'Carefully moves up cuff and gauntlet buttons cleanly',
        customerPrice: 28,
        partnerPayout: 21,
        platformFee: 7,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'shirt-sides',
        name: 'Take In Sides & Back Darts',
        description: 'Eliminates excess ballooning fabric around the waist and torso',
        customerPrice: 26,
        partnerPayout: 19,
        platformFee: 7,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'shirt-hem',
        name: 'Shorten Shirt Hem',
        description: 'Shorten for untucked casual wear or cleaner tucked profile',
        customerPrice: 22,
        partnerPayout: 16,
        platformFee: 6,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'dresses',
    name: 'Dresses & Gowns',
    tagline: 'Bespoke hem tiers, bodice tapering, and strap adjustments',
    startingPrice: 24,
    avgTurnaround: '48 hours',
    popularServices: [
      {
        id: 'dress-hem-simple',
        name: 'Shorten Dress Hem (Single Layer)',
        description: 'Clean line hemming for midi, maxi, and day dresses',
        customerPrice: 38,
        partnerPayout: 28,
        platformFee: 10,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'dress-straps',
        name: 'Shorten Shoulders & Straps',
        description: 'Lifts neckline to fit bust proportions flawlessly',
        customerPrice: 24,
        partnerPayout: 18,
        platformFee: 6,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'dress-bodice',
        name: 'Take In Bodice / Bust Contouring',
        description: 'Reshape side seams and waist seam for sculpted silhouette',
        customerPrice: 48,
        partnerPayout: 36,
        platformFee: 12,
        turnaroundDays: 2,
      },
      {
        id: 'dress-zipper',
        name: 'Invisible Zip Replacement',
        description: 'Smooth seamless zipper installation with hook & eye',
        customerPrice: 30,
        partnerPayout: 22,
        platformFee: 8,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'skirts',
    name: 'Skirts',
    tagline: 'Hem reshaping, waist cinching, and vent repairs',
    startingPrice: 24,
    avgTurnaround: '48 hours',
    popularServices: [
      {
        id: 'skirt-hem',
        name: 'Shorten Skirt Hem',
        description: 'Precise line hemming with blind stitch or topstitch',
        customerPrice: 24,
        partnerPayout: 18,
        platformFee: 6,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'skirt-waist',
        name: 'Take In Skirt Waistband',
        description: 'Eliminates gap at the waistband while keeping hip line smooth',
        customerPrice: 28,
        partnerPayout: 21,
        platformFee: 7,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'jackets',
    name: 'Jackets & Blazers',
    tagline: 'Shoulder realignment, sleeve tailoring, and side intake',
    startingPrice: 45,
    avgTurnaround: '48 hours',
    popularServices: [
      {
        id: 'jacket-sleeves',
        name: 'Shorten Blazer Sleeves (from Cuff)',
        description: 'Relocates buttons and functional buttonholes with precision',
        customerPrice: 45,
        partnerPayout: 34,
        platformFee: 11,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'jacket-sides',
        name: 'Take In Blazer Sides / Waist Suppression',
        description: 'Creates a sculpted silhouette through torso back seams',
        customerPrice: 55,
        partnerPayout: 41,
        platformFee: 14,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'jacket-collar',
        name: 'Lower / Reset Collar Roll',
        description: 'Fixes collar gap or rolls behind the neck',
        customerPrice: 50,
        partnerPayout: 38,
        platformFee: 12,
        turnaroundDays: 3,
      },
    ],
  },
  {
    id: 'suits',
    name: 'Suits & Formalwear',
    tagline: 'Complete 2-piece and 3-piece tailored fit packages',
    startingPrice: 68,
    avgTurnaround: '48-72 hours',
    popularServices: [
      {
        id: 'suit-complete-package',
        name: 'Full 2-Piece Suit Fit Overhaul',
        description: 'Includes trouser hem, waist, jacket sleeves, and side suppression',
        customerPrice: 110,
        partnerPayout: 85,
        platformFee: 25,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'suit-trousers-and-sleeves',
        name: 'Trouser Hem + Jacket Sleeves Duo',
        description: 'The standard essentials package for newly purchased suits',
        customerPrice: 68,
        partnerPayout: 52,
        platformFee: 16,
        turnaroundDays: 2,
        popular: true,
      },
    ],
  },
  {
    id: 'occasion',
    name: 'Ethnic & Occasion Wear',
    tagline: 'Intricate embroidery hemming, blouse darts, and delicate silk fits',
    startingPrice: 38,
    avgTurnaround: '48-72 hours',
    popularServices: [
      {
        id: 'occasion-blouse-fit',
        name: 'Blouse / Kurti Fit & Side Darts',
        description: 'Adjusted with margin preservation and custom bust contouring',
        customerPrice: 38,
        partnerPayout: 29,
        platformFee: 9,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'occasion-lehenga-hem',
        name: 'Lehenga / Gown Hem with Border Reset',
        description: 'Careful removal and re-application of heavy embellished borders',
        customerPrice: 75,
        partnerPayout: 58,
        platformFee: 17,
        turnaroundDays: 3,
        popular: true,
      },
    ],
  },
]

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
    a: 'All prices on Darzi are completely transparent and standardized. You pay securely online at booking, with zero hidden studio surcharges or surprise fees.',
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
