const express = require('express');
const router = express.Router();
const { getAll, create, update, delete: deleteItem } = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, requireRole('OWNER'), deleteItem);

module.exports = router;
