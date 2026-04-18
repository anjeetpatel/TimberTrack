const ActivityLog = require('../models/ActivityLog');

/**
 * Fire-and-forget activity logger.
 * Never throws — catching errors silently so they never break API responses.
 *
 * @param {Object} opts
 * @param {string} opts.organizationId
 * @param {string} opts.userId
 * @param {string} opts.userName
 * @param {string} opts.action  - One of ACTION_TYPES
 * @param {string} opts.resourceType
 * @param {string} opts.resourceId
 * @param {Object} [opts.meta]  - Lean fields only: amount, customerName, itemCount, itemName, note
 */
async function logActivity({ organizationId, userId, userName, action, resourceType, resourceId, meta = {} }) {
  try {
    await ActivityLog.create({
      organizationId,
      userId,
      userName,
      action,
      resourceType,
      resourceId,
      meta,
    });
  } catch (err) {
    // Log to console but never propagate — activity logging must not break business operations
    console.warn('[ActivityLog] Failed to write activity log:', err.message);
  }
}

module.exports = { logActivity };
