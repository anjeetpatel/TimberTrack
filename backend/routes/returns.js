const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { processReturn, getByRental } = require('../controllers/returnController');

router.post('/', auth, processReturn);
router.get('/', auth, getByRental);

module.exports = router;
