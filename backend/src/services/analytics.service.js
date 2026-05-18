const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');
const activityService = require('./activity.service');

const getAnalytics = async (childId, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  // Get analytics data
  const analytics = await prisma.usageAnalytics.findMany({
    where: { childId },
    orderBy: { timestamp: 'desc' },
    take: 100, // Last 100 records
  });

  // Calculate statistics
  const totalUsages = analytics.length;
  const vocabularyUsage = {};
  const dailyUsage = {};

  analytics.forEach((record) => {
    // Count vocabulary usage
    record.vocabularyIds.forEach((vocabId) => {
      vocabularyUsage[vocabId] = (vocabularyUsage[vocabId] || 0) + 1;
    });

    // Count daily usage
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    dailyUsage[date] = (dailyUsage[date] || 0) + 1;
  });

  // Get most used vocabulary
  const mostUsed = Object.entries(vocabularyUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([vocabId, count]) => ({
      vocabularyId: vocabId,
      count,
    }));

  return {
    totalUsages,
    mostUsed,
    dailyUsage,
    recentAnalytics: analytics.slice(0, 20),
  };
};

const recordUsage = async (childId, data, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  const analytics = await prisma.usageAnalytics.create({
    data: {
      childId,
      vocabularyIds: data.vocabularyIds || [],
      sentence: data.sentence,
      timestamp: new Date(),
    },
  });

  // Log activity if there's significant usage
  try {
    if (data.vocabularyIds && data.vocabularyIds.length > 0) {
      await activityService.logVocabularyUsed(
        userId,
        childId,
        data.vocabularyIds,
        data.sentence
      );
    }
  } catch (error) {
    console.error('Failed to log vocabulary usage activity:', error);
    // Don't fail the request if activity logging fails
  }

  return analytics;
};

module.exports = {
  getAnalytics,
  recordUsage,
};

