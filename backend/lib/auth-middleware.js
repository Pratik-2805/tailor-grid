const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('./prisma');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes

function hashRefreshToken(token) {
  if (!token) return null;
  return crypto.createHmac('sha256', JWT_REFRESH_SECRET).update(token).digest('hex');
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email || null,
      phone: user.phone || null,
      name: user.name,
      role: user.role || 'CUSTOMER',
      status: user.status || 'ACTIVE',
      studioId: user.studioId || null,
      tokenType: 'access',
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function setRefreshedAccessCookie(res, newAccessToken) {
  const isProd = process.env.NODE_ENV === 'production';
  const atMaxAge = 15 * 60; // 15 minutes
  const cookieDomain = process.env.COOKIE_DOMAIN || (isProd ? '.luxenart.in' : undefined);

  const cookieOptions = {
    path: '/',
    maxAge: atMaxAge * 1000,
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd,
    ...(cookieDomain && { domain: cookieDomain }),
  };

  res.cookie('tg_token', newAccessToken, cookieOptions);
}

/**
 * Universal Authentication & Role Extraction Middleware
 * Reads JWT from Authorization header ("Bearer <token>") or cookies.
 * 
 * SMART SERVER-SIDE AUTO-RENEWAL:
 * If the access token is missing or expired, but an HttpOnly refresh token cookie exists,
 * the backend silently verifies the refresh token against PostgreSQL, mints a fresh
 * access token, sets the new cookie on the response, and populates req.user.
 * 
 * This enables the frontend to make normal fetch calls without timers, and returning
 * users (even after 1 day or 1 week) to remain logged in seamlessly.
 */
async function authenticateUser(req, res, next) {
  // If already authenticated by an upstream middleware, proceed immediately
  if (req.user) {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const match = req.headers.cookie
        .split(';')
        .map((c) => c.trim())
        .find(
          (c) =>
            c.startsWith('tg_token=') ||
            c.startsWith('token=') ||
            c.startsWith('tg_auth_token=') ||
            c.startsWith('tg_super_admin_token=') ||
            c.startsWith('admin_token=')
        );
      if (match) token = match.split('=')[1];
    }

    // 1. Try to verify existing access token first
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ensure user account actually still exists in PostgreSQL and is active
        if (decoded && decoded.id && !String(decoded.id).startsWith('temp_g_')) {
          const dbUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, status: true, studioId: true, studioName: true, name: true, email: true, phone: true },
          });

          if (!dbUser || dbUser.status === 'BANNED' || dbUser.status === 'SUSPENDED' || dbUser.status === 'DELETED') {
            // User was deleted or banned/suspended by admin - force immediate invalidation
            req.user = null;
            return next();
          }

          req.user = { ...decoded, ...dbUser };
          return next();
        }

        req.user = decoded;
        return next();
      } catch (tokenErr) {
        // Access token expired or invalid - proceed down to silent refresh via HttpOnly cookie
      }
    }

    // 2. Transparent Server-Side Refresh via HttpOnly cookie
    if (req.headers.cookie) {
      const rtMatch = req.headers.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('tg_refresh_token=') || c.startsWith('refreshToken='));

      if (rtMatch) {
        const refreshToken = rtMatch.split('=')[1];
        if (refreshToken) {
          try {
            let decodedRt = null;
            try {
              decodedRt = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            } catch (_) {
              try {
                decodedRt = jwt.verify(refreshToken, JWT_SECRET);
              } catch (__) {}
            }

            if (decodedRt && decodedRt.id) {
              const user = await prisma.user.findUnique({ where: { id: decodedRt.id } });

              if (user && user.status !== 'BANNED' && user.status !== 'SUSPENDED') {
                const incomingHashed = hashRefreshToken(refreshToken);
                let isMatch = false;

                if (user.refreshToken) {
                  if (user.refreshToken === incomingHashed) {
                    isMatch = true;
                  } else if (user.refreshToken.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(user.refreshToken);
                      if (
                        parsed.current === incomingHashed ||
                        (parsed.previous === incomingHashed && Date.now() - (parsed.rotatedAt || 0) < 60000)
                      ) {
                        isMatch = true;
                      }
                    } catch {}
                  }
                }

                if (isMatch) {
                  // Mint fresh 15-minute access token on the fly
                  const newAccessToken = generateAccessToken(user);

                  // Set Set-Cookie header so browser automatically stores the fresh access token
                  setRefreshedAccessCookie(res, newAccessToken);

                  // Populate req.user for current request
                  req.user = {
                    id: user.id,
                    email: user.email || null,
                    phone: user.phone || null,
                    name: user.name,
                    role: user.role || 'CUSTOMER',
                    status: user.status || 'ACTIVE',
                    studioId: user.studioId || null,
                    tokenType: 'access',
                  };
                  return next();
                }
              }
            }
          } catch (rtErr) {
            // Refresh token verification failed
          }
        }
      }
    }

    req.user = null;
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
}

/**
 * Enforce that the request is authenticated
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  return next();
}

/**
 * Enforce that the request is made by a verified STUDIO or ADMIN
 */
function requireStudioOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (req.user.role !== 'STUDIO' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Studio partner or Admin privileges required.' });
  }
  return next();
}

module.exports = {
  authenticateUser,
  requireAuth,
  requireStudioOrAdmin,
  generateAccessToken,
  setRefreshedAccessCookie,
};
