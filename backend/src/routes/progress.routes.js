const express = require('express');
const controller = require('../controllers/progress.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/progress
 * @desc    Get progress analytics
 * @access  Private
 */
router.get('/', controller.getProgress);

module.exports = router;
