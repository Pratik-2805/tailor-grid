const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { prisma } = require('../lib/prisma');
const { readDb, writeDb } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'Darzi_jwt_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper to generate auth token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email || user.contact,
      name: user.name,
      role: user.role || 'CUSTOMER',
      studioId: user.studioId || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken, accessToken, profile, role = 'CUSTOMER' } = req.body;

    let email = '';
    let name = '';
    let avatar = '';

    // 1. If idToken is supplied, attempt verification with Google API
    if (idToken) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name || payload.given_name || 'Google User';
        avatar = payload.picture;
      } catch (verifyErr) {
        console.warn('ID Token verification warning:', verifyErr.message);
      }
    }

    // 2. If access_token is supplied and email still empty, fetch from userinfo endpoint
    if (!email && accessToken) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userInfoRes.ok) {
          const uInfo = await userInfoRes.json();
          email = uInfo.email;
          name = uInfo.name || uInfo.given_name || 'Google User';
          avatar = uInfo.picture;
        }
      } catch (apiErr) {
        console.warn('Google userinfo fetch error:', apiErr.message);
      }
    }

    // 3. Fallback to passed profile object
    if (!email && profile) {
      email = profile.email || profile.contact;
      name = profile.name || 'Google User';
      avatar = profile.avatar || profile.picture;
    }

    if (!email) {
      return res.status(400).json({ error: 'Failed to retrieve email or identity from Google authentication.' });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name || 'Google Darzi User',
            email: email.toLowerCase(),
            contact: email.toLowerCase(),
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            address: '18 Kensington Church St',
            postcode: 'W8 4EP',
            method: 'google',
            role: role || 'CUSTOMER',
          },
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma Google auth fallback:', prismaErr.message);
      const db = readDb();
      user = db.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase() || u.contact?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: name || 'Google Darzi User',
          email,
          contact: email,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          address: '18 Kensington Church St',
          postcode: 'W8 4EP',
          method: 'google',
          role: role || 'CUSTOMER',
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        writeDb(db);
      }
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Authenticated with Google successfully',
      token,
      user,
    });
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    return res.status(500).json({ error: 'Server error during Google authentication.' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      postcode,
      role = 'CUSTOMER',
      storeName,
      storeArea,
      machines,
    } = req.body;

    const contactStr = email || phone;
    if (!contactStr) {
      return res.status(400).json({ error: 'Email or phone number is required.' });
    }

    let user;
    let studioId = null;

    try {
      // If signing up as a studio, create a partner store if storeName provided
      if (role === 'STUDIO' && (storeName || name)) {
        const actualStoreName = storeName || `${name}'s Bespoke Studio`;
        const storeSlug = actualStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        studioId = `store-${storeSlug}-${Math.floor(100 + Math.random() * 900)}`;

        const newStoreData = {
          id: studioId,
          name: actualStoreName,
          area: storeArea || (postcode ? `Area ${postcode}` : 'Neighborhood Atelier'),
          address: address || '18 Kensington Church St',
          postcode: postcode || 'W8 4EP',
          distance: '0.4 mi away',
          distanceMiles: 0.4,
          rating: 5.0,
          reviewCount: 1,
          openingHours: 'Mon–Sat: 09:00 – 19:00',
          dailyCapacity: 25,
          machines: machines ? parseInt(machines) || 6 : 6,
          workers: 4,
          leadTailor: name || 'Master Tailor',
          specialties: ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
          retailSold: true,
          lat: 51.5033,
          lng: -0.1925,
        };

        try {
          await prisma.partnerStore.create({
            data: newStoreData,
          });
        } catch (storeErr) {
          console.warn('Store creation warning (Prisma):', storeErr.message);
        }

        // Always ensure newly registered studio is also saved to local JSON data store
        try {
          const db = readDb();
          if (!db.stores) db.stores = [];
          const existingIdx = db.stores.findIndex((s) => s.id === studioId || s.name.toLowerCase() === actualStoreName.toLowerCase());
          const storeEntry = {
            ...newStoreData,
            coords: { lat: newStoreData.lat, lng: newStoreData.lng }
          };
          if (existingIdx >= 0) {
            db.stores[existingIdx] = storeEntry;
          } else {
            db.stores.unshift(storeEntry);
          }
          writeDb(db);
        } catch (jsonErr) {
          console.warn('Failed to save store to local db:', jsonErr.message);
        }
      }

      if (email) {
        user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name || (role === 'STUDIO' ? storeName || 'Master Studio' : 'Darzi Member'),
            email: email ? email.toLowerCase() : null,
            contact: contactStr,
            phone: phone || null,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contactStr)}`,
            address: address || '42 Kensington Church St',
            postcode: postcode || 'W8 4EP',
            method: email ? 'email' : 'mobile',
            role: role || 'CUSTOMER',
            studioId: studioId || null,
            studioName: storeName || null,
          },
        });
      } else if (role === 'STUDIO' && !user.studioId) {
        // Upgrade existing user to studio if needed
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'STUDIO',
            studioId: studioId || user.studioId,
            studioName: storeName || user.studioName,
          },
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma signup fallback:', prismaErr.message);
      const db = readDb();
      if (!db.users) db.users = [];
      user = db.users.find((u) => u.contact === contactStr || u.email === contactStr);

      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: name || (role === 'STUDIO' ? storeName || 'Master Studio' : 'Darzi Member'),
          email: email || contactStr,
          contact: contactStr,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contactStr)}`,
          address: address || '42 Kensington Church St',
          postcode: postcode || 'W8 4EP',
          method: email ? 'email' : 'mobile',
          role: role || 'CUSTOMER',
          studioId: studioId || (role === 'STUDIO' ? `store-${Date.now()}` : undefined),
          studioName: storeName || (role === 'STUDIO' ? 'Partner Atelier' : undefined),
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);

        if (role === 'STUDIO') {
          if (!db.stores) db.stores = [];
          const actualStoreName = storeName || `${name || 'Master'}'s Studio`;
          const storeEntry = {
            id: user.studioId || `store-${Date.now()}`,
            name: actualStoreName,
            area: storeArea || (postcode ? `Area ${postcode}` : 'Neighborhood Atelier'),
            address: address || '18 Kensington Church St',
            postcode: postcode || 'W8 4EP',
            distance: '0.4 mi away',
            distanceMiles: 0.4,
            rating: 5.0,
            reviewCount: 1,
            openingHours: 'Mon–Sat: 09:00 – 19:00',
            dailyCapacity: 25,
            machines: machines ? parseInt(machines) || 6 : 6,
            workers: 4,
            leadTailor: name || 'Master Tailor',
            specialties: ['Custom Alterations', 'Precision Hemming', 'Express Tailoring'],
            retailSold: true,
            coords: { lat: 51.5033, lng: -0.1925 }
          };
          db.stores.unshift(storeEntry);
        }
        writeDb(db);
      }
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, role } = req.body;
    const contactStr = email || phone;

    let user;
    try {
      if (email) {
        user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma login fallback:', prismaErr.message);
    }

    if (!user) {
      const db = readDb();
      user = db.users.find((u) => u.contact === contactStr || u.email === contactStr);
    }

    if (!user) {
      // If logging in as demo studio partner and user not found, create demo partner on the fly
      if (role === 'STUDIO') {
        user = {
          id: 'usr_demo_partner',
          name: 'Marco Rossi (Master Tailor)',
          email: contactStr || 'partner@Darzi.com',
          contact: contactStr || 'partner@Darzi.com',
          role: 'STUDIO',
          studioId: 'atelier-soho',
          studioName: 'Atelier SoHo Tailors',
          method: 'email',
        };
      } else {
        return res.status(404).json({ error: 'User not found. Please sign up.' });
      }
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    try {
      if (decoded.id) {
        user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
      } else if (decoded.email) {
        user = await prisma.user.findUnique({
          where: { email: decoded.email.toLowerCase() },
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma auth/me fallback:', prismaErr.message);
    }

    if (!user) {
      const db = readDb();
      user = db.users.find((u) => u.id === decoded.id || u.email === decoded.email);
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
