# Payment & Subscription Implementation Plan

## 1. Executive Summary
This document outlines the detailed implementation plan for the Payment, Subscription, and Transaction History features in the Jisr application. The system integrates with **Thawani Pay** for processing one-off payments and utilizes a time-based calculation approach to manage subscriptions (since Thawani does not natively support auto-recurring billing). 

This plan details the current architecture, the exact flows for subscriptions and history, and the remaining actionable steps required to achieve a bulletproof production-ready payment system.

---

## 2. Architecture & Data Flow

The payment system relies on four core models in the Prisma schema:
1. **PaymentPlan**: Defines the tiers (`free-plan`, `family-plan`, `family-plus-plan`), pricing, and duration (`month`, `year`).
2. **Order**: Acts as the "intent" to purchase. It holds the `planId`, `userId`, `discountId`, and tracks the `thawaniSessionId`. The `status` dictates the subscription state (`PENDING`, `PAID`, `CANCELLED`, `REFUNDED`, `FAILED`).
3. **Payment**: Represents a successful transaction verified by Thawani. It links to an `Order`.
4. **Discount**: Manages promotional codes (percentage or fixed amounts) and usage limits.

### Subscription Inference Logic
Subscriptions are **inferred dynamically** rather than stored as a separate table.
- **Active Subscription**: Defined by the most recent `Order` with status `PAID` where `createdAt` + `plan.period` (30 or 365 days) is strictly greater than the current date.
- **Grace Period**: If a user cancels, the order status changes to `CANCELLED`, but they retain access until the calculated `endDate`.
- **Expired**: When the current date surpasses the `endDate`, the user reverts to the `free-plan` limitations.

**Implementation Sample (Backend `billing.service.js`):**
```javascript
const computeEndDate = (startDate, period) => {
  const PERIOD_DAYS = { month: 30, year: 365 };
  const days = PERIOD_DAYS[period] || 30;
  const end = new Date(startDate);
  end.setDate(end.getDate() + days);
  return end;
};

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
    // Even if cancelled, user has access until the grace period expires
    if (orderEndDate > now) {
      return {
        planId: order.plan.id,
        status: order.status === 'PAID' ? 'active' : 'cancelled',
        endDate: orderEndDate,
        features: order.plan.features,
      };
    }
  }
  return null;
};
```

---

## 3. Detailed Feature Implementation

### A. Subscription Management
1. **Purchase & Upgrades**:
   - **Frontend**: User selects a plan on `/payment`, optionally applies a discount code (validated in real-time via `/api/payments/validate-discount`), and clicks Pay.
   - **Backend**: `payment.controller.js` creates a Thawani checkout session. If the user already has an active plan, they are only allowed to purchase a higher-tier plan (Upgrade).

**Implementation Sample (Creating Payment Session):**
```javascript
// Check for existing active subscription to prevent accidental downgrades/duplicates
const activeSub = await billingService.getActiveSubscription(userId);
if (activeSub) {
  const currentTier = PLAN_HIERARCHY.indexOf(activeSub.planId);
  const requestedTier = PLAN_HIERARCHY.indexOf(planId);
  
  if (requestedTier >= 0 && requestedTier <= currentTier) {
    throw new AppError(
      `You already have an active ${activeSub.planName} subscription. You can only upgrade to a higher plan.`,
      400
    );
  }
}

// Generate Thawani checkout session
const sessionResult = await thawaniService.createSession({
  amount,
  currency: 'OMR',
  orderReference: order.orderReference,
  customerInfo: { name: user.name, email: user.email },
});
```

2. **Cancellation**:
   - **Action**: User clicks "Cancel Subscription" in the Dashboard/Settings.
   - **Execution**: The `billingService.cancelSubscription()` function updates the `Order` status to `CANCELLED`.
   - **Access**: The user continues to enjoy premium features until the `endDate` is reached.

3. **Renewals (Nudge Engine)**:
   - Because Thawani requires manual payment entry for each cycle, a background Cron Job (Worker) is required to email users 3 days before expiry, containing a direct link to renew their plan.

**Implementation Sample (Proposed `workers/nudge.worker.js`):**
```javascript
const cron = require('node-cron');
const prisma = require('../config/db');
const emailService = require('../services/email.service');

// Run daily at 09:00 AM
cron.schedule('0 9 * * *', async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  // Find all PAID orders approaching their renewal/expiry date
  const expiringOrders = await prisma.order.findMany({
    where: {
      status: 'PAID',
      dueDate: {
        gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
        lt: new Date(threeDaysFromNow.setHours(23, 59, 59, 999))
      }
    },
    include: { user: true, plan: true }
  });

  for (const order of expiringOrders) {
    await emailService.sendRenewalReminder({
      email: order.user.email,
      name: order.user.name,
      planName: order.plan.name,
      renewalLink: `${process.env.FRONTEND_URL}/payment?plan=${order.plan.id}&renew=true`
    });
  }
});
```

