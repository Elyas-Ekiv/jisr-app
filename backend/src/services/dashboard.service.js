const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get dashboard statistics for a user
 * Aggregates data from all user's children
 */
const getDashboardStats = async (userId) => {
  // Get all children for the user
  const children = await prisma.child.findMany({
    where: { userId },
    include: {
      vocabulary: {
        include: {
          vocabulary: true,
        },
      },
      analytics: {
        orderBy: { timestamp: 'desc' },
        take: 1000, // Get recent analytics for calculations
      },
    },
  });

  if (children.length === 0) {
    return {
      totalCards: 0,
      sentencesToday: 0,
      mostUsedCard: 'None',
      communicationStreak: 0,
      totalChildren: 0,
    };
  }

  // Calculate total vocabulary cards across all children
  const totalCards = children.reduce((sum, child) => {
    return sum + child.vocabulary.length;
  }, 0);

  // Calculate sentences/communications today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sentencesToday = children.reduce((sum, child) => {
    const todayAnalytics = child.analytics.filter(
      (a) => new Date(a.timestamp) >= today && a.sentence
    );
    return sum + todayAnalytics.length;
  }, 0);

  // Find most used vocabulary across all children
  const vocabularyUsage = {};
  children.forEach((child) => {
    child.analytics.forEach((analytics) => {
      analytics.vocabularyIds.forEach((vocabId) => {
        vocabularyUsage[vocabId] = (vocabularyUsage[vocabId] || 0) + 1;
      });
    });
  });

  // Get most used vocabulary
  let mostUsedCard = 'None';
  if (Object.keys(vocabularyUsage).length > 0) {
    const mostUsedId = Object.entries(vocabularyUsage)
      .sort(([, a], [, b]) => b - a)[0][0];
    
    // Get vocabulary text
    const vocab = await prisma.vocabulary.findUnique({
      where: { id: mostUsedId },
    });
    
    if (vocab && vocab.text) {
      const textObj = typeof vocab.text === 'string' 
        ? JSON.parse(vocab.text) 
        : vocab.text;
      mostUsedCard = textObj.en || textObj.ar || 'Unknown';
    }
  }

  // Calculate communication streak (consecutive days with at least one communication)
  const communicationStreak = calculateCommunicationStreak(children);

  return {
    totalCards,
    sentencesToday,
    mostUsedCard,
    communicationStreak,
    totalChildren: children.length,
  };
};

/**
 * Calculate communication streak
 * Returns the number of consecutive days with at least one communication
 */
const calculateCommunicationStreak = (children) => {
  if (children.length === 0) return 0;

  // Get all analytics from all children
  const allAnalytics = children.flatMap((child) => child.analytics);
  
  if (allAnalytics.length === 0) return 0;

  // Group by date
  const dailyCommunications = {};
  allAnalytics.forEach((analytics) => {
    const date = new Date(analytics.timestamp).toISOString().split('T')[0];
    if (!dailyCommunications[date]) {
      dailyCommunications[date] = 0;
    }
    dailyCommunications[date]++;
  });

  // Calculate streak (check consecutive days from today backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dailyCommunications[dateStr] && dailyCommunications[dateStr] > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get recent activity logs for a user
 */
const getRecentActivity = async (userId, limit = 10) => {
  const activities = await prisma.activityLog.findMany({
    where: { userId },
    include: {
      child: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    type: activity.type,
    time: formatTimeAgo(activity.createdAt),
    childName: activity.child?.name,
  }));
};

/**
 * Format time ago (e.g., "2 hours ago", "1 day ago")
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
};
