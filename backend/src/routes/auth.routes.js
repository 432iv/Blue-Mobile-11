const { Router } = require('express');
const { login, logout, me, changePassword } = require('../controllers/auth.controller');
const { verifyAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../validators/auth.validator');

const router = Router();

// Public (rate-limited in app.js)
router.post('/login', validate({ body: loginSchema }), login);

// Private
router.post('/logout', verifyAuth, logout);
router.get('/me', verifyAuth, me);
router.put('/change-password', verifyAuth, validate({ body: changePasswordSchema }), changePassword);

module.exports = router;
