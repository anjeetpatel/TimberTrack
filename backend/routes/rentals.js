const express = require('express');
const router = express.Router();
const { getAll, getById, create } = require('../controllers/rentalController');
const auth = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');

router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/', auth, checkSubscription('rental'), create);

module.exports = router;
