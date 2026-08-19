const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json(await productService.list(req.query));
});

const getById = asyncHandler(async (req, res) => {
  res.json({ product: await productService.getById(req.params.id) });
});

const getByBarcode = asyncHandler(async (req, res) => {
  res.json({ product: await productService.getByBarcode(req.params.code) });
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json({ product: await productService.create(req.body) });
});

const update = asyncHandler(async (req, res) => {
  res.json({ product: await productService.update(req.params.id, req.body) });
});

const purchase = asyncHandler(async (req, res) => {
  res.status(201).json({ product: await productService.purchase(req.params.id, req.body) });
});

const remove = asyncHandler(async (req, res) => {
  res.json({ deleted: await productService.remove(req.params.id) });
});

module.exports = { list, getById, getByBarcode, create, update, purchase, remove };
