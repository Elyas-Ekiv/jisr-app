const prisma = require('../config/db');
const thawaniService = require('../config/thawani');
const emailService = require('./email.service');
const { AppError } = require('../middlewares/error.middleware');
const billingService = require('./billing.service');

// How many days after order creation a PENDING payment is considered due.
const PAYMENT_DUE_DAYS = 3;

// Plan hierarchy for upgrade checks (higher index = higher tier)
const PLAN_HIERARCHY = ['free-plan', 'family-plan', 'family-plus-plan'];

// ─── Create payment session ───────────────────────────────────────────────────

const createPaymentSession = async (userId, planId, discountCode = null) => {
  console.log(`[Payment] Creating session for user=${userId} plan=${planId}`);

  // ── Duplicate payment prevention ─────────────────────────────────────────
  const activeSub = await billingService.getActiveSubscription(userId);
  if (activeSub) {
    const currentTier = PLAN_HIERARCHY.indexOf(activeSub.planId);
    const requestedTier = PLAN_HIERARCHY.indexOf(planId);

    if (requestedTier >= 0 && requestedTier <= currentTier) {
      throw new AppError(
        `You already have an active ${activeSub.planName} subscription (expires ${activeSub.endDate.toISOString().slice(0, 10)}). You can only upgrade to a higher plan.`,
        400
      );
    }
  }

  const plan = await prisma.paymentPlan.findUnique({ where: { id: planId } });

  if (!plan) {
    const allPlans = await prisma.paymentPlan.findMany({ select: { id: true, name: true, enabled: true } });
    console.log('[Payment] Available plans:', allPlans);
    throw new AppError(
      `Payment plan not found. Requested: ${planId}. Available: ${allPlans.map(p => p.id).join(', ')}`,
      404
    );
  }

  if (!plan.enabled) throw new AppError('Payment plan is disabled', 400);

  let amount = plan.price;
  let discount = null;

  if (discountCode) {
    discount = await prisma.discount.findUnique({ where: { code: discountCode } });

    if (!discount || !discount.enabled) throw new AppError('Invalid discount code', 400);

    const now = new Date();
    if (now < discount.validFrom || now > discount.validTo) {
      throw new AppError('Discount code is not valid at this time', 400);
    }
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      throw new AppError('Discount code has reached maximum uses', 400);
    }

    if (discount.type === 'PERCENTAGE') {
      amount = amount * (1 - discount.value / 100);
    } else if (discount.type === 'FIXED') {
      amount = Math.max(0, amount - discount.value);
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  // Due date = now + PAYMENT_DUE_DAYS (used by the Nudge Engine)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + PAYMENT_DUE_DAYS);

  const order = await prisma.order.create({
    data: {
      userId,
      planId,
      discountId: discount?.id,
      amount,
      status: 'PENDING',
      dueDate,
    },
    include: { plan: true },
  });

  const sessionResult = await thawaniService.createSession({
    amount,
    currency: 'OMR',
    orderReference: order.orderReference,
    customerInfo: { name: user.name, email: user.email },
    metadata: { orderId: order.id, planName: plan.name },
  });

  if (!sessionResult.success) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
    console.error('[Payment] Thawani session creation failed:', sessionResult);
    throw new AppError(sessionResult.error || 'Failed to create payment session', 500, sessionResult.details);
  }

  if (!sessionResult.sessionId || !sessionResult.sessionUrl) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
    throw new AppError('Invalid payment session response from Thawani', 500);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { thawaniSessionId: sessionResult.sessionId },
  });

  console.log(`[Payment] Session created. orderRef=${order.orderReference} sessionId=${sessionResult.sessionId}`);

  return {
    orderId: order.id,
    orderReference: order.orderReference,
    sessionId: sessionResult.sessionId,
    sessionUrl: sessionResult.sessionUrl,
    amount,
    currency: 'OMR',
  };
};

// ─── Verify payment ───────────────────────────────────────────────────────────

