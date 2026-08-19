const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  res.json({ summary: await dashboardService.summary() });
});

module.exports = { summary };
