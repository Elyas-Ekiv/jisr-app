# Thawani Payment Gateway Integration

**Project:** Jisr AAC Communication Platform  
**Environment:** UAT  
**Date:** May 2026  
**Stack:** Node.js · Express · PostgreSQL · Prisma · Resend · node-cron

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Database Schema Changes](#3-database-schema-changes)
4. [Environment Variables](#4-environment-variables)
5. [API Endpoints](#5-api-endpoints)
6. [Webhook Verification](#6-webhook-verification)
7. [Email Service](#7-email-service)
8. [Nudge Engine](#8-nudge-engine)
9. [Refund Flow](#9-refund-flow)
10. [Transaction History](#10-transaction-history)
11. [Payment Flow (End-to-End)](#11-payment-flow-end-to-end)
12. [Security Decisions](#12-security-decisions)
13. [Error Handling](#13-error-handling)
14. [Deployment Checklist](#14-deployment-checklist)

---

## 1. Architecture Overview

The integration follows the existing **Service-Repository pattern** of the codebase. No new architectural layers were introduced — only new files added inside the existing `services/`, `controllers/`, `routes/`, and a new `workers/` directory.

```
HTTP Request
     │
     ▼
Express Router  (payment.routes.js)
     │
     ▼
Controller      (payment.controller.js)
     │
     ├──► Payment Service   (payment.service.js)   ← business logic
     │         │
     │         ├──► Thawani Service  (config/thawani.js)   ← HTTP calls to Thawani API
     │         ├──► Email Service    (services/email.service.js)  ← Resend SDK
     │         └──► Prisma Client    (config/db.js)   ← PostgreSQL
     │
     └──► Response
```

```
Cron Scheduler (every day @ 09:00)
     │
     ▼
Nudge Worker    (workers/nudge.worker.js)
     │
     ├──► Prisma Client  ← query PENDING orders by dueDate
     └──► Email Service  ← dispatch reminder emails
```

---

## 2. Directory Structure

Files **created** or **modified** during this implementation are marked.

```
backend/
├── src/
│   ├── app.js                          ← MODIFIED: raw body capture for webhook
│   ├── server.js                       ← MODIFIED: starts Nudge Engine on boot
│   ├── config/
│   │   ├── env.js                      ← MODIFIED: added Resend config vars
│   │   └── thawani.js                  ← MODIFIED: fixed HMAC + added createRefund()
│   ├── controllers/
│   │   └── payment.controller.js       ← MODIFIED: added refundPayment, getTransactions
│   ├── routes/
│   │   └── payment.routes.js           ← MODIFIED: added /refund, /transactions routes
│   ├── services/
│   │   ├── payment.service.js          ← MODIFIED: webhook emails, processRefund, getTransactions
│   │   └── email.service.js            ← CREATED: Resend SDK + 5 HTML email templates
│   └── workers/
│       └── nudge.worker.js             ← CREATED: node-cron daily reminder job
├── prisma/
│   └── schema.prisma                   ← MODIFIED: added dueDate to Order model
└── .env                                ← MODIFIED: populated Thawani UAT keys + Resend vars
```

---

## 3. Database Schema Changes

### Migration applied
`prisma db push` was used to apply schema changes to the UAT database.  
For production use `npx prisma migrate deploy`.

### Change: `dueDate` added to `Order` model

```prisma
model Order {
  id               String      @id @default(cuid())
  userId           String
  planId           String
  discountId       String?
  amount           Float
  status           OrderStatus @default(PENDING)
  thawaniSessionId String?     @unique
  orderReference   String      @unique @default(cuid())
  dueDate          DateTime?   // ← NEW: payment deadline for the Nudge Engine
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  @@index([dueDate])            // ← NEW: index for efficient nudge queries
}
```

**Why `dueDate` on Order?**  
The Nudge Engine needs to query "which PENDING orders are due in N days?" without a full table scan. Storing `dueDate` as an indexed column makes this a single indexed range query per cron run.

**When is `dueDate` set?**  
In `payment.service.js → createPaymentSession()`, the due date is calculated as `now + 3 days` at the moment the order is created. This gives the customer 3 days to complete checkout before reminders begin.

```js
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + PAYMENT_DUE_DAYS); // PAYMENT_DUE_DAYS = 3
```

### No enum changes
The existing `OrderStatus` enum already contained `FAILED` and `REFUNDED`, which are used by the new flows. No new enum values were needed.

---

## 4. Environment Variables

### Full `.env` reference

```env
# ── Thawani (UAT) ──────────────────────────────────────
THAWANI_API_KEY=rRQ26GcsZzoEhbrP2HZvLYDbn9C9et       # Server-side API calls
THAWANI_SECRET_KEY=rRQ26GcsZzoEhbrP2HZvLYDbn9C9et    # Same as API key in UAT
THAWANI_PUBLISHABLE_KEY=HGvTMLDssJghr9tlN9gr4DVYt0qyBy # Used in checkout redirect URL
THAWANI_BASE_URL=https://uatcheckout.thawani.om
THAWANI_WEBHOOK_SECRET=rRQ26GcsZzoEhbrP2HZvLYDbn9C9et # Used to verify webhook HMAC
THAWANI_MODE=test

# ── Resend (email) ──────────────────────────────────────
RESEND_API_KEY=re_your_api_key_here      # Get from resend.com/api-keys
RESEND_FROM_EMAIL=noreply@yourdomain.com # Must be from a Resend-verified domain
RESEND_FROM_NAME=Jisr
```

### New `env.js` fields

```js
resendApiKey:    process.env.RESEND_API_KEY,
resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
resendFromName:  process.env.RESEND_FROM_NAME  || 'Jisr',
```

---

## 5. API Endpoints

### Full payment route table

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/payments/create` | JWT (User) | Create a Thawani checkout session |
| `POST` | `/api/payments/verify` | JWT (User) | Verify payment after Thawani redirect |
| `POST` | `/api/payments/webhooks/thawani` | None (Thawani servers) | HMAC-verified webhook receiver |
| `POST` | `/api/payments/refund` | JWT (Admin only) | Issue a refund + send confirmation email |
| `GET`  | `/api/payments/transactions` | JWT (User / Admin) | Paginated payment history |

### Request / Response examples

#### `POST /api/payments/refund`
```json
// Request body
{ "payment_id": "clxxxxxxxxxxxxxxxx" }

// Success response
{
  "status": "success",
  "message": "Refund processed successfully",
  "data": {
    "refundId": "ref_xxxxxxxx",
    "paymentId": "clxxxxxxxxxxxxxxxx",
    "orderReference": "cml_xxxxxxxxx",
    "amount": 10.500,
    "currency": "OMR"
  }
}
```

#### `GET /api/payments/transactions`
```
// User: returns their own payments
GET /api/payments/transactions?page=1&limit=20

// Admin: returns all payments
GET /api/payments/transactions?all=true&page=1&limit=50
```

---

## 6. Webhook Verification

### The problem with the original implementation
The original `verifyWebhookSignature()` in `thawani.js` used `JSON.stringify(payload)` as the message, which loses byte-level fidelity (key ordering, whitespace) and ignored the required timestamp header.

### Correct HMAC algorithm (per Thawani spec)

```
signature = HMAC-SHA256( rawBody + '-' + timestamp, webhookSecretKey )
```

| Component | Source |
|-----------|--------|
| `rawBody` | Raw request body **bytes** (not parsed JSON) |
| `timestamp` | `thawani-timestamp` request header |
| `webhookSecretKey` | `THAWANI_WEBHOOK_SECRET` env var |
| `signature` | `thawani-signature` request header (hex) |

### Implementation in `thawani.js`

```js
verifyWebhookSignature(rawBody, timestamp, signature) {
  const textBytes = Buffer.from(rawBody + '-' + timestamp, 'ascii');
  const keyBytes  = Buffer.from(config.thawaniWebhookSecret, 'ascii');

  const hmac = crypto.createHmac('sha256', keyBytes);
  hmac.update(textBytes);
  const expected = hmac.digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf); // constant-time compare
}
```

`crypto.timingSafeEqual` is used to prevent timing-based attacks where an attacker could guess the signature byte by byte based on response time differences.

### Raw body capture in `app.js`

Express's `express.json()` parser consumes the request stream. To get the original bytes, the `verify` callback is used — it runs before parsing and receives the raw `Buffer`:

```js
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf, encoding) => {
    if (req.originalUrl && req.originalUrl.includes('/webhooks/thawani')) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
}));
```

This approach is surgical — it only stores `req.rawBody` for the webhook path and does not affect any other route.

### Idempotency

The webhook handler checks for an existing `COMPLETED` payment before creating a new record, ensuring Thawani's guaranteed-at-least-once delivery does not cause duplicate payment records or duplicate emails:

```js
const existingPayment = await prisma.payment.findFirst({
  where: { orderId: order.id, status: 'COMPLETED' },
});
if (!existingPayment) {
  // create payment record and send email
}
```

---

## 7. Email Service

**File:** `src/services/email.service.js`  
**SDK:** Resend (`resend` npm package)

### Five email templates

| Function | Subject | Trigger |
|----------|---------|---------|
| `sendPaymentSuccess()` | ✅ Payment Confirmed | Webhook `payment.succeeded` or verify endpoint |
| `sendRefundConfirmation()` | 💰 Refund Processed | `POST /api/payments/refund` |
| `sendReminderTwoDays()` | 🔔 Payment Due in 2 Days | Nudge Engine (T-2) |
| `sendReminderOneDay()` | ⚠️ Payment Due Tomorrow | Nudge Engine (T-1) |
| `sendReminderOverdue()` | ❌ Payment Overdue | Nudge Engine (T+1) |

### Template design
All templates share a common `layout()` wrapper that outputs self-contained inline-CSS HTML compatible with all major email clients. The layout includes:
- A branded blue header with the Jisr logo
- A white content body
- A grey footer with copyright notice

### Safe degradation when Resend is not configured

```js
if (!config.resendApiKey || config.resendApiKey === 're_your_api_key_here') {
  console.warn(`[Email] RESEND_API_KEY not configured. Skipping email...`);
  return { success: false, reason: 'resend_not_configured' };
}
```

The server will boot and function normally without a valid Resend key. Email sending is logged as skipped.

### Non-blocking email dispatch

All email calls in the payment service are fire-and-forget. A failed email never causes an HTTP 500 or rolls back a payment:

```js
emailService.sendPaymentSuccess({ ... })
  .catch(err => console.error('[Payment] Success email failed:', err.message));
```

---

## 8. Nudge Engine

**File:** `src/workers/nudge.worker.js`  
**Scheduler:** `node-cron`  
**Schedule:** `0 9 * * *` — every day at **09:00 server local time**

### Three reminder windows

```
Today's date (cron run day)
        │
        ├─ dueDate == TODAY + 2  →  T-2 reminder  ("Payment due in 2 days")
        ├─ dueDate == TODAY + 1  →  T-1 reminder  ("Payment due tomorrow")
        └─ dueDate == YESTERDAY  →  Overdue        ("Payment overdue")
                                     + Order status updated to FAILED
```

### Database query

For each window, a Prisma query filters by `status = PENDING` and a UTC day range around the target date:

```js
function dayWindow(date) {
  const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
  const end   = new Date(date); end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

await prisma.order.findMany({
  where: {
    status: 'PENDING',
    dueDate: { gte: start, lte: end },
  },
  include: {
    plan: { select: { name: true } },
    user: { select: { name: true, email: true } },
  },
});
```

### Overdue order lifecycle

When an order reaches the T+1 (overdue) window, after the email is sent the order's status is updated from `PENDING` to `FAILED`. This ensures the order will never be picked up again by the cron job, preventing repeated overdue emails on subsequent days.

```js
await prisma.order.update({
  where: { id: order.id },
  data: { status: 'FAILED' },
});
```

### Error isolation

Each order's email send is wrapped in its own `try/catch`. A failure for one customer does not stop processing for the rest:

```js
for (const order of orders) {
  try {
    await emailService.sendReminderTwoDays({ ... });
  } catch (err) {
    console.error(`[Nudge T-2] Email failed for order ${order.id}:`, err.message);
  }
}
```

The cron callback itself is also wrapped so a crash never takes down the Express process:

```js
cron.schedule('0 9 * * *', async () => {
  try {
    await runNudgeJob();
  } catch (err) {
    console.error('[Nudge] Unhandled error:', err.message);
  }
});
```

### Exported for testing

`runNudgeJob()` is exported separately from the scheduler so it can be triggered manually during development:

```js
const { runNudgeJob } = require('./workers/nudge.worker');
await runNudgeJob(); // fire immediately without waiting for cron
```

---

## 9. Refund Flow

```
Admin                 Backend                Thawani API           Customer
  │                      │                       │                      │
  │  POST /refund         │                       │                      │
  │  { payment_id }       │                       │                      │
  │──────────────────────►│                       │                      │
  │                       │ Lookup Payment record  │                      │
  │                       │  → get thawaniPaymentId│                      │
  │                       │                       │                      │
  │                       │  POST /api/v1/refunds  │                      │
  │                       │  { charge_id, amount } │                      │
  │                       │──────────────────────►│                      │
  │                       │  { refund_id, ... }    │                      │
  │                       │◄──────────────────────│                      │
  │                       │                       │                      │
  │                       │ Prisma $transaction:   │                      │
  │                       │  Payment → REFUNDED    │                      │
  │                       │  Order   → REFUNDED    │                      │
  │                       │                       │                      │
  │                       │                       │   Refund email       │
  │                       │                       │──────────────────────►
  │  200 OK + refundId    │                       │                      │
  │◄──────────────────────│                       │                      │
```

### Status update is atomic

Both `Payment.status` and `Order.status` are updated inside a single `prisma.$transaction([...])` call. If either update fails, both roll back, guaranteeing the two records remain consistent.

### Thawani refund payload

```js
{
  "charge_id": "<thawani_payment_id>",  // from Payment.thawaniPaymentId
  "reason":    "requested_by_customer",
  "amount":    10500                    // OMR × 1000 = Baisa (integer, no floats)
}
```

`amount` is optional — omitting it issues a full refund. Partial refunds can be supported by passing a specific amount.

### Guard rails

| Condition | Error |
|-----------|-------|
| Payment not found | `404 Not Found` |
| Payment already refunded | `409 Conflict` |
| Payment not in COMPLETED status | `400 Bad Request` |
| No `thawaniPaymentId` on record | `400 Bad Request` |
| Thawani API rejects refund | `502 Bad Gateway` |

---

## 10. Transaction History

### Endpoint
```
GET /api/payments/transactions?page=1&limit=20
```

### Pagination
```json
{
  "status": "success",
  "data": {
    "payments": [ ... ],
    "pagination": {
      "total": 142,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

### Access control

| Caller | Behaviour |
|--------|-----------|
| Regular user (JWT) | Returns only their own payments (`WHERE userId = req.user.id`) |
| Admin + `?all=true` | Returns all payments across all users |
| Admin without `?all=true` | Returns only the admin's own payments |

### Included relations

Each payment record includes:
- `order.plan.name` and `order.plan.period`
- `user.id`, `user.name`, `user.email`

---

## 11. Payment Flow (End-to-End)

```
User clicks "Subscribe"
        │
        ▼
POST /api/payments/create   { planId }
        │
        ├─ Validate plan is enabled
        ├─ Apply discount (if any)
        ├─ Create Order (status: PENDING, dueDate: now+3d)
        ├─ Call Thawani: POST /api/v1/checkout/session
        └─ Return { sessionId, sessionUrl }
        │
        ▼
Frontend redirects → https://uatcheckout.thawani.om/pay/{session_id}?key=publishable_key
        │
        │  (User completes or cancels payment on Thawani's hosted page)
        │
        ├─────────────────────────────────────────────────────────────┐
        │ Path A: Thawani webhook (server-to-server)                  │
        │                                                             │
        │   POST /api/payments/webhooks/thawani                       │
        │   Headers: thawani-timestamp, thawani-signature             │
        │                                                             │
        │   1. Verify HMAC signature                                  │
        │   2. Check idempotency (skip if already COMPLETED)          │
        │   3. Update Order → PAID                                    │
        │   4. Create Payment record (COMPLETED)                      │
        │   5. Send success email via Resend                          │
        │                                                             │
        └─────────────────────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────────────────────────┐
        │ Path B: Frontend redirect verification                      │
        │                                                             │
        │   Thawani redirects → /payment/success?session_id=xxx       │
        │   Frontend calls POST /api/payments/verify { sessionId }    │
        │                                                             │
        │   1. Locate order (by sessionId, orderRef, or userId fallback)│
        │   2. Check idempotency (return early if already PAID)       │
        │   3. Call Thawani: GET /api/v1/checkout/session/{id}        │
        │   4. If paid: Update Order, create Payment, send email      │
        │   5. Return success/failure to frontend                     │
        │                                                             │
        └─────────────────────────────────────────────────────────────┘
```

Both paths are designed to be idempotent — whichever fires first wins; the second is a no-op.

---

## 12. Security Decisions

### HMAC constant-time comparison
`crypto.timingSafeEqual()` is used instead of `===` to prevent timing attacks where an attacker could guess the expected signature byte-by-byte by measuring response latency.

### Raw body, not parsed body
Webhook signatures are computed over the raw bytes transmitted over the wire. Using `JSON.stringify(req.body)` (the old approach) is unsafe because JSON serialization is not canonical — key ordering and whitespace may differ from what Thawani signed.

### Amount as integer (Baisa)
All amounts sent to Thawani are converted to Baisa (integer) at the last moment. The database stores amounts in OMR (Float) following existing schema conventions, but all Thawani API calls use `Math.round(amount * 1000)` to avoid floating-point representation errors.

### Admin-only refund
The `POST /api/payments/refund` route uses `requireAdmin` middleware. Refunds cannot be self-initiated by regular users.

### Non-interactive email errors
Email failures are caught and logged but never surfaced as HTTP errors. A broken Resend configuration cannot prevent a payment from being processed or a refund from completing.

---

## 13. Error Handling

All service functions use the existing `AppError` class and `catchAsync` wrapper, consistent with the rest of the codebase.

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Missing webhook headers | 401 | Missing webhook signature or timestamp headers |
| Invalid webhook signature | 401 | Invalid webhook signature |
| Order not found | 404 | Order not found |
| Payment not found (refund) | 404 | Payment record not found |
| Already refunded | 409 | This payment has already been refunded |
| Payment not COMPLETED | 400 | Cannot refund a payment with status: X |
| Thawani refund API failure | 502 | Thawani refund failed: [reason] |

---

## 14. Deployment Checklist

### Before going to production

- [ ] Replace UAT keys with live Thawani production keys in `.env`
- [ ] Change `THAWANI_BASE_URL` to the production Thawani URL
- [ ] Set `THAWANI_MODE=live`
- [ ] Register a domain in [resend.com](https://resend.com) and verify DNS records
- [ ] Set `RESEND_API_KEY` to a real key with send permissions
- [ ] Set `RESEND_FROM_EMAIL` to an address on your verified domain
- [ ] Run `npx prisma migrate deploy` (not `db push`) to apply the `dueDate` migration in production
- [ ] Register the webhook URL with Thawani portal: `https://yourdomain.com/api/payments/webhooks/thawani`
- [ ] Confirm the webhook secret in the Thawani portal matches `THAWANI_WEBHOOK_SECRET` in `.env`
- [ ] Test the full payment flow in UAT before switching keys
- [ ] Verify the Nudge Engine cron schedule matches your server's timezone expectations (`TZ` env var if needed)

### Manual nudge trigger (for testing)

```js
const { runNudgeJob } = require('./src/workers/nudge.worker');
runNudgeJob();
```

Or via a one-off Node.js script:

```bash
node -e "require('./src/workers/nudge.worker').runNudgeJob().then(() => process.exit())"
```
