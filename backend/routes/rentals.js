const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAll, getById, create } = require('../controllers/rentalController');

router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/', auth, create);

module.exports = router;
