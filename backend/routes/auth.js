const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { prisma } = require('../lib/prisma');
const { validateAndFormatPhone, sendVerificationSms, saveOtp, verifyOtp } = require('../lib/sms');

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
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normEmail },
          { contact: normEmail },
        ],
      },
    });
  }

  // 2. If not found by email, try lookup by phone if provided
  if (!user && normPhone) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normPhone },
          { contact: normPhone },
        ],
      },
    });
  }

  // STRICT ROLE GATE: If user exists with a different role, REJECT immediately!
  if (user && user.role && user.role !== role) {
    const roleErr = new Error('Unauthorized user, access denied.');
    roleErr.statusCode = 403;
    throw roleErr;
  }

  // 3. If Studio role and creating a store
  let actualStudioId = studioId || user?.studioId;
  let resolvedStore = null;
  if (role === 'STUDIO' && (studioName || studioId || user?.studioId)) {
    const actualStoreName = studioName || user?.studioName || `${name || 'Master'}'s Studio`;

    try {
      let existingStore = null;
      if (actualStudioId) {
        existingStore = await prisma.partnerStore.findUnique({ where: { id: actualStudioId } });
      }
      if (!existingStore) {
        existingStore = await prisma.partnerStore.findFirst({
          where: {
            OR: [
              { name: actualStoreName },
              { leadTailor: name || '' },
            ],
          },
        });
        if (existingStore) {
          actualStudioId = existingStore.id;
        }
      }

      if (!actualStudioId) {
        const storeSlug = actualStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        actualStudioId = `store-${storeSlug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      if (!existingStore) {
        resolvedStore = await prisma.partnerStore.create({
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
      } else {
        resolvedStore = await prisma.partnerStore.update({
          where: { id: existingStore.id },
          data: {
            name: actualStoreName,
            leadTailor: name || existingStore.leadTailor,
            address: address || existingStore.address,
            postcode: postcode || existingStore.postcode,
            ...(storeArea ? { area: storeArea } : {}),
            ...(machines ? { machines: parseInt(machines) || existingStore.machines } : {}),
          },
        });
      }
    } catch (storeErr) {
      console.warn('Store creation notice:', storeErr.message);
    }
  }

  // 4. Update existing user or create new user
  if (user) {
    let updatedPhone = user.phone;
    if (normPhone) {
      const phoneConflict = await prisma.user.findFirst({
        where: { phone: normPhone, NOT: { id: user.id } },
      });
      if (!phoneConflict) {
        updatedPhone = normPhone;
      }
    }

    const updatedFields = {
      email: normEmail || user.email,
      role: user.role || role,
      email: user.email || normEmail,
      phone: updatedPhone,
      name:
        name && name !== 'Master Tailor' && name !== 'Google User' && name !== 'Darzi Member' && name !== 'Mobile Member'
          ? name
          : user.name || name || 'Darzi Member',
      avatar:
        user.avatar && !user.avatar.includes('dicebear')
          ? user.avatar
          : avatar && !avatar.includes('dicebear')
            ? avatar
            : user.avatar ||
            avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              normEmail || normPhone || 'user'
            )}`,
      address: address || resolvedStore?.address || user.address || '18 Kensington Church St',
      postcode: postcode || resolvedStore?.postcode || user.postcode || 'W8 4EP',
      contact: normEmail || normPhone || user.email || user.phone || user.contact,
      role: role || user.role || 'CUSTOMER',
      studioId: (role === 'CUSTOMER' ? null : (actualStudioId || user.studioId || null)),
      studioName: (role === 'CUSTOMER' ? null : (studioName || resolvedStore?.name || user.studioName || null)),
    };

    user = await prisma.user.update({
      where: { id: user.id },
      data: updatedFields,
    });
  } else {
    // Check if phone or email is already taken
    if (normPhone) {
      const phoneTaken = await prisma.user.findFirst({
        where: { OR: [{ phone: normPhone }, { contact: normPhone }] },
      });
      if (phoneTaken) {
        if (phoneTaken.role && phoneTaken.role !== role) {
          const roleErr = new Error('Unauthorized user, access denied.');
          roleErr.statusCode = 403;
          throw roleErr;
        }
        if (!phoneTaken.role) {
          return await prisma.user.update({
            where: { id: phoneTaken.id },
            data: { role },
          });
        }
        return phoneTaken;
      }
    }
    if (normEmail) {
      const emailTaken = await prisma.user.findFirst({
        where: { OR: [{ email: normEmail }, { contact: normEmail }] },
      });
      if (emailTaken) {
        if (emailTaken.role && emailTaken.role !== role) {
          const roleErr = new Error('Unauthorized user, access denied.');
          roleErr.statusCode = 403;
          throw roleErr;
        }
        if (!emailTaken.role) {
          return await prisma.user.update({
            where: { id: emailTaken.id },
            data: { role },
          });
        }
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
      address: address || resolvedStore?.address || '18 Kensington Church St',
      postcode: postcode || resolvedStore?.postcode || 'W8 4EP',
      method:
        method ||
        (normEmail ? (normEmail.includes('google') ? 'google' : 'email') : 'mobile'),
      role,
      studioId: actualStudioId || null,
      studioName: studioName || resolvedStore?.name || null,
    };

    user = await prisma.user.create({
      data: newUserData,
    });
  }

  return user;
}

// In-flight OTP dispatch tracker and cooldown registry to prevent duplicate sends
const inFlightOtpRequests = new Map();
const otpCooldownStore = new Map();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, forceResend = false } = req.body;
    const phoneValidation = validateAndFormatPhone(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    const cleanPhone = phoneValidation.formatted;

    // 1. If another request for this phone is currently processing, wait for it instead of duplicating
    if (inFlightOtpRequests.has(cleanPhone)) {
      console.log(`[AUTH-OTP] Deduplicating concurrent request for ${cleanPhone}`);
      const inFlightResult = await inFlightOtpRequests.get(cleanPhone);
      return res.json(inFlightResult);
    }

    // 2. Cooldown check: if an OTP was sent within the last 30 seconds, reuse existing without spamming SMS
    const lastSentAt = otpCooldownStore.get(cleanPhone);
    const now = Date.now();
    if (lastSentAt && (now - lastSentAt < 30000) && !forceResend) {
      console.log(`[AUTH-OTP] Cooldown active for ${cleanPhone} (${Math.round((30000 - (now - lastSentAt)) / 1000)}s remaining)`);
      return res.json({
        success: true,
        phone: cleanPhone,
        message: `Verification code was already sent via SMS to ${cleanPhone}. Valid for 10 minutes.`,
        cooldown: true,
      });
    }

    // 3. Register lock and timestamp immediately (synchronously) before entering async dispatch
    otpCooldownStore.set(cleanPhone, Date.now());

    let resolveDispatch;
    let rejectDispatch;
    const dispatchPromise = new Promise((resolve, reject) => {
      resolveDispatch = resolve;
      rejectDispatch = reject;
    });
    inFlightOtpRequests.set(cleanPhone, dispatchPromise);

    (async () => {
      try {
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Persist OTP in PostgreSQL DB (and memory cache)
        await saveOtp(cleanPhone, code);
        console.log(`[AUTH-OTP] Generated & saved OTP code for ${cleanPhone}: ${code}`);

        // Send real SMS via Twilio
        const smsResult = await sendVerificationSms(cleanPhone, code);

        const responsePayload = {
          success: true,
          phone: cleanPhone,
          message: smsResult.message || `Verification code sent via SMS to ${cleanPhone}`,
        };
        resolveDispatch(responsePayload);
      } catch (dispatchErr) {
        // Clear cooldown so user can retry on true failure
        otpCooldownStore.delete(cleanPhone);
        rejectDispatch(dispatchErr);
      } finally {
        inFlightOtpRequests.delete(cleanPhone);
      }
    })();

    const result = await dispatchPromise;
    return res.json(result);
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send verification code.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, email, role = 'CUSTOMER', userId } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and verification code are required.' });
    }

    const phoneValidation = validateAndFormatPhone(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    const cleanPhone = phoneValidation.formatted;
    const cleanOtp = otp.trim();

    const isValidOtp = await verifyOtp(cleanPhone, cleanOtp);

    if (!isValidOtp) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification code. Please check your SMS and try again or click Resend.' });
    }

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
            error: 'This mobile number is registered as a Customer. Please use a different number for Studio.',
          });
        }
        if (role === 'CUSTOMER' && existingUser.role === 'STUDIO') {
          return res.status(403).json({
            error: 'This mobile number is registered as a Studio partner. Please sign in via the Studio portal.',
          });
        }
        user = existingUser;
      } else {
        // User does not exist
        if (role === 'STUDIO') {
          return res.json({
            success: true,
            isNewUser: true,
            phone: cleanPhone,
            message: 'Mobile number verified. Please complete your studio registration.',
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

    const phoneValidation = validateAndFormatPhone(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ error: phoneValidation.error });
    }

    const cleanPhone = phoneValidation.formatted;

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
      const isValid = await verifyOtp(cleanPhone, cleanOtp);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired verification code. Please check your SMS and try again or click Resend.' });
      }
    }

    if (targetUserId && String(targetUserId).startsWith('temp_g_')) {
      const cached = getPendingGoogleSignup(targetUserId);
      if (cached) {
        const createdUser = await findOrLinkUser({
          name: cached.name,
          email: cached.email,
          avatar: cached.avatar,
          phone: cleanPhone,
          method: 'google',
          role: cached.role || 'CUSTOMER',
        });

        removePendingGoogleSignup(targetUserId);

        const token = generateToken(createdUser);
        return res.json({
          success: true,
          message: 'Mobile number linked and account created successfully',
          user: createdUser,
          token,
          hasPhone: true,
        });
      }
    }

    let user = null;
    if (targetUserId) {
      user = await prisma.user.findUnique({ where: { id: targetUserId } }).catch(() => null);
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { contact: cleanPhone }],
        },
      });
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phone: cleanPhone },
      });
    } else {
      user = await findOrLinkUser({
        phone: cleanPhone,
        role: 'CUSTOMER',
      });
    }

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

