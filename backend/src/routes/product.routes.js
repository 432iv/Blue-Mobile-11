const { Router } = require('express');
const productController = require('../controllers/product.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  productSchema,
  productUpdateSchema,
  productListQuery,
  purchaseSchema,
} = require('../validators/product.validator');
const { idParam, barcodeParam } = require('../validators/common');

const router = Router();

router.use(verifyAuth);

// NOTE: the static routes below must be registered BEFORE /:id
router.get('/barcode/:code', validate({ params: barcodeParam }), productController.getByBarcode);

router.get('/', validate({ query: productListQuery }), productController.list);
router.get('/:id', validate({ params: idParam }), productController.getById);

router.post('/', validate({ body: productSchema }), productController.create);
router.put('/:id', validate({ params: idParam, body: productUpdateSchema }), productController.update);
// Purchase/restock: quantity + purchase price → internal batch, no duplicate product
router.post('/:id/purchase', validate({ params: idParam, body: purchaseSchema }), productController.purchase);
router.delete('/:id', validate({ params: idParam }), productController.remove);

module.exports = router;
