const { Router } = require('express');
const deviceModelController = require('../controllers/deviceModel.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { deviceModelSchema, deviceModelListQuery } = require('../validators/deviceModel.validator');

const router = Router();

router.use(verifyAuth);

router.get('/', validate({ query: deviceModelListQuery }), deviceModelController.list);
router.post('/', validate({ body: deviceModelSchema }), deviceModelController.create);

module.exports = router;
