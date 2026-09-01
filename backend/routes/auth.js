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

// Unified user resolution & creation helper directly in PostgreSQL
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
  const normPhone = phone ? phone.trim() : null;
  const contactStr = normEmail || normPhone || 'member@darzi.com';

  let user = null;

  // 1. Try lookup by email first if provided
  if (normEmail) {
    user = await prisma.user.findUnique({
      where: { email: normEmail },
    });
  }

  // 2. If not found by email, try lookup by phone if provided
  if (!user && normPhone) {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: normPhone }, { contact: normPhone }],
      },
    });
  }

  // 3. If Studio role and creating a store
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

  // 4. Update existing user or create new user
  if (user) {
    // If user has no phone and a new unique phone was passed, check phone conflict first
    let updatedPhone = user.phone;
    if (!user.phone && normPhone) {
      const phoneConflict = await prisma.user.findFirst({
        where: { phone: normPhone, NOT: { id: user.id } },
      });
      if (!phoneConflict) {
        updatedPhone = normPhone;
      }
    }

    const updatedFields = {
      email: user.email || normEmail,
      phone: updatedPhone,
      name:
        user.name &&
          user.name !== 'Darzi Member' &&
          user.name !== 'Google User' &&
          user.name !== 'Mobile Member'
          ? user.name
          : name || user.name,
      avatar:
        avatar && !avatar.includes('dicebear')
          ? avatar
          : user.avatar && !user.avatar.includes('dicebear')
            ? user.avatar
            : avatar ||
            user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              normEmail || normPhone || 'user'
            )}`,
      address: user.address || address || '18 Kensington Church St',
      postcode: user.postcode || postcode || 'W8 4EP',
      contact: user.email || user.phone || normEmail || normPhone || user.contact,
      studioId: actualStudioId || user.studioId || null,
      studioName: studioName || user.studioName || null,
    };

    user = await prisma.user.update({
      where: { id: user.id },
      data: updatedFields,
    });
  } else {
    // Check if phone or email is already taken
    if (normPhone) {
      const phoneTaken = await prisma.user.findUnique({ where: { phone: normPhone } });
      if (phoneTaken) {
        return phoneTaken;
      }
    }
    if (normEmail) {
      const emailTaken = await prisma.user.findUnique({ where: { email: normEmail } });
      if (emailTaken) {
        return emailTaken;
      }
    }

    const newUserData = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name:
        name ||
        (normEmail ? 'Darzi User' : normPhone ? 'Mobile Member' : 'Darzi Member'),
      email: normEmail,
      phone: normPhone,
      contact: contactStr,
      avatar:
        avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contactStr)}`,
      address: address || '18 Kensington Church St',
      postcode: postcode || 'W8 4EP',
      method:
        method ||
        (normEmail ? (normEmail.includes('google') ? 'google' : 'email') : 'mobile'),
      role: role || 'CUSTOMER',
      studioId: actualStudioId || null,
      studioName: studioName || null,
    };

    user = await prisma.user.create({
      data: newUserData,
    });
  }

  return user;
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ error: 'Please provide a valid mobile number.' });
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
      return res.status(400).json({ error: 'Mobile number and verification code are required.' });
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
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification code. Use 4829 or click Resend.' });
    }

    otpStore.delete(cleanPhone);

    let user;
    if (userId) {
      // Linking phone to existing user account
      const phoneConflict = await prisma.user.findFirst({
        where: { phone: cleanPhone, NOT: { id: userId } },
      });
      if (phoneConflict) {
        return res.status(409).json({
          error: 'This mobile number is already registered to another account.',
        });
      }

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
    } else {
      // Check existing user by phone
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { contact: cleanPhone }],
        },
      });

      if (existingUser) {
        // Strict role validation
        if (role === 'STUDIO' && existingUser.role !== 'STUDIO') {
          return res.status(403).json({
            error: 'Access Denied! Login with an another account.',
          });
        }
        if (role === 'CUSTOMER' && existingUser.role === 'STUDIO') {
          return res.status(403).json({
            error: 'Access Denied! Login with an another account.',
          });
        }
        user = existingUser;
      } else {
        // User does not exist
        if (role === 'STUDIO') {
          return res.status(404).json({
            error: 'No Studio partner account found with this mobile number. Please register your studio first.',
          });
        }
        user = await findOrLinkUser({
          phone: cleanPhone,
          email,
          name,
          method: 'mobile',
          role: 'CUSTOMER',
        });
      }
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Mobile number verified and authenticated successfully',
      token,
      user,
      hasPhone: true,
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify code.' });
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
      return res.status(400).json({ error: 'Mobile number is required.' });
    }

    const cleanPhone = phone.trim();

    // Check unique constraint: Is this phone already linked to ANOTHER user?
    const existingWithPhone = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        NOT: { id: targetUserId },
      },
    });

    if (existingWithPhone) {
      return res.status(409).json({
        error: 'This mobile number is already linked to another account. Please use a different number.',
      });
    }

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
        return res.status(400).json({ error: 'Invalid verification code. Use 4829 for testing.' });
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
    return res.status(500).json({ error: 'Failed to link mobile number.' });
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
      return res
        .status(400)
        .json({ error: 'Failed to retrieve email or identity from Google authentication.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      if (role === 'STUDIO' && existingUser.role !== 'STUDIO') {
        return res.status(403).json({
          error: 'Access Denied! Login with an another account.',
        });
      }
      if (role === 'CUSTOMER' && existingUser.role === 'STUDIO') {
        return res.status(403).json({
          error: 'Access Denied! Login with an another account.',
        });
      }
    }

    const user = await findOrLinkUser({
      email: cleanEmail,
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
      hasPhone: Boolean(user.phone),
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
      return res.status(400).json({ error: 'Email or mobile number is required.' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;

    // Check existing email conflict
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) {
        if (existingEmail.role !== role) {
          return res.status(409).json({
            error: 'Access Denied! Login with an another account.',
          });
        }
        return res.status(409).json({
          error: 'An account with this email address is already registered. Please sign in instead.',
        });
      }
    }

    // Check existing phone conflict
    if (cleanPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { contact: cleanPhone }],
        },
      });
      if (existingPhone) {
        if (existingPhone.role !== role) {
          return res.status(409).json({
            error: 'Access Denied! Login with an another account.',
          });
        }
        return res.status(409).json({
          error: 'An account with this mobile number is already registered. Please sign in instead.',
        });
      }
    }

    const user = await findOrLinkUser({
      name,
      email: cleanEmail,
      phone: cleanPhone,
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
      hasPhone: Boolean(user.phone),
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, identifier, role = 'CUSTOMER' } = req.body;
    const searchVal = identifier || email || phone;
    if (!searchVal) {
      return res.status(400).json({ error: 'Please enter your email or mobile number.' });
    }

    const cleanVal = searchVal.trim().toLowerCase();

    let user = null;
    if (cleanVal.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: cleanVal } });
    } else {
      user = await prisma.user.findFirst({
        where: { OR: [{ phone: cleanVal }, { contact: cleanVal }] },
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email or mobile number. Please register first.',
      });
    }

    // Role verification
    if (role === 'STUDIO' && user.role !== 'STUDIO') {
      return res.status(403).json({
        error: 'Access Denied! Login with an another account.',
      });
    }

    if (role === 'CUSTOMER' && user.role === 'STUDIO') {
      return res.status(403).json({
        error: 'Access Denied! Login with an another account.',
      });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user,
      needsPhone: !user.phone,
      hasPhone: Boolean(user.phone),
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
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const emailConflict = await prisma.user.findFirst({
        where: { email: cleanEmail, NOT: { id: targetId } },
      });
      if (emailConflict) {
        return res.status(409).json({ error: 'This email is already in use by another account.' });
      }
      updateData.email = cleanEmail;
    }
    if (phone) {
      const cleanPhone = phone.trim();
      const phoneConflict = await prisma.user.findFirst({
        where: { phone: cleanPhone, NOT: { id: targetId } },
      });
      if (phoneConflict) {
        return res
          .status(409)
          .json({ error: 'This mobile number is already in use by another account.' });
      }
      updateData.phone = cleanPhone;
    }
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
