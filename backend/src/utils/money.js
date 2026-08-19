const { Decimal } = require('@prisma/client/runtime/library');

/** Round a number to 2 decimals. */
function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/** Decimal-safe multiplication, rounded to 2 decimals. */
function mul(a, b) {
  return round2(new Decimal(a).mul(b).toNumber());
}

/** Decimal-safe addition, rounded to 2 decimals. */
function add(a, b) {
  return round2(new Decimal(a).add(b).toNumber());
}

/** Decimal-safe subtraction, rounded to 2 decimals. */
function sub(a, b) {
  return round2(new Decimal(a).sub(b).toNumber());
}

/** Convert a Prisma Decimal / number / string to a plain JS number for JSON. */
function toNum(v) {
  if (v === null || v === undefined) return 0;
  if (v instanceof Decimal) return v.toNumber();
  return Number(v);
}

module.exports = { round2, mul, add, sub, toNum };
