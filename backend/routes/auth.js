const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe } = require('../controllers/authController');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.get('/me', auth, getMe);

module.exports = router;
