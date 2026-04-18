const mongoose = require('mongoose');

const ACTION_TYPES = [
  'RENTAL_CREATED',
  'RETURN_PROCESSED',
  'PAYMENT_RECORDED',
  'CUSTOMER_ADDED',
  'CUSTOMER_DELETED',
  'INVENTORY_ADDED',
  'INVENTORY_UPDATED',
  'INVENTORY_DELETED',
  'OWNERSHIP_TRANSFERRED',
  'INVITE_REGENERATED',
  'PLAN_UPGRADED',
  'PLAN_DOWNGRADED',
];

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized — stored at log time so it's readable even if user is deleted
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ACTION_TYPES,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['Rental', 'Return', 'Payment', 'Customer', 'Inventory', 'Organization', 'Subscription'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // Lean meta — only essential fields, no full documents
    meta: {
      amount: Number,
      customerName: String,
      itemCount: Number,
      itemName: String,
      note: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // audit logs are append-only
    },
  },
  {
    // No updatedAt — immutable audit log
    timestamps: false,
    // Auto-expire after 1 year (optional, comment out if you want forever retention)
    // expireAfterSeconds: 365 * 24 * 60 * 60,
  }
);

// Indexes for paginated org-scoped lookups
activityLogSchema.index({ organizationId: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, action: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, userId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
module.exports.ACTION_TYPES = ACTION_TYPES;
