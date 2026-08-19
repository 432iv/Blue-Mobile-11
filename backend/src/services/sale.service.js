const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');
const { mul, add, toNum } = require('../utils/money');
const { consumeFifo, refundToStock, effectiveDescription } = require('./inventory.service');

const SALE_ITEM_SELECT = {
  id: true,
  productId: true,
  productName: true,
  productBrand: true,
  productDescription: true,
  isManual: true,
  quantity: true,
  unitCost: true,
  unitPrice: true,
  subtotal: true,
  createdAt: true,
};

function serializeItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productBrand: item.productBrand,
    productDescription: item.productDescription,
    isManual: item.isManual,
    quantity: item.quantity,
    unitCost: toNum(item.unitCost),
    unitPrice: toNum(item.unitPrice),
    subtotal: toNum(item.subtotal),
    createdAt: item.createdAt,
  };
}

function serializeSale(sale) {
  return {
    id: sale.id,
    saleNumber: sale.saleNumber,
    sessionId: sale.sessionId,
    customerId: sale.customerId,
    totalAmount: toNum(sale.totalAmount),
    paymentMethod: sale.paymentMethod,
    createdAt: sale.createdAt,
    items: (sale.items || []).map(serializeItem),
  };
}

/** Lock a product row for update; returns id/name/quantity or throws 404. */
async function lockProduct(tx, productId) {
  const rows = await tx.$queryRaw`SELECT id, name, quantity FROM products WHERE id = ${productId} FOR UPDATE`;
  if (!rows || rows.length === 0) {
    throw new AppError(400, 'Product not found.', 'PRODUCT_NOT_FOUND');
  }
  return { id: rows[0].id, name: rows[0].name, quantity: Number(rows[0].quantity) };
}

/** Get the single open day session or throw. */
async function getOpenSession(tx = prisma) {
  const session = await tx.daySession.findFirst({ where: { status: 'open' } });
  if (!session) {
    throw new AppError(400, 'No day is open. Start a new day first.', 'NO_OPEN_SESSION');
  }
  return session;
}

/** Read a product WITH its compatible model for snapshotting. */
async function getProductSnapshot(tx, productId) {
  return tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      brand: true,
      description: true,
      wattage: true,
      connectorType: true,
      compatibleModel: { select: { brand: true, model: true } },
    },
  });
}

/**
 * Create a sale line — ALL steps inside one database transaction.
 * Inventory item:  lock product → FIFO consume batches → decrement stock
 *                  → sale + item with name/description/cost snapshots
 * Manual item:     sale + item with productId=null, cost=0, no stock effect
 * If ANY step fails the whole transaction rolls back.
 */
async function create({ productId, manualText, quantity, unitPrice, paymentMethod, customerId }) {
  return prisma.$transaction(async (tx) => {
    const session = await getOpenSession(tx);

    let itemData;

    if (productId) {
      const product = await lockProduct(tx, productId);
      if (product.quantity < quantity) {
        throw new AppError(
          400,
          `Insufficient stock for this product (available: ${product.quantity}).`,
          'INSUFFICIENT_STOCK'
        );
      }

      const { unitCost } = await consumeFifo(tx, productId, quantity);

      const snapshot = await getProductSnapshot(tx, productId);
      const description = snapshot ? effectiveDescription(snapshot) : null;

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId,
          type: 'sale',
          quantity: -quantity,
          unitCost,
          note: `Sale of ${quantity} units`,
        },
      });

      itemData = {
        productId,
        productName: product.name,
        productBrand: (snapshot && snapshot.brand) || null,
        productDescription: description,
        isManual: false,
        quantity,
        unitCost,
      };
    } else {
      itemData = {
        productId: null,
        productName: manualText,
        productBrand: null,
        productDescription: null,
        isManual: true,
        quantity,
        unitCost: 0,
      };
    }

    const subtotal = mul(unitPrice, quantity);

    const counter = await tx.counter.update({
      where: { id: 1 },
      data: { value: { increment: 1 } },
    });
    const saleNumber = 'INV-' + String(counter.value).padStart(5, '0');

    const sale = await tx.sale.create({
      data: {
        saleNumber,
        sessionId: session.id,
        customerId: customerId || null,
        totalAmount: subtotal,
        paymentMethod,
        items: {
          create: { ...itemData, unitPrice, subtotal },
        },
      },
      include: { items: { select: SALE_ITEM_SELECT } },
    });

    return serializeSale(sale);
  });
}

/**
 * Update a sale line (only inside an OPEN session).
 * - old inventory line → refund its units to stock (FIFO-consistent)
 * - new inventory line → FIFO consume + decrement stock
 * Manual lines never touch stock.
 */
