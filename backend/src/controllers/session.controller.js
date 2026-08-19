const sessionService = require('../services/session.service');
const asyncHandler = require('../utils/asyncHandler');

const getCurrent = asyncHandler(async (req, res) => {
  res.json({ session: await sessionService.getCurrent() });
});

const start = asyncHandler(async (req, res) => {
  res.status(201).json({ session: await sessionService.start(req.body) });
});

const close = asyncHandler(async (req, res) => {
  res.json({ report: await sessionService.close() });
});

module.exports = { getCurrent, start, close };
