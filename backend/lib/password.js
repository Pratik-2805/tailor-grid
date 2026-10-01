const crypto = require('crypto');

/**
 * Hash a plain text password using PBKDF2 with a unique cryptographically secure salt.
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored 'salt:hash' string.
 */
function verifyPassword(password, storedCombined) {
  if (!password || !storedCombined || typeof storedCombined !== 'string') {
    return false;
  }
  const parts = storedCombined.split(':');
  if (parts.length !== 2) {
    return false;
  }
  const [salt, originalHash] = parts;
  const hashToCompare = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(hashToCompare, 'hex'));
}

module.exports = {
  hashPassword,
  verifyPassword,
};
