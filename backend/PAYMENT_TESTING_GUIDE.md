# 💳 Payment Gateway Testing Guide (Thawani)

This guide will help you test the Thawani payment gateway integration in your Jisr application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Testing Methods](#testing-methods)
4. [Test Scenarios](#test-scenarios)
5. [API Testing (Postman)](#api-testing-postman)
6. [Frontend Testing](#frontend-testing)
7. [Webhook Testing](#webhook-testing)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before testing, ensure you have:

- ✅ Backend server running (`npm run dev` in `backend/` folder)
- ✅ Database seeded with payment plans (`npm run prisma:seed`)
- ✅ Thawani UAT (test) account credentials
- ✅ `.env` file configured with Thawani test credentials
- ✅ Postman or similar API testing tool (optional)

---

## ⚙️ Environment Setup

### 1. Configure `.env` File

Make sure your `backend/.env` file has the following Thawani test credentials:

```env
# Thawani Payment Gateway (UAT/Test Mode)
THAWANI_API_KEY=your_test_api_key_here
THAWANI_SECRET_KEY=your_test_secret_key_here
THAWANI_BASE_URL=https://uatcheckout.thawani.om
THAWANI_WEBHOOK_SECRET=your_webhook_secret_here
THAWANI_MODE=test

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### 2. Get Thawani Test Credentials

1. Log in to your [Thawani Dashboard](https://dashboard.thawani.om)
2. Navigate to **Settings** → **API Keys**
3. Copy your **UAT/Test** API key and secret key
4. Set up a webhook secret for testing

### 3. Seed Payment Plans

Make sure payment plans are seeded in your database:

```bash
cd backend
npm run prisma:seed
```

This creates:
- `free-plan` (0 OMR)
- `family-plan` (15 OMR) ← Use this for testing
- `family-plus-plan` (25 OMR)
- Discount code: `WELCOME20` (20% off)

---

## 🧪 Testing Methods

You can test the payment gateway in three ways:

1. **API Testing** (Postman/curl) - Test backend endpoints directly
2. **Frontend Testing** - Test the full user flow
3. **Webhook Testing** - Test payment callbacks

---

## 📝 Test Scenarios

### Scenario 1: Successful Payment Flow ✅

1. User selects a payment plan
2. Creates payment session
3. Redirects to Thawani checkout
4. Completes payment with test card
5. Returns to success page
6. Payment is verified and order is marked as PAID

### Scenario 2: Payment Cancellation ❌

1. User creates payment session
2. Redirects to Thawani checkout
3. User cancels payment
4. Returns to cancel page
5. Order status remains PENDING

### Scenario 3: Payment Failure ❌

1. User creates payment session
2. Redirects to Thawani checkout
3. Payment fails (invalid card, insufficient funds, etc.)
4. Returns to cancel/failure page
5. Order status is marked as FAILED

### Scenario 4: Discount Code Application 💰

1. User creates payment session with discount code
2. Amount is calculated with discount
3. Payment proceeds with discounted amount

---

## 🔌 API Testing (Postman)

### Step 1: Authenticate

First, you need to get an access token:

**Request:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "parent@jisr.com",
  "password": "Parent123!"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Save the `accessToken` for the next step.**

### Step 2: Create Payment Session

**Request:**
```
POST http://localhost:3000/api/payments/create
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body (with discount code):**
```json
{
  "planId": "family-plan",
  "discountCode": "WELCOME20"
}
```

**Body (without discount):**
```json
{
  "planId": "family-plan"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Payment session created",
  "data": {
    "orderId": "clx...",
    "orderReference": "ORD-...",
    "sessionId": "thawani_session_id_here",
    "sessionUrl": "https://uatcheckout.thawani.om/checkout/session/...",
    "amount": 12.0,
    "currency": "OMR"
  }
}
```

**Important:** Copy the `sessionUrl` and open it in your browser to complete the payment.

### Step 3: Complete Payment on Thawani

1. Open the `sessionUrl` from the response in your browser
2. You'll be redirected to Thawani's test checkout page
3. Use Thawani's test card credentials (check Thawani documentation for test cards)
4. Complete the payment

### Step 4: Verify Payment

After completing payment on Thawani, verify it via API:

**Request:**
```
POST http://localhost:3000/api/payments/verify
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "thawani_session_id_from_step_2"
}
```

**Expected Response (200) - Success:**
```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "data": {
    "success": true,
    "payment": {
      "id": "clx...",
      "status": "COMPLETED",
      "amount": 12.0,
      "currency": "OMR",
      "thawaniPaymentId": "payment_id_from_thawani"
    },
    "order": {
      "id": "clx...",
      "status": "PAID",
      "amount": 12.0
    }
  }
}
```

**Expected Response (400) - Pending/Failed:**
```json
{
  "status": "fail",
  "message": "Payment verification failed",
  "data": {
    "success": false,
    "status": "pending",
    "message": "Payment is still pending"
  }
}
```

---

## 🖥️ Frontend Testing

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 2: Login to Frontend

1. Open `http://localhost:5173`
2. Go to Sign In page
3. Login with:
   - Email: `parent@jisr.com`
   - Password: `Parent123!`

### Step 3: Navigate to Payment Page

1. Go to the Payment page (or Pricing page)
2. Select a payment plan (e.g., "Family Plan")
3. Optionally enter discount code: `WELCOME20`

### Step 4: Create Payment

1. Click "Pay Now" or "Subscribe"
2. Frontend should call `POST /api/payments/create`
3. You should receive a `sessionUrl`
4. Frontend should redirect to the Thawani checkout page

### Step 5: Complete Payment

1. On Thawani checkout page, use test card credentials
2. Complete the payment
3. You'll be redirected back to your frontend success page

### Step 6: Verify Payment

The frontend should automatically call `POST /api/payments/verify` to confirm the payment.

---

## 🔔 Webhook Testing

Thawani sends webhooks to notify your backend about payment status changes.

### Webhook Endpoint

```
POST http://localhost:3000/api/webhooks/thawani
```

### Testing Webhooks Locally

Since Thawani can't send webhooks to `localhost`, you have two options:

#### Option 1: Use ngrok (Recommended)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Configure webhook in Thawani Dashboard:**
   - URL: `https://abc123.ngrok.io/api/webhooks/thawani`
   - Events: `payment.paid`, `payment.failed`, `payment.cancelled`

5. **Update your `.env`** (if needed):
   ```env
   THAWANI_WEBHOOK_SECRET=your_webhook_secret
   ```

#### Option 2: Manual Webhook Testing (Postman)

Simulate a webhook call manually:

**Request:**
```
POST http://localhost:3000/api/webhooks/thawani
Content-Type: application/json
thawani-signature: <calculated_signature>
```

**Body:**
```json
{
  "session_id": "thawani_session_id",
  "payment_status": "paid",
  "payment_id": "payment_id_from_thawani"
}
```

**Note:** You need to calculate the signature correctly. The signature is an HMAC SHA256 of the JSON payload using your `THAWANI_WEBHOOK_SECRET`.

**Calculate signature (Node.js):**
```javascript
const crypto = require('crypto');
const payload = JSON.stringify(webhookData);
const signature = crypto
  .createHmac('sha256', process.env.THAWANI_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
```

### Webhook Payload Examples

**Successful Payment:**
```json
{
  "session_id": "sess_abc123",
  "payment_status": "paid",
  "payment_id": "pay_xyz789",
  "amount": 12000,
  "currency": "OMR"
}
```

**Failed Payment:**
```json
{
  "session_id": "sess_abc123",
  "payment_status": "failed",
  "payment_id": null
}
```

**Cancelled Payment:**
```json
{
  "session_id": "sess_abc123",
  "payment_status": "cancelled",
  "payment_id": null
}
```

---

## 🧪 Test Cases Checklist

Use this checklist to ensure comprehensive testing:

### ✅ Basic Functionality

- [ ] Create payment session with valid plan
- [ ] Create payment session with invalid plan (should fail)
- [ ] Create payment session with discount code
- [ ] Create payment session with invalid discount code (should fail)
- [ ] Verify payment after successful transaction
- [ ] Verify payment for pending transaction
- [ ] Verify payment for failed transaction

### ✅ Payment Flows

- [ ] Complete successful payment on Thawani
- [ ] Cancel payment on Thawani checkout
- [ ] Payment fails due to invalid card
- [ ] Payment fails due to insufficient funds
- [ ] Payment timeout handling

### ✅ Discount Codes

- [ ] Apply valid percentage discount (e.g., 20% off)
- [ ] Apply valid fixed discount
- [ ] Invalid discount code rejected
- [ ] Expired discount code rejected
- [ ] Discount code with max uses reached

### ✅ Webhooks

- [ ] Webhook received for successful payment
- [ ] Webhook received for failed payment
- [ ] Webhook received for cancelled payment
- [ ] Invalid webhook signature rejected
- [ ] Duplicate webhook handling (idempotency)

### ✅ Database Updates

- [ ] Order created with correct status (PENDING)
- [ ] Order updated to PAID after successful payment
- [ ] Payment record created after successful payment
- [ ] Discount usage incremented after payment
- [ ] Order updated to FAILED after failed payment

### ✅ Error Handling

- [ ] Network error during payment creation
- [ ] Invalid API credentials
- [ ] Missing required fields
- [ ] Invalid session ID for verification
- [ ] Expired payment session

---

## 🐛 Troubleshooting

### Issue: "Failed to create payment session"

**Possible causes:**
1. Invalid Thawani API credentials
2. Network connectivity issues
3. Invalid request payload

**Solutions:**
- Check `.env` file has correct `THAWANI_API_KEY` and `THAWANI_SECRET_KEY`
- Verify `THAWANI_BASE_URL` is set to `https://uatcheckout.thawani.om` for testing
- Check backend console for detailed error messages
- Verify plan ID exists in database

### Issue: "Payment verification failed"

**Possible causes:**
1. Payment not completed on Thawani
2. Session ID mismatch
3. Payment still pending

**Solutions:**
- Make sure you completed the payment on Thawani checkout page
- Wait a few seconds and try verification again
- Check Thawani dashboard for payment status
- Verify the session ID is correct

### Issue: "Invalid webhook signature"

**Possible causes:**
1. Wrong webhook secret
2. Signature calculation mismatch
3. Payload modification

**Solutions:**
- Verify `THAWANI_WEBHOOK_SECRET` in `.env` matches Thawani dashboard
- Check that payload is not modified before signature verification
- Ensure signature header name is correct (`thawani-signature` or `x-thawani-signature`)

### Issue: "Order not found" during verification

**Possible causes:**
1. Session ID doesn't match any order
2. Order was deleted
3. Wrong session ID used

**Solutions:**
- Verify you're using the correct session ID from payment creation
- Check database for orders with that session ID
- Ensure order wasn't deleted

### Issue: CORS errors in frontend

**Solutions:**
- Verify backend CORS is configured to allow frontend URL
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Restart backend server after changing `.env`

### Issue: Redirect URLs not working

**Solutions:**
- Verify `FRONTEND_URL` in `.env` is correct
- Check success/cancel URLs in Thawani service configuration
- Ensure frontend routes exist (`/payment/success`, `/payment/cancel`)

---

## 📊 Monitoring & Logs

### Backend Logs

Check your backend console for:
- Payment session creation logs
- Thawani API request/response logs
- Payment verification logs
- Webhook processing logs
- Error messages

### Database Checks

Query your database to verify:

```sql
-- Check orders
SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 10;

-- Check payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 10;

-- Check payment plans
SELECT * FROM "PaymentPlan";
```

### Thawani Dashboard

Check your Thawani dashboard for:
- Payment transactions
- Session status
- Webhook delivery status
- API request logs

---

## 🔐 Security Notes

⚠️ **Important for Testing:**

1. **Never use real credit cards** in test mode
2. **Use only test credentials** from Thawani UAT environment
3. **Don't commit `.env` file** to version control
4. **Test webhook signature verification** to ensure security
5. **Verify HTTPS** is used for all Thawani API calls

---

## 📚 Additional Resources

- [Thawani Documentation](https://docs.thawani.om)
- [Thawani Dashboard](https://dashboard.thawani.om)
- [Postman Collection Guide](./POSTMAN_GUIDE.md)
- [Backend Setup Guide](./SETUP_GUIDE.md)

---

## ✅ Quick Test Script

Here's a quick test you can run to verify everything is set up:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. In another terminal, test health endpoint
curl http://localhost:3000/health

# 3. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@jisr.com","password":"Parent123!"}'

# 4. Use the accessToken from response to create payment
curl -X POST http://localhost:3000/api/payments/create \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"planId":"family-plan"}'
```

---

**Happy Testing! 🎉**

If you encounter any issues, check the troubleshooting section or review the backend logs for detailed error messages.
