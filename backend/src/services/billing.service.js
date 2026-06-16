const prisma = require('../config/db');
const { AppError } = require('../middlewares/error.middleware');

// Subscription duration constants
const PERIOD_DAYS = { month: 30, year: 365 };

// Plan hierarchy for upgrade checks (higher index = higher tier)
const PLAN_HIERARCHY = ['free-plan', 'family-plan', 'family-plus-plan'];

// Child limits per plan
const CHILD_LIMITS = {
  'free-plan': 1,
  'family-plan': 3,
  'family-plus-plan': 5,
};

/**
 * Compute subscription end date from order creation date and plan period.
 */
const computeEndDate = (startDate, period) => {
  const days = PERIOD_DAYS[period] || 30;
  const end = new Date(startDate);
  end.setDate(end.getDate() + days);
  return end;
};

/**
 * Get user's billing information including active subscription details.
 */
const getUserBilling = async (userId) => {
  // Get user's completed orders (PAID only, not CANCELLED or REFUNDED)
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ['PAID', 'CANCELLED'] },
    },
    include: {
      plan: true,
      discount: { select: { code: true, type: true, value: true } },
      payments: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Find active subscription: most recent PAID order that hasn't expired
  const now = new Date();
  let activeOrder = null;
  let subscriptionStatus = 'none'; // 'active' | 'cancelled' | 'expired' | 'none'
  let endDate = null;

  for (const order of orders) {
    const orderEndDate = computeEndDate(order.createdAt, order.plan.period);
    if (order.status === 'PAID' && orderEndDate > now) {
      activeOrder = order;
      endDate = orderEndDate;
      subscriptionStatus = 'active';
      break;
    }
    // Check for cancelled but still in grace period
    if (order.status === 'CANCELLED' && orderEndDate > now) {
      activeOrder = order;
      endDate = orderEndDate;
      subscriptionStatus = 'cancelled'; // cancelled but still accessible
      break;
    }
  }

  // If no active order found, check if there was ever a paid order (now expired)
  if (!activeOrder) {
    const lastPaid = orders.find((o) => o.status === 'PAID' || o.status === 'CANCELLED');
    if (lastPaid) {
      subscriptionStatus = 'expired';
    }
  }

  // Format billing history
  const billingHistory = orders.map((order) => ({
    id: order.id,
    date: order.createdAt,
    amount: order.amount,
    currency: 'OMR',
    planName: order.plan.name,
    status: order.status,
    discountCode: order.discount?.code || null,
    payment: order.payments[0]
      ? {
          id: order.payments[0].id,
          transactionId: order.payments[0].transactionId,
          createdAt: order.payments[0].createdAt,
        }
      : null,
  }));

  // Compute days remaining
  const daysRemaining = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    currentPlan: activeOrder
      ? {
          id: activeOrder.plan.id,
          name: activeOrder.plan.name,
          nameAr: activeOrder.plan.nameAr,
          price: activeOrder.plan.price,
          period: activeOrder.plan.period,
          features: activeOrder.plan.features,
          status: subscriptionStatus,
          startDate: activeOrder.createdAt,
          endDate,
          daysRemaining,
          orderId: activeOrder.id,
        }
      : null,
    subscriptionStatus,
    childLimit: activeOrder
      ? CHILD_LIMITS[activeOrder.plan.id] || 1
      : CHILD_LIMITS['free-plan'],
    billingHistory,
  };
};

/**
 * Cancel user's active subscription.
 * Access remains until the subscription period ends (grace period).
 */
const cancelSubscription = async (userId) => {
  // Find the active PAID order
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: { userId, status: 'PAID' },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  let activeOrder = null;
  for (const order of orders) {
    const orderEndDate = computeEndDate(order.createdAt, order.plan.period);
    if (orderEndDate > now) {
      activeOrder = order;
      break;
    }
  }

  if (!activeOrder) {
    throw new AppError('No active subscription found to cancel', 404);
  }

  // Mark as CANCELLED — user keeps access until endDate
  await prisma.order.update({
    where: { id: activeOrder.id },
    data: { status: 'CANCELLED' },
  });

  const endDate = computeEndDate(activeOrder.createdAt, activeOrder.plan.period);

  return {
    success: true,
    message: 'Subscription cancelled. You will retain access until the current period ends.',
    endDate,
    planName: activeOrder.plan.name,
  };
};

/**
 * Get the active subscription for a user (used by middleware).
 * Returns { planId, status, endDate, childLimit } or null.
 */
const getActiveSubscription = async (userId) => {
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: { userId, status: { in: ['PAID', 'CANCELLED'] } },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  for (const order of orders) {
    const orderEndDate = computeEndDate(order.createdAt, order.plan.period);
    if (orderEndDate > now) {
      return {
        planId: order.plan.id,
        planName: order.plan.name,
        status: order.status === 'PAID' ? 'active' : 'cancelled',
        endDate: orderEndDate,
        childLimit: CHILD_LIMITS[order.plan.id] || 1,
        features: order.plan.features,
      };
    }
  }

  return null;
};

module.exports = {
  getUserBilling,
  cancelSubscription,
  getActiveSubscription,
  PLAN_HIERARCHY,
  CHILD_LIMITS,
  computeEndDate,
};
