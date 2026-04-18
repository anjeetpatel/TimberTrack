const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const rateLimit = require('express-rate-limit');

// Rate limit AI specifically so people don't spam the Google API
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 AI requests per 5 minutes
  message: { success: false, message: 'Too many AI requests. Please wait a few minutes.' }
});

router.use(auth); // Ensure user is logged in
router.use(aiLimiter); // Apply AI specific limits

// Only owners can generate bills to manipulate tone/financials
router.post('/billing-summary', requireRole('OWNER'), aiController.generateBillingSummary);

module.exports = router;
