require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/customers');
const rentalRoutes = require('./routes/rentals');
const returnRoutes = require('./routes/returns');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const whatsappRoutes = require('./routes/whatsapp');
const exportRoutes = require('./routes/export');
const organizationRoutes = require('./routes/organization');
const subscriptionRoutes = require('./routes/subscription');
const activityRoutes = require('./routes/activity');

const app = express();

// ── Security middleware ──────────────────────────────────────────
app.use(helmet());                          // Sets secure HTTP headers
app.use(mongoSanitize());                   // Strips $ and . from req.body to prevent NoSQL injection

// ── General middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10kb' }));   // Prevent huge payload attacks
app.use(requestLogger);                     // Log every request via Winston

// ── Rate limiting ────────────────────────────────────────────────
// Auth-specific rate limiting is applied in routes/auth.js
// General API rate limit (300 req/min)
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/activity', activityRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TimberTrack API is running.',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TimberTrack API v2 running on port ${PORT}`);
  });
});