const verifyPayment = async (sessionId, userId = null) => {
  console.log(`[Payment] Verifying sessionId=${sessionId} userId=${userId}`);

  let order = null;

  const isOrderReference = sessionId && sessionId.startsWith('cml') && sessionId.length > 20;
  const isInvalidSessionId = !sessionId || sessionId === '{session_id}' || sessionId.includes('{');

  if (isOrderReference) {
    order = await prisma.order.findUnique({
      where: { orderReference: sessionId },
      include: { plan: true, user: { select: { id: true, name: true, email: true } } },
    });
    if (order?.thawaniSessionId) sessionId = order.thawaniSessionId;
  } else if (isInvalidSessionId) {
    console.warn(`[Payment] Invalid session ID format: ${sessionId}`);
    if (userId) {
      order = await prisma.order.findFirst({
        where: { userId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: { plan: true, user: { select: { id: true, name: true, email: true } } },
      });
      if (order?.thawaniSessionId) {
        sessionId = order.thawaniSessionId;
      } else {
        throw new AppError('No pending payment found. Please try the payment again.', 404);
      }
    } else {
      throw new AppError('Invalid session ID. Please login and try again.', 401);
    }
  } else {
    order = await prisma.order.findUnique({
      where: { thawaniSessionId: sessionId },
      include: { plan: true, user: { select: { id: true, name: true, email: true } } },
    });
  }

  // Fallback: resolve order via Thawani's client_reference_id
  if (!order) {
    console.log(`[Payment] Order not found by sessionId; querying Thawani API...`);
    try {
      const sessionResponse = await thawaniService.getSession(sessionId);
      if (sessionResponse.success && sessionResponse.data?.client_reference_id) {
        order = await prisma.order.findUnique({
          where: { orderReference: sessionResponse.data.client_reference_id },
          include: { plan: true, user: { select: { id: true, name: true, email: true } } },
        });
        if (order && !order.thawaniSessionId) {
          await prisma.order.update({ where: { id: order.id }, data: { thawaniSessionId: sessionId } });
        }
      }
    } catch (err) {
      console.error('[Payment] Error querying Thawani for fallback:', err.message);
    }
  }

  // Last-resort fallback by userId
  if (!order && userId) {
    order = await prisma.order.findFirst({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { plan: true, user: { select: { id: true, name: true, email: true } } },
    });
    if (order?.thawaniSessionId) sessionId = order.thawaniSessionId;
  }

  if (!order) throw new AppError('Order not found. Contact support if you completed the payment.', 404);

  console.log(`[Payment] Found order=${order.id} status=${order.status}`);

  if (order.status === 'PAID') {
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id, status: 'COMPLETED' },
    });
    if (existingPayment) {
      return { success: true, payment: existingPayment, order, message: 'Payment already verified' };
    }
  }

  const verificationResult = await thawaniService.verifyPayment(sessionId);

  if (!verificationResult.success) {
    if (['failed', 'cancelled'].includes(verificationResult.status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: verificationResult.status.toUpperCase() },
      });
    }
    return { success: false, status: verificationResult.status, message: 'Payment verification failed' };
  }

  if (verificationResult.status === 'paid') {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        amount: verificationResult.amount || order.amount,
        currency: 'OMR',
        status: 'COMPLETED',
        thawaniPaymentId: verificationResult.paymentId,
        thawaniSessionId: sessionId,
        transactionId: verificationResult.paymentId,
        metadata: { verifiedAt: new Date().toISOString() },
      },
    });

    if (order.discountId) {
      await prisma.discount.update({
        where: { id: order.discountId },
        data: { currentUses: { increment: 1 } },
      });
    }

    // Send success email (non-blocking; failures are logged, not thrown)
    emailService.sendPaymentSuccess({
      email: order.user.email,
      name: order.user.name,
      planName: order.plan.name,
      amount: payment.amount,
      orderReference: order.orderReference,
    }).catch(err => console.error('[Payment] Success email failed:', err.message));

    return { success: true, payment, order, message: 'Payment verified successfully' };
  }

  return { success: false, status: verificationResult.status, message: 'Payment is still pending' };
};

// ─── Webhook handler ──────────────────────────────────────────────────────────

/**
 * @param {string} rawBody   - Raw request body string (req.rawBody)
 * @param {object} webhookData - Parsed request body (req.body)
 * @param {string} timestamp - thawani-timestamp header value
 * @param {string} signature - thawani-signature header value
 */
const handleWebhook = async (rawBody, webhookData, timestamp, signature) => {
  const isValid = thawaniService.verifyWebhookSignature(rawBody, timestamp, signature);

  if (!isValid) {
    throw new AppError('Invalid webhook signature', 401);
  }

  const { session_id, payment_status, payment_id } = webhookData;
  console.log(`[Webhook] Received status=${payment_status} session=${session_id}`);

  const order = await prisma.order.findUnique({
    where: { thawaniSessionId: session_id },
    include: {
      plan: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) throw new AppError('Order not found for this session', 404);

  if (payment_status === 'paid') {
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id, status: 'COMPLETED' },
    });

    if (!existingPayment) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });

      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          amount: order.amount,
          currency: 'OMR',
          status: 'COMPLETED',
          thawaniPaymentId: payment_id,
          thawaniSessionId: session_id,
          transactionId: payment_id,
          metadata: {
            webhookReceivedAt: new Date().toISOString(),
            webhookData,
          },
        },
      });

      if (order.discountId) {
        await prisma.discount.update({
          where: { id: order.discountId },
          data: { currentUses: { increment: 1 } },
        });
      }

      // Send success email (non-blocking)
      emailService.sendPaymentSuccess({
        email: order.user.email,
        name: order.user.name,
        planName: order.plan.name,
        amount: payment.amount,
        orderReference: order.orderReference,
      }).catch(err => console.error('[Webhook] Success email failed:', err.message));
    }
  } else if (payment_status === 'failed' || payment_status === 'cancelled') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: payment_status.toUpperCase() },
    });
  }

  return { success: true, message: 'Webhook processed' };
};