### B. Transaction History
1. **Data Retrieval**:
   - Fetched via `paymentService.getTransactions()`. It queries the `Payment` table, including related `Order` and `PaymentPlan` data.
2. **Frontend Display**:
   - Displayed in the `Payment.tsx` page (via `<TransactionHistory />`) and in the Billing tab of `Settings.tsx`.
   - Shows Date, Plan Name, Status, Amount, and Currency.

**Implementation Sample (Frontend Data Fetching in `Payment.tsx`):**
```typescript
const loadBilling = async () => {
  try {
    setBillingLoading(true);
    // Fetch user's current billing status and past transactions concurrently
    const [billingData, txData] = await Promise.all([
      billingService.getBilling(),
      paymentService.getTransactions(1, 10), // Page 1, Limit 10
    ]);
    
    setBilling(billingData);
    setTransactions(txData.payments || []);
    
    // Auto-select current plan if no URL param is present
    if (!searchParams.get('plan') && billingData.currentPlan?.id) {
      setPlanId(billingData.currentPlan.id);
    }
  } catch (err) {
    console.error('Failed to load billing:', err);
  } finally {
    setBillingLoading(false);
  }
};
```

3. **Invoices / Receipts**:
   - Users need the ability to download a receipt for successful payments. This requires generating a PDF or a printable HTML view containing the Thawani Transaction ID, Date, Amount, and Plan Details.

---

## 4. Frontend Integration & UI

The UI strictly adheres to the established clean, bilingual (English/Arabic) design system.
- **`Payment.tsx`**: The main hub for purchasing. It displays the current active subscription (`<SubscriptionInfo />`), plan options, and past transactions.
- **`Settings.tsx` (Billing Tab)**: A centralized place for users to view their current plan status, cancel their subscription, and download receipts.

---

## 5. Actionable Next Steps & Missing Pieces

To finalize the payment and subscription system for production, the following specific tasks must be completed:

### Phase 1: Frontend Finalization
- [ ] **Connect Cancel Action in Settings**: In `Settings.tsx`, the "Cancel Subscription" button is currently a static UI element. It needs an `onClick` handler that calls the backend `billingService.cancelSubscription()` endpoint.

**Implementation Sample (Adding Cancel logic to `Settings.tsx`):**
```tsx
const handleCancelSubscription = async () => {
  if (!window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد إلغاء الاشتراك؟' : 'Are you sure you want to cancel your subscription?')) {
    return;
  }
  
  try {
    const response = await billingService.cancelSubscription();
    showToast(response.message, 'success');
    // Reload billing data to reflect the new "cancelled" grace-period status
    loadBilling();
  } catch (err: any) {
    showToast(err.message || 'Failed to cancel subscription', 'error');
  }
};

// Inside JSX
<button 
  onClick={handleCancelSubscription}
  className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
>
  Cancel Subscription
</button>
```

- [ ] **Implement Receipt Download**: In `Settings.tsx`, the "Download Receipt" button is static. We need to implement a function that either generates a PDF on the frontend (using `jspdf` / `html2canvas`) or fetches a generated PDF from a new backend endpoint.

### Phase 2: Backend Polish & Edge Cases
- [ ] **Nudge Engine (Cron Jobs)**: Implement the daily worker proposed in Section 3A to scan for `PAID` orders expiring within 3 days and dispatch renewal reminder emails via `emailService`.
- [ ] **Downgrade Logic Handling**: Currently, the system blocks downgrades. We need a clear UI/UX flow for what happens when an upgraded plan expires (e.g., ensuring users with 5 children don't lose data if they revert to the Free plan, but restricting access to the extra profiles until they upgrade again).

### Phase 3: Security & Testing
- [ ] **Webhook Idempotency**: Ensure `payment.service.js` webhook handler safely handles duplicate webhooks from Thawani without creating duplicate `Payment` records. (Partially handled, but needs strict database-level unique constraints on `thawaniSessionId` / `thawaniPaymentId`).
- [ ] **Comprehensive E2E Testing**: Run complete flows for purchase -> cancel -> expiry -> renew in both English and Arabic.

---

## 6. Conclusion
The foundation of the Thawani payment integration is solid and correctly implements the necessary security and database structures. By executing the next steps outlined above—specifically focusing on the Nudge Engine for renewals and tying up loose UI actions—the application will have a robust, production-ready subscription system.
