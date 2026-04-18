const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    pin: {
      type: String,
      required: [true, 'PIN is required'],
      minlength: [4, 'PIN must be at least 4 digits'],
      select: false, // never returned in queries by default
    },

    // ── Multi-tenant fields ─────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    role: {
      type: String,
      enum: ['OWNER', 'WORKER'],
      default: 'OWNER',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: a phone number is unique per organization
userSchema.index({ organizationId: 1, phone: 1 }, { unique: true });
userSchema.index({ organizationId: 1, role: 1 });

// Hash PIN before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  this.pin = await bcrypt.hash(this.pin, 12);
  next();
});

// Compare plain PIN to hashed
userSchema.methods.comparePin = async function (plainPin) {
  return bcrypt.compare(plainPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
