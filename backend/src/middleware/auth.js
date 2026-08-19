const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

const COOKIE_NAME = 'bm_token';

/**
 * Authentication middleware.
 * 1. Reads the token from the httpOnly cookie, with a Bearer header
 *    fallback for API clients.
 * 2. Verifies the JWT (signature + expiry).
 * 3. Checks the server-side session row (jti) — must exist, be
 *    unrevoked and not expired. This is what makes logout real.
 * 4. Loads the user and attaches { user, sessionId } to req.
 */
async function verifyAuth(req, res, next) {
  try {
    const fromCookie = req.cookies && req.cookies[COOKIE_NAME];
    const fromHeader =
      req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    const raw = fromCookie || fromHeader;
    if (!raw) {
      throw new AppError(401, 'Authentication required.', 'UNAUTHENTICATED');
    }

    const payload = verifyToken(raw);

    const session = await prisma.authSession.findUnique({
      where: { tokenJti: payload.jti },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new AppError(401, 'Session has expired or been revoked. Please log in again.', 'SESSION_EXPIRED');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new AppError(401, 'Account no longer exists.', 'USER_NOT_FOUND');
    }

    req.user = user;
    req.sessionId = session.id;
    req.tokenJti = payload.jti;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyAuth, COOKIE_NAME };
