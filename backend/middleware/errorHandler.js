const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const userId = req.user?.id || 'anon';
  const orgId = req.user?.organizationId || '-';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    logger.warn(`Validation error: ${method} ${url}`, { messages, userId, orgId });
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Please check your input.',
      errors: messages,
    });
  }

  // Mongoose duplicate key (e.g. unique phone per org)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    logger.warn(`Duplicate key: ${field} = ${value}`, { userId, orgId });
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} (${value}) already exists in your organization.`,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for field: ${err.path}.`,
    });
  }

  // MongoDB transaction not supported on standalone
  if (err.codeName === 'IllegalOperation' ||
      (err.message && err.message.includes('Transaction numbers are only allowed'))) {
    logger.error('Transaction attempted on standalone MongoDB', { userId, orgId });
    return res.status(503).json({
      success: false,
      message: 'This operation requires a MongoDB replica set.',
    });
  }

  // Custom application errors (set err.statusCode in controllers)
  if (err.statusCode) {
    logger.warn(`App error: ${err.message}`, { statusCode: err.statusCode, userId, orgId });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unhandled server error
  logger.error(`Unhandled error: ${method} ${url} — ${err.message}`, {
    stack: err.stack,
    userId,
    orgId,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred. Please try again.',
  });
};

module.exports = errorHandler;
