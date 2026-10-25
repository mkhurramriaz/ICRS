const express = require('express');
const { body } = require('express-validator');
const {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint
} = require('../Controllers/complaintController');
const { authMiddleware, requireRole } = require('../Middlewares/authMiddleware');
const upload = require('../Middlewares/uploadMiddleware');

const router = express.Router();

// Validation chains for complaint creation
const createValidation = [
  body('title').notEmpty().withMessage('Complaint title is required').trim(),
  body('description').notEmpty().withMessage('Complaint description is required').trim(),
  body('category').notEmpty().withMessage('Civic category selection is required').trim(),
  body('location').notEmpty().withMessage('Location details are required').trim(),
  body('latitude').notEmpty().withMessage('Latitude is required').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').notEmpty().withMessage('Longitude is required').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
];

// Routes mapping
router.post(
  '/',
  authMiddleware,
  requireRole('CITIZEN', 'ADMIN'),
  upload.single('image'),
  createValidation,
  createComplaint
);

router.get('/', authMiddleware, getComplaints);
router.get('/my', authMiddleware, getMyComplaints);
router.get('/:id', authMiddleware, getComplaintById);

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('STAFF', 'ADMIN'),
  updateComplaintStatus
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('STAFF', 'ADMIN'),
  updateComplaint
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  deleteComplaint
);

module.exports = router;
