const express = require('express');
const controller = require('../controllers/billing.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/billing
 * @desc    Get user's billing information
 * @access  Private
 */
router.get('/', controller.getBilling);

/**
 * @route   POST /api/billing/cancel
 * @desc    Cancel user's active subscription (grace period until end date)
 * @access  Private
 */
router.post('/cancel', controller.cancelSubscription);

module.exports = router;
