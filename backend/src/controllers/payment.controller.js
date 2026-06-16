const paymentService = require('../services/payment.service');
const { catchAsync, AppError } = require('../middlewares/error.middleware');

/**
 * POST /api/payments/create
 */
const createPayment = catchAsync(async (req, res) => {
  const { planId, discountCode } = req.body;
  const userId = req.user.id;

  const result = await paymentService.createPaymentSession(userId, planId, discountCode);

  res.status(200).json({
    status: 'success',
    message: 'Payment session created',
    data: result,
  });
});

/**
 * POST /api/payments/verify
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user?.id;

  const result = await paymentService.verifyPayment(sessionId, userId);

  if (result.success) {
    return res.status(200).json({
      status: 'success',
      message: result.message,
      data: result,
    });
  }

  return res.status(400).json({
    status: 'fail',
    message: result.message,
    data: result,
  });
});

/**
 * POST /api/payments/webhooks/thawani
 * Public – called by Thawani servers only.
 * Raw body is available on req.rawBody (set by the express.json verify callback).
 */
const handleWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['thawani-signature'];
  const timestamp = req.headers['thawani-timestamp'];
  const rawBody = req.rawBody;
  const webhookData = req.body;

  if (!signature || !timestamp) {
    return res.status(401).json({
      status: 'fail',
      message: 'Missing webhook signature or timestamp headers',
    });
  }

  if (!rawBody) {
    // Should not happen if app.js verify callback is correctly configured
    return res.status(400).json({
      status: 'fail',
      message: 'Raw body unavailable for signature verification',
    });
  }

  const result = await paymentService.handleWebhook(rawBody, webhookData, timestamp, signature);

  return res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * POST /api/payments/refund
 * Admin only.
 */
const refundPayment = catchAsync(async (req, res) => {
  const { payment_id } = req.body;

  if (!payment_id) {
    throw new AppError('payment_id is required', 400);
  }

  const result = await paymentService.processRefund(payment_id);

  return res.status(200).json({
    status: 'success',
    message: result.message,
    data: result,
  });
});

/**
 * GET /api/payments/transactions
 * Authenticated user → their own transactions.
 * Admin → all transactions (pass ?all=true).
 */
const getTransactions = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  // Admins can request all transactions via ?all=true
  const isAdmin = req.user.role === 'ADMIN';
  const fetchAll = isAdmin && req.query.all === 'true';
  const userId = fetchAll ? null : req.user.id;

  const result = await paymentService.getTransactions(userId, { page, limit });

  return res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * POST /api/payments/validate-discount
 * Validate a discount code and return preview pricing.
 */
const validateDiscount = catchAsync(async (req, res) => {
  const { code, planId } = req.body;

  if (!code || !planId) {
    throw new AppError('code and planId are required', 400);
  }

  const result = await paymentService.validateDiscount(code, planId);

  return res.status(200).json({
    status: result.valid ? 'success' : 'fail',
    data: result,
  });
});

module.exports = {
  createPayment,
  verifyPayment,
  handleWebhook,
  refundPayment,
  getTransactions,
  validateDiscount,
};
