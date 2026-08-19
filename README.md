# Blue Mobile — POS for a Mobile Phone & Accessories Store

**Blue Mobile** is a complete, production-ready Point of Sale system. It keeps the
original Blue Mobile glass UI and turns the old `localStorage` app into a real
full-stack application:

```
Blue Mobile Frontend (glass UI)   →   Backend API (Express)   →   PostgreSQL
```

| Layer | What it is |
|---|---|
| **Frontend** | The original Blue Mobile UI — no redesign. Served by the backend **or** deployable to Netlify. |
| **Backend** | Node.js + Express REST API, JWT auth in httpOnly cookies, bcrypt password hashing, Zod validation, Helmet + CORS + rate limiting. |
| **Database** | PostgreSQL via Prisma (migrations included). |

There is **one admin account only** — no sign-up, no registration, no multi-user.

## POS features (v2)

- **Searchable product autocomplete** in the sale form — type to search active inventory
  (name, brand, description, stock, selling price).
- **Manual / service items** — the same field accepts free text (e.g. *Software
  installation*): description + quantity + selling price; no inventory, no stock
  deduction; included in totals and reports.
- **Product descriptions & specifications** — every product has an optional
  description; it appears under the product name in search, cards and sale rows.
- **Product types with type-specific fields** — Chargers (brand, wattage,
  connector), Cables/AUX/Adapters (connector type such as `Type-C → Lightning`),
  Phone Cases & Screen Protectors (searchable **compatible phone model** with
  add-new; no brand needed), Earphones, Power Banks, Phones, Other Accessories.
- **Product identity by variant** — same name with different specs/description/
  compatible model = separate inventory items (internal IDs).
- **Purchase batches** — restocking asks only *quantity* + *purchase price*; the
  system creates an internal batch (no duplicate product) and updates the
  product's current purchase price to the latest batch price.
- **FIFO costing** — sale costs come from purchase batches (oldest first); the
  employee never enters cost at sale time. Historical profits never change when
  prices change.
- **Historical snapshots** — every sale item stores product id, name, brand,
  description/specs, quantity, unit selling price and unit FIFO cost at sale time.
  Renaming/redescribing/re-pricing a product never alters past sales.
- **Zero-stock handling** — products at 0 stock leave the active inventory and
  sales search (never deleted; history preserved) and return automatically when
  restocked.
- **Daily notes** — time-stamped notes attached to the sales day (e.g.
  *"10:30 — Gave my brother 100 LYD"*), shown in the day's final report and
  report details.

---

## Table of contents

