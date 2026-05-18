const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get progress analytics for a user (aggregated across all children, or for a specific child)
 */
const getProgressAnalytics = async (userId, timeRange = 'week', childId = null) => {
  // Build the where clause: either a specific child or all children for the user
  const whereClause = childId
    ? { userId, id: childId }
    : { userId };

  // Get children matching the filter
  const children = await prisma.child.findMany({
    where: whereClause,
    include: {
      vocabulary: {
        include: {
          vocabulary: true,
        },
      },
      analytics: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (children.length === 0) {
    return {
      overallProgress: 0,
      lessonsCompleted: 0,
      averageScore: 0,
      learningStreak: 0,
      weeklyActivity: [],
      subjectProgress: [],
      recentAchievements: [],
      learningTimeline: [],
    };
  }

  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  // Filter analytics by time range
  const filteredAnalytics = children.flatMap((child) =>
    child.analytics.filter((a) => new Date(a.timestamp) >= startDate)
  );

  // Calculate overall progress (based on vocabulary usage)
  const totalVocabulary = children.reduce((sum, child) => sum + child.vocabulary.length, 0);
  const usedVocabulary = new Set();
  filteredAnalytics.forEach((a) => {
    a.vocabularyIds.forEach((id) => usedVocabulary.add(id));
  });
  const overallProgress = totalVocabulary > 0 
    ? Math.round((usedVocabulary.size / totalVocabulary) * 100)
    : 0;

  // Lessons completed (communications made)
  const lessonsCompleted = filteredAnalytics.length;

  // Average score (based on usage frequency - more usage = higher score)
  const vocabularyUsageCount = {};
  filteredAnalytics.forEach((a) => {
    a.vocabularyIds.forEach((id) => {
      vocabularyUsageCount[id] = (vocabularyUsageCount[id] || 0) + 1;
    });
  });
  const avgUsage = Object.values(vocabularyUsageCount).length > 0
    ? Object.values(vocabularyUsageCount).reduce((sum, count) => sum + count, 0) / Object.values(vocabularyUsageCount).length
    : 0;
  const averageScore = Math.min(100, Math.round(avgUsage * 10)); // Scale to 0-100

  // Learning streak (consecutive days with activity)
  const learningStreak = calculateLearningStreak(children, startDate);

  // Weekly activity (last 7 days)
  const weeklyActivity = calculateWeeklyActivity(children);

  // Subject progress (based on vocabulary categories)
  const subjectProgress = calculateSubjectProgress(children, filteredAnalytics);

  // Recent achievements (milestones)
  const recentAchievements = calculateRecentAchievements(children, filteredAnalytics);

  // Learning timeline (recent activities)
  const learningTimeline = calculateLearningTimeline(filteredAnalytics.slice(0, 10));

  return {
    overallProgress,
    lessonsCompleted,
    averageScore,
    learningStreak,
    weeklyActivity,
    subjectProgress,
    recentAchievements,
    learningTimeline,
  };
};

/**
 * Calculate learning streak
 */
const calculateLearningStreak = (children, startDate) => {
  const allAnalytics = children.flatMap((child) => child.analytics);
  const dailyActivity = {};
  
  allAnalytics.forEach((a) => {
    const date = new Date(a.timestamp).toISOString().split('T')[0];
    if (!dailyActivity[date]) {
      dailyActivity[date] = 0;
    }
    dailyActivity[date]++;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (currentDate >= startDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dailyActivity[dateStr] && dailyActivity[dateStr] > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate weekly activity
 */
const calculateWeeklyActivity = (children) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = {};
  
  // Initialize with 0
  days.forEach(day => weeklyData[day] = 0);

  const allAnalytics = children.flatMap((child) => child.analytics);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  allAnalytics
    .filter((a) => new Date(a.timestamp) >= oneWeekAgo)
    .forEach((a) => {
      const date = new Date(a.timestamp);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert Sunday=0 to Monday=0
      weeklyData[dayName] = (weeklyData[dayName] || 0) + 1;
    });

  return days.map(day => ({
    day,
    activities: weeklyData[day] || 0,
  }));
};

/**
 * Calculate subject progress (based on vocabulary categories)
 */
const calculateSubjectProgress = (children, analytics) => {
  const categories = ['needs', 'actions', 'feelings', 'people', 'places', 'objects'];
  const categoryStats = {};

  // Get all vocabulary categories
  children.forEach((child) => {
    child.vocabulary.forEach((cv) => {
      const category = cv.vocabulary.category.toLowerCase();
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          used: new Set(),
          lessons: 0,
        };
      }
      categoryStats[category].total++;
    });
  });

  // Count usage
  analytics.forEach((a) => {
    a.vocabularyIds.forEach((vocabId) => {
      const vocab = children
        .flatMap((c) => c.vocabulary)
        .find((cv) => cv.vocabulary.id === vocabId);
      if (vocab) {
        const category = vocab.vocabulary.category.toLowerCase();
        if (categoryStats[category]) {
          categoryStats[category].used.add(vocabId);
          categoryStats[category].lessons++;
        }
      }
    });
  });

  // Format as subject progress
  return Object.entries(categoryStats)
    .map(([category, stats]) => ({
      subject: category.charAt(0).toUpperCase() + category.slice(1),
      progress: stats.total > 0 ? Math.round((stats.used.size / stats.total) * 100) : 0,
      lessons: stats.lessons,
      avgScore: stats.used.size > 0 ? Math.round((stats.lessons / stats.used.size) * 10) : 0,
    }))
    .slice(0, 4); // Limit to 4 subjects
};

/**
 * Calculate recent achievements
 */
const calculateRecentAchievements = (children, analytics) => {
  const achievements = [];
  const now = new Date();

  // Achievement: Completed 10 communications
  const totalCommunications = analytics.length;
  if (totalCommunications >= 10) {
    achievements.push({
      id: 'comm-10',
      title: 'Communication Master',
      description: `Completed ${totalCommunications} communications`,
      date: formatTimeAgo(now),
    });
  }

  // Achievement: Used 20 vocabulary items
  const uniqueVocabulary = new Set();
  analytics.forEach((a) => {
    a.vocabularyIds.forEach((id) => uniqueVocabulary.add(id));
  });
  if (uniqueVocabulary.size >= 20) {
    achievements.push({
      id: 'vocab-20',
      title: 'Vocabulary Explorer',
      description: `Used ${uniqueVocabulary.size} different vocabulary items`,
      date: formatTimeAgo(now),
    });
  }

  // Achievement: 7 day streak
  const streak = calculateLearningStreak(children, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
  if (streak >= 7) {
    achievements.push({
      id: 'streak-7',
      title: 'Weekly Champion',
      description: `Maintained ${streak} day learning streak`,
      date: formatTimeAgo(now),
    });
  }

  return achievements.slice(0, 3);
};

/**
 * Calculate learning timeline
 */
const calculateLearningTimeline = (analytics) => {
  return analytics.map((a, index) => {
    const date = new Date(a.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    let dateLabel = 'Today';
    if (diffDays === 1) dateLabel = 'Yesterday';
    else if (diffDays > 1) dateLabel = `${diffDays} days ago`;

    return {
      date: dateLabel,
      activity: a.sentence || `Used ${a.vocabularyIds.length} vocabulary card(s)`,
      time: formatTimeAgo(a.timestamp),
    };
  });
};

/**
 * Format time ago
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
  return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
};

module.exports = {
  getProgressAnalytics,
};
