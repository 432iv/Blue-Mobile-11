const { z } = require('zod');

const noteSchema = z.object({
  sessionId: z.string().max(64).optional().default(''),
  text: z.string().trim().min(1, 'Note text is required').max(500),
});

const noteListQuery = z.object({
  sessionId: z.string().max(64).optional().default(''),
});

module.exports = { noteSchema, noteListQuery };
