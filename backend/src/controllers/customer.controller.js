const customerService = require('../services/customer.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await customerService.list(req.query));
});

const getById = asyncHandler(async (req, res) => {
  res.json({ customer: await customerService.getById(req.params.id) });
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json({ customer: await customerService.create(req.body) });
});

const update = asyncHandler(async (req, res) => {
  res.json({ customer: await customerService.update(req.params.id, req.body) });
});

const remove = asyncHandler(async (req, res) => {
  res.json({ deleted: await customerService.remove(req.params.id) });
});

const addTransaction = asyncHandler(async (req, res) => {
  res.status(201).json({ customer: await customerService.addTransaction(req.params.id, req.body) });
});

module.exports = { list, getById, create, update, remove, addTransaction };