async function update(id, { productId, manualText, quantity, unitPrice, paymentMethod }) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.sale.findUnique({
      where: { id },
      include: {
        session: true,
        items: { select: { id: true, productId: true, isManual: true, quantity: true, unitCost: true } },
      },
    });
    if (!existing) throw new AppError(404, 'Sale not found.', 'SALE_NOT_FOUND');
    if (existing.session.status !== 'open') {
      throw new AppError(409, 'This sale belongs to a closed day and cannot be edited.', 'SESSION_CLOSED');
    }

    const oldItem = existing.items[0]; // one line per sale in Blue Mobile

    // 1) Refund the OLD line's stock (if it was an inventory item)
    if (oldItem && !oldItem.isManual && oldItem.productId) {
      const oldProduct = await lockProduct(tx, oldItem.productId);
      await refundToStock(tx, oldItem.productId, oldItem.quantity, toNum(oldItem.unitCost));
      await tx.product.update({
        where: { id: oldItem.productId },
        data: { quantity: { increment: oldItem.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: oldItem.productId,
          type: 'sale_refund',
          quantity: oldItem.quantity,
          unitCost: toNum(oldItem.unitCost),
          saleId: id,
          note: `Refund on edit of sale ${existing.saleNumber}`,
        },
      });
    }

    // 2) Build the NEW line data
    let itemData;
    if (productId) {
      const product = await lockProduct(tx, productId);
      if (product.quantity < quantity) {
        throw new AppError(
          400,
          `Insufficient stock for this product (available: ${product.quantity}).`,
          'INSUFFICIENT_STOCK'
        );
      }
      const { unitCost } = await consumeFifo(tx, productId, quantity);
      const snapshot = await getProductSnapshot(tx, productId);
      const description = snapshot ? effectiveDescription(snapshot) : null;

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId,
          type: 'sale',
          quantity: -quantity,
          unitCost,
          saleId: id,
          note: `Sale on edit (${existing.saleNumber})`,
        },
      });

      itemData = {
        productId,
        productName: product.name,
        productBrand: (snapshot && snapshot.brand) || null,
        productDescription: description,
        isManual: false,
        quantity,
        unitCost,
      };
    } else {
      itemData = {
        productId: null,
        productName: manualText,
        productBrand: null,
        productDescription: null,
        isManual: true,
        quantity,
        unitCost: 0,
      };
    }

    const subtotal = mul(unitPrice, quantity);

    const updated = await tx.sale.update({
      where: { id },
      data: {
        totalAmount: subtotal,
        paymentMethod,
        items: {
          update: {
            where: { id: oldItem.id },
            data: { ...itemData, unitPrice, subtotal },
          },
        },
      },
      include: { items: { select: SALE_ITEM_SELECT } },
    });

    return serializeSale(updated);
  });
}

/**
 * Delete a sale line (only inside an OPEN session) — restores stock
 * for inventory items (FIFO-consistent refund), manual items untouched.
 */
async function remove(id) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.sale.findUnique({
      where: { id },
      include: {
        session: true,
        items: { select: { id: true, productId: true, isManual: true, quantity: true, unitCost: true } },
      },
    });
    if (!existing) throw new AppError(404, 'Sale not found.', 'SALE_NOT_FOUND');
    if (existing.session.status !== 'open') {
      throw new AppError(409, 'This sale belongs to a closed day and cannot be deleted.', 'SESSION_CLOSED');
    }

    const item = existing.items[0];
    if (item && !item.isManual && item.productId) {
      const product = await lockProduct(tx, item.productId);
      await refundToStock(tx, item.productId, item.quantity, toNum(item.unitCost));
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'sale_refund',
          quantity: item.quantity,
          unitCost: toNum(item.unitCost),
          saleId: id,
          note: `Refund on delete of sale ${existing.saleNumber}`,
        },
      });
    }

    await tx.saleItem.deleteMany({ where: { saleId: id } });
    await tx.sale.delete({ where: { id } });

    return { id };
  });
}

/** List sales of a session (defaults to the open session). */
async function list(sessionId) {
  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const open = await prisma.daySession.findFirst({ where: { status: 'open' } });
    targetSessionId = open ? open.id : null;
  }
  if (!targetSessionId) return [];

  const sales = await prisma.sale.findMany({
    where: { sessionId: targetSessionId },
    orderBy: { createdAt: 'asc' },
    include: { items: { select: SALE_ITEM_SELECT } },
  });
  return sales.map(serializeSale);
}

module.exports = { create, update, remove, list, serializeSale, serializeItem };