1. [What you are deploying](#1-what-you-are-deploying)
2. [Option A — Deploy everything on Render (recommended)](#option-a--deploy-everything-on-render-recommended)
3. [Option B — Frontend on Netlify + backend on Render](#option-b--frontend-on-netlify--backend-on-render)
4. [Environment variables](#environment-variables)
5. [How to verify the production app works](#how-to-verify-the-production-app-works)
6. [Run locally](#run-locally)
7. [Project structure](#project-structure)
8. [Security notes](#security-notes)
9. [Migrating data from the old localStorage app](#migrating-data-from-the-old-localstorage-app)
10. [Tests](#tests)
11. [Troubleshooting](#troubleshooting)

---

## 1. What you are deploying

Three pieces:

1. **PostgreSQL database** — created and hosted for you (Render/Neon/Supabase/Railway all offer free tiers).
2. **Backend API** — a Node.js web service. It needs 4 things to run:
   - the database connection string (`DATABASE_URL`)
   - a secret to sign sessions (`JWT_SECRET`)
   - the admin username/password (used once by the seed to create your account)
   - in some setups, the frontend's URL (`FRONTEND_URL`)
3. **Frontend** — plain static files (HTML/JS/CSS). No build step needed.

**The recommended setup (Option A)** deploys the backend and the frontend together
on one service, so the whole app lives at one URL. **Option B** puts the frontend on
Netlify (free static hosting) and the backend on Render.

> The project already includes `render.yaml` and `netlify.toml` — the deployment
> configuration files. You do not need to write any configuration yourself.

---

## Option A — Deploy everything on Render (recommended)

One service hosts the database, the API and the frontend. One URL, no CORS or
cookie configuration to think about.

### Step 1 — Create a GitHub repository

1. Go to https://github.com/new and create a new **private** repository (e.g. `blue-mobile`).
2. Upload the project: in the "uploading an existing file" screen, drag in every
   folder and file of this project (frontend, backend, render.yaml, package.json,
   README.md, .gitignore — **do NOT upload node_modules or .env; both are ignored
   by .gitignore anyway**).
3. Commit.

### Step 2 — Create the Render service (uses the included blueprint)

1. Sign up / sign in at https://render.com.
2. Click **New + → Blueprint** (Render calls this "Blueprint" because it reads
   `render.yaml` from your repo).
3. Connect your GitHub account and pick the `blue-mobile` repository.
   Render reads `render.yaml` and creates:
   - the **PostgreSQL database** (`blue-mobile-db`), and
   - the **web service** (`blue-mobile`).
4. Before Render starts the first deploy, open the new **Web Service** and add the
   missing environment variables (see below) — **the first deploy will fail with a
   clear message until `ADMIN_PASSWORD` is set, which is intentional** (it stops you
   from deploying without an admin password).

### Step 3 — Set the environment variables (in the Render dashboard)

| Variable | Where to find it | Example |
|---|---|---|
| `DATABASE_URL` | Auto-filled from the database (Render does this for you) | `postgresql://...` |
| `JWT_SECRET` | Auto-generated by Render (`generateValue: true`) | a long random string |
| `NODE_ENV` | Auto-filled | `production` |
| `ADMIN_USERNAME` | You choose | `admin` |
| `ADMIN_PASSWORD` | You choose — **this is your store login password, make it strong** | `MyStore!2026` |
| `FRONTEND_URL` | Leave empty for Option A | *(empty)* |

### Step 4 — Deploy and wait

The first deploy runs, in order:

```
npm install  →  npx prisma generate  →  npx prisma migrate deploy  →  npm run seed  →  npm start
```

- **migrate deploy** creates the database tables (migrations are included in the repo).
- **seed** creates your single admin account (bcrypt-hashed) and the invoice counter.
- **start** launches the API and serves the frontend.

Wait until the deploy says **Live**. Your app URL looks like:
`https://blue-mobile.onrender.com` — open it and sign in with your admin username
and password.

> **First deploy failed?** Almost always because `ADMIN_PASSWORD` was empty. Set it
> in the Web Service → Environment, then click **Manual Deploy → Deploy latest commit**.

That's it — you are live. Your data lives in the Render PostgreSQL database and
survives redeploys, restarts and refreshes.

---

## Option B — Frontend on Netlify + backend on Render

Use this when you want the frontend served by Netlify's CDN (often a bit faster to
load, free tier included). It needs two extra settings, both already supported.

### 1. Backend on Render (API + database only)

1. Follow Option A steps 1–3, with two differences:
   - In the web service settings set `FRONTEND_URL` to your Netlify URL once it
     exists, e.g. `https://blue-mobile.netlify.app`.
   - The backend still serves the frontend at its own URL — that's fine; you simply
     use the Netlify URL as the main one.
2. Deploy, wait for **Live**.

### 2. Frontend on Netlify

1. Sign up / sign in at https://app.netlify.com.
2. **Add new site → Import an existing project → GitHub**, pick the `blue-mobile`
   repo.
3. Netlify reads `netlify.toml` automatically: **publish directory = `frontend`**,
   no build command. Deploy.
4. After the first deploy you get a URL like `https://blue-mobile.netlify.app`.
5. **One file to edit in your repo** — `frontend/js/config.js`:

   ```js
   window.BLUE_MOBILE_API_BASE = "https://blue-mobile.onrender.com/api";
   ```

   Push that change; Netlify redeploys automatically.
6. Make sure the backend's `FRONTEND_URL` contains exactly your Netlify URL
   (otherwise CORS rejects the requests).

Both URLs now work. The cookies are set to `SameSite=None; Secure` automatically
when `FRONTEND_URL` is configured, which is required for the Netlify → Render
communication.

### Manual Render setup (without the blueprint) — step by step

Prefer this when you want to see every part separately. You need a GitHub account
and a Render account (free at https://render.com, sign in with GitHub).

1. **Push the project to GitHub** (private repo). The repo must contain
   `frontend/`, `backend/`, `package.json`, `render.yaml`, `README.md`. Do not
   upload `node_modules` or `.env` (`.gitignore` already excludes them).
2. **Create the database first** — on Render click **New + → PostgreSQL**:
   - Name: `blue-mobile-db` · Database: `blue_mobile` · Region: nearest to you.
   - After it is ready, copy the **Internal Database URL** (starts with
     `postgres://...`). Keep it for step 4.
3. **Create the web service** — **New + → Web Service → Connect your GitHub
   repo** and fill in:
   - Name: `blue-mobile-api`
   - Runtime: **Node**
   - Root Directory: **`backend`**
   - Region: nearest to you (same as the database)
   - Instance type: Free is fine for testing; **Starter for a real store**
   - Build command:
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && npm run seed
     ```
   - Start command: `npm start`
4. **Environment variables** (Web Service → Environment):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the Internal Database URL from step 2 |
   | `JWT_SECRET` | long random string — generate at https://www.random.org/strings/ or with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `NODE_ENV` | `production` |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | your store password (min 8 chars) |
   | `FRONTEND_URL` | `https://YOUR-SITE.netlify.app` (your Netlify URL) |
   | `JWT_EXPIRES_IN` | `12h` |
   - Also set **Node Version = 20** in the service settings if asked.
5. **Deploy** — click **Manual Deploy → Deploy latest commit** and watch the logs:
   it installs → creates tables → creates the admin → starts. When the status is
   **Live**, open `https://blue-mobile-api.onrender.com/api/health` — you should
   see `{"status":"ok",...}`.
6. **Connect Netlify** — see [Option B](#option-b--frontend-on-netlify--backend-on-render) step 2:
   set the API URL in `frontend/js/config.js`, push, and Netlify redeploys.

> **Important — free tier limits:** Render's free web service *sleeps* after
> ~15 minutes without traffic (the first visit after sleep takes ~1 minute to
> wake up), and **free PostgreSQL databases are deleted after 30 days**. For a
> real store, use at least the Starter plan for the database (your sales data is
> too important to lose), or use a free PostgreSQL host that never expires such
> as Neon (https://neon.tech) and paste its connection string into `DATABASE_URL`.

---

## Environment variables

All secrets live in environment variables — **never in the code**. The template is
`backend/.env.example` (used for local development) and the same variables are set
in the Render/Railway dashboard for production.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Signs login sessions. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NODE_ENV` | ✅ | `development` or `production` |
| `ADMIN_USERNAME` | ✅ (seed) | The single admin's username |
| `ADMIN_PASSWORD` | ✅ (seed) | The single admin's password (min 8 chars) |
| `PORT` | — | Server port (Render sets it automatically) |
| `JWT_EXPIRES_IN` | — | Session lifetime, default `12h` |
| `FRONTEND_URL` | only Option B | Frontend origin(s), comma-separated |
| `COOKIE_SECURE` | — | Force Secure cookie flag (auto in production) |
| `COOKIE_SAMESITE` | — | Auto: `lax` same-origin / `none` when `FRONTEND_URL` set |
| `FRONTEND_DIR` | — | Override the frontend files location (rarely needed) |

> Generate a strong `JWT_SECRET` — never reuse an example secret from a README.
> The backend **refuses to start** with a missing or weak secret.

---

## How to verify the production app works

After deploying, run this checklist in the browser at your app URL:

1. **Login** — the login screen appears; wrong password is rejected; correct
   username/password signs you in.
2. **Dashboard** — the stat cards load (they are computed from the database).
3. **Products** — add a product, edit it, search it; refresh the page — it is still there.
4. **Sales** — open the Sales page → **Start New Day** → record a sale → the stock
   number on the product decreases. Refresh the page: the open day and sales are still there.
5. **Close day** — the final receipt appears; the Reports page now shows the day.
6. **Customers** — add a customer, add credit, record a payment; the balance updates.
7. **Log out** → log in again → everything is still there (data is in PostgreSQL,
   not in the browser).
8. **Session expiry** — after `JWT_EXPIRES_IN` (default 12h) of inactivity the app
   automatically returns you to the login screen.
9. **API health** — open `https://YOUR-APP-URL/api/health` in a new tab; it returns
   `{"status":"ok",...}`.

You can also run the built-in test suites locally (section 10).

---

## Run locally

Prerequisites: **Node.js 18+** (20 recommended) and **PostgreSQL 14+**.

```bash
# 1. install backend dependencies
cd backend
npm install

# 2. configure environment
cp .env.example .env
#    edit .env → set DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# 3. create the database (one time)
createdb blue_mobile
#    or with psql:  CREATE DATABASE blue_mobile;

# 4. create tables + admin account
npx prisma migrate dev
npm run seed

# 5. run
npm run dev
```

Open **http://localhost:4000** — the Blue Mobile login screen appears.

> `npm run dev` auto-restarts on code changes. `npm start` runs it without watching.

---

## Project structure

```
Blue-Mobile/
├── frontend/                 → the Blue Mobile UI (deployable to Netlify)
│   ├── index.html            original UI + login screen
│   ├── js/config.js          ★ the only frontend setting: API URL
│   ├── js/api.js             API service layer (fetch + httpOnly cookie)
│   ├── js/app.js             application logic (data via the API)
│   └── vendor/               html5-qrcode (vendored, no CDN dependency)
├── backend/                  → the Node.js API + PostgreSQL
│   ├── src/                  app.js, server.js, routes/, controllers/,
│   │                         services/, middleware/, validators/, utils/
│   ├── prisma/               schema.prisma, migrations/, seed.js
│   ├── scripts/              import-localstorage.js + test suites
│   ├── .env.example          all environment variables documented
│   └── package.json
├── render.yaml               Render blueprint (database + web service)
├── netlify.toml              Netlify frontend configuration
├── package.json              convenience scripts (dev, seed, tests)
├── .gitignore                .env and node_modules are ignored
├── .nvmrc                    Node 20
└── README.md                 this guide
```

---

## Security notes

- **One admin account** — created by the seed; there is no registration endpoint
  and no way to create more users.
- Passwords are stored as **bcrypt hashes** (cost 12) and never returned by the API.
- Login sessions are **JWTs in httpOnly, SameSite cookies** — JavaScript cannot read
  them, so XSS cannot steal them. Logout **revokes** the session server-side.
- Sessions expire (`JWT_EXPIRES_IN`); changing the password revokes all other sessions.
- Helmet security headers, strict CORS, rate limiting (600 req/15 min globally,
  10 login attempts/15 min per IP), Zod validation on every endpoint, and
  parameterized queries (Prisma) throughout.
- Sales are created inside **database transactions with row locks** — inventory can
  never go negative and partial sales never exist.
- Errors never leak stack traces or internal details.

---

## Migrating data from the old localStorage app

If you were using the original Blue Mobile app (data in the browser's localStorage),
you can import it into the database once:

1. In the **old** app's browser console, export the data:

   ```js
   copy(JSON.stringify({
     pos_products: JSON.parse(localStorage.getItem('pos_products') || '[]'),
     pos_currentSession: JSON.parse(localStorage.getItem('pos_currentSession') || 'null'),
     pos_reports: JSON.parse(localStorage.getItem('pos_reports') || '[]'),
     pos_customers: JSON.parse(localStorage.getItem('pos_customers') || '[]'),
     pos_saleCounter: localStorage.getItem('pos_saleCounter') || '0'
   }))
   ```

2. Paste the copied JSON into a file, e.g. `backend/data/export.json`, then:

   ```bash
   cd backend
   npm run import:localstorage -- ./data/export.json
   ```

Products, customers + transactions, closed-day reports and your open day are all
imported. The script refuses to run against a database that already has data
(`--force` overrides).

---

## Tests

Both suites are included (local development tools — not part of the runtime):

```bash
# API: 89 end-to-end checks (auth, CRUD, transactions, stock integrity, reports, ...)
npm run test:api

# Frontend: 29 UI checks driving the real interface via jsdom
npm run test:frontend
```

Prerequisites: backend running on `http://localhost:4000` and a freshly seeded
database: `npx prisma migrate reset --force && npm run seed` (backend folder).

> The API suite deliberately exhausts the login rate limit as part of its checks —
> restart the backend between `test:api` and `test:frontend` so the limiter resets.

---

## Troubleshooting

| Problem | Cause & fix |
|---|---|
| Deploy fails: "ADMIN_PASSWORD is required" | Set `ADMIN_PASSWORD` (and `ADMIN_USERNAME`) in the hosting environment, then redeploy. The seed refuses to prompt in production on purpose. |
| Login shows "Invalid username or password" right after deploy | The seed did not run or the password env changed. Re-run the seed (`npm run seed`) via the hosting shell, or reset with `ADMIN_RESET_PASSWORD=true`. |
| Everything works at the Render URL but not from Netlify | `frontend/js/config.js` must point to the backend URL, and backend `FRONTEND_URL` must contain the Netlify URL exactly. |
| "Origin not allowed by CORS" | `FRONTEND_URL` is set but doesn't include the origin you're using. |
| Page loads but every request returns 401 | `JWT_SECRET` changed after deploy (sessions are signed with the old secret). Keep it stable; changing it signs everyone out. |
| "Cannot reach the server" screen | The backend is down or the URL in `config.js` is wrong. Check `https://YOUR-APP/api/health`. |
| Backend won't start: "JWT_SECRET is not configured" | Set a real `JWT_SECRET` (≥32 random chars). |

---

**Blue Mobile** — production POS. Frontend → Backend/API → PostgreSQL, with the
original glass UI preserved. No demo data, no mock backend, no localStorage for
business data.
