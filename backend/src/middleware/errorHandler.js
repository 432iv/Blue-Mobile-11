const { Prisma } = require('@prisma/client');

/**
 * Central error handler.
 * - Operational AppErrors → their status + message.
 * - Zod → 400 (handled in validate middleware, but kept as a fallback).
 * - Prisma known errors (unique constraint, not found) → mapped.
 * - Anything else → 500 with a generic message (real details logged
 *   server-side only; never leaked to the client).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Operational errors thrown by our code
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details || undefined,
      },
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
      return res.status(409).json({
        error: {
          message: `A record with this value already exists${target ? ` (${target})` : ''}.`,
          code: 'DUPLICATE',
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Record not found.', code: 'NOT_FOUND' } });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({
        error: { message: 'This record is still referenced by other data.', code: 'FK_CONSTRAINT' },
      });
    }
  }

  // Unknown errors — log details, return generic message
  console.error('[Unhandled error]', err);
  return res.status(500).json({
    error: { message: 'Internal server error.', code: 'INTERNAL' },
  });
}

module.exports = errorHandler;
