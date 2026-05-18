const express = require('express');
const controller = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', controller.getStats);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/activity', controller.getRecentActivity);

/**
 * @route   GET /api/dashboard/notifications
 * @desc    Get notifications
 * @access  Private
 */
router.get('/notifications', controller.getNotifications);

/**
 * @route   GET /api/dashboard/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/notifications/unread-count', controller.getUnreadCount);

/**
 * @route   PUT /api/dashboard/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', controller.markNotificationAsRead);

/**
 * @route   PUT /api/dashboard/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/notifications/read-all', controller.markAllNotificationsAsRead);

module.exports = router;
