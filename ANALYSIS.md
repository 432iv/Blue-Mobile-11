# Blue Mobile — Project Analysis & Backend Design

*Prepared before implementation. Based on a full review of the existing `Blue-Mobile.html` single-file application (2,618 lines).*

---

## 1. What the existing application is

Blue Mobile is a **single-file vanilla JS POS** for a mobile phone & accessories shop.
All data lives in `localStorage`. There is **no backend, no authentication, no network calls**.

### Pages / sections (sidebar navigation)
| Section | Functionality |
|---|---|
| **Dashboard** | 8 stat cards (Today's Sales, Today's Cost, Today's Profit, # of Sales, Total Products, Total in Stock, Low Stock count, Inventory Value), Recent Activity list, Day Status panel |
| **Products** | Search box, category filter, brand filter, product cards (image, name, category, brand, stock badge, wholesale + selling price), Add/Edit/Delete product modal (name, category, brand, qty, wholesale price, selling price, image URL, notes, barcode with camera scan, minimum stock) |
| **Sales** | Day-session lifecycle: **Start New Day** (day name + date) → **New Sale** form (product, qty, cost, sell, cash/card payment, profit preview, live clock) → **Today's Sales** table (invoice, product, qty, cost, sell, profit, payment, time, edit/delete) → **Live Summary** (count, total, cost, profit, cash, card) → **Close Day** (locks the day, shows final receipt report) |
| **Reports** | 4 tabs: **Daily Reports** (closed days, click → day details), **Monthly Summary** (grouped by YYYY-MM), **Best Sellers** (qty/revenue/profit per product), **Low Stock** |
| **Customers** | Search, Add/Edit/Delete (name, phone, notes), summary cards (customer count, total owed, total credit), customer cards with live balance, detail modal with **Add Credit / Record Payment** + transaction history |
| **Scanner** | Html5Qrcode camera scanner + manual barcode entry → product lookup by barcode |
| **Settings** | Language (en/ar), Theme (dark/light), **Clear All Data** |

### localStorage keys and their data
| Key | Data |
|---|---|
| `pos_products` | `[{ id, name, category, brand, quantity, wholesalePrice, sellingPrice, image, notes, barcode, minimumStock }]` |
| `pos_currentSession` | open day `{ id, dayName, date, startedAt, sales: [...] }` or `null` |
| `pos_reports` | closed days `[{ id, dayName, date, closedAt, totals: {sales,cost,profit,cash,card,count}, sales: [...] }]` |
| `pos_customers` | `[{ id, name, phone, notes, transactions: [{ type: credit\|payment, amount, note, time }] }]` |
| `pos_saleCounter` | invoice counter (INV-00001 …) |
| `pos_theme`, `pos_lang` | UI preferences |
| `pos_seeded` | first-run demo products flag |

### Business rules discovered
- A sale **only exists inside an open day session**; "today" = the open session.
- Sale = one product line: invoice number, qty, cost, sell, payment (cash/card), time.
- **Inventory decrements on sale, is restored on sale edit/delete** (old product restored, new deducted); insufficient stock blocks the sale.
- Closing a day: totals computed from session sales, session is cleared, report is saved. Reports are historical; editing sales is only possible while the day is open.
- Customer balance = Σ credit − Σ payment (credit = debt owed to the shop).
- Profit per line = (sell − cost) × qty.

## 2. What moves from localStorage → PostgreSQL
- `pos_products` → `products` table
- `pos_currentSession` → `day_sessions` (status `open`) + `sales` + `sale_items`
- `pos_reports` → **not stored as snapshots** — derived dynamically from `day_sessions` (status `closed`) + `sales` + `sale_items` (per requirement: reports computed from the DB)
- `pos_customers` → `customers` + `customer_transactions`
- `pos_saleCounter` → `counters` table (single row, incremented inside the sale transaction)
- `pos_theme` / `pos_lang` → **stay in localStorage**: they are purely cosmetic client preferences (standard practice even in production apps); they contain no business data
- `pos_seeded` demo products → optional, controlled by the seed script (dev only by default)

## 3. Recommended database structure (Prisma)

```
users                 — single admin (username, password_hash)
auth_sessions         — server-side sessions (jti, expires_at, revoked_at) → real logout & revocation
products              — name, barcode (unique), buying_price, selling_price, quantity,
                         category, brand, image_url, notes, minimum_stock
day_sessions          — day_name, date, status (open|closed), opened_at, closed_at
sales                 — sale_number (INV-00001, unique), session_id, customer_id?, total_amount, payment_method
sale_items            — sale_id, product_id (nullable→SetNull on delete), product_name (snapshot),
                         quantity, unit_cost (snapshot), unit_price (snapshot), subtotal
customers             — name, phone, notes
customer_transactions — customer_id, type (credit|payment), amount, note
counters              — invoice counter
```

**Design notes (deviations from the minimum spec, each required by existing functionality):**
- `sale_items.product_name`, `unit_cost`, `unit_price` are **snapshots**: the app shows cost/profit on historical reports; products can be renamed or deleted without corrupting history.
- `sale_items.product_id` is nullable with `ON DELETE SET NULL` — the existing app lets you delete any product; reports keep the name snapshot.
- `day_sessions` is required — sales/reports in this app are strictly session-based.
- `auth_sessions` is required for a **real** logout/session revocation (JWT alone is stateless).
- Reports (daily/monthly/best-sellers) are **computed dynamically** from `day_sessions`/`sales`/`sale_items`.

## 4. REST API endpoints

| Method & Path | Purpose |
|---|---|
| `POST /api/auth/login` | public, rate-limited; bcrypt verify → JWT in httpOnly cookie + session row |
| `POST /api/auth/logout` | revokes the session row, clears cookie |
| `GET /api/auth/me` | current admin (id, username) |
| `PUT /api/auth/change-password` | current password required; change username and/or password; revokes other sessions |
| `GET /api/products` | list + search/filter (`?search=&category=&brand=`) |
| `GET /api/products/:id` | one product |
| `GET /api/products/barcode/:code` | scanner lookup |
| `POST /api/products` / `PUT /api/products/:id` / `DELETE /api/products/:id` | CRUD (delete blocked with 409 if sale items reference it — SetNull keeps history, but Prisma FK order makes delete safe; see implementation) |
| `GET /api/sessions/current` | current open day session or `null` |
| `POST /api/sessions` | start a new day (fails 409 if one is open) |
| `POST /api/sessions/close` | close the open day → returns final report (computed) |
| `GET /api/sales?sessionId=` | sales of a session (defaults to open session) |
| `POST /api/sales` | **transactional**: create sale + items + decrement stock + increment invoice counter; rollback on any failure; stock can never go negative |
| `PUT /api/sales/:id` | edit a sale in an **open** session (stock restored/deducted transactionally) |
| `DELETE /api/sales/:id` | delete a sale in an **open** session (stock restored) |
| `GET /api/reports?from=&to=` | closed-day reports with computed totals |
| `GET /api/reports/:id` | single closed day + its sale items |
| `GET /api/reports/monthly` | monthly summary (existing tab) |
| `GET /api/reports/best-sellers` | best sellers (existing tab) |
| `GET /api/reports/low-stock` | low stock list (existing tab) |
| `GET /api/customers?search=` | customers with computed balances |
| `GET /api/customers/:id` | customer + transactions + balance |
| `POST/PUT/DELETE /api/customers(/:id)` | customer CRUD |
| `POST /api/customers/:id/transactions` | add credit or record payment |
| `GET /api/dashboard/summary` | everything the dashboard renders |
| `DELETE /api/admin/data` | "Clear All Data" from Settings |
| `GET /api/health` | health check |

## 5. Authentication architecture decision
**JWT in an HTTP-only, SameSite=Lax cookie** (Secure in production), **plus a server-side session table**:

- The frontend is served by the same Express server → same-origin → cookies "just work", no XSS-readable token, no localStorage token theft.
- The `auth_sessions` table makes `logout` a **true** revocation (a stateless JWT would otherwise stay valid until expiry).
- Sessions expire via JWT `exp` **and** a DB `expires_at` (default 12h, configurable).
- On any `401`, the frontend clears state and shows the login screen automatically.
- CORS is configured for `FRONTEND_URL` with `credentials: true` in case the frontend is hosted separately.

## 6. Files created / modified
```
Blue-Mobile/
├── ANALYSIS.md                 (this file)
├── render.yaml                 (Render Blueprint: web service + PostgreSQL)
├── netlify.toml                (optional Netlify frontend hosting)
├── package.json                (root convenience scripts)
├── .gitignore / .nvmrc
├── frontend/                   (original Blue Mobile UI, wired to the API)
│   ├── index.html              (same HTML/CSS; + login screen & change-password modal)
│   ├── js/config.js            (production API URL — the only frontend setting)
│   ├── js/api.js               (fetch service layer)
│   ├── js/app.js               (same logic; localStorage business data → API)
│   └── vendor/html5-qrcode.min.js (vendored scanner library, CSP-compatible)
├── backend/
│   ├── package.json / package-lock.json
│   ├── .env.example            (all environment variables documented)
│   ├── .gitignore
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js             (single admin account, env-driven)
│   ├── scripts/
│   │   ├── import-localstorage.js   (one-time migration of old localStorage data)
│   │   ├── test-api.sh               (89 API checks)
│   │   └── test-frontend.js          (29 UI smoke tests)
│   └── src/
│       ├── app.js  ├── server.js
│       ├── utils/       (prisma, AppError, asyncHandler, jwt, money)
│       ├── middleware/  (auth/verifyToken, validate, errorHandler, notFound)
│       ├── validators/  (zod: auth, product, sale, session, customer, report)
│       ├── services/    (auth, product, sale, session, customer, report, dashboard, admin)
│       ├── controllers/ (thin HTTP layer over services)
│       └── routes/      (auth, products, sessions, sales, reports, customers, dashboard, admin)
└── README.md               (complete production deployment guide)
```

## 7. What the frontend keeps vs. changes
**Kept:** the entire design — glass UI, colors, layout, sidebar, sections, animations, navigation, i18n, scanner, every existing feature.
**Changed only where required:**
- Business data read/written through `api.js` instead of `localStorage` (theme/lang remain local preferences).
- Product select uses IDs (server uses IDs), sale rows display the server snapshot name.
- Added: login screen, Log Out action, Change Password modal, loading/error/empty/network-offline states, auto-redirect to login on `401`.
- Brand string fixed to **Blue Mobile** (the file title/brand previously said "Nexus POS").
- Scanner library vendored locally; API base configurable via `js/config.js` (same-origin default).
