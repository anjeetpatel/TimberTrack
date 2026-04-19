const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, role: user.role, organizationId: user.organizationId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, phone, pin, organizationName, inviteCode } = req.body;

    if (!name || !phone || !pin) {
      return res.status(400).json({ success: false, message: 'Name, phone, and PIN are required.' });
    }
    if (pin.length < 4) {
      return res.status(400).json({ success: false, message: 'PIN must be at least 4 digits.' });
    }
    if (!organizationName && !inviteCode) {
      return res.status(400).json({ success: false, message: 'Provide either organizationName (to create a new org) or inviteCode (to join an existing one).' });
    }

    let org;
    let role;
    let newUserId;

    if (organizationName) {
      newUserId = new mongoose.Types.ObjectId();
      // ── Create new organization as OWNER ──────────────────────
      org = await Organization.create({
        name: organizationName.trim(),
        ownerId: newUserId, // will be set after user creation
        usageStats: { lastResetDate: new Date() },
      });
      role = 'OWNER';
    } else {
      // ── Join existing org as WORKER via invite code ────────────
      org = await Organization.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
      if (!org) {
        return res.status(404).json({ success: false, message: 'Invalid invite code. Please check with your organization owner.' });
      }

      const validity = org.isInviteValid();
      if (!validity.valid) {
        return res.status(400).json({ success: false, message: validity.reason });
      }

      role = 'WORKER';
    }

    // Check duplicate phone within the same org
    const existing = await User.findOne({ organizationId: org._id, phone });
    if (existing) {
      // Clean up orphan org if just created
      if (organizationName) await Organization.findByIdAndDelete(org._id);
      return res.status(400).json({ success: false, message: 'A user with this phone number already exists in this organization.' });
    }

    const userData = {
      name: name.trim(),
      phone: phone.trim(),
      pin,
      organizationId: org._id,
      role,
    };
    if (newUserId) {
      userData._id = newUserId;
    }
    const user = await User.create(userData);

    // For new org: set ownerId now that user exists
    if (organizationName) {
      org.ownerId = user._id;
      await org.save();
    } else {
      // For invite: update usage counter and track who joined
      org.inviteCodeUsageCount += 1;
      org.inviteCodeUsedBy.push(user._id);
      await org.save();
    }

    const token = signToken(user);
    res.status(201).json({
      success: true,
      message: role === 'OWNER' ? 'Organization created successfully!' : 'Joined organization successfully!',
      data: {
        token,
        user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
        organization: { id: org._id, name: org.name, plan: org.plan },
      },
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

    // Need PIN field (select: false by default)
    const user = await User.findOne({ phone }).select('+pin');
    if (!user || !(await user.comparePin(pin))) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or PIN.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const org = await Organization.findById(user.organizationId).select('name plan');
    const token = signToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
        organization: { id: org?._id, name: org?.name, plan: org?.plan },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh — token rotation
exports.refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token required.' });
    }
    const oldToken = authHeader.split(' ')[1];

    let decoded;
    try {
      // Allow refresh of expired tokens (up to 1 day after expiry)
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
      // But reject if more than 1 day past expiry
      const expiry = decoded.exp * 1000;
      if (Date.now() - expiry > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ success: false, message: 'Token too old to refresh. Please log in again.' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const user = await User.findById(decoded.id).select('name role organizationId isActive');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    const newToken = signToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: { token: newToken, expiresAt },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-pin');
    const org = await Organization.findById(req.user.organizationId).select('name plan inviteCode usageStats');
    res.json({
      success: true,
      data: { user, organization: org },
    });
  } catch (error) {
    next(error);
  }
};
