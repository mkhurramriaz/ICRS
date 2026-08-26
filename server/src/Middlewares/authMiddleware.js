const jwt = require('jsonwebtoken');
const User = require('../Models/User');

/**
 * Authentication middleware that verifies the JWT token sent in authorization headers.
 * Extracts userId, resolves the User, and attaches it to req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Authorization token missing or malformed'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('Error: JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }

    const decoded = jwt.verify(token, secret);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: User account not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: User account has been deactivated'
      });
    }

    // Attach user information to request
    req.user = user;
    next();
  } catch (error) {
    let msg = 'Access Denied: Invalid authentication token';
    if (error.name === 'TokenExpiredError') {
      msg = 'Access Denied: Authentication token has expired';
    }
    return res.status(401).json({
      success: false,
      message: msg,
      errors: [error.message]
    });
  }
};

/**
 * Authorization middleware to check if user has necessary role access.
 * 
 * @param {...string} roles - Allowed roles (e.g. 'CITIZEN', 'STAFF', 'ADMIN')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: User is not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Unauthorized access level. Requires one of: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { authMiddleware, requireRole };
