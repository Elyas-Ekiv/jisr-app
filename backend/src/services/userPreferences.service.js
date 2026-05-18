const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get user preferences
 */
const getUserPreferences = async (userId) => {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    // Create default settings
    settings = await prisma.userSettings.create({
      data: {
        userId,
        language: 'en',
        theme: 'light',
        soundEffects: true,
        backgroundMusic: false,
        contrast: 'normal',
        gridView: true,
        fontSize: 'medium',
      },
    });
  }

  return settings;
};

/**
 * Update user preferences
 */
const updateUserPreferences = async (userId, preferences) => {
  const existing = await prisma.userSettings.findUnique({
    where: { userId },
  });

  const allowedLang = (v) =>
    v === 'ar' || v === 'en' ? v : (existing?.language ?? 'en');
  const allowedTheme = (v) =>
    v === 'light' || v === 'dark' || v === 'auto'
      ? v
      : (existing?.theme ?? 'light');
  const allowedContrast = (v) =>
    v === 'normal' || v === 'high' || v === 'maximum'
      ? v
      : (existing?.contrast ?? 'normal');
  const allowedFont = (v) =>
    v === 'small' || v === 'medium' || v === 'large' || v === 'extra-large'
      ? v
      : (existing?.fontSize ?? 'medium');

  const next = {
    language:
      preferences.language !== undefined
        ? allowedLang(preferences.language)
        : (existing?.language ?? 'en'),
    theme:
      preferences.theme !== undefined
        ? allowedTheme(preferences.theme)
        : (existing?.theme ?? 'light'),
    soundEffects:
      preferences.soundEffects !== undefined
        ? preferences.soundEffects
        : (existing?.soundEffects ?? true),
    backgroundMusic:
      preferences.backgroundMusic !== undefined
        ? preferences.backgroundMusic
        : (existing?.backgroundMusic ?? false),
    contrast:
      preferences.contrast !== undefined
        ? allowedContrast(preferences.contrast)
        : (existing?.contrast ?? 'normal'),
    gridView:
      preferences.gridView !== undefined
        ? preferences.gridView
        : (existing?.gridView ?? true),
    fontSize:
      preferences.fontSize !== undefined
        ? allowedFont(preferences.fontSize)
        : (existing?.fontSize ?? 'medium'),
  };

  if (existing) {
    return await prisma.userSettings.update({
      where: { userId },
      data: next,
    });
  }
  return await prisma.userSettings.create({
    data: {
      userId,
      ...next,
    },
  });
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
};
