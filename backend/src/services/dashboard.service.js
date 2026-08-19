const prisma = require('../utils/prisma');
const { toNum, mul } = require('../utils/money');
const { computeSessionTotals } = require('./session.service');
const { serializeSession } = require('./session.service');

/**
 * Everything the Blue Mobile dashboard renders, computed live:
 *  - open day session totals (today's sales/cost/profit/count/cash/card)
 *  - product stats (total products, total stock, low stock, inventory value)
 *  - recent activity (last 6 sales of the open day)
 */
async function summary() {
  const session = await prisma.daySession.findFirst({
    where: { status: 'open' },
    orderBy: { openedAt: 'desc' },
  });

  let totals = { sales: 0, cost: 0, profit: 0, cash: 0, card: 0, count: 0 };
  let recent = [];

  if (session) {
    totals = await computeSessionTotals(session.id);

    const recentSales = await prisma.sale.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: true },
    });
    recent = recentSales.flatMap((sale) =>
      sale.items.map((item) => ({
        id: item.id,
        saleId: sale.id,
        productName: item.productName,
        quantity: item.quantity,
        amount: mul(toNum(item.unitPrice), item.quantity),
        createdAt: sale.createdAt,
      }))
    );
  }

  const products = await prisma.product.findMany({
    select: { quantity: true, buyingPrice: true, minimumStock: true },
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.quantity, 0);
  const lowStock = products.filter((p) => p.quantity <= p.minimumStock).length;
  const inventoryValue =
    Math.round(products.reduce((s, p) => s + mul(toNum(p.buyingPrice), p.quantity), 0) * 100) / 100;

  return {
    today: totals,
    products: { totalProducts, totalStock, lowStock, inventoryValue },
    session: serializeSession(session),
    recent,
  };
}

module.exports = { summary };
