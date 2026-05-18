const dashboardService = require('../services/dashboard.service');
const notificationService = require('../services/notification.service');
const activityService = require('../services/activity.service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * Get dashboard statistics
 */
const getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

/**
 * Get recent activity
 */
const getRecentActivity = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const activities = await dashboardService.getRecentActivity(req.user.id, limit);
  res.status(200).json({
    status: 'success',
    data: activities,
  });
});

/**
 * Get notifications
 */
const getNotifications = catchAsync(async (req, res) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const limit = parseInt(req.query.limit) || 50;
  const notifications = await notificationService.getNotifications(req.user.id, {
    unreadOnly,
    limit,
  });
  res.status(200).json({
    status: 'success',
    data: notifications,
  });
});

/**
 * Get unread notification count
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { count },
  });
});

/**
 * Mark notification as read
 */
const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  await notificationService.markAsRead(id, req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
  });
});

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

module.exports = {
  getStats,
  getRecentActivity,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
