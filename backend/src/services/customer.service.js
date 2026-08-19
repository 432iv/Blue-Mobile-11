const prisma = require('../utils/prisma');
const AppError = require('../utils/AppError');
const { toNum } = require('../utils/money');

const CUSTOMER_SELECT = {
  id: true,
  name: true,
  phone: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
};

/** Balance = Σ credit − Σ payment (computed, never stored). */
function balanceOf(transactions) {
  return transactions.reduce((sum, t) => {
    const amount = toNum(t.amount);
    return Math.round((sum + (t.type === 'credit' ? amount : -amount)) * 100) / 100;
  }, 0);
}

function serializeCustomer(c, includeTransactions = false) {
  const balance = balanceOf(c.transactions || []);
  const out = { ...c, balance };
  if (includeTransactions) {
    out.transactions = (c.transactions || [])
      .map((t) => ({ ...t, amount: toNum(t.amount) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return out;
}

async function list({ search = '' }) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { name: 'asc' },
    select: { ...CUSTOMER_SELECT, transactions: { select: { type: true, amount: true } } },
  });

  const result = customers.map((c) => serializeCustomer(c));
  const totalOwed = Math.round(result.reduce((s, c) => s + c.balance, 0) * 100) / 100;
  const totalCredit =
    Math.round(
      result.reduce(
        (s, c) => s + c.transactions.filter((t) => t.type === 'payment').reduce((ss, t) => ss + toNum(t.amount), 0),
        0
      ) * 100
    ) / 100;

  return {
    customers: result,
    summary: { count: result.length, totalOwed, totalCredit },
  };
}

async function getById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { ...CUSTOMER_SELECT, transactions: true },
  });
  if (!customer) throw new AppError(404, 'Customer not found.', 'CUSTOMER_NOT_FOUND');
  return serializeCustomer(customer, true);
}

async function create(data) {
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      notes: data.notes || null,
    },
    select: { ...CUSTOMER_SELECT, transactions: true },
  });
  return serializeCustomer(customer, true);
}

async function update(id, data) {
  await getById(id);
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
    },
    select: { ...CUSTOMER_SELECT, transactions: true },
  });
  return serializeCustomer(customer, true);
}

async function remove(id) {
  await getById(id);
  await prisma.customer.delete({ where: { id } });
  return { id };
}

/** Add a credit (customer owes the shop) or a payment (customer pays). */
async function addTransaction(id, { type, amount, note }) {
  const customer = await prisma.customer.findUnique({ where: { id }, select: { id: true } });
  if (!customer) throw new AppError(404, 'Customer not found.', 'CUSTOMER_NOT_FOUND');

  await prisma.customerTransaction.create({
    data: { customerId: id, type, amount, note: note || null },
  });

  return getById(id);
}

module.exports = { list, getById, create, update, remove, addTransaction, balanceOf };
