const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/restriction.middleware');
const { paymentLimiter } = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
  createPaymentValidation,
  verifyPaymentValidation,
} = require('../validations/payment.validation');

const router = express.Router();

/**
 * POST /api/payments/create
 * Create a Thawani checkout session.
 */
router.post(
  '/create',
  authenticate,
  requireFeature('payments'),
  paymentLimiter,
  createPaymentValidation,
  validate,
  paymentController.createPayment
);

/**
 * POST /api/payments/verify
 * Verify payment status after redirect from Thawani.
 */
router.post(
  '/verify',
  authenticate,
  verifyPaymentValidation,
  validate,
  paymentController.verifyPayment
);

/**
 * POST /api/payments/webhooks/thawani
 * Thawani server-to-server webhook (public — no JWT).
 * Raw body is captured by the express.json verify callback in app.js.
 */
router.post('/webhooks/thawani', paymentController.handleWebhook);

/**
 * POST /api/payments/refund
 * Issue a refund for a completed payment.
 * Admin only.
 */
router.post(
  '/refund',
  authenticate,
  requireAdmin,
  paymentController.refundPayment
);

/**
 * GET /api/payments/transactions
 * Return payment history.
 * Regular users: their own payments.
 * Admin + ?all=true: all payments.
 */
router.get(
  '/transactions',
  authenticate,
  paymentController.getTransactions
);

/**
 * POST /api/payments/validate-discount
 * Validate a discount code and return preview pricing.
 */
router.post(
  '/validate-discount',
  authenticate,
  paymentController.validateDiscount
);

module.exports = router;

