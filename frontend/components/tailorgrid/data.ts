export type Screen =
  | 'home'
  | 'how-it-works'
  | 'about'
  | 'for-partners'
  | 'booking'
  | 'orders'
  | 'partner'
  | 'admin'

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
  customerName: string
  customerEmail: string
  customerPhone: string
  postcode: string
  garmentId: string
  serviceId: string
  storeId: string
  date: string
  timeSlot: string
  garmentBrand?: string
  fitNotes?: string
  status: OrderStatus
  price: number
  otp: string
  createdAt: string
  retailPurchase?: {
    made: boolean
    amount?: number
    category?: string
  }
}

// 7 Categories strictly matching Tech Brief
export const GARMENT_CATEGORIES: GarmentCategory[] = [
  {
    id: 'trousers',
    name: 'Trousers & Jeans',
    tagline: 'Precision hem lengths, waist shaping, and leg tapers',
    startingPrice: 20,
    avgTurnaround: '2 days',
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
        description: 'Preserves the distressed factory wash hem on denim',
        customerPrice: 26,
        partnerPayout: 20,
        platformFee: 6,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'trouser-waist',
        name: 'Take In / Let Out Waist',
        description: 'Reshape waistband through the rear rise for a gap-free fit',
        customerPrice: 28,
        partnerPayout: 21,
        platformFee: 7,
        turnaroundDays: 3,
      },
      {
        id: 'trouser-taper',
        name: 'Taper Trouser Legs',
        description: 'Slimming from knee to ankle for a modern tailored silhouette',
        customerPrice: 32,
        partnerPayout: 24,
        platformFee: 8,
        turnaroundDays: 3,
      },
      {
        id: 'trouser-zip',
        name: 'Replace Zip / Fly Repair',
        description: 'New durable YKK metal or nylon zipper installation',
        customerPrice: 22,
        partnerPayout: 16,
        platformFee: 6,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'shirts',
    name: 'Shirts & Blouses',
    tagline: 'Streamlined torsos, shortened sleeves, and collar adjustments',
    startingPrice: 18,
    avgTurnaround: '2 days',
    popularServices: [
      {
        id: 'shirt-sleeves',
        name: 'Shorten Sleeves with Placket Reset',
        description: 'Carefully moves up cuff and gauntlet buttons cleanly',
        customerPrice: 24,
        partnerPayout: 18,
        platformFee: 6,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'shirt-sides',
        name: 'Take In Sides & Back Darts',
        description: 'Eliminates excess ballooning fabric around the waist',
        customerPrice: 22,
        partnerPayout: 16,
        platformFee: 6,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'shirt-hem',
        name: 'Shorten Shirt Hem',
        description: 'Shorten for untucked casual wear or cleaner tucked profile',
        customerPrice: 18,
        partnerPayout: 13,
        platformFee: 5,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'dresses',
    name: 'Dresses & Gowns',
    tagline: 'Bespoke hem tiers, bodice tapering, and strap adjustments',
    startingPrice: 28,
    avgTurnaround: '3 days',
    popularServices: [
      {
        id: 'dress-hem-simple',
        name: 'Shorten Dress Hem (Single Layer)',
        description: 'Clean line hemming for midi, maxi, and day dresses',
        customerPrice: 28,
        partnerPayout: 21,
        platformFee: 7,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'dress-straps',
        name: 'Shorten Shoulders & Straps',
        description: 'Lifts neckline to fit bust proportions flawlessly',
        customerPrice: 22,
        partnerPayout: 16,
        platformFee: 6,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'dress-bodice',
        name: 'Take In Bodice / Bust Contouring',
        description: 'Reshape side seams and waist seam for sculpted silhouette',
        customerPrice: 38,
        partnerPayout: 29,
        platformFee: 9,
        turnaroundDays: 3,
      },
      {
        id: 'dress-zipper',
        name: 'Invisible Zip Replacement',
        description: 'Smooth seamless zipper installation with hook & eye',
        customerPrice: 26,
        partnerPayout: 19,
        platformFee: 7,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'skirts',
    name: 'Skirts',
    tagline: 'Hem reshaping, waist cinching, and vent repairs',
    startingPrice: 20,
    avgTurnaround: '2 days',
    popularServices: [
      {
        id: 'skirt-hem',
        name: 'Shorten Skirt Hem',
        description: 'Precise line hemming with blind stitch or topstitch',
        customerPrice: 20,
        partnerPayout: 15,
        platformFee: 5,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'skirt-waist',
        name: 'Take In Skirt Waistband',
        description: 'Eliminates gap at the waistband while keeping hip line smooth',
        customerPrice: 25,
        partnerPayout: 19,
        platformFee: 6,
        turnaroundDays: 2,
      },
    ],
  },
  {
    id: 'jackets',
    name: 'Jackets & Blazers',
    tagline: 'Shoulder realignment, sleeve tailoring, and side intake',
    startingPrice: 35,
    avgTurnaround: '3 days',
    popularServices: [
      {
        id: 'jacket-sleeves',
        name: 'Shorten Blazer Sleeves (from Cuff)',
        description: 'Relocates buttons and buttonholes with precision',
        customerPrice: 35,
        partnerPayout: 27,
        platformFee: 8,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'jacket-sides',
        name: 'Take In Blazer Sides / Waist Suppression',
        description: 'Creates a sculpted silhouette through torso back seams',
        customerPrice: 42,
        partnerPayout: 32,
        platformFee: 10,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'jacket-collar',
        name: 'Lower / Reset Collar Roll',
        description: 'Fixes collar gap or rolls behind the neck',
        customerPrice: 45,
        partnerPayout: 34,
        platformFee: 11,
        turnaroundDays: 4,
      },
    ],
  },
  {
    id: 'suits',
    name: 'Suits & Tailored Sets',
    tagline: 'Complete 2-piece and 3-piece tailored fit packages',
    startingPrice: 65,
    avgTurnaround: '4 days',
    popularServices: [
      {
        id: 'suit-complete-package',
        name: 'Full 2-Piece Suit Fit Overhaul',
        description: 'Includes trouser hem, waist, jacket sleeves, and side suppression',
        customerPrice: 85,
        partnerPayout: 65,
        platformFee: 20,
        turnaroundDays: 4,
        popular: true,
      },
      {
        id: 'suit-trousers-and-sleeves',
        name: 'Trouser Hem + Jacket Sleeves Duo',
        description: 'The standard essentials package for newly purchased suits',
        customerPrice: 52,
        partnerPayout: 40,
        platformFee: 12,
        turnaroundDays: 3,
        popular: true,
      },
    ],
  },
  {
    id: 'occasion',
    name: 'Ethnic & Occasion Wear',
    tagline: 'Intricate embroidery hemming, blouse darts, and delicate silk fits',
    startingPrice: 32,
    avgTurnaround: '4 days',
    popularServices: [
      {
        id: 'occasion-blouse-fit',
        name: 'Blouse / Kurti Fit & Side Darts',
        description: 'Adjusted with margin preservation and custom bust contouring',
        customerPrice: 32,
        partnerPayout: 24,
        platformFee: 8,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'occasion-lehenga-hem',
        name: 'Lehenga / Gown Hem with Border Reset',
        description: 'Careful removal and re-application of heavy embellished borders',
        customerPrice: 58,
        partnerPayout: 45,
        platformFee: 13,
        turnaroundDays: 4,
        popular: true,
      },
    ],
  },
]

// Verified Partner Studios
export const PARTNER_STORES: StoreOption[] = [
  {
    id: 'atelier-north',
    name: 'Atelier North Tailoring',
    area: 'Kensington & Chelsea',
    address: '18 Kensington Church Street',
    postcode: 'W8 4EP',
    distance: '0.6 mi away',
    distanceMiles: 0.6,
    rating: 4.96,
    reviewCount: 312,
    openingHours: 'Mon–Sat: 09:00 – 19:00',
    dailyCapacity: 25,
    machines: 6,
    workers: 4,
    leadTailor: 'Marco Rossi (30 yrs Savile Row experience)',
    specialties: ['Denim Chainstitch', 'Suit Tailoring', 'Silk & Eveningwear'],
    retailSold: true,
    coords: { lat: 51.5032, lng: -0.1915 },
  },
  {
    id: 'stitch-form',
    name: 'Stitch & Form Atelier',
    area: 'Notting Hill / Bayswater',
    address: '42 Westbourne Grove',
    postcode: 'W2 5SH',
    distance: '1.2 mi away',
    distanceMiles: 1.2,
    rating: 4.91,
    reviewCount: 248,
    openingHours: 'Mon–Sat: 09:30 – 18:30',
    dailyCapacity: 20,
    machines: 5,
    workers: 3,
    leadTailor: 'Elena Vance (Master Seamstress)',
    specialties: ['Dresses & Gowns', 'Blazer Structuring', 'Linen Repairs'],
    retailSold: true,
    coords: { lat: 51.5155, lng: -0.1945 },
  },
  {
    id: 'the-hem-room',
    name: 'The Hem Room Studio',
    area: 'Marylebone / Central',
    address: '74 Marylebone High Street',
    postcode: 'W1U 5JW',
    distance: '2.1 mi away',
    distanceMiles: 2.1,
    rating: 4.88,
    reviewCount: 195,
    openingHours: 'Mon–Sun: 10:00 – 19:00',
    dailyCapacity: 30,
    machines: 8,
    workers: 5,
    leadTailor: 'Arthur Pendelton',
    specialties: ['Express Hemming', 'Trousers & Jeans', 'Zip Replacements'],
    retailSold: false,
    coords: { lat: 51.5198, lng: -0.1508 },
  },
  {
    id: 'soho-craft-tailors',
    name: 'Soho Craft Tailors',
    area: 'Soho & Fitzrovia',
    address: '14 Beak Street',
    postcode: 'W1F 9RB',
    distance: '2.8 mi away',
    distanceMiles: 2.8,
    rating: 4.94,
    reviewCount: 420,
    openingHours: 'Mon–Sat: 09:00 – 20:00',
    dailyCapacity: 35,
    machines: 10,
    workers: 7,
    leadTailor: 'David Lin',
    specialties: ['Designer Alterations', 'Occasion Wear', 'Leather & Suede'],
    retailSold: true,
    coords: { lat: 51.5126, lng: -0.1378 },
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'I had three pairs of vintage selvedge denim tailored at Atelier North through TailorGrid. The original hem match was immaculate and the studio was so welcoming.',
    author: 'Camilla Harrington',
    role: 'Fashion Editor, London',
    garment: '3x Selvedge Denim',
    store: 'Atelier North',
    rating: 5,
  },
  {
    quote:
      'Finding a tailor you actually trust with luxury garments used to be stressful. TailorGrid matched me with a master seamstress 8 minutes from my flat. Never buying off-the-rack without tailoring again.',
    author: 'Julian Sterling',
    role: 'Architect',
    garment: 'Loro Piana Wool Blazer',
    store: 'Stitch & Form Atelier',
    rating: 5,
  },
  {
    quote:
      'The digital fitting pass made everything seamless. Walked into the Marylebone studio, spent 5 minutes getting pinned, and picked up a custom-fit dress two days later.',
    author: 'Sophie Dubois',
    role: 'Creative Director',
    garment: 'Silk Slip Evening Gown',
    store: 'The Hem Room Studio',
    rating: 5,
  },
]

export const FAQS = [
  {
    q: 'How does TailorGrid work?',
    a: 'Simply choose your garment type and required alteration, enter your location, and our platform instantly matches you with a certified master tailor studio nearby. You get transparent upfront pricing, book a fitting or drop-off time, and receive your digital fitting pass with direct studio directions.',
  },
  {
    q: 'Do I need to pin my clothes before dropping off?',
    a: 'You can choose either option! If you know your exact measurement or have pinned it at home, you can simply drop it off in under 60 seconds. Alternatively, select "Pin & Measure in Studio" during booking, and the partner master tailor will personally pin and fit the garment on you in their private fitting room.',
  },
  {
    q: 'What if the fit is not 100% right upon collection?',
    a: 'Every single order through TailorGrid is protected by our 100% Fit Guarantee. When you collect your item at the studio, you can try it on right there. If any minor tweak is needed, the partner studio will adjust it complimentary within 24 hours.',
  },
  {
    q: 'How are partner studios vetted and selected?',
    a: 'Every studio in the TailorGrid network undergoes rigorous in-person auditing. We check machine calibration (including specialist industrial blind-stitch, overlock, and chainstitch machines), artisan craftsmanship portfolio, turnaround reliability, and customer service standards.',
  },
  {
    q: 'How does pricing work?',
    a: 'All prices on TailorGrid are completely transparent and standardized. You pay securely online at booking, with zero hidden studio surcharges or surprise fees.',
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
