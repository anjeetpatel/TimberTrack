const express = require('express');
const router = express.Router();
const { getOrg, transferOwnership, regenerateInviteCode } = require('../controllers/organizationController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, getOrg);
router.post('/transfer', auth, requireRole('OWNER'), transferOwnership);
router.post('/invite/regenerate', auth, requireRole('OWNER'), regenerateInviteCode);

module.exports = router;
