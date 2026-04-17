const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { recordPayment, getByRental } = require('../controllers/paymentController');

router.post('/', auth, recordPayment);
router.get('/', auth, getByRental);

module.exports = router;
