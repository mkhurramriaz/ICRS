const express = require('express');
const Department = require('../Models/Department');

const router = express.Router();

/**
 * Get all active departments
 * GET /api/departments
 */
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).select('name code issueTypes');
    return res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
