const express = require('express');
const router = express.Router();
const { processReturn, getByRental } = require('../controllers/returnController');
const auth = require('../middleware/auth');

// Both OWNER and WORKER can process returns
router.get('/', auth, getByRental);
router.post('/', auth, processReturn);

module.exports = router;
