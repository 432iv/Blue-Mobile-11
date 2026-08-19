const { z } = require('zod');

const PAYMENT_METHODS = ['cash', 'card'];

/**
 * A sale line is either:
 *  - an inventory product (productId) — cost is computed via FIFO, stock decreases
 *  - a manual / service item (manualText) — free text, no inventory, cost = 0
 */
const saleSchema = z
  .object({
    productId: z.string().min(1).max(64).nullable().optional(),
    manualText: z.string().trim().min(1).max(200).optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(1000000),
    unitPrice: z.number().min(0, 'Selling price cannot be negative').max(1e9),
    paymentMethod: z.enum(PAYMENT_METHODS).default('cash'),
    customerId: z.string().min(1).max(64).nullable().optional(),
  })
  .refine((data) => {
    const hasProduct = !!data.productId;
    const hasManual = !!data.manualText;
    return hasProduct !== hasManual; // exactly one of the two
  }, {
    message: 'Provide either an inventory product or a manual item description.',
    path: ['productId'],
  });

const saleUpdateSchema = saleSchema;

const saleListQuery = z.object({
  // empty string = "the open session"
  sessionId: z.string().max(64).optional().default(''),
});

module.exports = { saleSchema, saleUpdateSchema, saleListQuery };
