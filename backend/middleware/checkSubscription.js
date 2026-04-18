const Organization = require('../models/Organization');

/**
 * Subscription enforcement middleware.
 *
 * Applies FREE plan limits and auto-resets monthly usage counters.
 * Mount on routes that create rentals or customers.
 *
 * @param {'rental'|'customer'} resourceType
 */
const checkSubscription = (resourceType) => async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    // ── Monthly reset ─────────────────────────────────────────────
    const now = new Date();
    const last = org.usageStats.lastResetDate;
    const isDifferentMonth =
      !last ||
      last.getMonth() !== now.getMonth() ||
      last.getFullYear() !== now.getFullYear();

    if (isDifferentMonth) {
      org.usageStats.rentalsThisMonth = 0;
      org.usageStats.lastResetDate = now;
      await org.save();
    }

    // ── FREE plan enforcement ─────────────────────────────────────
    if (org.plan === 'FREE') {
      if (resourceType === 'rental' && org.usageStats.rentalsThisMonth >= 50) {
        return res.status(402).json({
          success: false,
          message:
            'Free plan limit reached: 50 rentals per month. Please upgrade to continue.',
          limit: 50,
          used: org.usageStats.rentalsThisMonth,
          plan: 'FREE',
        });
      }
      if (resourceType === 'customer' && org.usageStats.totalCustomers >= 100) {
        return res.status(402).json({
          success: false,
          message:
            'Free plan limit reached: 100 customers maximum. Please upgrade to add more.',
          limit: 100,
          used: org.usageStats.totalCustomers,
          plan: 'FREE',
        });
      }
    }

    // Attach org to request so controllers can update usage without re-fetching
    req.org = org;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkSubscription;
