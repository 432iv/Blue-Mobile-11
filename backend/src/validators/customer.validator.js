const { z } = require('zod');
const { dateString } = require('./common');

const customerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required').max(200),
  phone: z.string().trim().max(50).optional().default(''),
  notes: z.string().trim().max(1000).optional().default(''),
});

const customerUpdateSchema = customerSchema.partial();

const customerListQuery = z.object({
  search: z.string().trim().max(200).optional().default(''),
});

const transactionSchema = z.object({
  type: z.enum(['credit', 'payment']),
  amount: z.number().positive('Amount must be greater than 0').max(1e9),
  note: z.string().trim().max(500).optional().default(''),
});

const reportListQuery = z
  .object({
    from: dateString.optional(),
    to: dateString.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: '"from" cannot be after "to"',
    path: ['from'],
  });

module.exports = {
  customerSchema,
  customerUpdateSchema,
  customerListQuery,
  transactionSchema,
  reportListQuery,
};
