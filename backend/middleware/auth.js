const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid authentication token.';
      return res.status(401).json({ success: false, message: msg });
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('name role organizationId isActive');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact your organization owner.' });
    }

    // Attach user context to request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      organizationId: user.organizationId.toString(),
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
