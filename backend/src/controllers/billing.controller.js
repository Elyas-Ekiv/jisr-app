const billingService = require('../services/billing.service');
const { catchAsync } = require('../middlewares/error.middleware');

/**
 * GET /api/billing
 * Get user's billing information
 */
const getBilling = catchAsync(async (req, res) => {
  const billing = await billingService.getUserBilling(req.user.id);
  res.status(200).json({
    status: 'success',
    data: billing,
  });
});

/**
 * POST /api/billing/cancel
 * Cancel user's active subscription (keeps access until period ends)
 */
const cancelSubscription = catchAsync(async (req, res) => {
  const result = await billingService.cancelSubscription(req.user.id);
  res.status(200).json({
    status: 'success',
    message: result.message,
    data: result,
  });
});

module.exports = {
  getBilling,
  cancelSubscription,
};
