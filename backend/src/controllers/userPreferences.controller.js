const userPreferencesService = require('../services/userPreferences.service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * Get user preferences
 */
const getPreferences = catchAsync(async (req, res) => {
  const preferences = await userPreferencesService.getUserPreferences(req.user.id);
  res.status(200).json({
    status: 'success',
    data: preferences,
  });
});

/**
 * Update user preferences
 */
const updatePreferences = catchAsync(async (req, res) => {
  const preferences = await userPreferencesService.updateUserPreferences(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Preferences updated successfully',
    data: preferences,
  });
});

module.exports = {
  getPreferences,
  updatePreferences,
};
