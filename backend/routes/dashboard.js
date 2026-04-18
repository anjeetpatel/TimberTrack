const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/stats', auth, requireRole('OWNER'), getStats);

module.exports = router;
