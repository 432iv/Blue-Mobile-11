/**
 * Wraps async route handlers so rejected promises are forwarded
 * to the Express error middleware (no try/catch noise in routes).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
