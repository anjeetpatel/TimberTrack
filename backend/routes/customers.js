const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAll, create } = require('../controllers/customerController');

router.get('/', auth, getAll);
router.post('/', auth, create);

module.exports = router;
