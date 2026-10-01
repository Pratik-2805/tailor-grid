const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Legitimate alteration service categories
const LEGIT_CATEGORIES = [
  {
    id: 'trousers',
    name: 'Trousers & Jeans',
    tagline: 'Precision hems, waist taking-in, taper and seat contouring.',
    startingPrice: 12.0,
    avgTurnaround: '48 hours',
    services: [
      {
        id: 'trouser-hem-plain',
        name: 'Shorten Hem (Plain)',
        description: 'Clean cut and machine-stitched standard hem for suit trousers, chinos, and pants.',
        customerPrice: 16.0,
        partnerPayout: 12.0,
        platformFee: 4.0,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'trouser-hem-original',
        name: 'Shorten with Original Jean Hem',
        description: 'Preserves the distressed factory hem on premium and selvedge denim.',
        customerPrice: 22.0,
        partnerPayout: 16.5,
        platformFee: 5.5,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'trouser-waist',
        name: 'Take In / Let Out Waist & Seat',
        description: 'Tailored fit through waistband and seat seams for structured trousers.',
        customerPrice: 25.0,
        partnerPayout: 18.75,
        platformFee: 6.25,
        turnaroundDays: 3,
        popular: false,
      },
      {
        id: 'trouser-taper',
        name: 'Taper Legs (Knee to Ankle)',
        description: 'Slim down trousers from the knee down to create a streamlined, modern silhouette.',
        customerPrice: 28.0,
        partnerPayout: 21.0,
        platformFee: 7.0,
        turnaroundDays: 3,
        popular: false,
      },
    ],
  },
  {
    id: 'jackets',
    name: 'Jackets & Blazers',
    tagline: 'Sleeve adjustments, body slimming, and collar roll correction.',
    startingPrice: 28.0,
    avgTurnaround: '72 hours',
    services: [
      {
        id: 'jacket-sleeves',
        name: 'Shorten Blazer Sleeves (from Cuff)',
        description: 'Precision sleeve shortening with vent and button relocation.',
        customerPrice: 34.0,
        partnerPayout: 25.5,
        platformFee: 8.5,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'jacket-sides',
        name: 'Take In Jacket Sides & Back Seams',
        description: 'Contour blazer silhouette through side and center back seams.',
        customerPrice: 42.0,
        partnerPayout: 31.5,
        platformFee: 10.5,
        turnaroundDays: 4,
        popular: true,
      },
      {
        id: 'jacket-collar',
        name: 'Collar Roll Correction',
        description: 'Eliminates unsightly fabric bunching beneath the back jacket collar.',
        customerPrice: 38.0,
        partnerPayout: 28.5,
        platformFee: 9.5,
        turnaroundDays: 4,
        popular: false,
      },
    ],
  },
  {
    id: 'shirts',
    name: 'Shirts & Tops',
    tagline: 'Sides taken in, sleeves shortened, dart insertions.',
    startingPrice: 14.0,
    avgTurnaround: '48 hours',
    services: [
      {
        id: 'shirt-sides',
        name: 'Take In Sides & Back Darts',
        description: 'Transform boxy shirts into a tailored athletic or slim silhouette.',
        customerPrice: 18.0,
        partnerPayout: 13.5,
        platformFee: 4.5,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'shirt-sleeves',
        name: 'Shorten Shirt Sleeves with Placket',
        description: 'Clean sleeve shortening with precision gauntlet and cuff reset.',
        customerPrice: 22.0,
        partnerPayout: 16.5,
        platformFee: 5.5,
        turnaroundDays: 2,
        popular: false,
      },
      {
        id: 'shirt-hem',
        name: 'Shorten Shirt Hem',
        description: 'Shorten shirt tail length with curved or straight finish.',
        customerPrice: 16.0,
        partnerPayout: 12.0,
        platformFee: 4.0,
        turnaroundDays: 2,
        popular: false,
      },
    ],
  },
  {
    id: 'dresses',
    name: 'Dresses & Gowns',
    tagline: 'Bodice fitting, hem shortening, strap adjustments.',
    startingPrice: 22.0,
    avgTurnaround: '48 hours',
    services: [
      {
        id: 'dress-hem-simple',
        name: 'Shorten Dress Hem (Single Layer)',
        description: 'Clean machine or blind hem on cotton, linen, or synthetic fabrics.',
        customerPrice: 24.0,
        partnerPayout: 18.0,
        platformFee: 6.0,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'dress-take-in',
        name: 'Take In Bodice / Side Seams',
        description: 'Adjust dress waistline and bust shape for a contoured fit.',
        customerPrice: 32.0,
        partnerPayout: 24.0,
        platformFee: 8.0,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'dress-straps',
        name: 'Shorten Shoulder Straps',
        description: 'Lift bodice and adjust strap length on day or evening dresses.',
        customerPrice: 18.0,
        partnerPayout: 13.5,
        platformFee: 4.5,
        turnaroundDays: 2,
        popular: false,
      },
    ],
  },
  {
    id: 'skirts',
    name: 'Skirts',
    tagline: 'Hem shortening, waist adjustments, slit repairs.',
    startingPrice: 16.0,
    avgTurnaround: '48 hours',
    services: [
      {
        id: 'skirt-hem',
        name: 'Shorten Skirt Hem',
        description: 'Straight or A-line skirt shortening with clean edge finish.',
        customerPrice: 18.0,
        partnerPayout: 13.5,
        platformFee: 4.5,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'skirt-waist',
        name: 'Take In Skirt Waistband',
        description: 'Reduce waistband width to eliminate gaps around natural waist.',
        customerPrice: 22.0,
        partnerPayout: 16.5,
        platformFee: 5.5,
        turnaroundDays: 2,
        popular: false,
      },
    ],
  },
  {
    id: 'coats',
    name: 'Coats & Outerwear',
    tagline: 'Heavy fabric alterations, lining adjustments, zipper replacement.',
    startingPrice: 35.0,
    avgTurnaround: '72 hours',
    services: [
      {
        id: 'coat-sleeves',
        name: 'Shorten Coat Sleeves',
        description: 'Shorten heavy wool or trench coat sleeves with lining preservation.',
        customerPrice: 40.0,
        partnerPayout: 30.0,
        platformFee: 10.0,
        turnaroundDays: 3,
        popular: true,
      },
      {
        id: 'coat-hem',
        name: 'Shorten Coat Hem',
        description: 'Re-hem overcoats and trench coats while maintaining vent balance.',
        customerPrice: 48.0,
        partnerPayout: 36.0,
        platformFee: 12.0,
        turnaroundDays: 4,
        popular: false,
      },
    ],
  },
  {
    id: 'repairs',
    name: 'Repairs & Mending',
    tagline: 'Zipper replacements, button restitching, tear reinforcements.',
    startingPrice: 8.0,
    avgTurnaround: '24 hours',
    services: [
      {
        id: 'repair-zipper',
        name: 'Replace Trousers / Jeans Zipper',
        description: 'High-grade YKK metal or coil zipper replacement.',
        customerPrice: 16.0,
        partnerPayout: 12.0,
        platformFee: 4.0,
        turnaroundDays: 2,
        popular: true,
      },
      {
        id: 'repair-buttons',
        name: 'Reattach / Replace Buttons',
        description: 'Hand-sewn horn or resin button attachment with thread shank.',
        customerPrice: 8.0,
        partnerPayout: 6.0,
        platformFee: 2.0,
        turnaroundDays: 1,
        popular: false,
      },
    ],
  },
];

async function main() {
  console.log('🌱 Starting clean database seed (zero dummy records)...');

  // Seed Alteration Catalog & Pricing
  for (const cat of LEGIT_CATEGORIES) {
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

  console.log(`✅ Seeded ${LEGIT_CATEGORIES.length} real Garment Categories and Services.`);
  console.log('✨ Seed complete. No dummy users or mock orders were created.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
