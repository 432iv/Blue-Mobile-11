const AppError = require('../utils/AppError');

/** 404 for unknown API routes. */
function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}

module.exports = notFound;
