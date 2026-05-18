# 🔗 Frontend-Backend Connection Guide

## ✅ What's Been Set Up

I've created all the necessary files to connect your frontend to the backend:

1. ✅ **API Configuration** (`src/config/api.ts`)

   - Base URL: `http://localhost:3000/api`
   - All endpoint definitions

2. ✅ **API Utility** (`src/utils/api.ts`)

   - Handles all HTTP requests
   - Automatic token management
   - Auto-refresh on token expiration

3. ✅ **Auth Service** (`src/services/authService.ts`)

   - Register, login, logout functions
   - Token management

4. ✅ **Updated SignIn & SignUp**
   - Now connected to real backend API

## 🚀 Quick Test

### Step 1: Make Sure Backend is Running

```bash
cd backend
npm run dev
```

**Check:** Server should be running on `http://localhost:3000`

### Step 2: Start Frontend

```bash
# In a new terminal, from project root
npm run dev
```

**Check:** Frontend should be running on `http://localhost:5173`

### Step 3: Test Connection

1. **Open your browser:** `http://localhost:5173`
2. **Go to Sign Up page**
3. **Fill in the form:**
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
4. **Click "Create Account"**

**Expected:**

- ✅ Account created
- ✅ Automatically logged in
- ✅ Redirected to dashboard
- ✅ Token saved in localStorage

**If you see an error:**

- Check browser console (F12) for errors
- Check backend server console for errors
- Make sure backend is running on port 3000

---

## 🔧 Configuration

### API Base URL

The frontend is configured to connect to:

```
http://localhost:3000/api
```

**To change this:**

1. Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:3000/api
```

2. Or edit `src/config/api.ts`:

```typescript
export const API_BASE_URL = "http://your-backend-url/api";
```

---

## 📋 What's Connected

### ✅ Authentication

- **Sign Up** → `POST /api/auth/register`
- **Sign In** → `POST /api/auth/login`
- **Get Current User** → `GET /api/auth/me`
- **Logout** → `POST /api/auth/logout`

### ⏳ Ready to Connect (Not Yet Implemented)

- Children management
- Vocabulary management
- Settings management
- Analytics
- Payments

---

## 🧪 Testing the Connection

### Test 1: Register a User

1. Go to Sign Up page
2. Fill form and submit
3. **Check browser console (F12):**
   - Should see API request to `/api/auth/register`
   - Should see response with tokens

### Test 2: Login

1. Go to Sign In page
2. Use the email/password you just created
3. **Check browser console:**
   - Should see API request to `/api/auth/login`
   - Should see response with tokens

### Test 3: Check Token Storage

1. After login, open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. You should see:
   - `accessToken`
   - `refreshToken`

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Possible causes:**

1. **Backend not running**

   - Fix: Start backend with `npm run dev` in backend folder

2. **Wrong API URL**

   - Fix: Check `src/config/api.ts` - should be `http://localhost:3000/api`

3. **CORS error**
   - Fix: Backend CORS is already configured, but check if backend is running

### Issue: "401 Unauthorized"

**Fix:**

- Token might be expired
- Try logging in again
- Check if token is in localStorage

### Issue: "User already exists"

**Fix:**

- Use a different email
- Or delete the user from database

### Issue: "Validation failed"

**Fix:**

- Check the error message
- Make sure password meets requirements (min 6 chars, uppercase, lowercase, number)
- Make sure email is valid format

---

## 📝 Next Steps

### To Connect More Features:

1. **Children Management:**

   - Update `Dashboard.tsx` to fetch children from API
   - Use `api.get(API_ENDPOINTS.CHILDREN.LIST)`

2. **Vocabulary:**

   - Update `aacService.ts` to use real API calls
   - Replace mock data with `api.get()` calls

3. **Settings:**
   - Update settings pages to use API
   - Use `api.get()` and `api.put()` for settings

---

## ✅ Connection Checklist

- [ ] Backend server running (`npm run dev` in backend folder)
- [ ] Frontend server running (`npm run dev` in root folder)
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Token is saved in localStorage
- [ ] Can navigate to dashboard after login
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console

---

## 💡 Tips

1. **Always check browser console** (F12) for errors
2. **Check backend console** for API request logs
3. **Use Network tab** in DevTools to see API requests
4. **Test in Postman first** to verify backend works
5. **Check localStorage** to see if tokens are saved

---

**Your frontend is now connected to your backend!** 🎉

Try registering a user and logging in to test the connection.
