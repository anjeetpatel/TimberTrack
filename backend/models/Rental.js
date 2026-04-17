const mongoose = require('mongoose');

const rentalItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  issuedQty: {
    type: Number,
    required: true,
    min: [1, 'Must rent at least 1 item'],
  },
  returnedQty: {
    type: Number,
    default: 0,
    min: 0,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  lastCalculatedDate: {
    type: Date,
    required: true,
  },
}, { _id: false });

const rentalSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: {
    type: [rentalItemSchema],
    validate: [arr => arr.length > 0, 'At least one item is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED'],
    default: 'ACTIVE',
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PARTIAL', 'PAID'],
    default: 'UNPAID',
  },
}, { timestamps: true });

// Virtual: remaining balance
rentalSchema.virtual('remainingBalance').get(function () {
  return Math.max(0, this.totalAmount - this.amountPaid);
});

rentalSchema.set('toJSON', { virtuals: true });
rentalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Rental', rentalSchema);
