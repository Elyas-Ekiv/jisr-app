const analyticsService = require('../services/analytics.service');
const { catchAsync } = require('../middlewares/error.middleware');

const getAnalytics = catchAsync(async (req, res) => {
  const { childId } = req.params;
  const analytics = await analyticsService.getAnalytics(childId, req.user.id);
  res.status(200).json({
    status: 'success',
    data: analytics,
  });
});

const recordUsage = catchAsync(async (req, res) => {
  const { childId } = req.params;
  const analytics = await analyticsService.recordUsage(childId, req.body, req.user.id);
  res.status(201).json({
    status: 'success',
    message: 'Usage recorded successfully',
    data: analytics,
  });
});

module.exports = {
  getAnalytics,
  recordUsage,
};

