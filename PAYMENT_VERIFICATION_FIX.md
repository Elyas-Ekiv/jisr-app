# 🔧 Fix: Payment Verification "Order not found" Issue

## Problem
After completing payment on Thawani, you're redirected back but get "Order not found" error.

## Root Cause
The log shows: `Order not found for session: {session_id}`

This means Thawani is **NOT replacing the `{session_id}` placeholder** in the success URL. The placeholder is being passed literally instead of the actual session ID.

## What I Fixed

1. ✅ Added fallback to find order by user's most recent pending order
2. ✅ Added better URL parsing to extract session ID from full URL
3. ✅ Added extensive logging to debug the issue
4. ✅ Added validation for placeholder detection

## Next Steps

### Step 1: Check Browser Console

When you're redirected back from Thawani, open browser DevTools (F12) and check:

1. **Console tab** - Look for:
   - "Verifying payment with session ID: ..."
   - "Current URL: ..."
   - "All URL params: ..."

2. **Network tab** - Check the verify payment request:
   - What `sessionId` is being sent?
   - Is it `{session_id}` or an actual session ID?

### Step 2: Check the Redirect URL

After completing payment on Thawani, check the URL you're redirected to. It should be:
```
http://localhost:5173/payment/success?session_id=checkout_xxxxx
```

**If you see:**
```
http://localhost:5173/payment/success?session_id={session_id}
```

Then Thawani is not replacing the placeholder. This is a Thawani configuration issue.

### Step 3: Check Thawani Dashboard

In your Thawani merchant dashboard, check:
1. **Webhook/Success URL configuration**
2. Make sure the success URL format is correct
3. Verify that Thawani is configured to replace placeholders

## Temporary Workaround

I've added a fallback that will:
1. If session ID is `{session_id}`, find the most recent pending order for the logged-in user
2. Use that order's session ID for verification

This should work as a temporary fix, but the real issue is that Thawani should be replacing the placeholder.

## Check Backend Logs

After trying again, check your backend console. You should see:
- `[Payment Service] Verifying payment for session: ...`
- `[Payment Service] Recent orders: ...`
- Whether the fallback found an order

---

**Try again and check both browser console and backend console to see what's happening!**
