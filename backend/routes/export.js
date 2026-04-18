const express = require('express');
const router = express.Router();
const { exportRentals, exportPayments } = require('../controllers/exportController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/rentals', auth, requireRole('OWNER'), exportRentals);
router.get('/payments', auth, requireRole('OWNER'), exportPayments);

module.exports = router;
