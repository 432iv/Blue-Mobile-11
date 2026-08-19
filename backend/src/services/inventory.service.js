const AppError = require('../utils/AppError');
const { toNum, mul, add } = require('../utils/money');

/**
 * FIFO inventory costing over purchase batches.
 * Batches are consumed oldest-first; refunds go back to the
 * newest batch, which keeps FIFO order consistent.
 */

/**
 * Consume `quantity` units FIFO.
 * Returns the weighted-average unit cost of the consumed units.
 * Throws INSUFFICIENT_STOCK if the product cannot cover the quantity.
 */
async function consumeFifo(tx, productId, quantity) {
  const batches = await tx.purchaseBatch.findMany({
    where: { productId, remaining: { gt: 0 } },
    orderBy: [{ purchasedAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true, remaining: true, unitCost: true },
  });

  let remainingToConsume = quantity;
  let totalCost = 0;

  for (const batch of batches) {
    if (remainingToConsume <= 0) break;
    const take = Math.min(batch.remaining, remainingToConsume);
    totalCost = add(totalCost, mul(toNum(batch.unitCost), take));
    remainingToConsume -= take;
    await tx.purchaseBatch.update({
      where: { id: batch.id },
      data: { remaining: batch.remaining - take },
    });
  }

  if (remainingToConsume > 0) {
    throw new AppError(400, 'Insufficient stock for this product.', 'INSUFFICIENT_STOCK');
  }

  const unitCost = Math.round((totalCost / quantity) * 100) / 100;
  return { unitCost };
}

/**
 * Refund `quantity` units back into stock.
 * Units are returned to the NEWEST batch (reverse of FIFO), which
 * keeps FIFO ordering consistent. If no batch exists, a new batch
 * is created at the refunded unit cost.
 */
async function refundToStock(tx, productId, quantity, unitCost) {
  const latest = await tx.purchaseBatch.findFirst({
    where: { productId },
    orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true },
  });

  if (latest) {
    await tx.purchaseBatch.update({
      where: { id: latest.id },
      data: { remaining: { increment: quantity } },
    });
  } else {
    await tx.purchaseBatch.create({
      data: {
        productId,
        quantity,
        remaining: quantity,
        unitCost,
        purchasedAt: new Date(),
      },
    });
  }
}

/** Get the effective FIFO cost for a quantity (no consumption). */
async function peekFifoCost(tx, productId, quantity) {
  const batches = await tx.purchaseBatch.findMany({
    where: { productId, remaining: { gt: 0 } },
    orderBy: [{ purchasedAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    select: { remaining: true, unitCost: true },
  });
  let remainingToPeek = quantity;
  let totalCost = 0;
  for (const batch of batches) {
    if (remainingToPeek <= 0) break;
    const take = Math.min(batch.remaining, remainingToPeek);
    totalCost = add(totalCost, mul(toNum(batch.unitCost), take));
    remainingToPeek -= take;
  }
  if (remainingToPeek > 0) return null; // cannot be covered
  return Math.round((totalCost / quantity) * 100) / 100;
}

/** Effective display description of a product (description + specs). */
function effectiveDescription(product) {
  const parts = [];
  if (product.description) parts.push(product.description);
  if (product.wattage) parts.push(product.wattage);
  if (product.connectorType) parts.push(product.connectorType);
  if (product.compatibleModel) parts.push(`${product.compatibleModel.brand} ${product.compatibleModel.model}`);
  return parts.join(' · ') || null;
}

module.exports = { consumeFifo, refundToStock, peekFifoCost, effectiveDescription };
