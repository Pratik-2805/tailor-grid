const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'Darzi_jwt_secret_key_2026';

/**
 * Universal Authentication & Role Extraction Middleware
 * Reads JWT from Authorization header ("Bearer <token>") or cookies.
 * Attaches decoded payload to req.user.
 */
function authenticateUser(req, res, next) {
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

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
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
};
