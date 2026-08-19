const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json({ reports: await reportService.list(req.query) });
});

const detail = asyncHandler(async (req, res) => {
  res.json({ report: await reportService.detail(req.params.id) });
});

const monthly = asyncHandler(async (req, res) => {
  res.json({ months: await reportService.monthly() });
});

const bestSellers = asyncHandler(async (req, res) => {
  res.json({ products: await reportService.bestSellers() });
});

const lowStock = asyncHandler(async (req, res) => {
  res.json({ products: await reportService.lowStock() });
});

module.exports = { list, detail, monthly, bestSellers, lowStock };
