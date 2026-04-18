const Organization = require('../models/Organization');
const User = require('../models/User');
const { withTransaction } = require('../utils/transactionHelper');
const { logActivity } = require('../utils/activityLogger');

// GET /api/organization
exports.getOrg = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });

    const memberCount = await User.countDocuments({ organizationId: org._id, isActive: true });

    res.json({
      success: true,
      data: {
        id: org._id,
        name: org.name,
        plan: org.plan,
        planExpiresAt: org.planExpiresAt,
        invite: {
          code: req.user.role === 'OWNER' ? org.inviteCode : undefined, // workers don't see invite code
          expiresAt: org.inviteCodeExpiresAt,
          usageLimit: org.inviteCodeUsageLimit,
          usageCount: org.inviteCodeUsageCount,
          usesRemaining: Math.max(0, org.inviteCodeUsageLimit - org.inviteCodeUsageCount),
        },
        usageStats: org.usageStats,
        memberCount,
        createdAt: org.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/organization/transfer — OWNER only
exports.transferOwnership = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required.' });
    }
    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You are already the owner.' });
    }

    // Validate target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }
    if (!targetUser.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot transfer ownership to a deactivated user.' });
    }
    if (targetUser.organizationId.toString() !== req.user.organizationId) {
      return res.status(400).json({ success: false, message: 'Target user must belong to your organization.' });
    }

    // Atomic transfer
    await withTransaction(async (session) => {
      const saveOpts = session ? { session } : {};
      const findOpts = session ? { session } : {};

      const org = await Organization.findById(req.user.organizationId, null, findOpts);
      const currentOwner = await User.findById(req.user.id, null, findOpts);
      const newOwner = await User.findById(targetUserId, null, findOpts);

      org.ownerId = newOwner._id;
      newOwner.role = 'OWNER';
      currentOwner.role = 'WORKER';

      await org.save(saveOpts);
      await newOwner.save(saveOpts);
      await currentOwner.save(saveOpts);
    });

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'OWNERSHIP_TRANSFERRED',
      resourceType: 'Organization',
      resourceId: req.user.organizationId,
      meta: { note: `Transferred to ${targetUser.name}` },
    });

    res.json({
      success: true,
      message: `Ownership transferred to ${targetUser.name}. You are now a Worker.`,
      data: { newOwner: { id: targetUser._id, name: targetUser.name, phone: targetUser.phone } },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/organization/invite/regenerate — OWNER only
exports.regenerateInviteCode = async (req, res, next) => {
  try {
    const { expiresInDays, usageLimit } = req.body;

    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });

    org.regenerateInvite({ expiresInDays, usageLimit });
    await org.save();

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'INVITE_REGENERATED',
      resourceType: 'Organization',
      resourceId: org._id,
    });

    res.json({
      success: true,
      message: 'Invite code regenerated.',
      data: {
        inviteCode: org.inviteCode,
        expiresAt: org.inviteCodeExpiresAt,
        usageLimit: org.inviteCodeUsageLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};
