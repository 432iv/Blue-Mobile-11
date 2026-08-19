const { Router } = require('express');
const reportController = require('../controllers/report.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reportListQuery } = require('../validators/customer.validator');
const { idParam } = require('../validators/common');

const router = Router();

router.use(verifyAuth);

// Static sub-routes MUST come before /:id
router.get('/monthly', reportController.monthly);
router.get('/best-sellers', reportController.bestSellers);
router.get('/low-stock', reportController.lowStock);

router.get('/', validate({ query: reportListQuery }), reportController.list);
router.get('/:id', validate({ params: idParam }), reportController.detail);

module.exports = router;
