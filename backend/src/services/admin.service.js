const prisma = require('../utils/prisma');

/**
 * "Clear All Data" (Settings → Clear Data).
 * Deletes all business data: sale items, sales, day sessions,
 * customers (+their transactions), products — and resets the
 * invoice counter. The admin account is preserved.
 */
async function clearAllData() {
  return prisma.$transaction(async (tx) => {
    await tx.saleItem.deleteMany({});
    await tx.sale.deleteMany({});
    await tx.daySession.deleteMany({});
    await tx.customer.deleteMany({});
    await tx.product.deleteMany({});
    await tx.counter.update({ where: { id: 1 }, data: { value: 0 } });
    return { cleared: true };
  });
}

module.exports = { clearAllData };
