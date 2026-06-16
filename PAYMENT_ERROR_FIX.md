# 🔧 Fix: Payment Session Errors

## Issues You're Experiencing

1. **"Failed to fetch"** - Network/CORS issue or backend not responding
2. **"Request failed with status code 400"** - Backend validation error
3. **"http://localhost:5173/undefined"** - Session URL is undefined

## What I Fixed

1. ✅ Added validation for session URL before redirecting
2. ✅ Added better error logging in backend
3. ✅ Improved Thawani API response handling
4. ✅ Added error details to responses

## Troubleshooting Steps

### Step 1: Check Backend Console

When you click "Pay Now", check your **backend console**. You should see:

```
[Payment Service] Looking for plan with ID: family-plus-plan
Thawani API Response: {...}
```

**If you see Thawani API errors:**
- Check your `.env` file has correct Thawani credentials
- Verify `THAWANI_API_KEY` and `THAWANI_SECRET_KEY` are set
- Check `THAWANI_BASE_URL` is `https://uatcheckout.thawani.om` for testing

### Step 2: Check Browser Console

Open browser DevTools (F12) and check the Console tab. You should see:

```
Creating payment session with: {planId: "family-plus-plan"}
Payment session created: {sessionId: "...", sessionUrl: "..."}
```

**If sessionUrl is undefined:**
- The Thawani API call failed
- Check backend console for Thawani errors
- Verify Thawani credentials are correct

### Step 3: Verify Thawani Credentials

Make sure your `backend/.env` has:

```env
THAWANI_API_KEY=your_test_api_key_here
THAWANI_SECRET_KEY=your_test_secret_key_here
THAWANI_BASE_URL=https://uatcheckout.thawani.om
THAWANI_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:5173
```

### Step 4: Test Thawani API Directly

You can test if Thawani credentials work by checking the backend logs when creating a payment session. The logs will show the full Thawani API response.

## Common Issues & Solutions

### Issue: "Failed to fetch"

**Causes:**
- Backend server not running
- CORS error
- Network issue

**Solutions:**
1. Make sure backend is running: `cd backend && npm run dev`
2. Check backend is on `http://localhost:3000`
3. Check browser console for CORS errors
4. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

### Issue: "Request failed with status code 400"

**Causes:**
- Invalid plan ID
- Missing required fields
- Validation error

**Solutions:**
1. Check backend console for detailed error message
2. Verify plan ID exists: `node check-payment-plans.js`
3. Make sure you're logged in (payment requires authentication)

### Issue: "http://localhost:5173/undefined"

**Causes:**
- Thawani API returned no session URL
- Thawani API call failed
- Invalid Thawani credentials

**Solutions:**
1. Check backend console for Thawani API errors
2. Verify Thawani credentials in `.env`
3. Check Thawani API response in backend logs
4. Make sure Thawani test account is active

## Testing Without Thawani

If Thawani credentials are not set up yet, you can test the flow by:

1. **Mock the Thawani response** (for development only)
2. **Use test credentials** from Thawani dashboard
3. **Check backend logs** to see what Thawani is returning

## Next Steps

1. **Restart backend server** to apply changes
2. **Try payment again** and check both browser and backend consoles
3. **Look for error messages** - they will now be more detailed
4. **Check Thawani credentials** if you see API errors

## Debug Checklist

- [ ] Backend server is running
- [ ] Frontend server is running  
- [ ] User is logged in
- [ ] Payment plans exist in database (`node check-payment-plans.js`)
- [ ] Thawani credentials are in `.env`
- [ ] `FRONTEND_URL` matches frontend URL
- [ ] Check backend console for errors
- [ ] Check browser console for errors
- [ ] Check Network tab in DevTools for API response

---

**After checking these, the error messages will be more helpful!** 🎯
