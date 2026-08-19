#!/usr/bin/env node
/* ============================================================
   Blue Mobile — one-time migration of EXISTING localStorage data
   into PostgreSQL.

   Usage:
     1. In your old Blue Mobile app (browser console) export the data:
        copy(JSON.stringify({
          pos_products: JSON.parse(localStorage.getItem('pos_products') || '[]'),
          pos_currentSession: JSON.parse(localStorage.getItem('pos_currentSession') || 'null'),
          pos_reports: JSON.parse(localStorage.getItem('pos_reports') || '[]'),
          pos_customers: JSON.parse(localStorage.getItem('pos_customers') || '[]'),
          pos_saleCounter: localStorage.getItem('pos_saleCounter') || '0'
        }))
        → paste into data/export.json

     2. Run:  npm run import:localstorage -- ./data/export.json

   Refuses to run if the database already contains business data
   (pass --force to import anyway).
   ============================================================ */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const file = process.argv[2];
const force = process.argv.includes('--force');

if (!file) {
  console.error('✖ Usage: node scripts/import-localstorage.js <export.json> [--force]');
  process.exit(1);
}

function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function str(v) { return v == null ? null : String(v); }

async function main() {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  const productCount = await prisma.product.count();
  const sessionCount = await prisma.daySession.count();
  if ((productCount > 0 || sessionCount > 0) && !force) {
    console.error('✖ The database already contains data. Delete it first or re-run with --force.');
    process.exit(1);
  }

  // ---- products ----
  let importedProducts = 0;
  for (const p of data.pos_products || []) {
    const product = await prisma.product.create({
      data: {
        name: String(p.name || 'Unnamed'),
        barcode: str(p.barcode) || null,
        buyingPrice: num(p.wholesalePrice ?? p.buyingPrice),
        sellingPrice: num(p.sellingPrice),
        quantity: Math.max(0, parseInt(p.quantity, 10) || 0),
        category: String(p.category || 'Other Accessories'),
        brand: String(p.brand || ''),
        description: str(p.description) || null,
        wattage: str(p.wattage) || null,
        connectorType: str(p.connectorType) || null,
        imageUrl: str(p.image) || null,
        notes: str(p.notes) || null,
        minimumStock: parseInt(p.minimumStock, 10) || 5,
      },
    });
    // initial FIFO batch for imported stock
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
    importedProducts++;
  }
  console.log(`✔ Products: ${importedProducts} (with initial FIFO batches)`);

  // ---- customers + transactions ----
  let importedCustomers = 0, importedTx = 0;
  for (const c of data.pos_customers || []) {
    const customer = await prisma.customer.create({
      data: { name: String(c.name), phone: str(c.phone) || null, notes: str(c.notes) || null },
    });
    importedCustomers++;
    for (const tr of c.transactions || []) {
      await prisma.customerTransaction.create({
        data: {
          customerId: customer.id,
          type: tr.type === 'payment' ? 'payment' : 'credit',
          amount: num(tr.amount),
          note: str(tr.note) || null,
          createdAt: new Date(tr.time || Date.now()),
        },
      });
      importedTx++;
    }
  }
  console.log(`✔ Customers: ${importedCustomers}, transactions: ${importedTx}`);

  // ---- closed-day reports → closed sessions ----
  let importedReports = 0;
  for (const r of data.pos_reports || []) {
    const session = await prisma.daySession.create({
      data: {
        dayName: String(r.dayName || 'Day'),
        date: String(r.date || '1970-01-01').slice(0, 10),
        status: 'closed',
        openedAt: new Date(r.closedAt || Date.now()),
        closedAt: new Date(r.closedAt || Date.now()),
        createdAt: new Date(r.closedAt || Date.now()),
      },
    });
    importedReports++;
    await importSales(session.id, r.sales || []);
  }
  console.log(`✔ Closed days (reports): ${importedReports}`);

  // ---- current open session ----
  if (data.pos_currentSession) {
    const s = data.pos_currentSession;
    const session = await prisma.daySession.create({
      data: {
        dayName: String(s.dayName || 'Day'),
        date: String(s.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
        status: 'open',
        openedAt: new Date(s.startedAt || Date.now()),
        createdAt: new Date(s.startedAt || Date.now()),
      },
    });
    await importSales(session.id, s.sales || []);
    console.log('✔ Open day session imported (sales included).');
  }

  // ---- invoice counter ----
  const counterVal = parseInt(data.pos_saleCounter, 10) || 0;
  await prisma.counter.upsert({
    where: { id: 1 },
    update: { value: counterVal },
    create: { id: 1, value: counterVal },
  });
  console.log(`✔ Invoice counter set to ${counterVal} (next: INV-${String(counterVal + 1).padStart(5, '0')})`);

  console.log('✔ Import complete. Sign in with your admin account to see your data.');
}

async function importSales(sessionId, sales) {
  for (const sale of sales) {
    // localStorage sales reference products by NAME; link by name if it still exists
    const product = await prisma.product.findFirst({ where: { name: sale.product } });
    const productId = product ? product.id : null;

    const subtotal = Math.round(num(sale.sell) * num(sale.qty) * 100) / 100;
    const number = String(sale.invoice || '').startsWith('INV-') ? sale.invoice : null;

    await prisma.sale.create({
      data: {
        saleNumber: number || 'IMPORT-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
        sessionId,
        totalAmount: subtotal,
        paymentMethod: sale.payment === 'card' ? 'card' : 'cash',
        createdAt: new Date(sale.time || Date.now()),
        items: {
          create: {
            productId,
            productName: String(sale.product || 'Unknown'),
            quantity: Math.max(1, parseInt(sale.qty, 10) || 1),
            unitCost: num(sale.cost),
            unitPrice: num(sale.sell),
            subtotal,
            createdAt: new Date(sale.time || Date.now()),
          },
        },
      },
    });
  }
}

main()
  .catch((e) => { console.error('✖ Import failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
