const { z } = require('zod');
const { dateString } = require('./common');

const sessionCreateSchema = z.object({
  dayName: z.string().trim().min(1, 'Day name is required').max(100),
  date: dateString,
});

module.exports = { sessionCreateSchema };
