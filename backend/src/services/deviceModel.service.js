const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');

/**
 * Searchable phone/device model list used by Phone Cases and
 * Screen Protectors. Brands: Apple, Samsung, Redmi, Honor,
 * Infinix, Tecno, Other ...
 */

async function list({ search = '' }) {
  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  return prisma.deviceModel.findMany({
    where,
    orderBy: [{ brand: 'asc' }, { model: 'asc' }],
  });
}

async function create({ brand, model }) {
  const existing = await prisma.deviceModel.findUnique({
    where: { brand_model: { brand, model } },
  });
  if (existing) return { model: existing, created: false }; // idempotent

  return { model: await prisma.deviceModel.create({ data: { brand, model } }), created: true };
}

async function getById(id) {
  const model = await prisma.deviceModel.findUnique({ where: { id } });
  if (!model) throw new AppError(404, 'Device model not found.', 'MODEL_NOT_FOUND');
  return model;
}

module.exports = { list, create, getById };
