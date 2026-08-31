const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data_store.json');

const INITIAL_DATA = {
  users: [
    {
      id: 'usr_demo',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      contact: 'sarah.jenkins@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address: '18 Kensington Church St',
      postcode: 'W8 4EP',
      method: 'google',
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 'TG-849201',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.jenkins@example.com',
      customerPhone: '+44 7700 900077',
      postcode: 'W8 4EP',
      garmentId: 'trousers',
      garmentName: 'Trousers & Jeans',
      serviceId: 'trouser-hem',
      serviceName: 'Standard Hem Adjustment',
      storeId: 'store-1',
      storeName: 'Kensington Bespoke Atelier',
      date: '2026-08-28',
      timeSlot: '14:00 - 15:00',
      garmentBrand: 'Reiss',
      fitNotes: 'Slim taper down to 14 inch leg opening',
      status: 'Work in Progress',
      price: 22,
      otp: '4829',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'TG-739102',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.jenkins@example.com',
      customerPhone: '+44 7700 900077',
      postcode: 'W8 4EP',
      garmentId: 'jackets',
      garmentName: 'Suits & Blazers',
      serviceId: 'jacket-sleeves',
      serviceName: 'Sleeve Shortening (Unlined)',
      storeId: 'store-1',
      storeName: 'Kensington Bespoke Atelier',
      date: '2026-08-20',
      timeSlot: '11:00 - 12:00',
      garmentBrand: 'Hugo Boss',
      fitNotes: 'Show 0.5 inches of shirt cuff',
      status: 'Collected',
      price: 35,
      otp: '9120',
      createdAt: new Date(Date.now() - 600000000).toISOString()
    }
  ],
  services: [
    {
      id: 'trousers',
      name: 'Trousers & Jeans',
      tagline: 'Precision hem lengths, waist shaping, and leg tapers',
      startingPrice: 18,
      avgTurnaround: '48 hrs',
      popularServices: [
        { id: 'trouser-hem', name: 'Standard Hem Adjustment', description: 'Plain or turn-up hem to exact break preference', customerPrice: 18, partnerPayout: 12, platformFee: 6, turnaroundDays: 2, popular: true },
        { id: 'trouser-waist', name: 'Waist Take-in / Let-out', description: 'Adjust waistband up to 2 inches for custom waist fit', customerPrice: 24, partnerPayout: 16, platformFee: 8, turnaroundDays: 2, popular: true },
        { id: 'trouser-taper', name: 'Leg Tapering', description: 'Narrow leg width from thigh to cuff for modern silhouette', customerPrice: 28, partnerPayout: 18, platformFee: 10, turnaroundDays: 3 }
      ]
    },
    {
      id: 'jackets',
      name: 'Suits & Blazers',
      tagline: 'Expert shoulder adjustments, sleeve alterations, and chest suppression',
      startingPrice: 28,
      avgTurnaround: '72 hrs',
      popularServices: [
        { id: 'jacket-sleeves', name: 'Sleeve Shortening (Unlined)', description: 'Adjust sleeve length from cuff or shoulder', customerPrice: 32, partnerPayout: 22, platformFee: 10, turnaroundDays: 3, popular: true },
        { id: 'jacket-waist', name: 'Jacket Side Seams Take-in', description: 'Create tailored hourglass or athletic fit through torso', customerPrice: 38, partnerPayout: 25, platformFee: 13, turnaroundDays: 3, popular: true }
      ]
    },
    {
      id: 'dresses',
      name: 'Dresses & Eveningwear',
      tagline: 'Delicate fabric hems, bodice fittings, zipper replacements',
      startingPrice: 25,
      avgTurnaround: '48 hrs',
      popularServices: [
        { id: 'dress-hem', name: 'Single Layer Hemming', description: 'Hem alignment for casual and day dresses', customerPrice: 25, partnerPayout: 17, platformFee: 8, turnaroundDays: 2, popular: true },
        { id: 'dress-bodice', name: 'Bodice Take-in / Fitting', description: 'Precision fitting at bust and side seams', customerPrice: 42, partnerPayout: 28, platformFee: 14, turnaroundDays: 3 }
      ]
    },
    {
      id: 'shirts',
      name: 'Shirts & Blouses',
      tagline: 'Sleeve shortening, body tapering, and collar refurbishment',
      startingPrice: 16,
      avgTurnaround: '24 hrs',
      popularServices: [
        { id: 'shirt-taper', name: 'Side Seam Tapering', description: 'Slim down excess fabric for modern tailored silhouette', customerPrice: 18, partnerPayout: 12, platformFee: 6, turnaroundDays: 1, popular: true },
        { id: 'shirt-sleeves', name: 'Sleeve Shortening', description: 'Shorten sleeves with original gauntlet/cuff preserved', customerPrice: 20, partnerPayout: 13, platformFee: 7, turnaroundDays: 1 }
      ]
    }
  ],
  stores: [
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
      coords: { lat: 40.7259, lng: -74.0003 }
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
      coords: { lat: 34.0689, lng: -118.4014 }
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
      coords: { lat: 40.7716, lng: -73.9616 }
    },
    {
      id: 'brooklyn-craft-tailors',
      name: 'Brooklyn Craft Tailors',
      area: 'Williamsburg / Greenpoint',
      address: '145 Bedford Avenue',
      postcode: '11211',
      distance: '1.8 mi away',
      distanceMiles: 1.8,
      rating: 4.94,
      reviewCount: 395,
      openingHours: 'Mon–Sat: 09:00 – 20:00',
      dailyCapacity: 35,
      machines: 10,
      workers: 7,
      leadTailor: 'David Lin',
      specialties: ['Designer Alterations', 'Occasion Wear', 'Leather & Suede'],
      retailSold: true,
      coords: { lat: 40.7188, lng: -73.9575 }
    },
    {
      id: 'store-1',
      name: 'Kensington Bespoke Atelier',
      area: 'Kensington & Chelsea',
      address: '18 Kensington Church St',
      postcode: 'W8 4EP',
      distance: '0.3 mi away',
      distanceMiles: 0.3,
      rating: 4.95,
      reviewCount: 312,
      openingHours: '08:00 - 19:30',
      dailyCapacity: 20,
      machines: 6,
      workers: 4,
      leadTailor: 'Master Tailor Marco V.',
      specialties: ['Savile Row Suiting', 'Silk & Fine Dresses', 'Express 24h Hemming'],
      retailSold: true,
      coords: { lat: 51.5033, lng: -0.1925 }
    },
    {
      id: 'store-2',
      name: 'Mayfair Craft Tailors',
      area: 'Mayfair & St. James',
      address: '42 South Molton Street',
      postcode: 'W1K 5RR',
      distance: '1.2 mi away',
      distanceMiles: 1.2,
      rating: 4.98,
      reviewCount: 489,
      openingHours: '09:00 - 20:00',
      dailyCapacity: 25,
      machines: 8,
      workers: 6,
      leadTailor: 'Master Tailor Elena R.',
      specialties: ['Luxury Eveningwear', 'Custom Suits', 'Leather & Suede'],
      retailSold: true,
      coords: { lat: 51.5135, lng: -0.1468 }
    }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    return INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db file, re-initializing:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    return INITIAL_DATA;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  readDb,
  writeDb
};
