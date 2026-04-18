const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    // ── Multi-tenant ──────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },

    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    availableQuantity: {
      type: Number,
      min: [0, 'Available quantity cannot be negative'],
    },
    itemValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-set availableQuantity = totalQuantity on first create
inventorySchema.pre('save', function (next) {
  if (this.isNew && this.availableQuantity === undefined) {
    this.availableQuantity = this.totalQuantity;
  }
  next();
});

// ── Compound indexes ──────────────────────────────────────
inventorySchema.index({ organizationId: 1, isDeleted: 1, name: 1 });
inventorySchema.index({ organizationId: 1, availableQuantity: 1 });
inventorySchema.index({ organizationId: 1, category: 1 });

// Virtual: human-readable status
inventorySchema.virtual('status').get(function () {
  if (this.isDeleted) return 'Deleted';
  if (this.availableQuantity === 0) return 'Out of Stock';
  if (this.availableQuantity < this.totalQuantity * 0.2) return 'Low Stock';
  return 'Available';
});

module.exports = mongoose.model('Inventory', inventorySchema);
