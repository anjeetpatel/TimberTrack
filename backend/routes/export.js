const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { exportRentals, exportPayments } = require('../controllers/exportController');

router.get('/rentals', auth, exportRentals);
router.get('/payments', auth, exportPayments);

module.exports = router;
