const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME } = require('../middleware/auth');
const { msFromExpiresIn } = require('../utils/jwt');

/**
 * Auth cookie options.
 * - httpOnly: JS can never read the token (XSS-safe).
 * - SameSite auto-policy:
 *     • 'lax'  — default; correct for same-origin deployments.
 *     • 'none' — automatically used when FRONTEND_URL is set
 *                (frontend hosted on a different origin, e.g. Netlify).
 *                'none' REQUIRES Secure → forced on.
 * - Secure: automatic in production, or via COOKIE_SECURE=true.
 */
const cookieOptions = () => {
  const crossOrigin = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean).length > 0;
  const sameSite = process.env.COOKIE_SAMESITE || (crossOrigin ? 'none' : 'lax');
  const secure =
    process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production' || sameSite === 'none';
  return {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
    maxAge: msFromExpiresIn(process.env.JWT_EXPIRES_IN || '12h'),
  };
};

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const { user, token, expiresAt } = await authService.login(username, password);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ user, expiresAt });
});

const logout = asyncHandler(async (req, res) => {
  if (req.tokenJti) await authService.logout(req.tokenJti);
  const { maxAge, ...clearOpts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, clearOpts);
  res.json({ message: 'Logged out.' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: authService.publicUser(req.user) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, username, newPassword } = req.body;
  const user = await authService.changePassword(req.user.id, req.tokenJti, {
    currentPassword,
    username,
    newPassword,
  });
  res.json({ user, message: 'Account updated. Other sessions were signed out.' });
});

module.exports = { login, logout, me, changePassword };
