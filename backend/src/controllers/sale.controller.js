const saleService = require('../services/sale.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json({ sales: await saleService.list(req.query.sessionId || '') });
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json({ sale: await saleService.create(req.body) });
});

const update = asyncHandler(async (req, res) => {
  res.json({ sale: await saleService.update(req.params.id, req.body) });
});

const remove = asyncHandler(async (req, res) => {
  res.json({ deleted: await saleService.remove(req.params.id) });
});

module.exports = { list, create, update, remove };
