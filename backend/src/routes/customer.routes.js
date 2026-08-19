const { Router } = require('express');
const customerController = require('../controllers/customer.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  customerSchema,
  customerUpdateSchema,
  customerListQuery,
  transactionSchema,
} = require('../validators/customer.validator');
const { idParam } = require('../validators/common');

const router = Router();

router.use(verifyAuth);

router.get('/', validate({ query: customerListQuery }), customerController.list);
router.post('/', validate({ body: customerSchema }), customerController.create);

router.get('/:id', validate({ params: idParam }), customerController.getById);
router.put('/:id', validate({ params: idParam, body: customerUpdateSchema }), customerController.update);
router.delete('/:id', validate({ params: idParam }), customerController.remove);
router.post(
  '/:id/transactions',
  validate({ params: idParam, body: transactionSchema }),
  customerController.addTransaction
);

module.exports = router;
