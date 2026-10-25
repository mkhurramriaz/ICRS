const User = require('../Models/User');
const Department = require('../Models/Department');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

/**
 * Generates a signed JWT for authentication
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, role }, secret, { expiresIn });
};

/**
 * Maps User document properties to match frontend application expectations.
 * E.g., lowercase role names 'citizen', 'admin', 'staff'.
 */
const mapUserToFrontend = (user) => {
  return {
    id: user._id ? user._id.toString() : undefined,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    avatarUrl: user.avatarUrl,
    departmentId: user.departmentId ? user.departmentId.toString() : null
  };
};

/**
 * Register a new user (CITIZEN, STAFF, or ADMIN)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Registration validation failed',
        errors: errors.array().map((err) => err.msg)
      });
    }

    const { name, email, password } = req.body;
    const role = (req.body.role || 'CITIZEN').toUpperCase();

    if (!['CITIZEN', 'STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Registration validation failed',
        errors: ['Invalid role. Must be CITIZEN, STAFF, or ADMIN.']
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        errors: ['An account with this email address is already registered.']
      });
    }

    let resolvedDepartmentId = null;

    // Validate department assignment
    if (role === 'STAFF') {
      const { departmentId } = req.body;
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Registration validation failed',
          errors: ['Department is required for STAFF registration.']
        });
      }

      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Registration validation failed',
          errors: ['Invalid department ID format.']
        });
      }

      const dept = await Department.findOne({ _id: departmentId, isActive: true });
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: 'Registration validation failed',
          errors: ['Selected department does not exist or is inactive.']
        });
      }

      resolvedDepartmentId = dept._id;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the User
    const user = new User({
      name,
      email,
      passwordHash,
      role,
      departmentId: resolvedDepartmentId
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0) + role.slice(1).toLowerCase()} registered successfully`,
      token,
      user: mapUserToFrontend(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates login credentials and generates a token
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Login validation failed',
        errors: errors.array().map((err) => err.msg)
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: ['Invalid email or password.']
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account suspended',
        errors: ['This user account has been deactivated.']
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: ['Invalid email or password.']
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: mapUserToFrontend(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Destroys session / log out user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully. Token should be cleared client-side.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the profile of the currently authenticated user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapUserToFrontend(req.user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  mapUserToFrontend
};
