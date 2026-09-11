require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_CATEGORIES = [
  {
    id: 'trousers',
    name: 'Trousers & Jeans',
    tagline: 'Precision hem lengths, waist shaping, and leg tapers',
    startingPrice: 20,
    avgTurnaround: '48 hours',
    services: [
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
        popular: false,
      },
      {
        id: 'trouser-taper',
        name: 'Taper Trouser Legs',
        description: 'Slimming from knee to ankle for a modern tailored silhouette',
        customerPrice: 35,
        partnerPayout: 26,
        platformFee: 9,
        turnaroundDays: 2,
        popular: false,
      },
      {
        id: 'trouser-zip',
        name: 'Replace Zip / Fly Repair',
        description: 'New durable heavy-duty YKK metal or nylon zipper installation',
        customerPrice: 24,
        partnerPayout: 18,
        platformFee: 6,
        turnaroundDays: 2,
        popular: false,
      },
    ],
  },
  {
    id: 'shirts',
    name: 'Shirts & Tops',
    tagline: 'Streamlined torsos, shortened sleeves, and collar adjustments',
    startingPrice: 22,
    avgTurnaround: '48 hours',
    services: [
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
        popular: false,
      },
    ],
  },
  {
    id: 'dresses',
    name: 'Dresses & Gowns',
    tagline: 'Bespoke hem tiers, bodice tapering, and strap adjustments',
    startingPrice: 24,
    avgTurnaround: '48 hours',
    services: [
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
        popular: false,
      },
    ],
  },
  {
    id: 'jackets',
    name: 'Jackets & Blazers',
    tagline: 'Shoulder realignment, sleeve tailoring, and side intake',
    startingPrice: 45,
    avgTurnaround: '48 hours',
    services: [
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
    ],
  },
  {
    id: 'suits',
    name: 'Suits & Formalwear',
    tagline: 'Complete 2-piece and 3-piece tailored fit packages',
    startingPrice: 68,
    avgTurnaround: '48-72 hours',
    services: [
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
    services: [
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
];

const SEED_STORES = [
  {
    id: 'atelier-soho',
    name: 'Atelier SoHo Tailors',
    area: 'SoHo / Lower Manhattan',
    address: '452 West Broadway',
    postcode: '10012',
    distance: '0.4 mi away',
    distanceMiles: 0.4,
    rating: 4.96,
    reviewCount: 312,
    openingHours: 'Mon–Sat: 09:00 – 19:00',
    dailyCapacity: 25,
    machines: 6,
    workers: 4,
    leadTailor: 'Marco Rossi (25 yrs Bespoke Master)',
    specialties: ['Denim Chainstitch', 'Suit Tailoring', 'Silk & Eveningwear'],
    retailSold: true,
    lat: 40.7259,
    lng: -74.0003,
  },
  {
    id: 'stitch-beverly',
    name: 'Stitch & Form Beverly Hills',
    area: 'Beverly Hills / West Hollywood',
    address: '9410 Brighton Way',
    postcode: '90210',
    distance: '0.8 mi away',
    distanceMiles: 0.8,
    rating: 4.98,
    reviewCount: 420,
    openingHours: 'Mon–Sat: 09:30 – 18:30',
    dailyCapacity: 30,
    machines: 8,
    workers: 5,
    leadTailor: 'Elena Vance (Master Seamstress)',
    specialties: ['Dresses & Gowns', 'Blazer Structuring', 'Red Carpet Fits'],
    retailSold: true,
    lat: 34.0689,
    lng: -118.4014,
  },
  {
    id: 'the-hem-room',
    name: 'The Hem Room Studio',
    area: 'Upper East Side / Midtown',
    address: '1024 Lexington Avenue',
    postcode: '10021',
    distance: '1.2 mi away',
    distanceMiles: 1.2,
    rating: 4.91,
    reviewCount: 248,
    openingHours: 'Mon–Sun: 10:00 – 19:00',
    dailyCapacity: 30,
    machines: 8,
    workers: 5,
    leadTailor: 'Arthur Pendelton',
    specialties: ['24h Express Hemming', 'Trousers & Jeans', 'Zip Replacements'],
    retailSold: false,
    lat: 40.7716,
    lng: -73.9616,
  },
  {
    id: 'kensington-atelier',
    name: 'Kensington Bespoke Atelier',
    area: 'Kensington & Chelsea',
    address: '18 Kensington Church St',
    postcode: 'W8 4EP',
    distance: '0.3 mi away',
    distanceMiles: 0.3,
    rating: 4.95,
    reviewCount: 312,
    openingHours: 'Mon–Sat: 08:30 – 19:30',
    dailyCapacity: 20,
    machines: 6,
    workers: 4,
    leadTailor: 'Master Tailor Marco V.',
    specialties: ['Savile Row Suiting', 'Silk & Fine Dresses', 'Express 24h Hemming'],
    retailSold: true,
    lat: 51.5033,
    lng: -0.1925,
  },
  {
    id: 'atelier-mayfair',
    name: 'Mayfair Haute Couture Works',
    area: 'Mayfair & St James',
    address: '22 Savile Row',
    postcode: 'W1K 6WP',
    distance: '0.6 mi away',
    distanceMiles: 0.6,
    rating: 4.97,
    reviewCount: 184,
    openingHours: 'Mon–Sat: 09:00 – 18:00',
    dailyCapacity: 20,
    machines: 6,
    workers: 4,
    leadTailor: 'Julian Sterling (Bespoke Cutter)',
    specialties: ['Savile Row Suiting', 'Working Buttonholes', 'Jacket Structure'],
    retailSold: true,
    lat: 51.5113,
    lng: -0.1415,
  },
];

const SEED_USER = {
  id: 'usr_demo_sarah',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@example.com',
  contact: 'sarah.jenkins@example.com',
  phone: '+44 7700 900077',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  address: '18 Kensington Church St',
  postcode: 'W8 4EP',
  method: 'google',
};

const SEED_ORDERS = [
  {
    id: 'TG-849201',
    userId: 'usr_1789109785691_966',
    customerName: 'Soham Sawalakhe',
    customerEmail: 'robotg339@gmail.com',
    customerPhone: '+44 7700 900123',
    postcode: 'W8 4EP',
    garmentId: 'trousers',
    garmentName: 'Trousers & Jeans',
    serviceId: 'trouser-hem-original',
    serviceName: 'Shorten with Original Jean Hem',
    storeId: 'kensington-atelier',
    storeName: 'Kensington Bespoke Atelier',
    storePhone: '+44 20 7946 0912',
    date: '2026-09-12',
    timeSlot: '14:00 - 15:00',
    garmentBrand: "Levi's 501 Selvedge",
    fitNotes: 'Preserve raw factory chainstitch lock. 1.25 inch reduction.',
    pinnedAdjustment: JSON.stringify({ waist: '32.0 in', inseam: '30.0 in (Slight Break)', hem: '1.25 in Reduction' }),
    sewingNotes: 'Use 40wt gold contrast thread for chainstitch hem.',
    slaHours: 48,
    partnerPayout: 21.0,
    retailSold: false,
    status: 'Accepted',
    price: 28.0,
    otp: '4892',
  },
  {
    id: 'TG-392810',
    userId: 'usr_1789109785691_966',
    customerName: 'Soham Sawalakhe',
    customerEmail: 'robotg339@gmail.com',
    customerPhone: '+44 7700 900123',
    postcode: 'W1K 6WP',
    garmentId: 'jackets',
    garmentName: 'Jackets & Blazers',
    serviceId: 'jacket-sleeves',
    serviceName: 'Shorten Sleeves with Working Buttonholes',
    storeId: 'atelier-mayfair',
    storeName: 'Mayfair Haute Couture Works',
    storePhone: '+44 20 7946 0145',
    date: '2026-09-10',
    timeSlot: '11:00 - 12:00',
    garmentBrand: 'Suitsupply Havana Blazer',
    fitNotes: 'Shorten sleeves 1.0 in from shoulder crown to preserve functional surgeon cuffs.',
    pinnedAdjustment: JSON.stringify({ sleeve: '23.5 in (Wrist Bone Break)', shoulder: '16.0 in Fitted', chest: '39.0 in' }),
    sewingNotes: 'Re-align sleeve head canvas and shoulder pads.',
    slaHours: 48,
    partnerPayout: 33.75,
    retailSold: false,
    status: 'Work in Progress',
    price: 45.0,
    otp: '7153',
  },
  {
    id: 'TG-572194',
    userId: 'usr_1789109785691_966',
    customerName: 'Soham Sawalakhe',
    customerEmail: 'robotg339@gmail.com',
    customerPhone: '+44 7700 900123',
    postcode: 'W1F 8AA',
    garmentId: 'shirts',
    garmentName: 'Shirts & Tops',
    serviceId: 'shirt-sides',
    serviceName: 'Take In Sides & Back Darts',
    storeId: 'atelier-soho',
    storeName: 'Soho Master Tailors',
    storePhone: '+44 20 7946 0831',
    date: '2026-09-08',
    timeSlot: '16:00 - 17:00',
    garmentBrand: 'Thomas Pink Formal',
    fitNotes: 'Slim fit taper through side seams and add clean back darts.',
    pinnedAdjustment: JSON.stringify({ chest: '38.5 in Tapered', waist: '31.5 in Slim' }),
    sewingNotes: 'Finished with single needle flat felled seams.',
    slaHours: 48,
    partnerPayout: 19.5,
    retailSold: true,
    retailValue: 12.0,
    retailCategory: 'Garment Care Kit',
    status: 'Ready',
    price: 26.0,
    otp: '9041',
  },
  {
    id: 'TG-615409',
    userId: 'usr_demo_sarah',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    customerPhone: '+44 7700 900077',
    postcode: 'W8 4EP',
    garmentId: 'dresses',
    garmentName: 'Dresses & Jumpsuits',
    serviceId: 'dress-hem',
    serviceName: 'Shorten Dress Hem (Lined / Silk)',
    storeId: 'kensington-atelier',
    storeName: 'Kensington Bespoke Atelier',
    storePhone: '+44 20 7946 0912',
    date: '2026-09-11',
    timeSlot: '15:00 - 16:00',
    garmentBrand: 'Zimmermann Silk Gown',
    fitNotes: 'Delicate hand rolled hem on pure silk georgette layer.',
    pinnedAdjustment: JSON.stringify({ hem: 'Midi (Mid-calf 42.0 in)', waist: '27.0 in' }),
    sewingNotes: 'Hand-sewn blind hem.',
    slaHours: 48,
    partnerPayout: 31.5,
    retailSold: false,
    status: 'Accepted',
    price: 42.0,
    otp: '6154',
  }
];

async function main() {
  console.log('🌱 Starting Prisma Database Seed for Darzi...');

  // 1. Seed Categories and Services
  for (const cat of SEED_CATEGORIES) {
    const { services, ...catData } = cat;
    await prisma.garmentCategory.upsert({
      where: { id: catData.id },
      update: catData,
      create: catData,
    });

    for (const service of services) {
      await prisma.alterationService.upsert({
        where: { id: service.id },
        update: { ...service, categoryId: catData.id },
        create: { ...service, categoryId: catData.id },
      });
    }
  }
  console.log(`✅ Seeded ${SEED_CATEGORIES.length} Garment Categories & Services`);

  // 2. Seed Partner Stores
  for (const store of SEED_STORES) {
    await prisma.partnerStore.upsert({
      where: { id: store.id },
      update: store,
      create: store,
    });
  }
  console.log(`✅ Seeded ${SEED_STORES.length} Partner Studios`);

  // 3. Seed Demo User
  await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: SEED_USER,
    create: SEED_USER,
  });
  console.log(`✅ Seeded Demo User: ${SEED_USER.email}`);

  // 4. Seed Demo Orders into PostgreSQL
  const robotUser = await prisma.user.findFirst({ where: { email: 'robotg339@gmail.com' } });
  for (const order of SEED_ORDERS) {
    const orderToInsert = { ...order };
    if (orderToInsert.customerEmail === 'robotg339@gmail.com' && robotUser) {
      orderToInsert.userId = robotUser.id;
    }
    await prisma.order.upsert({
      where: { id: orderToInsert.id },
      update: orderToInsert,
      create: orderToInsert,
    });
  }
  console.log(`✅ Seeded ${SEED_ORDERS.length} Real Orders into Database`);

  console.log('🎉 Prisma database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
