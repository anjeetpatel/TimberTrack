const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
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
    min: [0, 'Quantity cannot be negative'],
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
  },
  itemValue: {
    type: Number,
    default: 0,
    min: [0, 'Item value cannot be negative'],
  },
}, { timestamps: true });

// Virtual for status display
inventorySchema.virtual('status').get(function () {
  if (this.availableQuantity === 0) return 'Out of Stock';
  if (this.availableQuantity < this.totalQuantity * 0.2) return 'Low Stock';
  return 'In Stock';
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
