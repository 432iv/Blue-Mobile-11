const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');
const { toNum, mul } = require('../utils/money');
const { serializeSale } = require('./sale.service');

const SESSION_SELECT = {
  id: true,
  dayName: true,
  date: true,
  status: true,
  openedAt: true,
  closedAt: true,
  createdAt: true,
};

function serializeSession(s) {
  if (!s) return s;
  return {
    id: s.id,
    dayName: s.dayName,
    date: s.date,
    status: s.status,
    openedAt: s.openedAt,
    closedAt: s.closedAt,
    createdAt: s.createdAt,
  };
}

/** Compute totals for a session's sales (dynamic — never stored). */
async function computeSessionTotals(sessionId) {
  const sales = await prisma.sale.findMany({
    where: { sessionId },
    include: { items: true },
  });

  const totals = { sales: 0, cost: 0, profit: 0, cash: 0, card: 0, count: sales.length };
  for (const sale of sales) {
    let saleTotal = 0;
    for (const item of sale.items) {
      const lineSell = mul(toNum(item.unitPrice), item.quantity);
      const lineCost = mul(toNum(item.unitCost), item.quantity);
      totals.sales = Math.round((totals.sales + lineSell) * 100) / 100;
      totals.cost = Math.round((totals.cost + lineCost) * 100) / 100;
      totals.profit = Math.round((totals.profit + (lineSell - lineCost)) * 100) / 100;
      saleTotal = Math.round((saleTotal + lineSell) * 100) / 100;
    }
    if (sale.paymentMethod === 'cash') totals.cash = Math.round((totals.cash + saleTotal) * 100) / 100;
    else totals.card = Math.round((totals.card + saleTotal) * 100) / 100;
  }
  return totals;
}

/** Current open session, or null. */
async function getCurrent() {
  const session = await prisma.daySession.findFirst({
    where: { status: 'open' },
    orderBy: { openedAt: 'desc' },
  });
  return serializeSession(session);
}

/** Start a new day (fails if a day is already open). */
async function start({ dayName, date }) {
  const open = await prisma.daySession.findFirst({ where: { status: 'open' } });
  if (open) {
    throw new AppError(409, 'A day is already open. Close it before starting a new one.', 'DAY_ALREADY_OPEN');
  }
  const session = await prisma.daySession.create({
    data: { dayName, date, status: 'open', openedAt: new Date() },
  });
  return serializeSession(session);
}

/**
 * Close the open day → returns the final report (computed).
 * The report is NOT stored separately; it is derived from the
 * closed session + its sales whenever reports are requested.
 */
async function close() {
  const session = await prisma.daySession.findFirst({
    where: { status: 'open' },
    orderBy: { openedAt: 'desc' },
  });
  if (!session) {
    throw new AppError(400, 'No day is open to close.', 'NO_OPEN_SESSION');
  }

  const totals = await computeSessionTotals(session.id);

  const closed = await prisma.daySession.update({
    where: { id: session.id },
    data: { status: 'closed', closedAt: new Date() },
  });

  const sales = await prisma.sale.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    include: { items: true },
  });

  const notes = await prisma.dailyNote.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
  });

  return {
    ...serializeSession(closed),
    totals,
    sales: sales.map(serializeSale),
    notes,
  };
}

module.exports = { getCurrent, start, close, computeSessionTotals, serializeSession };