// GET /api/auth/check-email
router.get('/check-email', async (req, res) => {
  try {
    const { email, role = 'STUDIO' } = req.query;
    if (!email) return res.json({ exists: false });

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existingUser && existingUser.studioName) {
      return res.json({
        exists: true,
        user: existingUser,
        error: 'An account with this email address is already registered. Please sign in instead.',
      });
    }

    return res.json({ exists: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// In-memory cache for pending Google signups (as optional fallback)
const pendingGoogleSignups = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, item] of pendingGoogleSignups.entries()) {
    if (item.expiresAt < now) {
      pendingGoogleSignups.delete(key);
    }
  }
}, 5 * 60 * 1000);

function storePendingGoogleSignup(tempId, data, ttlMs = 60 * 60 * 1000) {
  pendingGoogleSignups.set(tempId, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function getPendingGoogleSignup(tempId) {
  if (!tempId) return null;

  // 1. Check in-memory map first
  const item = pendingGoogleSignups.get(tempId);
  if (item) {
    if (item.expiresAt >= Date.now()) {
      return item.data;
    }
    pendingGoogleSignups.delete(tempId);
  }

  // 2. Stateless JWT verification: allows surviving server restarts & multi-day onboarding
  const rawToken = String(tempId).startsWith('temp_g_') ? String(tempId).slice(7) : String(tempId);
  try {
    const decoded = jwt.verify(rawToken, JWT_SECRET);
    if (decoded && (decoded.email || decoded.type === 'pending_google_signup')) {
      return {
        tempSignupId: tempId,
        email: decoded.email,
        name: decoded.name || 'Google User',
        avatar: decoded.avatar,
        role: decoded.role || 'CUSTOMER',
        method: decoded.method || 'google',
      };
    }
  } catch (jwtErr) {
    // Not a valid or signed JWT
  }

  return null;
}

function removePendingGoogleSignup(tempId) {
  pendingGoogleSignups.delete(tempId);
}

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken, accessToken, profile, role = 'CUSTOMER', isSignup = false } = req.body;

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

    // Check if user already exists in DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { contact: cleanEmail }],
      },
    });

    if (existingUser) {
      if (role === 'STUDIO' && existingUser.role !== 'STUDIO') {
        return res.status(403).json({
          error: 'Unauthorized user, access denied.',
        });
      }
      if (role === 'CUSTOMER' && existingUser.role === 'STUDIO') {
        return res.status(403).json({
          error: 'Unauthorized user, access denied.',
        });
      }

      const isRegisteredStudio = Boolean(existingUser.role === 'STUDIO' && existingUser.studioName && existingUser.phone);
      const isNewUser = role === 'STUDIO' ? !isRegisteredStudio : false;

      const token = generateToken(existingUser);
      return res.json({
        success: true,
        message: 'Authenticated with Google successfully',
        token,
        user: existingUser,
        isNewUser,
        needsPhone: !existingUser.phone,
        hasPhone: Boolean(existingUser.phone),
      });
    }

    // Persist new user directly to database
    const newUser = await findOrLinkUser({
      email: cleanEmail,
      name: name || 'Google User',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role,
    });

    const token = generateToken(newUser);
    return res.json({
      success: true,
      isNewUser: true,
      message: 'Google identity verified successfully.',
      token,
      user: newUser,
      needsPhone: !newUser.phone,
      hasPhone: Boolean(newUser.phone),
    });
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    return res.status(err.statusCode || 500).json({ error: err.message || 'Server error during Google authentication.' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let currentUserId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        currentUserId = decoded.id;
      } catch (e) { }
    }

    const {
      tempSignupId,
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

    // Check if there is a pending Google cache entry
    let cachedGoogleData = null;
    if (tempSignupId) {
      cachedGoogleData = getPendingGoogleSignup(tempSignupId);
      // Resilient fallback: If cache entry is missing or expired, but the client provides email or phone,
      // allow registration to proceed so active onboarding users never get blocked by timeouts or restarts.
      if (!cachedGoogleData && !email && !phone) {
        return res.status(400).json({
          error: 'Your sign-up session has expired. Please sign up with Google again.',
        });
      }
    }

    const finalEmail = (email || cachedGoogleData?.email || '').trim().toLowerCase();
    let finalPhone = null;
    if (phone) {
      const phoneValidation = validateAndFormatPhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ error: phoneValidation.error });
      }
      finalPhone = phoneValidation.formatted;
    }
    const finalName = name || cachedGoogleData?.name || 'Darzi Member';
    const finalAvatar = cachedGoogleData?.avatar;
    const finalMethod = (tempSignupId || cachedGoogleData) ? 'google' : 'email';

    const contactStr = finalEmail || finalPhone;
    if (!contactStr) {
      return res.status(400).json({ error: 'Email or mobile number is required.' });
    }

    // Check existing email conflict
    if (finalEmail) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          OR: [{ email: finalEmail }, { contact: finalEmail }],
        },
      });
      if (existingEmail) {
        if (existingEmail.role !== role) {
          return res.status(403).json({
            error: 'Unauthorized user, access denied.',
          });
        }
        // If Customer role, prevent duplicate registration
        if (role === 'CUSTOMER') {
          return res.status(409).json({
            error: 'An account with this email address is already registered. Please sign in instead.',
          });
        }
      }
    }

    // Check existing phone conflict
    if (finalPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          OR: [{ phone: finalPhone }, { contact: finalPhone }],
        },
      });
      if (existingPhone) {
        if (existingPhone.role !== role) {
          return res.status(403).json({
            error: 'Unauthorized user, access denied.',
          });
        }
        if (existingPhone.email && finalEmail && existingPhone.email !== finalEmail) {
          return res.status(409).json({
            error: 'An account with this mobile number is already registered to another email.',
          });
        }
      }
    }

    // Now write to database
    const user = await findOrLinkUser({
      name: finalName,
      email: finalEmail || undefined,
      phone: finalPhone || undefined,
      avatar: finalAvatar,
      method: finalMethod,
      address,
      postcode,
      role: role || cachedGoogleData?.role || 'CUSTOMER',
      studioName: storeName,
      storeArea,
      machines,
    });

    if (tempSignupId) {
      removePendingGoogleSignup(tempSignupId);
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
    console.error('Signup Error:', err);
    return res.status(500).json({ error: err.message || 'Server error during registration.' });
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

    const cleanVal = searchVal.trim();

    let user = null;
    if (cleanVal.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: cleanVal.toLowerCase() } });
    } else {
      const phoneValidation = validateAndFormatPhone(cleanVal);
      const searchFormatted = phoneValidation.isValid ? phoneValidation.formatted : cleanVal;
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: searchFormatted },
            { phone: cleanVal },
            { contact: searchFormatted },
            { contact: cleanVal },
          ],
        },
      });
    }

    if (!user) {
      if (role === 'STUDIO') {
        return res.status(403).json({
          error: 'Unauthorized user, access denied.',
        });
      }
      return res.status(404).json({
        error: 'No account found with this email or mobile number. Please register first.',
      });
    }

    // STRICT ROLE GATE & OTP ENFORCEMENT: Studio accounts cannot bypass OTP
    if (role === 'STUDIO') {
      if (user.role !== 'STUDIO') {
        return res.status(403).json({
          error: 'Unauthorized user, access denied.',
        });
      }
      return res.status(403).json({
        error: 'Studio partners must authenticate via SMS verification code.',
        requireOtp: true,
        phone: user.phone || null,
      });
    }

    if (role === 'CUSTOMER' && user.role === 'STUDIO') {
      return res.status(403).json({
        error: 'Unauthorized user, access denied.',
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

    const { id, name, email, phone, address, postcode, avatar, studioName } = req.body;
    let targetId = userId || id;

    if (!targetId && email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (userByEmail) targetId = userByEmail.id;
    }

    if (!targetId) {
      return res.status(401).json({ error: 'Unauthorized: missing user identity.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (studioName !== undefined) updateData.studioName = studioName;
    if (avatar !== undefined) updateData.avatar = avatar;
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
      const phoneValidation = validateAndFormatPhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ error: phoneValidation.error });
      }
      const cleanPhone = phoneValidation.formatted;
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

    // If user is a Studio partner, sync details to partnerStore
    if (user.role === 'STUDIO') {
      try {
        let store = null;
        if (user.studioId) {
          store = await prisma.partnerStore.findUnique({ where: { id: user.studioId } });
        }
        if (!store) {
          store = await prisma.partnerStore.findFirst({
            where: {
              OR: [
                ...(user.studioName ? [{ name: user.studioName }] : []),
                { leadTailor: user.name },
              ],
            },
          });
        }
        if (store) {
          await prisma.partnerStore.update({
            where: { id: store.id },
            data: {
              ...(studioName ? { name: studioName } : {}),
              ...(name ? { leadTailor: name } : {}),
              ...(address ? { address } : {}),
              ...(postcode ? { postcode } : {}),
            },
          });
          if (!user.studioId) {
            await prisma.user.update({
              where: { id: user.id },
              data: { studioId: store.id },
            });
          }
        }
      } catch (storeSyncErr) {
        console.warn('Sync partner store error:', storeSyncErr.message);
      }
    }

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

    if (user.role === 'STUDIO' && user.studioId) {
      try {
        const store = await prisma.partnerStore.findUnique({ where: { id: user.studioId } });
        if (store) {
          const needsSync =
            (store.address && user.address !== store.address) ||
            (store.postcode && user.postcode !== store.postcode) ||
            (store.name && user.studioName !== store.name);
          if (needsSync) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                address: store.address || user.address,
                postcode: store.postcode || user.postcode,
                studioName: store.name || user.studioName,
              },
            });
          }
        }
      } catch (syncErr) {
        console.warn('Sync partner store in /me notice:', syncErr.message);
      }
    }

    if (!user.role) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'CUSTOMER' },
      });
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
