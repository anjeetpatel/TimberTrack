const ActivityLog = require('../models/ActivityLog');

// GET /api/activity — OWNER only, paginated
exports.getLogs = async (req, res, next) => {
  try {
    const { action, page = 1, limit = 20 } = req.query;

    // Enforce max page size
    const pageLimit = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * pageLimit;

    const query = { organizationId: req.user.organizationId };
    if (action) query.action = action.toUpperCase();

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};
