const { z } = require('zod');

const idParam = z.object({
  id: z.string().min(1).max(64),
});

const barcodeParam = z.object({
  code: z.string().min(1).max(128),
});

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

module.exports = { idParam, barcodeParam, dateString };
