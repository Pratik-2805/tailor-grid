const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { readDb, writeDb } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tailorgrid_jwt_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper to generate auth token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email || user.contact, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken, accessToken, profile } = req.body;

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
        console.warn('ID Token verification warning (falling back to userinfo/profile):', verifyErr.message);
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

    // 3. Fallback to passed profile object if token verification endpoint wasn't reached
    if (!email && profile) {
      email = profile.email || profile.contact;
      name = profile.name || 'Google User';
      avatar = profile.avatar || profile.picture;
    }

    if (!email) {
      return res.status(400).json({ error: 'Failed to retrieve email or identity from Google authentication.' });
    }

    const db = readDb();
    let existingUser = db.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() || u.contact?.toLowerCase() === email.toLowerCase()
    );

    if (!existingUser) {
      existingUser = {
        id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: name || 'Google TailorGrid User',
        email,
        contact: email,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        address: '18 Kensington Church St',
        postcode: 'W8 4EP',
        method: 'google',
        createdAt: new Date().toISOString(),
      };
      db.users.push(existingUser);
      writeDb(db);
    }

    const token = generateToken(existingUser);

    return res.json({
      success: true,
      message: 'Authenticated with Google successfully',
      token,
      user: existingUser,
    });
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    return res.status(500).json({ error: 'Server error during Google authentication.' });
  }
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  try {
    const { name, email, phone, address, postcode } = req.body;

    const contactStr = email || phone;
    if (!contactStr) {
      return res.status(400).json({ error: 'Email or phone number is required.' });
    }

    const db = readDb();
    let existingUser = db.users.find((u) => u.contact === contactStr || u.email === contactStr);

    if (!existingUser) {
      existingUser = {
        id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: name || 'TailorGrid Member',
        email: email || contactStr,
        contact: contactStr,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contactStr)}`,
        address: address || '42 Kensington Church St',
        postcode: postcode || 'W8 4EP',
        method: email ? 'email' : 'mobile',
        createdAt: new Date().toISOString(),
      };
      db.users.push(existingUser);
      writeDb(db);
    }

    const token = generateToken(existingUser);
    return res.json({
      success: true,
      token,
      user: existingUser,
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, phone } = req.body;
    const contactStr = email || phone;

    const db = readDb();
    const existingUser = db.users.find((u) => u.contact === contactStr || u.email === contactStr);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found. Please sign up.' });
    }

    const token = generateToken(existingUser);
    return res.json({
      success: true,
      token,
      user: existingUser,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    const user = db.users.find((u) => u.id === decoded.id || u.email === decoded.email);

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
