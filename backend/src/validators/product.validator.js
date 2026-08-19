const { z } = require('zod');

const optionalEmptyToNull = z
  .union([z.string().trim().max(200), z.literal('')])
  .transform((v) => (v === '' ? null : v));

// Product types (category = type). Legacy values from the old app are
// still accepted so existing data is never broken.
const PRODUCT_TYPES = [
  'Chargers',
  'Cables',
  'Phone Cases',
  'Screen Protectors',
  'Bluetooth Earphones',
  'Wired Earphones',
  'AUX Cables',
  'Adapters & Connectors',
  'Power Banks',
  'Phones',
  'Other Accessories',
  // legacy values preserved
  'Phone Covers',
  'Earphones',
  'Accessories',
];

const productSchemaBase = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200),
  category: z.string().trim().min(1).max(60).default('Other Accessories'),
  brand: z.string().trim().max(100).default(''),
  description: z.string().trim().max(1000).optional(),
  wattage: optionalEmptyToNull.optional(), // chargers only
  connectorType: optionalEmptyToNull.optional(), // cables / adapters
  compatibleModelId: z.string().trim().max(64).nullable().optional(), // cases / screen protectors
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(1000000).default(0),
  buyingPrice: z.number().min(0, 'Purchase price cannot be negative').max(1e9).default(0),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative').max(1e9).default(0),
  imageUrl: z.union([z.string().trim().url('Image URL is not valid').max(500), z.literal('')]).optional(),
  notes: z.string().trim().max(1000).optional(),
  barcode: optionalEmptyToNull.optional(),
  minimumStock: z.number().int().min(0).max(1000000).default(5),
});

const productSchema = productSchemaBase.refine((data) => {
  // Phone cases & screen protectors must have a compatible phone model
  const needsModel = data.category === 'Phone Cases' || data.category === 'Screen Protectors';
  if (needsModel && !data.compatibleModelId) {
    return false;
  }
  return true;
}, {
  message: 'A compatible phone model is required for this product type.',
  path: ['compatibleModelId'],
});

const productUpdateSchema = productSchemaBase.partial();

const productListQuery = z.object({
  search: z.string().trim().max(200).optional().default(''),
  category: z.string().trim().max(60).optional().default(''),
  brand: z.string().trim().max(100).optional().default(''),
  includeOut: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
});

// Purchase batch creation: quantity + purchase price only
const purchaseSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(1000000),
  unitCost: z.number().min(0, 'Purchase price cannot be negative').max(1e9),
});

module.exports = {
  productSchema,
  productUpdateSchema,
  productListQuery,
  purchaseSchema,
  PRODUCT_TYPES,
};
