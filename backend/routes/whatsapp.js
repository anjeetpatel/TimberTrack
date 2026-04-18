const express = require('express');
const router = express.Router();
const { rentalMessage, returnMessage, reminderMessage } = require('../controllers/whatsappController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Both OWNER and WORKER can generate rental/return messages
router.get('/rental/:id', auth, rentalMessage);
router.get('/return/:id', auth, returnMessage);

// Only OWNER can send payment reminders
router.get('/reminder/:id', auth, requireRole('OWNER'), reminderMessage);

module.exports = router;
