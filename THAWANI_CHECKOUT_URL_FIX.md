# 🔧 Fix: Thawani Checkout URL 404 Error

## Problem
Getting 404 error when redirecting to Thawani checkout:
```
https://uatcheckout.thawani.om/checkout/session/checkout_xxx
```

## Issue
The checkout URL format is incorrect. Thawani doesn't return a `session_url` in their API response, so we need to construct it correctly.

## Solution

I've updated the code to try the `/pay/{session_id}` format. However, the correct format depends on Thawani's actual API structure.

### Try These URL Formats

After restarting your backend, check the console logs. The code will now try:
1. **Format 1**: `https://uatcheckout.thawani.om/pay/{session_id}` ✅ (currently using)
2. **Format 2**: `https://uatcheckout.thawani.om/checkout/{session_id}`
3. **Format 3**: `https://uatcheckout.thawani.om/{session_id}`

### Check Thawani Documentation

The correct format should be in Thawani's API documentation. Common formats:

- `/pay/{session_id}`
- `/checkout/{session_id}`  
- `/session/{session_id}`
- Or a completely different base URL for checkout

### Next Steps

1. **Restart backend server**
2. **Try payment again**
3. **Check backend console** - you'll see:
   - Available fields in the Thawani response
   - The constructed URL
   - Alternative formats to try

4. **If still 404**, check Thawani's documentation for:
   - Checkout URL format
   - Whether checkout uses a different base URL
   - If there's a `checkout_url` or `payment_url` field in the response

### Quick Test

You can manually test different URL formats:
- `https://uatcheckout.thawani.om/pay/checkout_qfbrMDFkHjBPt0U7rr0Ai4kBP4KBSUKFJ6kqxgVZFHjeTrEgJg`
- `https://uatcheckout.thawani.om/checkout/checkout_qfbrMDFkHjBPt0U7rr0Ai4kBP4KBSUKFJ6kqxgVZFHjeTrEgJg`
- `https://uatcheckout.thawani.om/checkout_qfbrMDFkHjBPt0U7rr0Ai4kBP4KBSUKFJ6kqxgVZFHjeTrEgJg`

Whichever one works, update the code accordingly.

---

**After restarting, check the logs to see what URL format is being used!**
