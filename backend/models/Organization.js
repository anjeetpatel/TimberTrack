const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Generate a random alphanumeric invite code.
 */
const generateInviteCode = () =>
  crypto.randomBytes(6).toString('base64url').substring(0, 8).toUpperCase();

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Subscription ─────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['FREE', 'PAID'],
      default: 'FREE',
    },
    planExpiresAt: {
      type: Date,
    },

    // ── Invite System ─────────────────────────────────────────────
    inviteCode: {
      type: String,
      default: generateInviteCode,
    },
    inviteCodeExpiresAt: {
      type: Date, // null = never expires
    },
    inviteCodeUsageLimit: {
      type: Number,
      default: 10,
      min: 1,
    },
    inviteCodeUsageCount: {
      type: Number,
      default: 0,
    },
    // Track which users joined via this invite code (deduplication)
    inviteCodeUsedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ── Usage Stats (subscription enforcement) ────────────────────
    usageStats: {
      rentalsThisMonth: { type: Number, default: 0 },
      totalCustomers: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Indexes
organizationSchema.index({ inviteCode: 1 }, { unique: true });
organizationSchema.index({ ownerId: 1 });

/**
 * Instance method: regenerate invite code with optional new expiry/limit.
 */
organizationSchema.methods.regenerateInvite = function (opts = {}) {
  this.inviteCode = generateInviteCode();
  this.inviteCodeUsageCount = 0;
  this.inviteCodeUsedBy = [];
  this.inviteCodeExpiresAt = opts.expiresInDays
    ? new Date(Date.now() + opts.expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  if (opts.usageLimit) this.inviteCodeUsageLimit = opts.usageLimit;
};

/**
 * Instance method: check if invite code is valid for new joins.
 */
organizationSchema.methods.isInviteValid = function () {
  if (this.inviteCodeExpiresAt && new Date() > this.inviteCodeExpiresAt) {
    return { valid: false, reason: 'Invite code has expired.' };
  }
  if (this.inviteCodeUsageCount >= this.inviteCodeUsageLimit) {
    return { valid: false, reason: 'Invite code usage limit has been reached.' };
  }
  return { valid: true };
};

module.exports = mongoose.model('Organization', organizationSchema);
module.exports.generateInviteCode = generateInviteCode;
