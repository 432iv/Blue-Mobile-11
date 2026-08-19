const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { verifyAuth } = require('../middleware/auth');

const router = Router();

router.use(verifyAuth);

router.get('/summary', dashboardController.summary);

module.exports = router;
