const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    // ── Multi-tenant ──────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },

    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Soft delete ───────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Phone is unique per organization (not globally)
customerSchema.index({ organizationId: 1, phone: 1 }, { unique: true });
customerSchema.index({ organizationId: 1, isDeleted: 1 });
customerSchema.index({ organizationId: 1, name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
