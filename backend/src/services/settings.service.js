const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');
const activityService = require('./activity.service');

const getSettings = async (childId, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  let settings = await prisma.aACSettings.findUnique({
    where: { childId },
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.aACSettings.create({
      data: {
        childId,
        primaryLanguage: 'en',
        voiceType: 'child',
        speechSpeed: 0.8,
        volume: 1.0,
        maxSentenceLength: 10,
        visibleImageCount: 0,
        vocabularyLevel: 'BASIC',
        speechMode: 'SENTENCE',
      },
    });
  }

  return settings;
};

const updateSettings = async (childId, data, userId) => {
  // Verify child belongs to user
  const child = await prisma.child.findFirst({
    where: { id: childId, userId },
  });

  if (!child) {
    throw new AppError('Child not found', 404);
  }

  // Check if settings exist
  const existing = await prisma.aACSettings.findUnique({
    where: { childId },
  });

  if (existing) {
    // Track which settings changed
    const settingsChanged = [];
    if (data.primaryLanguage && data.primaryLanguage !== existing.primaryLanguage) {
      settingsChanged.push('Primary Language');
    }
    if (data.voiceType && data.voiceType !== existing.voiceType) {
      settingsChanged.push('Voice Type');
    }
    if (data.speechSpeed !== undefined && data.speechSpeed !== existing.speechSpeed) {
      settingsChanged.push('Speech Speed');
    }
    if (data.volume !== undefined && data.volume !== existing.volume) {
      settingsChanged.push('Volume');
    }
    if (data.vocabularyLevel && data.vocabularyLevel !== existing.vocabularyLevel) {
      settingsChanged.push('Vocabulary Level');
    }

    const updated = await prisma.aACSettings.update({
      where: { childId },
      data: {
        primaryLanguage: data.primaryLanguage,
        secondaryLanguage: data.secondaryLanguage,
        voiceType: data.voiceType,
        speechSpeed: data.speechSpeed,
        volume: data.volume,
        maxSentenceLength: data.maxSentenceLength,
        visibleImageCount: data.visibleImageCount,
        vocabularyLevel: data.vocabularyLevel,
        speechMode: data.speechMode,
        gridColumns: data.gridColumns,
        cardSize: data.cardSize,
      },
    });

    // Log activity if settings changed
    if (settingsChanged.length > 0) {
      try {
        await activityService.logSettingsUpdated(userId, childId, settingsChanged);
      } catch (error) {
        console.error('Failed to log settings update activity:', error);
        // Don't fail the request if activity logging fails
      }
    }

    return updated;
  } else {
    // Create new settings
    return await prisma.aACSettings.create({
      data: {
        childId,
        primaryLanguage: data.primaryLanguage || 'en',
        secondaryLanguage: data.secondaryLanguage,
        voiceType: data.voiceType || 'child',
        speechSpeed: data.speechSpeed || 0.8,
        volume: data.volume || 1.0,
        maxSentenceLength: data.maxSentenceLength || 10,
        visibleImageCount: data.visibleImageCount || 0,
        vocabularyLevel: data.vocabularyLevel || 'BASIC',
        speechMode: data.speechMode || 'SENTENCE',
        gridColumns: data.gridColumns || 4,
        cardSize: data.cardSize || 'medium',
      },
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};

