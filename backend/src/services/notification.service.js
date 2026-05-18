const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get notifications for a user
 */
const getNotifications = async (userId, options = {}) => {
  const { unreadOnly = false, limit = 50 } = options;

  const where = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications;
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return count;
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });
};

/**
 * Create a notification
 */
const createNotification = async (userId, data) => {
  return await prisma.notification.create({
    data: {
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      link: data.link,
      metadata: data.metadata,
    },
  });
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
};
