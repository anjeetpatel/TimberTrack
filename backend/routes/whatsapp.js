const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { rentalMessage, returnMessage, reminderMessage } = require('../controllers/whatsappController');

router.get('/rental/:id', auth, rentalMessage);
router.get('/return/:id', auth, returnMessage);
router.get('/reminder/:id', auth, reminderMessage);

module.exports = router;
