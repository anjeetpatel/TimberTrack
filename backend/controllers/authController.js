const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { phone, name, pin } = req.body;

    if (!phone || !name || !pin) {
      return res.status(400).json({ success: false, message: 'Phone, name, and PIN are required.' });
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits.' });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This phone number is already registered.' });
    }

    const user = await User.create({ phone, name, pin });
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { token, user: { id: user._id, name: user.name, phone: user.phone } },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ success: false, message: 'Phone and PIN are required.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this phone number.' });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect PIN. Please try again.' });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful!',
      data: { token, user: { id: user._id, name: user.name, phone: user.phone } },
    });
  } catch (error) {
    next(error);
  }
};
