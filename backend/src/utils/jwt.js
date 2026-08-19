const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./AppError');

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function msFromExpiresIn(expiresIn) {
  const m = String(expiresIn).match(/^(\d+)([smhd])$/);
  if (!m) return 12 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * mult[m[2]];
}

function assertSecretConfigured() {
  if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.includes('change-me')) {
    throw new AppError(
      500,
      'JWT_SECRET is not configured. Set a strong random value in .env ' +
        '(generate with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))").',
      'JWT_SECRET_MISSING'
    );
  }
}

/**
 * Sign an access token for the given user.
 * Returns { token, jti, expiresAt }.
 */
function signToken(userId) {
  assertSecretConfigured();
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + msFromExpiresIn(EXPIRES_IN));
  const token = jwt.sign({ sub: userId, jti }, JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
  return { token, jti, expiresAt };
}

/**
 * Verify a raw token; returns the decoded payload or throws 401.
 */
function verifyToken(token) {
  assertSecretConfigured();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new AppError(401, 'Session is invalid or expired. Please log in again.', 'INVALID_TOKEN');
  }
}

module.exports = { signToken, verifyToken, msFromExpiresIn, EXPIRES_IN };