// ─── Process refund ───────────────────────────────────────────────────────────

/**
 * @param {string} paymentId - Internal Payment record ID (not Thawani's)
 */
const processRefund = async (paymentId) => {
  console.log(`[Payment] Processing refund for payment=${paymentId}`);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          plan: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!payment) throw new AppError('Payment record not found', 404);
  if (payment.status === 'REFUNDED') throw new AppError('This payment has already been refunded', 409);
  if (payment.status !== 'COMPLETED') {
    throw new AppError(`Cannot refund a payment with status: ${payment.status}`, 400);
  }
  if (!payment.thawaniPaymentId) {
    throw new AppError('No Thawani payment ID on record — cannot issue refund', 400);
  }

  const refundResult = await thawaniService.createRefund(payment.thawaniPaymentId, payment.amount);

  if (!refundResult.success) {
    throw new AppError(
      `Thawani refund failed: ${refundResult.error}`,
      502,
      refundResult.details
    );
  }

  const refundId = refundResult.data?.id || refundResult.data?.refund_id || 'N/A';

  // Update payment and order status atomically
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        metadata: {
          ...(payment.metadata || {}),
          refundedAt: new Date().toISOString(),
          thawaniRefundId: refundId,
        },
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'REFUNDED' },
    }),
  ]);

  // Send refund confirmation email (non-blocking)
  emailService.sendRefundConfirmation({
    email: payment.order.user.email,
    name: payment.order.user.name,
    planName: payment.order.plan.name,
    amount: payment.amount,
    orderReference: payment.order.orderReference,
    refundId,
  }).catch(err => console.error('[Payment] Refund email failed:', err.message));

  console.log(`[Payment] Refund successful. refundId=${refundId}`);

  return {
    success: true,
    refundId,
    paymentId: payment.id,
    orderReference: payment.order.orderReference,
    amount: payment.amount,
    currency: payment.currency,
    message: 'Refund processed successfully',
  };
};

// ─── Get transactions ─────────────────────────────────────────────────────────

/**
 * Returns payment history for a user (or all payments for admins).
 * @param {string|null} userId - Filter by user; pass null for admin (all records)
 * @param {object}      opts   - { page, limit }
 */
const getTransactions = async (userId = null, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const where = userId ? { userId } : {};

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            plan: { select: { name: true, period: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Validate discount code ───────────────────────────────────────────────────

/**
 * Validate a discount code and return preview pricing.
 * @param {string} code      - Discount code
 * @param {string} planId    - Plan to apply discount to
 * @returns {{ valid, discount, originalPrice, discountedPrice, discountAmount }}
 */
const validateDiscount = async (code, planId) => {
  const plan = await prisma.paymentPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError('Plan not found', 404);

  const discount = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });

  if (!discount || !discount.enabled) {
    return { valid: false, message: 'Invalid discount code' };
  }

  const now = new Date();
  if (now < discount.validFrom || now > discount.validTo) {
    return { valid: false, message: 'Discount code is not valid at this time' };
  }
  if (discount.maxUses && discount.currentUses >= discount.maxUses) {
    return { valid: false, message: 'Discount code has reached maximum uses' };
  }

  let discountAmount = 0;
  if (discount.type === 'PERCENTAGE') {
    discountAmount = plan.price * (discount.value / 100);
  } else if (discount.type === 'FIXED') {
    discountAmount = Math.min(discount.value, plan.price);
  }

  const discountedPrice = Math.max(0, plan.price - discountAmount);

  return {
    valid: true,
    discount: {
      code: discount.code,
      type: discount.type,
      value: discount.value,
      description: discount.description,
    },
    originalPrice: plan.price,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountedPrice: Math.round(discountedPrice * 100) / 100,
  };
};

module.exports = {
  createPaymentSession,
  verifyPayment,
  handleWebhook,
  processRefund,
  getTransactions,
  validateDiscount,
};
