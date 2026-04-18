const Organization = require('../models/Organization');
const { logActivity } = require('../utils/activityLogger');

const FREE_LIMITS = { rentalsPerMonth: 50, maxCustomers: 100 };

// GET /api/subscription
exports.getSubscription = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });

    const isPaid = org.plan === 'PAID';
    res.json({
      success: true,
      data: {
        plan: org.plan,
        planExpiresAt: org.planExpiresAt,
        limits: isPaid
          ? { rentalsPerMonth: Infinity, maxCustomers: Infinity }
          : FREE_LIMITS,
        usage: {
          rentalsThisMonth: org.usageStats.rentalsThisMonth,
          totalCustomers: org.usageStats.totalCustomers,
          lastResetDate: org.usageStats.lastResetDate,
        },
        percentUsed: isPaid ? null : {
          rentals: Math.round((org.usageStats.rentalsThisMonth / FREE_LIMITS.rentalsPerMonth) * 100),
          customers: Math.round((org.usageStats.totalCustomers / FREE_LIMITS.maxCustomers) * 100),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/subscription/upgrade — OWNER only
exports.upgradePlan = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });

    if (org.plan === 'PAID') {
      return res.status(400).json({ success: false, message: 'Already on the PAID plan.' });
    }

    org.plan = 'PAID';
    org.planExpiresAt = null; // stub — no real payment gateway
    await org.save();

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'PLAN_UPGRADED',
      resourceType: 'Subscription',
      meta: { note: 'Upgraded to PAID plan' },
    });

    res.json({
      success: true,
      message: 'Plan upgraded to PAID successfully! (Note: This is a demo upgrade — no payment is charged)',
      data: { plan: 'PAID' },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/subscription/downgrade — OWNER only
exports.downgradePlan = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });

    if (org.plan === 'FREE') {
      return res.status(400).json({ success: false, message: 'Already on the FREE plan.' });
    }

    org.plan = 'FREE';
    org.planExpiresAt = null;
    await org.save();

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'PLAN_DOWNGRADED',
      resourceType: 'Subscription',
    });

    res.json({ success: true, message: 'Plan downgraded to FREE.', data: { plan: 'FREE' } });
  } catch (error) {
    next(error);
  }
};
