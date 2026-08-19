const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const sessionRoutes = require('./routes/session.routes');
const saleRoutes = require('./routes/sale.routes');
const customerRoutes = require('./routes/customer.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminRoutes = require('./routes/admin.routes');
const noteRoutes = require('./routes/note.routes');
const deviceModelRoutes = require('./routes/deviceModel.routes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Behind proxies (Render / Railway / nginx) so rate limiting and
// Secure cookies see the real client IP / protocol.
app.set('trust proxy', 1);

// ---------- Security headers ----------
// CSP is tuned for the Blue Mobile frontend:
//  - scripts come from 'self' only (html5-qrcode is vendored locally)
//  - product images may load from any https host (image URL field)
//  - inline styles stay allowed (the glass UI uses style attributes)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
      },
    },
  })
);

// ---------- CORS ----------
// Same-origin deployments (backend serves the frontend): no
// cross-origin access is needed at all → CORS disabled entirely.
// Split deployments (frontend on Netlify etc.): only the origins
// listed in FRONTEND_URL are accepted, with credentials enabled.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true); // same-origin / non-browser clients
    if (allowedOrigins.length === 0) {
      // No cross-origin access configured — same-origin requests do
      // not need CORS headers and keep working.
      return callback(null, false);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new AppError(403, 'Origin not allowed by CORS.', 'CORS_DENIED'));
  },
};
app.use(cors(corsOptions));

// ---------- Parsers ----------
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

// ---------- Rate limiting ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later.', code: 'RATE_LIMITED' } },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many login attempts. Try again in 15 minutes.', code: 'LOGIN_RATE_LIMITED' } },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/device-models', deviceModelRoutes);

// Public health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'blue-mobile', time: new Date().toISOString() }));

// 404 for unknown API routes
app.use('/api', notFound);

// ---------- Frontend (optional, same origin → httpOnly cookies work) ----------
// Default location: <project-root>/frontend (sibling of backend/).
// Override with FRONTEND_DIR if your layout differs. When the
// frontend folder is absent (API-only deploy), only JSON is served.
const FRONTEND_DIR = process.env.FRONTEND_DIR
  ? path.resolve(process.env.FRONTEND_DIR)
  : path.join(__dirname, '..', '..', 'frontend');
const FRONTEND_INDEX = path.join(FRONTEND_DIR, 'index.html');

if (fs.existsSync(FRONTEND_INDEX)) {
  app.use(express.static(FRONTEND_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(FRONTEND_INDEX);
  });
} else {
  app.get('/', (req, res) =>
    res.json({ status: 'ok', service: 'blue-mobile-api', health: '/api/health', note: 'frontend not bundled' })
  );
}

// ---------- 404 + central error handler (must be last) ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
