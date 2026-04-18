const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required'],
  },
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: [true, 'Rental ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment must be at least ₹1'],
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'],
    required: [true, 'Payment method is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Compound org-scoped indexes
paymentSchema.index({ organizationId: 1, rentalId: 1, createdAt: -1 });
paymentSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
