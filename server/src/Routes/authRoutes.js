const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../Controllers/authController');
const { authMiddleware } = require('../Middlewares/authMiddleware');

const router = express.Router();

// Validation chains
const registerValidation = [
  body('name').notEmpty().withMessage('Full name is required').trim(),
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Router registrations
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
