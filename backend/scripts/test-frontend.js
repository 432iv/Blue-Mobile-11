#!/usr/bin/env node
/* ============================================================
   Blue Mobile — FRONTEND SMOKE TEST (jsdom)
   Loads the real frontend (index.html + js/api.js + js/app.js),
   injects a cookie-aware fetch, and drives the actual UI:
   login → dashboard → products CRUD → day session → sale
   record/edit → close day → reports tabs → customers + credit
   → change password → logout.

   Prereq: the backend must be running on PORT (default 4000)
   with a freshly seeded database (admin / BlueMobile@2026!).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:4000';
const ADMIN_USER = process.env.TEST_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.TEST_ADMIN_PASS || 'BlueMobile@2026!';

const FRONTEND = path.join(__dirname, '..', '..', 'frontend');
const html = fs.readFileSync(path.join(FRONTEND, 'index.html'), 'utf8')
  .replace('<script src="js/api.js"></script>', '')
  .replace('<script src="js/app.js"></script>', '');
const apiJs = fs.readFileSync(path.join(FRONTEND, 'js', 'api.js'), 'utf8');
const appJs = fs.readFileSync(path.join(FRONTEND, 'js', 'app.js'), 'utf8');

let PASS = 0, FAIL = 0;
const errors = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function ok(cond, msg) {
  if (cond) { PASS++; console.log('  ✔ ' + msg); }
  else { FAIL++; console.log('  ✖ ' + msg); }
}

/* ---------------- cookie-aware fetch (same-origin jar) ---------------- */
const jar = new Map(); // name -> value
async function cookieFetch(input, init = {}) {
  const url = new URL(input, BASE).href;
  const headers = new Headers(init.headers || {});
  const cookie = [...jar.entries()].map(([k, v]) => k + '=' + v).join('; ');
  if (cookie) headers.set('Cookie', cookie);
  const res = await fetch(url, { ...init, headers, redirect: 'follow' });
  let setCookies = [];
  try { setCookies = res.headers.getSetCookie(); } catch (e) { /* old node */ }
  for (const sc of setCookies) {
    const [pair] = sc.split(';');
    const eq = pair.indexOf('=');
    if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return res;
}

/* ---------------- helpers ---------------- */
async function waitFor(fn, what, timeout = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    try { const v = fn(); if (v) return v; } catch (e) { /* keep polling */ }
    await sleep(100);
  }
  throw new Error('TIMEOUT waiting for: ' + what);
}

const $ = (dom, sel) => dom.window.document.querySelector(sel);
const $$ = (dom, sel) => [...dom.window.document.querySelectorAll(sel)];
const text = (dom, id) => dom.window.document.getElementById(id).textContent;
const click = (dom, el) => el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
const input = (dom, id, value) => {
  const el = dom.window.document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
};
const change = (dom, id) => {
  const el = dom.window.document.getElementById(id);
  el.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
};
const submit = (dom, formSel) => {
  $(dom, formSel).dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
};
// select a product in the autocomplete combobox like a real user:
// type its name → dropdown appears → click the matching item
async function pickSaleProduct(dom, productName, qty) {
  input(dom, 'sale-search', productName);
  await sleep(80);
  const item = $$(dom, '#sale-search-list [data-sale-product]').find((el) =>
    el.textContent.includes(productName)
  );
  if(!item) throw new Error('product not found in autocomplete: ' + productName);
  click(dom, item);
  await sleep(50);
  input(dom, 'sale-qty', String(qty));
  await sleep(30);
}
// select a manual/service item by typing free text and choosing the manual option
async function pickManualItem(dom, text, qty, price) {
  input(dom, 'sale-search', text);
  await sleep(80);
  const item = $(dom, '#sale-search-list [data-sale-manual]');
  if(!item) throw new Error('manual option not found for: ' + text);
  click(dom, item);
  await sleep(50);
  input(dom, 'sale-qty', String(qty));
  input(dom, 'sale-sell', String(price));
  await sleep(30);
}
const saleRows = (dom) => $$(dom, '#sales-tbody tr').filter((tr) => tr.textContent.includes('INV-'));

