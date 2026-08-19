const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { verifyAuth } = require('../middleware/auth');

const router = Router();

router.use(verifyAuth);

// Settings → "Clear All Data"
router.delete('/data', adminController.clearAllData);

module.exports = router;
