#!/usr/bin/env node
/* ============================================================
   Blue Mobile — Seed script
   Creates the SINGLE admin account (no registration exists).
   Credentials come from environment variables:
     ADMIN_USERNAME  (default "admin")
     ADMIN_PASSWORD  (REQUIRED — never hard-code a real password)
   If ADMIN_PASSWORD is missing, the script prompts interactively.

   Idempotent: if a user already exists it is left untouched
   (unless ADMIN_RESET_PASSWORD=true is set).
   In development (NODE_ENV !== "production") a small set of demo
   products is seeded when the products table is empty, to mirror
   the original app's first-run experience. Set
   SEED_DEMO_PRODUCTS=true to force it in production too.
   ============================================================ */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

require('dotenv').config();

const prisma = new PrismaClient();

function ask(question, hidden = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  if (hidden) {
    // crude masking: print nothing. Good enough for a setup prompt.
  }
  return new Promise((resolve) => {
    rl.question(question + ' ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  let password = process.env.ADMIN_PASSWORD || '';
  const isProduction = process.env.NODE_ENV === 'production';

  const existing = await prisma.user.findFirst();

  if (existing) {
    if (process.env.ADMIN_RESET_PASSWORD === 'true') {
      if (!password) {
        if (isProduction) {
          console.error('✖ ADMIN_PASSWORD is required (production). Set it in your hosting environment, then re-run the seed.');
          process.exit(1);
        }
        password = await ask(`New password for "${existing.username}":`, true);
      }
      if (password.length < 8) {
        console.error('✖ Password must be at least 8 characters.');
        process.exit(1);
      }
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { username, passwordHash: hash },
      });
      await prisma.authSession.updateMany({
        where: { revokedAt: null },
        data: { revokedAt: new Date() },
      });
      console.log(`✔ Admin "${username}" updated (password reset, all sessions revoked).`);
    } else {
      console.log(`ℹ Admin account already exists ("${existing.username}") — skipping.`);
      console.log(`  To reset it, re-run with ADMIN_RESET_PASSWORD=true and ADMIN_PASSWORD set.`);
    }
    return;
  }

  if (!password) {
    if (isProduction) {
      console.error(
        '✖ ADMIN_PASSWORD is required to create the admin account.\n' +
          '  Set ADMIN_USERNAME and ADMIN_PASSWORD in your hosting environment, then re-run: npm run seed'
      );
      process.exit(1);
    }
    password = await ask('Choose the admin password (min 8 chars):', true);
  }
  if (password.length < 8) {
    console.error('✖ Password must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { username, passwordHash } });
  console.log(`✔ Admin account created — username: "${username}" (password stored as bcrypt hash).`);
}

async function ensureCounter() {
  const counter = await prisma.counter.findUnique({ where: { id: 1 } });
  if (!counter) {
    await prisma.counter.create({ data: { id: 1, value: 0 } });
    console.log('✔ Invoice counter initialized (next invoice: INV-00001).');
  }
}

const DEMO_PRODUCTS = [
  { name: 'Charging Cable', category: 'Cables', brand: '', buyingPrice: 5, sellingPrice: 12, quantity: 50, description: 'USB → Type-C', connectorType: 'USB → Type-C' },
  { name: 'Phone Charger', category: 'Chargers', brand: '', buyingPrice: 8, sellingPrice: 20, quantity: 30, description: 'Fast charge', wattage: '20W' },
  { name: 'Wireless Charger', category: 'Chargers', brand: '', buyingPrice: 15, sellingPrice: 35, quantity: 20, description: 'Qi wireless pad', wattage: '15W' },
  { name: 'Phone Case', category: 'Phone Cases', brand: '', buyingPrice: 3, sellingPrice: 10, quantity: 40, description: 'Silicone, transparent', compatibleModel: { brand: 'Samsung', model: 'Galaxy A55' } },
  { name: 'Power Bank', category: 'Power Banks', brand: '', buyingPrice: 20, sellingPrice: 45, quantity: 15, description: '10,000 mAh' },
  { name: 'Earphones', category: 'Bluetooth Earphones', brand: '', buyingPrice: 7, sellingPrice: 18, quantity: 25, description: 'TWS, in-ear' },
  { name: 'Screen Protector', category: 'Screen Protectors', brand: '', buyingPrice: 2, sellingPrice: 8, quantity: 60, description: 'Tempered glass', compatibleModel: { brand: 'Apple', model: 'iPhone 15' } },
];

async function ensureDemoProducts() {
  const force = process.env.SEED_DEMO_PRODUCTS === 'true';
  const isDev = process.env.NODE_ENV !== 'production';
  if (!force && !isDev) return;

  const count = await prisma.product.count();
  if (count > 0) return;

  for (const p of DEMO_PRODUCTS) {
    let compatibleModelId = null;
    if (p.compatibleModel) {
      const model = await prisma.deviceModel.upsert({
        where: { brand_model: { brand: p.compatibleModel.brand, model: p.compatibleModel.model } },
        update: {},
        create: { brand: p.compatibleModel.brand, model: p.compatibleModel.model },
      });
      compatibleModelId = model.id;
    }
    const { compatibleModel, ...data } = p;
    const product = await prisma.product.create({
      data: { ...data, imageUrl: null, notes: null, barcode: null, minimumStock: 5, compatibleModelId },
    });
    await prisma.purchaseBatch.create({
      data: { productId: product.id, quantity: product.quantity, remaining: product.quantity, unitCost: product.buyingPrice },
    });
  }
  console.log(`✔ Seeded ${DEMO_PRODUCTS.length} demo products (development first-run experience).`);
}

/**
 * Backfill: every product with stock but WITHOUT purchase batches gets
 * one initial batch at its current buying price, so FIFO costing works
 * for pre-existing inventory (incl. data imported from localStorage).
 */
async function ensureInitialBatches() {
  const products = await prisma.product.findMany({
    where: { quantity: { gt: 0 } },
    select: { id: true, quantity: true, buyingPrice: true, createdAt: true },
  });
  let created = 0;
  for (const p of products) {
    const batchCount = await prisma.purchaseBatch.count({ where: { productId: p.id } });
    if (batchCount === 0) {
      await prisma.purchaseBatch.create({
        data: {
          productId: p.id,
          quantity: p.quantity,
          remaining: p.quantity,
          unitCost: p.buyingPrice,
          purchasedAt: p.createdAt,
          createdAt: p.createdAt,
        },
      });
      created++;
    }
  }
  if (created > 0) console.log(`✔ Created ${created} initial purchase batch(es) for existing stock (FIFO).`);
}

async function main() {
  await ensureAdmin();
  await ensureCounter();
  await ensureDemoProducts();
  await ensureInitialBatches();
  console.log('✔ Seed complete.');
}

main()
  .catch((e) => {
    console.error('✖ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
