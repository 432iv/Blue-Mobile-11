const deviceModelService = require('../services/deviceModel.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  res.json({ models: await deviceModelService.list(req.query) });
});

const create = asyncHandler(async (req, res) => {
  const { model, created } = await deviceModelService.create(req.body);
  res.status(created ? 201 : 200).json({ model });
});

module.exports = { list, create };
