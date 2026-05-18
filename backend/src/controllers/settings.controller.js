const settingsService = require('../services/settings.service');
const { catchAsync } = require('../middlewares/error.middleware');

const getSettings = catchAsync(async (req, res) => {
  const { childId } = req.params;
  const settings = await settingsService.getSettings(childId, req.user.id);
  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const { childId } = req.params;
  const settings = await settingsService.updateSettings(childId, req.body, req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Settings updated successfully',
    data: settings,
  });
});

module.exports = {
  getSettings,
  updateSettings,
};

