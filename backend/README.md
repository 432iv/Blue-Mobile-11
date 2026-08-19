# Blue Mobile — Backend

Node.js + Express REST API · PostgreSQL · Prisma · JWT in httpOnly cookies · bcrypt · Zod.

**Full deployment guide (local + production) is in the root [`README.md`](../README.md).**

## Quick start (local)

```bash
npm install
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npx prisma migrate dev
npm run seed                # creates the single admin account
npm run dev                 # → http://localhost:4000 (API + frontend)
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | run with auto-reload |
| `npm start` | run (production) |
| `npm run seed` | create/reset the admin account (env-driven; never prompts in production) |
| `npx prisma migrate dev` | apply migrations in development |
| `npx prisma migrate deploy` | apply migrations in production |
| `npm run import:localstorage -- ./file.json` | import data from the old localStorage app |
| `npm run test:api` | 89 end-to-end API checks |
| `npm run test:frontend` | 29 UI smoke tests (jsdom) |

## Environment variables

All defined in [`.env.example`](.env.example): `DATABASE_URL`, `PORT`, `NODE_ENV`,
`JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `COOKIE_SECURE`, `COOKIE_SAMESITE`,
`FRONTEND_DIR`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

## API

Everything under `/api` except `POST /api/auth/login` and `GET /api/health`
requires the session cookie: auth (login/logout/me/change-password), products
(CRUD + barcode + search + **purchase/restock batches**), device models
(search + add, for phone cases/screen protectors), sessions (start/close day),
sales (transactional, **FIFO costing**, manual/service items), daily notes
(crud per open day), reports (daily/monthly/best-sellers/low-stock), customers
(+credit/payment transactions), dashboard summary, admin clear-data.
