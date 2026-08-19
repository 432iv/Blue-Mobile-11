const { Router } = require('express');
const saleController = require('../controllers/sale.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { saleSchema, saleUpdateSchema, saleListQuery } = require('../validators/sale.validator');
const { idParam } = require('../validators/common');

const router = Router();

router.use(verifyAuth);

router.get('/', validate({ query: saleListQuery }), saleController.list);
router.post('/', validate({ body: saleSchema }), saleController.create);
router.put('/:id', validate({ params: idParam, body: saleUpdateSchema }), saleController.update);
router.delete('/:id', validate({ params: idParam }), saleController.remove);

module.exports = router;
