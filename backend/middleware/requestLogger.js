const logger = require('../utils/logger');

/**
 * HTTP request logger middleware.
 * Logs method, path, user/org context, and response time.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || 'anon';
    const orgId = req.user?.organizationId || '-';
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    logger[level](
      `${req.method} ${req.originalUrl} ${status} ${duration}ms`,
      { userId, orgId }
    );
  });

  next();
};

module.exports = requestLogger;
