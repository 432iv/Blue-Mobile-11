const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');

const clearAllData = asyncHandler(async (req, res) => {
  res.json(await adminService.clearAllData());
});

module.exports = { clearAllData };
