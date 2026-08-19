const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');
const { toNum } = require('../utils/money');

const PRODUCT_SELECT = {
  id: true,
  name: true,
  barcode: true,
  buyingPrice: true,
  sellingPrice: true,
  quantity: true,
  category: true,
  brand: true,
  description: true,
  wattage: true,
  connectorType: true,
  compatibleModelId: true,
  compatibleModel: { select: { id: true, brand: true, model: true } },
  imageUrl: true,
  notes: true,
  minimumStock: true,
  createdAt: true,
  updatedAt: true,
};

function serialize(p) {
  if (!p) return p;
  return {
    ...p,
    buyingPrice: toNum(p.buyingPrice),
    sellingPrice: toNum(p.sellingPrice),
    compatibleModelName: p.compatibleModel ? `${p.compatibleModel.brand} ${p.compatibleModel.model}` : null,
  };
}

/**
 * List products. Active inventory (quantity > 0) is returned as
 * `products`; zero-stock items are returned separately as
 * `outOfStock` so historical products are never lost but are not
 * offered for sale.
 */
async function list({ search = '', category = '', brand = '', includeOut = false }) {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search } },
    ];
  }
  if (category) where.category = category;
  if (brand) where.brand = brand;

  const all = await prisma.product.findMany({
    where,
    orderBy: [{ quantity: 'desc' }, { name: 'asc' }],
    select: PRODUCT_SELECT,
  });

  const products = all.filter((p) => p.quantity > 0).map(serialize);
  const outOfStock = includeOut ? all.filter((p) => p.quantity <= 0).map(serialize) : [];

  return { products, outOfStock };
}

async function getById(id) {
  const product = await prisma.product.findUnique({ where: { id }, select: PRODUCT_SELECT });
  if (!product) throw new AppError(404, 'Product not found.', 'PRODUCT_NOT_FOUND');
  return serialize(product);
}

async function getByBarcode(code) {
  const product = await prisma.product.findFirst({
    where: { barcode: code },
    select: PRODUCT_SELECT,
  });
  if (!product) throw new AppError(404, 'No product found with this barcode.', 'BARCODE_NOT_FOUND');
  return serialize(product);
}

async function create(data) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      category: data.category || 'Other Accessories',
      brand: data.brand || '',
      description: data.description || null,
      wattage: data.wattage || null,
      connectorType: data.connectorType || null,
      compatibleModelId: data.compatibleModelId || null,
      quantity: data.quantity ?? 0,
      buyingPrice: data.buyingPrice ?? 0,
      sellingPrice: data.sellingPrice ?? 0,
      imageUrl: data.imageUrl || null,
      notes: data.notes || null,
      barcode: data.barcode || null,
      minimumStock: data.minimumStock ?? 5,
    },
    select: PRODUCT_SELECT,
  });
  // Initial purchase batch so FIFO works from day one
  if (product.quantity > 0) {
    await prisma.purchaseBatch.create({
      data: {
        productId: product.id,
        quantity: product.quantity,
        remaining: product.quantity,
        unitCost: product.buyingPrice,
      },
    });
  }
  return serialize(product);
}

async function update(id, data) {
  await getById(id); // 404 if missing
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.brand !== undefined ? { brand: data.brand } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.wattage !== undefined ? { wattage: data.wattage || null } : {}),
      ...(data.connectorType !== undefined ? { connectorType: data.connectorType || null } : {}),
      ...(data.compatibleModelId !== undefined ? { compatibleModelId: data.compatibleModelId || null } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.buyingPrice !== undefined ? { buyingPrice: data.buyingPrice } : {}),
      ...(data.sellingPrice !== undefined ? { sellingPrice: data.sellingPrice } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      ...(data.barcode !== undefined ? { barcode: data.barcode || null } : {}),
      ...(data.minimumStock !== undefined ? { minimumStock: data.minimumStock } : {}),
    },
    select: PRODUCT_SELECT,
  });
  return serialize(product);
}

/**
 * Purchase / restock: user enters ONLY quantity + purchase price.
 * Creates an internal purchase batch, increases stock, updates the
 * product's current purchase price to the latest batch price, and
 * records a stock movement. A zero-stock product becomes active again.
 */
async function purchase(id, { quantity, unitCost }) {
  await getById(id); // 404 if missing

  return prisma.$transaction(async (tx) => {
    const batch = await tx.purchaseBatch.create({
      data: { productId: id, quantity, remaining: quantity, unitCost },
    });
    await tx.product.update({
      where: { id },
      data: {
        quantity: { increment: quantity },
        buyingPrice: unitCost, // latest purchase price
      },
    });
    await tx.stockMovement.create({
      data: {
        productId: id,
        type: 'purchase',
        quantity,
        unitCost,
        batchId: batch.id,
        note: `Purchase batch of ${quantity} @ ${unitCost}`,
      },
    });
    return tx.product.findUnique({ where: { id }, select: PRODUCT_SELECT });
  }).then(serialize);
}

async function remove(id) {
  await getById(id); // 404 if missing
  // SaleItem.productId is ON DELETE SET NULL → history snapshots
  // (product_name, product_description, unit_cost, unit_price) are preserved.
  await prisma.product.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, getByBarcode, create, update, purchase, remove };
