const { z } = require('zod');

const deviceModelSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required').max(60),
  model: z.string().trim().min(1, 'Model is required').max(100),
});

const deviceModelListQuery = z.object({
  search: z.string().trim().max(100).optional().default(''),
});

module.exports = { deviceModelSchema, deviceModelListQuery };