/* ---------------- boot the app ---------------- */
async function main() {
  const virtualConsole = new VirtualConsole(); // silence "not implemented" noise
  const dom = new JSDOM(html, {
    url: BASE + '/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.fetch = cookieFetch;
      window.confirm = () => true;
      // jsdom does not implement scrollIntoView (browsers do)
      window.HTMLElement.prototype.scrollIntoView = function () {};
      window.addEventListener('error', (e) => errors.push(e.error || e.message));
    },
  });
  dom.window.eval(apiJs);
  dom.window.eval(appJs);

  console.log('== Frontend loads ==');
  await waitFor(() => $(dom, '#login-screen').classList.contains('active'), 'login screen shown (no session → redirect)');
  ok(true, 'app booted → redirected to login screen (unauthenticated)');

  console.log('== Login ==');
  input(dom, 'login-username', ADMIN_USER);
  input(dom, 'login-password', ADMIN_PASS);
  submit(dom, '#login-form');
  await waitFor(() => $(dom, '#app').style.display === 'flex', 'app visible after login');
  ok(true, 'login succeeds → app visible');

  console.log('== Dashboard (server data) ==');
  await waitFor(() => text(dom, 'stat-total-products') !== '', 'dashboard stats populated');
  ok(text(dom, 'stat-total-products') === '7', 'total products = 7 (seed)');
  ok(text(dom, 'stat-sales') === '0.00', 'today sales = 0.00');
  ok(text(dom, 'stat-low-stock') === '0', 'low stock count rendered');
  ok(text(dom, 'session-pill-text') === 'No day open', 'session pill shows "No day open"');

  console.log('== Products ==');
  click(dom, $(dom, '[data-nav="products"]'));
  await waitFor(() => $$(dom, '.product-card').length === 7, 'product cards render');
  ok($$(dom, '.product-card').length === 7, '7 product cards rendered');

  click(dom, $(dom, '#add-product-btn'));
  await waitFor(() => $(dom, '#modal-product').classList.contains('active'), 'product modal opens');
  input(dom, 'product-name-input', 'Smoke Test Cable');
  input(dom, 'product-category-input', 'Cables');
  change(dom, 'product-category-input'); // Cables type → connector field visible
  ok($(dom, '#field-product-connector').style.display !== 'none', 'cable type shows connector field');
  input(dom, 'product-connector-input', 'USB → Type-C');
  input(dom, 'product-description-input', 'Fast charging cable');
  input(dom, 'product-qty-input', '3'); // deliberately below minimum stock (5) → low-stock report
  input(dom, 'product-wholesale-input', '4');
  input(dom, 'product-selling-input', '11');
  input(dom, 'product-barcode-input', 'SMOKE-1');
  submit(dom, '#product-form');
  await waitFor(() => $$(dom, '.product-card').length === 8, 'product added via API');
  ok($$(dom, '.product-card').length === 8, 'product persisted via API (8 cards)');

  console.log('== Sales: start day ==');
  click(dom, $(dom, '[data-nav="sales"]'));
  await waitFor(() => $(dom, '#sales-guard').style.display === 'flex', 'sales guard visible (no open day)');
  click(dom, $(dom, '#guard-start-day-btn'));
  await waitFor(() => $(dom, '#modal-startday').classList.contains('active'), 'start-day modal opens');
  input(dom, 'day-name-input', 'Smoke Saturday');
  input(dom, 'day-date-input', '2026-08-16');
  submit(dom, '#startday-form');
  await waitFor(() => $(dom, '#sales-active-wrap').style.display === 'block', 'sale form active after starting day');
  ok(true, 'day started → sale form active');
  ok(text(dom, 'session-pill-text').includes('Smoke Saturday'), 'session pill shows open day');

  console.log('== Sales: autocomplete search + record + edit + delete ==');
  const firstProd = (await (await cookieFetch(BASE + '/api/products')).json()).products[0];
  const P = Number(firstProd.sellingPrice); // dynamic expected price
  await pickSaleProduct(dom, firstProd.name, 2);
  submit(dom, '#sale-form');
  await waitFor(() => saleRows(dom).length === 1, 'real sale row appears');
  ok(saleRows(dom).length === 1, 'sale recorded → row with invoice in table');
  ok(text(dom, 'sales-tbody').includes(firstProd.name), 'sale row shows product name');

  // dashboard reflects server-side totals (2 × P)
  const dashRes = await cookieFetch(BASE + '/api/dashboard/summary');
  const dash = await dashRes.json();
  ok(dash.summary.today.count === 1 && Math.abs(dash.summary.today.sales - 2 * P) < 0.001,
    `backend totals: count=1 sales=${(2 * P).toFixed(2)} (got count=${dash.summary.today.count} sales=${dash.summary.today.sales})`);

  // edit sale → qty 3
  click(dom, $(dom, '.edit-btn'));
  await sleep(100);
  input(dom, 'sale-qty', '3');
  submit(dom, '#sale-form');
  await sleep(700);
  const dash2 = await (await cookieFetch(BASE + '/api/dashboard/summary')).json();
  ok(Math.abs(dash2.summary.today.sales - 3 * P) < 0.001, `edit sale → totals = ${(3 * P).toFixed(2)} (got ${dash2.summary.today.sales})`);

  // delete sale → totals back to 0
  click(dom, $(dom, '.del-btn'));
  await waitFor(() => saleRows(dom).length === 0, 'sale row removed');
  const dash3 = await (await cookieFetch(BASE + '/api/dashboard/summary')).json();
  ok(dash3.summary.today.count === 0, 'delete sale → count 0, stock restored');

  console.log('== Sales: manual (service) items ==');
  await pickManualItem(dom, 'Software installation', 1, 25);
  submit(dom, '#sale-form');
  await waitFor(() => saleRows(dom).length === 1, 'manual sale row appears');
  ok(text(dom, 'sales-tbody').includes('Software installation'), 'manual item row shown');
  const dashM = await (await cookieFetch(BASE + '/api/dashboard/summary')).json();
  ok(Math.abs(dashM.summary.today.sales - 25) < 0.001, `manual item in totals (25) got ${dashM.summary.today.sales}`);
  const stockBefore = (await (await cookieFetch(BASE + '/api/products')).json()).products
    .find((p) => p.id === firstProd.id).quantity;
  ok(stockBefore === Number(firstProd.quantity), 'manual item did NOT touch inventory');
  // delete the manual sale to keep totals predictable
  click(dom, $(dom, '.del-btn'));
  await waitFor(() => saleRows(dom).length === 0, 'manual sale removed');

  console.log('== Sales: daily notes ==');
  input(dom, 'note-input', 'Gave my brother 100 LYD');
  click(dom, $(dom, '#note-add-btn'));
  await waitFor(() => text(dom, 'daily-notes-list').includes('Gave my brother'), 'note appears in list');
  ok(text(dom, 'daily-notes-list').includes('Gave my brother 100 LYD'), 'daily note added via API');

  console.log('== Sales: record 2 sales, close day ==');
  await pickSaleProduct(dom, firstProd.name, 1);
  submit(dom, '#sale-form');
  await waitFor(() => saleRows(dom).length === 1, 'sale re-recorded');
  await pickSaleProduct(dom, firstProd.name, 4);
  submit(dom, '#sale-form');
  await waitFor(() => saleRows(dom).length === 2, 'second sale recorded');

  click(dom, $(dom, '#close-day-btn'));
  await waitFor(() => $(dom, '#modal-closeday').classList.contains('active'), 'close-day confirm modal');
  click(dom, $(dom, '#confirm-close-day-btn'));
  await waitFor(() => $(dom, '#modal-finalreport').classList.contains('active'), 'final report modal');
  const reportBody = text(dom, 'final-report-body');
  ok(reportBody.includes((5 * P).toFixed(2)), `final report total = ${(5 * P).toFixed(2)} (1×P + 4×P)`);
  ok(reportBody.includes('Smoke Saturday'), 'final report shows day name');
  ok(reportBody.includes('Gave my brother 100 LYD'), 'final report includes daily notes');

  console.log('== Reports (server-computed) ==');
  click(dom, $(dom, '[data-nav="reports"]'));
  await waitFor(() => $$(dom, '.report-card').length === 1, 'daily report card');
  ok($$(dom, '.report-card').length === 1, '1 closed-day report card');

  click(dom, $(dom, '[data-tab="monthly"]'));
  await waitFor(() => text(dom, 'report-tab-monthly').includes('2026-08'), 'monthly summary loaded');
  ok(text(dom, 'report-tab-monthly').includes((5 * P).toFixed(2)), `monthly shows ${(5 * P).toFixed(2)}`);

  click(dom, $(dom, '[data-tab="best-sellers"]'));
  await waitFor(() => text(dom, 'report-tab-best-sellers').includes(firstProd.name), 'best sellers loaded');
  ok(true, 'best sellers shows the sold product');

  click(dom, $(dom, '[data-tab="low-stock"]'));
  await waitFor(() => $$(dom, '#report-tab-low-stock .low-stock-item').length > 0, 'low stock loaded');
  ok($$(dom, '#report-tab-low-stock .low-stock-item').length >= 1, 'low stock list rendered');

  console.log('== Customers + credit ==');
  click(dom, $(dom, '[data-nav="customers"]'));
  await waitFor(() => $(dom, '#customer-grid') !== null, 'customers page');
  click(dom, $(dom, '#add-customer-btn'));
  await waitFor(() => $(dom, '#modal-customer').classList.contains('active'), 'customer modal');
  input(dom, 'customer-name-input', 'Smoke Customer');
  input(dom, 'customer-phone-input', '0911111111');
  submit(dom, '#customer-form');
  await waitFor(() => $$(dom, '.customer-card').length === 1, 'customer card');
  ok($$(dom, '.customer-card').length === 1, 'customer persisted via API');

  dom.window.prompt = () => '150';
  click(dom, $(dom, '.customer-detail-btn'));
  await waitFor(() => $(dom, '#modal-customer-detail').classList.contains('active'), 'customer detail modal');
  click(dom, $(dom, '#customer-add-debt-btn'));
  await waitFor(() => $$(dom, '.debt-row').length === 1, 'credit transaction row');
  ok($$(dom, '.debt-row').length === 1, 'credit transaction recorded via API');

  console.log('== Settings: change password ==');
  click(dom, $(dom, '[data-nav="settings"]'));
  await waitFor(() => $(dom, '#account-username').textContent.includes('admin'), 'account row shows username');
  ok($(dom, '#account-username').textContent.includes('admin'), 'account username displayed');

  click(dom, $(dom, '#change-password-btn'));
  await waitFor(() => $(dom, '#modal-changepassword').classList.contains('active'), 'change-password modal');
  input(dom, 'cp-current', 'WRONG');
  input(dom, 'cp-new', 'SmokeNew@123');
  input(dom, 'cp-confirm', 'SmokeNew@123');
  submit(dom, '#change-password-form');
  await sleep(500);
  ok($(dom, '#modal-changepassword').classList.contains('active'), 'wrong current password rejected (modal stays open)');

  input(dom, 'cp-current', ADMIN_PASS);
  submit(dom, '#change-password-form');
  await waitFor(() => !$(dom, '#modal-changepassword').classList.contains('active'), 'modal closes on success');
  ok(true, 'password changed successfully');

  // re-login with the new password
  click(dom, $(dom, '#logout-btn'));
  await waitFor(() => $(dom, '#login-screen').classList.contains('active'), 'back to login after logout');
  ok(true, 'logout returns to login screen');
  input(dom, 'login-username', ADMIN_USER);
  input(dom, 'login-password', 'SmokeNew@123');
  submit(dom, '#login-form');
  await waitFor(() => $(dom, '#app').style.display === 'flex', 'login with new password');
  ok(true, 'login works with the NEW password');

  // restore original password for repeatability
  click(dom, $(dom, '#logout-btn'));
  await waitFor(() => $(dom, '#login-screen').classList.contains('active'), 'logout again');
  input(dom, 'login-username', ADMIN_USER);
  input(dom, 'login-password', 'SmokeNew@123');
  submit(dom, '#login-form');
  await waitFor(() => $(dom, '#app').style.display === 'flex', 'relogin');
  click(dom, $(dom, '[data-nav="settings"]'));
  await waitFor(() => $(dom, '#change-password-btn') !== null, 'settings');
  click(dom, $(dom, '#change-password-btn'));
  await waitFor(() => $(dom, '#modal-changepassword').classList.contains('active'), 'modal');
  input(dom, 'cp-current', 'SmokeNew@123');
  input(dom, 'cp-new', ADMIN_PASS);
  input(dom, 'cp-confirm', ADMIN_PASS);
  submit(dom, '#change-password-form');
  await waitFor(() => !$(dom, '#modal-changepassword').classList.contains('active'), 'password restored');
  ok(true, 'original password restored');

  ok(errors.length === 0, 'no uncaught JavaScript errors: ' + (errors.length ? errors.join(' | ') : ''));

  console.log('\n========================================');
  console.log(`FRONTEND SMOKE TEST: ${PASS} passed, ${FAIL} failed`);
  console.log('========================================');
  process.exit(FAIL === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('✖ Smoke test crashed:', err.message);
  process.exit(1);
});
