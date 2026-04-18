/**
 * requireRole middleware — restricts route access by user role.
 *
 * Usage:
 *   router.delete('/:id', auth, requireRole('OWNER'), handler)
 *   router.post('/',      auth, requireRole('OWNER', 'WORKER'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access restricted. Required role: ${roles.join(' or ')}.`,
      yourRole: req.user.role,
    });
  }
  next();
};

module.exports = requireRole;
