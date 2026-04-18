const express = require('express');
const router = express.Router();
const { getAll, create, delete: deleteCustomer } = require('../controllers/customerController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const checkSubscription = require('../middleware/checkSubscription');

router.get('/', auth, getAll);
router.post('/', auth, checkSubscription('customer'), create);
router.delete('/:id', auth, requireRole('OWNER'), deleteCustomer);

module.exports = router;
