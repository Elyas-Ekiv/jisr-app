const express = require('express');
const controller = require('../controllers/userPreferences.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/user-preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/', controller.getPreferences);

/**
 * @route   PUT /api/user-preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/', controller.updatePreferences);

module.exports = router;
