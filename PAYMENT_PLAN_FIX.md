# 🔧 Fix: "Payment plan not found or disabled" Error

## Problem
When clicking "Pay Now", you get the error: **"Payment plan not found or disabled"**

## Cause
The database hasn't been seeded with payment plans yet.

## Solution

### Step 1: Check if plans exist

Run this command to check if payment plans are in your database:

```bash
cd backend
node check-payment-plans.js
```

### Step 2: Seed the database

If no plans are found, run the seed script:

```bash
cd backend
npm run prisma:seed
```

This will create:
- ✅ `free-plan` (0 OMR)
- ✅ `family-plan` (15 OMR)
- ✅ `family-plus-plan` (25 OMR)
- ✅ Discount code: `WELCOME20` (20% off)

### Step 3: Verify plans were created

Run the check script again:

```bash
node check-payment-plans.js
```

You should see:
```
✅ Found 3 payment plan(s):
1. ID: free-plan
2. ID: family-plan
3. ID: family-plus-plan
```

### Step 4: Try payment again

1. Go to your frontend: `http://localhost:5173/payment`
2. Select a plan (e.g., "Family Plan")
3. Click "Pay Now"
4. It should now work! ✅

---

## Alternative: Manual Database Check

If you want to check the database directly:

```bash
cd backend
npx prisma studio
```

Then navigate to the `payment_plans` table to see if plans exist.

---

## Still Having Issues?

### Check Backend Logs

When you click "Pay Now", check your backend console. You should now see:
```
[Payment Service] Looking for plan with ID: family-plan
[Payment Service] Available plans: [...]
```

This will show you:
- What plan ID was requested
- What plans are available in the database

### Common Issues

1. **Database not connected**
   - Check `DATABASE_URL` in `backend/.env`
   - Make sure PostgreSQL is running

2. **Migrations not run**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

3. **Wrong plan ID**
   - Frontend uses: `family-plan`, `family-plus-plan`, `free-plan`
   - Make sure these match what's in the database

---

## Quick Test

After seeding, test with Postman or curl:

```bash
# 1. Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@jisr.com","password":"Parent123!"}'

# 2. Use the accessToken to create payment (replace <token>)
curl -X POST http://localhost:3000/api/payments/create \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"planId":"family-plan"}'
```

If this works, the frontend should work too!

---

**After seeding, the payment should work! 🎉**
