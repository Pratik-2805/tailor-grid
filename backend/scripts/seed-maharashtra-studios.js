#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { prisma } = require('../lib/prisma');

// Comprehensive list of Maharashtra cities with realistic coordinates, PIN code prefixes, and neighborhood areas
const MH_CITIES = [
  {
    city: 'Mumbai',
    centerLat: 19.0760,
    centerLng: 72.8777,
    radiusDeg: 0.12, // ~8-12 km spread across suburbs
    postcodePrefix: '400',
    weight: 120, // 120 studios in Mumbai MMR
    areas: ['Bandra West', 'Andheri East', 'Andheri West', 'Juhu', 'Dadar', 'Colaba', 'Lower Parel', 'Kurla', 'Ghatkopar', 'Chembur', 'Borivali West', 'Kandivali', 'Malad', 'Thane West', 'Navi Mumbai Vashi', 'Kalyan'],
  },
  {
    city: 'Pune',
    centerLat: 18.5204,
    centerLng: 73.8567,
    radiusDeg: 0.08,
    postcodePrefix: '411',
    weight: 90, // 90 studios in Pune & PCMC
    areas: ['Kothrud', 'Viman Nagar', 'Baner', 'Aundh', 'Hinjewadi', 'Koregaon Park', 'Shivajinagar', 'Hadapsar', 'Wakad', 'Pimpri', 'Chinchwad', 'Camp'],
  },
  {
    city: 'Nagpur',
    centerLat: 21.1458,
    centerLng: 79.0882,
    radiusDeg: 0.06,
    postcodePrefix: '440',
    weight: 50,
    areas: ['Dharampeth', 'Sitabuldi', 'Sadar', 'Wardhaman Nagar', 'Manish Nagar', 'Pratap Nagar', 'Civil Lines', 'Ramdaspeth'],
  },
  {
    city: 'Nashik',
    centerLat: 19.9975,
    centerLng: 73.7898,
    radiusDeg: 0.05,
    postcodePrefix: '422',
    weight: 40,
    areas: ['College Road', 'Gangapur Road', 'Panchavati', 'Indira Nagar', 'CIDCO', 'Dwarka', 'Mahatma Nagar'],
  },
  {
    city: 'Chhatrapati Sambhajinagar',
    centerLat: 19.8762,
    centerLng: 75.3433,
    radiusDeg: 0.05,
    postcodePrefix: '431',
    weight: 35,
    areas: ['CIDCO New Town', 'Garkheda', 'Samarth Nagar', 'Kranti Chowk', 'Cantonment', 'Waluj'],
  },
  {
    city: 'Solapur',
    centerLat: 17.6599,
    centerLng: 75.9064,
    radiusDeg: 0.04,
    postcodePrefix: '413',
    weight: 25,
    areas: ['Jule Solapur', 'Navi Peth', 'Hotgi Road', 'Saat Rasta', 'Ashok Chowk'],
  },
  {
    city: 'Kolhapur',
    centerLat: 16.7050,
    centerLng: 74.2433,
    radiusDeg: 0.04,
    postcodePrefix: '416',
    weight: 25,
    areas: ['Rajarampuri', 'Shahupuri', 'Tarabai Park', 'Nagala Park', 'Laxmipuri'],
  },
  {
    city: 'Amravati',
    centerLat: 20.9374,
    centerLng: 77.7796,
    radiusDeg: 0.04,
    postcodePrefix: '444',
    weight: 20,
    areas: ['Raja Peth', 'Camp Road', 'Badnera', 'Dastur Nagar', 'Gadge Nagar'],
  },
  {
    city: 'Nanded',
    centerLat: 19.1383,
    centerLng: 77.3210,
    radiusDeg: 0.04,
    postcodePrefix: '431',
    weight: 15,
    areas: ['Vasant Nagar', 'Shivaji Nagar', 'Taroda Naka', 'Anand Nagar'],
  },
  {
    city: 'Jalgaon',
    centerLat: 21.0077,
    centerLng: 75.5626,
    radiusDeg: 0.04,
    postcodePrefix: '425',
    weight: 15,
    areas: ['Ring Road', 'Navi Peth', 'Pratap Nagar', 'MIDC Area'],
  },
  {
    city: 'Akola',
    centerLat: 20.7002,
    centerLng: 77.0082,
    radiusDeg: 0.03,
    postcodePrefix: '444',
    weight: 15,
    areas: ['Civil Lines', 'Jatharpeth', 'Kaulkhed', 'Gorakshan Road'],
  },
  {
    city: 'Latur',
    centerLat: 18.4088,
    centerLng: 76.5604,
    radiusDeg: 0.03,
    postcodePrefix: '413',
    weight: 15,
    areas: ['Ausa Road', 'Gandhi Chowk', 'Khadgaon Road', 'Old Latur'],
  },
  {
    city: 'Ahmednagar',
    centerLat: 19.0952,
    centerLng: 74.7496,
    radiusDeg: 0.03,
    postcodePrefix: '414',
    weight: 15,
    areas: ['Savedi', 'Station Road', 'Professor Chowk', 'Delhi Gate'],
  },
  {
    city: 'Sangli',
    centerLat: 16.8524,
    centerLng: 74.5815,
    radiusDeg: 0.03,
    postcodePrefix: '416',
    weight: 15,
    areas: ['Vishrambag', 'Khanbhag', 'Gaon Bhag', 'Miraj Road'],
  },
  {
    city: 'Satara',
    centerLat: 17.6805,
    centerLng: 73.9997,
    radiusDeg: 0.03,
    postcodePrefix: '415',
    weight: 10,
    areas: ['Karanje', 'Sadar Bazar', 'Powai Naka', 'Godoli'],
  },
];

