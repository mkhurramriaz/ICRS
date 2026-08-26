const express = require('express');
const { getDashboardSummary } = require('../Controllers/dashboardController');
const { authMiddleware } = require('../Middlewares/authMiddleware');

const router = express.Router();

// Fetch aggregated dashboard metrics
router.get('/summary', authMiddleware, getDashboardSummary);

module.exports = router;
