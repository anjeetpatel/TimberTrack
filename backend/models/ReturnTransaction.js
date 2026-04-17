const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantityReturned: {
    type: Number,
    required: true,
    min: [1, 'Must return at least 1 item'],
  },
  daysCharged: {
    type: Number,
    required: true,
    min: 1,
  },
  lineCost: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const returnTransactionSchema = new mongoose.Schema({
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: [true, 'Rental ID is required'],
  },
  returnedItems: {
    type: [returnItemSchema],
    validate: [arr => arr.length > 0, 'At least one item must be returned'],
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required'],
    default: Date.now,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  damageCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  lostCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('ReturnTransaction', returnTransactionSchema);