const STUDIO_NAME_PREFIXES = [
  'Royal', 'Master', 'Heritage', 'Apex', 'Imperial', 'Classic', 'Elite', 'Prime',
  'Prestige', 'Golden', 'Darzi', 'Signature', 'Vogue', 'Artisan', 'Urban', 'Velvet',
  'Craftsman', 'Nova', 'Crown', 'Silver Needle'
];

const STUDIO_NAME_SUFFIXES = [
  'Atelier', 'Tailors', 'Bespoke Studio', 'Couturiers', 'Stitch Lab', 'Garment Works',
  'Alterations Studio', 'Design House', 'Tailoring Co.', 'Craft Studio', 'Fashion Atelier'
];

const LEAD_TAILORS = [
  'Pratik Pradhan', 'Santosh Shinde', 'Ramesh Patil', 'Ganesh Kadam', 'Sunil More',
  'Anand Joshi', 'Sachin Deshmukh', 'Prakash Jadhav', 'Vikas Sawant', 'Sanjay Gokhale',
  'Mahesh Salunkhe', 'Deepak Chavan', 'Nitin Pawar', 'Rahul Gaikwad', 'Amit Kulkarni',
  'Vijay Shirke', 'Kishore Tambe', 'Abhishek Mane', 'Tushar Jagtap', 'Sandeep Mahajan'
];

const SPECIALTIES_POOL = [
  ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
  ['Bespoke Suits', 'Tuxedo Restyling', 'Jacket Relining'],
  ['Traditional Kurtas', 'Sherwani Alteration', 'Nehru Jacket Tailoring'],
  ['Bridal Lehengas', 'Blouse Alteration', 'Gown Restyling'],
  ['Denim Tapering', 'Shorten Hem (Plain)', 'Waist Adjustments'],
  ['Leather Garment Repair', 'Zip Replacement', 'Formal Trouser Tapering'],
];

async function seed500MaharashtraStudios() {
  console.log('🚀 Starting creation of 500 test studios across Maharashtra cities...\n');

  // Total weight check
  const totalWeight = MH_CITIES.reduce((sum, c) => sum + c.weight, 0); // 500
  console.log(`Targeting 500 studios across ${MH_CITIES.length} Maharashtra cities (Total Allocation: ${totalWeight}).\n`);

  const studios = [];
  let studioCounter = 1;

  for (const cityConfig of MH_CITIES) {
    const countForCity = cityConfig.weight;

    for (let i = 0; i < countForCity; i++) {
      const id = `test-mh-studio-${String(studioCounter).padStart(4, '0')}`;
      const prefix = STUDIO_NAME_PREFIXES[Math.floor(Math.random() * STUDIO_NAME_PREFIXES.length)];
      const suffix = STUDIO_NAME_SUFFIXES[Math.floor(Math.random() * STUDIO_NAME_SUFFIXES.length)];
      const area = cityConfig.areas[Math.floor(Math.random() * cityConfig.areas.length)];
      const name = `${prefix} ${suffix} (${cityConfig.city} - ${area})`;

      // Realistic Gaussian-ish scatter around city center
      const r = cityConfig.radiusDeg * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const lat = Number((cityConfig.centerLat + r * Math.cos(theta)).toFixed(6));
      const lng = Number((cityConfig.centerLng + r * Math.sin(theta)).toFixed(6));

      const subCode = String(Math.floor(10 + Math.random() * 89)).padStart(2, '0');
      const postcode = `${cityConfig.postcodePrefix}0${subCode}`;

      const leadTailor = LEAD_TAILORS[Math.floor(Math.random() * LEAD_TAILORS.length)];
      const specialties = SPECIALTIES_POOL[Math.floor(Math.random() * SPECIALTIES_POOL.length)];
      const rating = Number((4.7 + Math.random() * 0.3).toFixed(1)); // 4.7 - 5.0
      const reviewCount = Math.floor(40 + Math.random() * 350);
      const dailyCapacity = Math.floor(20 + Math.random() * 30); // 20 - 50
      const machines = Math.floor(4 + Math.random() * 8); // 4 - 12
      const workers = Math.floor(3 + Math.random() * 6); // 3 - 9

      studios.push({
        id,
        name,
        email: `studio.${studioCounter}@darzitest.maharashtra.in`,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
        area: `${area}, ${cityConfig.city}`,
        address: `Shop ${Math.floor(1 + Math.random() * 45)}, ${area} Commercial Complex, ${cityConfig.city}`,
        postcode,
        rating,
        reviewCount,
        openingHours: 'Mon–Sat: 09:00 – 20:00',
        dailyCapacity,
        machines,
        workers,
        leadTailor,
        specialties,
        retailSold: true,
        lat,
        lng,
      });

      studioCounter++;
    }
  }

  console.log(`📦 Generated ${studios.length} studio records. Inserting into PostgreSQL via Prisma...`);

  // Use batch create or chunks of 100 for maximum reliability
  const CHUNK_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < studios.length; i += CHUNK_SIZE) {
    const chunk = studios.slice(i, i + CHUNK_SIZE);
    const res = await prisma.partnerStore.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += res.count;
    console.log(`  -> Inserted batch ${Math.floor(i / CHUNK_SIZE) + 1} (${inserted}/${studios.length})`);
  }

  console.log(`\n🎉 Success! Inserted ${inserted} test studios across Maharashtra in PostgreSQL!`);

  // Summary by city
  const totalStores = await prisma.partnerStore.count();
  console.log(`Total Partner Studios now in database: ${totalStores}`);
}

seed500MaharashtraStudios()
  .catch((err) => {
    console.error('❌ Failed to seed studios:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
