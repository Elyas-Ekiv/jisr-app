const progressService = require('../services/progress.service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * Get progress analytics
 */
const getProgress = catchAsync(async (req, res) => {
  const timeRange = req.query.range || 'week';
  const childId = req.query.childId || null;
  const progress = await progressService.getProgressAnalytics(req.user.id, timeRange, childId);
  res.status(200).json({
    status: 'success',
    data: progress,
  });
});

module.exports = {
  getProgress,
};
