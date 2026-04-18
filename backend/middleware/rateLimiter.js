const rateLimit = require('express-rate-limit');

const createLimiter = (opts) =>
  rateLimit({
    standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    ...opts,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: opts.message || 'Too many requests. Please try again later.',
      });
    },
  });

// Auth: strict — brute force protection
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration attempts. Please try again in an hour.',
});

// General API: relaxed — normal usage
const apiLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  message: 'Too many requests. Please slow down.',
});

module.exports = { loginLimiter, registerLimiter, apiLimiter };
