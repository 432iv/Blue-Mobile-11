const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');
const { toNum, mul } = require('../utils/money');
const { serializeSale } = require('./sale.service');
const { computeSessionTotals } = require('./session.service');

const SESSION_SELECT = {
  id: true,
  dayName: true,
  date: true,
  status: true,
  openedAt: true,
  closedAt: true,
  createdAt: true,
};

/** Closed-day reports with computed totals, optionally filtered by date range. */
async function list({ from = '', to = '' }) {
  const where = { status: 'closed' };
  if (from && to) where.date = { gte: from, lte: to };
  else if (from) where.date = { gte: from };
  else if (to) where.date = { lte: to };

  const sessions = await prisma.daySession.findMany({
    where,
    orderBy: { date: 'desc' },
    select: SESSION_SELECT,
  });

  const reports = [];
  for (const session of sessions) {
    const totals = await computeSessionTotals(session.id);
    reports.push({ ...session, totals });
  }
  return reports;
}

/** One closed day: session + totals + every sale line + daily notes. */
async function detail(id) {
  const session = await prisma.daySession.findUnique({
    where: { id },
    select: {
      ...SESSION_SELECT,
      sales: { include: { items: true }, orderBy: { createdAt: 'asc' } },
      notes: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!session) throw new AppError(404, 'Report not found.', 'REPORT_NOT_FOUND');

  const totals = await computeSessionTotals(session.id);
  return {
    ...session,
    totals,
    sales: session.sales.map(serializeSale),
  };
}

/** Monthly summary — aggregates closed days by YYYY-MM. */
async function monthly() {
  const sessions = await prisma.daySession.findMany({
    where: { status: 'closed' },
    select: { id: true, date: true },
  });

  const months = {};
  for (const s of sessions) {
    const key = String(s.date).slice(0, 7);
    if (!key) continue;
    if (!months[key]) months[key] = { sales: 0, cost: 0, profit: 0, count: 0 };
    const totals = await computeSessionTotals(s.id);
    months[key].sales = Math.round((months[key].sales + totals.sales) * 100) / 100;
    months[key].cost = Math.round((months[key].cost + totals.cost) * 100) / 100;
    months[key].profit = Math.round((months[key].profit + totals.profit) * 100) / 100;
    months[key].count += totals.count;
  }

  return Object.entries(months)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, totals]) => ({ month, ...totals }));
}

/** Best sellers — aggregated across all closed days, by product name snapshot. */
async function bestSellers() {
  const closedSessions = await prisma.daySession.findMany({ where: { status: 'closed' }, select: { id: true } });
  if (closedSessions.length === 0) return [];

  const items = await prisma.saleItem.findMany({
    where: { sale: { sessionId: { in: closedSessions.map((s) => s.id) } } },
  });

  const map = {};
  for (const item of items) {
    if (!map[item.productName]) {
      map[item.productName] = { name: item.productName, qty: 0, revenue: 0, profit: 0 };
    }
    const lineSell = mul(toNum(item.unitPrice), item.quantity);
    const lineCost = mul(toNum(item.unitCost), item.quantity);
    map[item.productName].qty += item.quantity;
    map[item.productName].revenue = Math.round((map[item.productName].revenue + lineSell) * 100) / 100;
    map[item.productName].profit = Math.round((map[item.productName].profit + (lineSell - lineCost)) * 100) / 100;
  }

  return Object.values(map).sort((a, b) => b.profit - a.profit);
}

/** Low stock — quantity at or below the minimum stock alert (incl. zero). */
async function lowStock() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      brand: true,
      quantity: true,
      minimumStock: true,
      buyingPrice: true,
      sellingPrice: true,
    },
  });

  return products
    .filter((p) => p.quantity <= p.minimumStock)
    .sort((a, b) => a.quantity - b.quantity)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      quantity: p.quantity,
      minimumStock: p.minimumStock,
      buyingPrice: toNum(p.buyingPrice),
      sellingPrice: toNum(p.sellingPrice),
    }));
}

module.exports = { list, detail, monthly, bestSellers, lowStock };
