const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { prisma } = require('../lib/prisma');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'Darzi_jwt_secret_key_2026';
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// In-memory OTP storage: phone -> { code, expiresAt }
const otpStore = new Map();

// Helper to generate auth token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email || null,
      phone: user.phone || null,
      name: user.name,
      avatar: user.avatar || null,
      role: user.role || 'CUSTOMER',
      studioId: user.studioId || null,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Unified user resolution & account linking helper directly in PostgreSQL
async function findOrLinkUser({
  email,
  phone,
  name,
  avatar,
  address,
  postcode,
  method = 'email',
  role = 'CUSTOMER',
  studioId,
  studioName,
  storeArea,
  machines,
}) {
  const normEmail = email ? email.trim().toLowerCase() : null;
  let normPhone = phone ? phone.trim() : null;
  const contactStr = normEmail || normPhone || 'member@darzi.com';

  let user = null;

  // 1. Check local JSON store first to resolve duplicates and get any verified phone
  const db = readDb();
  if (!db.users) db.users = [];

  const matchingLocalUsers = db.users.filter((u) => {
    if (normEmail && u.email && u.email.toLowerCase() === normEmail) return true;
    if (normEmail && u.contact && u.contact.toLowerCase() === normEmail) return true;
    if (normPhone && u.phone === normPhone) return true;
    if (normPhone && u.contact === normPhone) return true;
    return false;
  });

  let existingPhoneFromDb = null;
  if (matchingLocalUsers.length > 0) {
    const userWithPhone = matchingLocalUsers.find((u) => u.phone && u.phone.trim().length > 5);
    if (userWithPhone) {
      existingPhoneFromDb = userWithPhone.phone.trim();
      if (!normPhone) normPhone = existingPhoneFromDb;
    }
  }

  // 2. Try Prisma lookup
  try {
    if (normEmail) {
      user = await prisma.user.findUnique({
        where: { email: normEmail },
      });
    }
    if (!user && normPhone) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ phone: normPhone }, { contact: normPhone }],
        },
      });
    }
  } catch (prismaErr) {
    console.warn('Prisma user lookup notice:', prismaErr.message);
  }

  // 3. If user found from Prisma, ensure any existing phone from DB is retained
  if (!user && matchingLocalUsers.length > 0) {
    user = matchingLocalUsers.find((u) => u.phone) || matchingLocalUsers[matchingLocalUsers.length - 1];
  }

  const finalPhone = normPhone || user?.phone || existingPhoneFromDb || null;

  // 4. If Studio role and creating a store
  let actualStudioId = studioId;
  if (role === 'STUDIO' && (studioName || name)) {
    const actualStoreName = studioName || `${name || 'Master'}'s Studio`;
    if (!actualStudioId) {
      const storeSlug = actualStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      actualStudioId = `store-${storeSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    try {
      const existingStore = await prisma.partnerStore.findUnique({ where: { id: actualStudioId } });
      if (!existingStore) {
        await prisma.partnerStore.create({
          data: {
            id: actualStudioId,
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
            lat: 40.7259,
            lng: -74.0003,
          },
        });
      }
    } catch (storeErr) {
      console.warn('Store creation notice:', storeErr.message);
    }
  }

  // 5. Update existing user or create new user
  if (user) {
    const updatedFields = {
      email: user.email || normEmail,
      phone: finalPhone,
      name: (user.name && user.name !== 'Darzi Member' && user.name !== 'Google User' && user.name !== 'Mobile Member') ? user.name : (name || user.name),
      avatar: (avatar && !avatar.includes('dicebear'))
        ? avatar
        : (user.avatar && !user.avatar.includes('dicebear'))
          ? user.avatar
          : (avatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normEmail || normPhone || 'user')}`),
      address: user.address || address || '18 Kensington Church St',
      postcode: user.postcode || postcode || 'W8 4EP',
      contact: normEmail || normPhone || user.contact,
      role: role || user.role,
      studioId: actualStudioId || user.studioId || null,
      studioName: studioName || user.studioName || null,
    };

    try {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updatedFields,
      });
    } catch (prismaUpdateErr) {
      user = { ...user, ...updatedFields };
    }
  } else {
    const newUserData = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name || (normEmail ? 'Google Darzi User' : normPhone ? 'Mobile Member' : 'Darzi Member'),
      email: normEmail,
      phone: finalPhone,
      contact: contactStr,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contactStr)}`,
      address: address || '18 Kensington Church St',
      postcode: postcode || 'W8 4EP',
      method: method || (normEmail ? (normEmail.includes('google') ? 'google' : 'email') : 'mobile'),
      role: role || 'CUSTOMER',
      studioId: actualStudioId || null,
      studioName: studioName || null,
    };

    try {
      user = await prisma.user.create({
        data: newUserData,
      });
    } catch (prismaCreateErr) {
      console.warn('Prisma create user fallback:', prismaCreateErr.message);
      user = newUserData;
    }
  }

  // Deduplicate and consolidate local database record for this user
  db.users = db.users.filter((u) => {
    if (u.id === user.id) return false;
    if (normEmail && u.email && u.email.toLowerCase() === normEmail) return false;
    return true;
  });
  db.users.push(user);
  writeDb(db);

  return user;
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    const cleanPhone = phone.trim();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(cleanPhone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`[AUTH-OTP] Sent OTP code for ${cleanPhone}: ${code}`);

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanPhone}`,
      demoCode: code,
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, email, role = 'CUSTOMER', userId } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and verification code are required.' });
    }

    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    const stored = otpStore.get(cleanPhone);
    const isValidOtp =
      (stored && stored.code === cleanOtp && Date.now() <= stored.expiresAt) ||
      cleanOtp === '4829' ||
      cleanOtp === '1234' ||
      cleanOtp === '0000' ||
      cleanOtp === '9999';

    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Use 4829 or click Resend.' });
    }

    otpStore.delete(cleanPhone);

    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            phone: cleanPhone,
            ...(email && !user.email ? { email: email.toLowerCase() } : {}),
          },
        });
      }
    }

    if (!user) {
      user = await findOrLinkUser({
        phone: cleanPhone,
        email,
        name,
        method: 'mobile',
        role,
      });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Phone verified and authenticated successfully',
      token,
      user,
      hasPhone: true,
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// POST /api/auth/link-phone
router.post('/link-phone', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.id;
      } catch (e) { }
    }

    const { phone, otp, id } = req.body;
    const targetUserId = userId || id;
    if (!targetUserId) {
      return res.status(401).json({ error: 'Unauthorized: User ID required.' });
    }
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanPhone = phone.trim();
    if (otp) {
      const cleanOtp = otp.trim();
      const stored = otpStore.get(cleanPhone);
      const isValid =
        (stored && stored.code === cleanOtp && Date.now() <= stored.expiresAt) ||
        cleanOtp === '4829' ||
        cleanOtp === '1234' ||
        cleanOtp === '0000' ||
        cleanOtp === '9999';
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid OTP code. Use 4829 for testing.' });
      }
      otpStore.delete(cleanPhone);
    }

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { phone: cleanPhone },
    });

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Mobile number linked successfully',
      user,
      token,
      hasPhone: true,
    });
  } catch (err) {
    console.error('Link Phone Error:', err);
    return res.status(500).json({ error: 'Failed to link phone number.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken, accessToken, profile, role = 'CUSTOMER' } = req.body;

    let email = '';
    let name = '';
    let avatar = '';

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

    if (!email && profile) {
      email = profile.email || profile.contact;
      name = profile.name || 'Google User';
      avatar = profile.avatar || profile.picture;
    }

    if (!email) {
      return res.status(400).json({ error: 'Failed to retrieve email or identity from Google authentication.' });
    }

    const user = await findOrLinkUser({
      email,
      name,
      avatar,
      method: 'google',
      role,
    });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Authenticated with Google successfully',
      token,
      user,
      needsPhone: !user.phone,
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

    const user = await findOrLinkUser({
      name,
      email,
      phone,
      address,
      postcode,
      role,
      studioName: storeName,
      storeArea,
      machines,
    });

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user,
      needsPhone: !user.phone,
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, identifier, role } = req.body;
    const searchVal = identifier || email || phone;
    if (!searchVal) {
      return res.status(400).json({ error: 'Please enter your email or mobile number.' });
    }

    const cleanVal = searchVal.trim().toLowerCase();

    let user = null;
    if (cleanVal.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: cleanVal } });
    } else {
      user = await prisma.user.findFirst({ where: { OR: [{ phone: cleanVal }, { contact: cleanVal }] } });
    }

    if (!user) {
      if (role === 'STUDIO') {
        user = await findOrLinkUser({
          email: cleanVal.includes('@') ? cleanVal : 'partner@darzi.com',
          phone: !cleanVal.includes('@') ? cleanVal : '+44 7700 900123',
          name: 'Master Tailor Marco',
          role: 'STUDIO',
          studioId: 'atelier-soho',
          studioName: 'Atelier SoHo Tailors',
        });
      } else {
        user = await findOrLinkUser({
          email: cleanVal.includes('@') ? cleanVal : null,
          phone: !cleanVal.includes('@') ? cleanVal : null,
          role: role || 'CUSTOMER',
        });
      }
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user,
      needsPhone: !user.phone,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/update-profile
router.post('/update-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.id;
      } catch (e) { }
    }

    const { id, name, email, phone, address, postcode } = req.body;
    const targetId = userId || id;

    if (!targetId) {
      return res.status(401).json({ error: 'Unauthorized: missing user identity.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (postcode) updateData.postcode = postcode;

    const user = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
    });

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
      token,
      hasPhone: Boolean(user.phone),
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
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

    let user = null;
    if (decoded.id) {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email.toLowerCase() },
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
      user,
      hasPhone: Boolean(user.phone),
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
