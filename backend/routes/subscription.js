const express = require('express');
const router = express.Router();
const { getSubscription, upgradePlan, downgradePlan } = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, getSubscription);
router.post('/upgrade', auth, requireRole('OWNER'), upgradePlan);
router.post('/downgrade', auth, requireRole('OWNER'), downgradePlan);

module.exports = router;
