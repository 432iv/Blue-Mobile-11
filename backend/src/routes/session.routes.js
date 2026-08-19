const { Router } = require('express');
const sessionController = require('../controllers/session.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sessionCreateSchema } = require('../validators/session.validator');

const router = Router();

router.use(verifyAuth);

router.get('/current', sessionController.getCurrent);
router.post('/', validate({ body: sessionCreateSchema }), sessionController.start);
router.post('/close', sessionController.close);

module.exports = router;
