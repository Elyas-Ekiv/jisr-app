const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get activity logs for a user
 */
const getActivities = async (userId, options = {}) => {
  const { childId = null, type = null, limit = 50 } = options;

  const where = { userId };
  if (childId) {
    where.childId = childId;
  }
  if (type) {
    where.type = type;
  }

  const activities = await prisma.activityLog.findMany({
    where,
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

  return activities;
};

/**
 * Create an activity log
 */
const createActivity = async (userId, data) => {
  return await prisma.activityLog.create({
    data: {
      userId,
      childId: data.childId || null,
      type: data.type,
      title: data.title,
      description: data.description,
      metadata: data.metadata || {},
    },
  });
};

/**
 * Helper: Create activity when vocabulary is added
 */
const logVocabularyAdded = async (userId, childId, vocabularyId, vocabularyText) => {
  const textObj = typeof vocabularyText === 'string' 
    ? JSON.parse(vocabularyText) 
    : vocabularyText;
  const text = textObj.en || textObj.ar || 'vocabulary';
  
  return await createActivity(userId, {
    childId,
    type: 'VOCABULARY_ADDED',
    title: `Added new vocabulary card: "${text}"`,
    description: `Vocabulary card added to child's vocabulary`,
    metadata: { vocabularyId },
  });
};

/**
 * Helper: Create activity when vocabulary is used
 */
const logVocabularyUsed = async (userId, childId, vocabularyIds, sentence) => {
  return await createActivity(userId, {
    childId,
    type: 'USAGE_RECORDED',
    title: sentence 
      ? `Child used vocabulary: "${sentence}"`
      : `Child used ${vocabularyIds.length} vocabulary card(s)`,
    description: 'Vocabulary usage recorded',
    metadata: { vocabularyIds, sentence },
  });
};

/**
 * Helper: Create activity when settings are updated
 */
const logSettingsUpdated = async (userId, childId, settingsChanged) => {
  return await createActivity(userId, {
    childId,
    type: 'SETTINGS_UPDATED',
    title: 'Updated voice settings',
    description: `Updated: ${settingsChanged.join(', ')}`,
    metadata: { settingsChanged },
  });
};

/**
 * Helper: Create activity when child is created
 */
const logChildCreated = async (userId, childId, childName) => {
  return await createActivity(userId, {
    childId,
    type: 'CHILD_CREATED',
    title: `Added new family member: ${childName}`,
    description: 'New child profile created',
    metadata: { childId },
  });
};

module.exports = {
  getActivities,
  createActivity,
  logVocabularyAdded,
  logVocabularyUsed,
  logSettingsUpdated,
  logChildCreated,
};
