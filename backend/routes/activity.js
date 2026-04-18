const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/activityController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, requireRole('OWNER'), getLogs);

module.exports = router;
