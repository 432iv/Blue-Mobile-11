/**
 * Operational error carrying an HTTP status code.
 * Thrown by services; rendered by the central error handler.
 */
class AppError extends Error {
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // machine-readable code, e.g. "INSUFFICIENT_STOCK"
    this.details = details; // e.g. zod issues
    this.isOperational = true;
  }
}

module.exports = AppError;
