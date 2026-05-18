# Postman Testing Guide

## 🚀 Quick Start

### 1. Start the Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
🌐 Frontend URL: http://localhost:5173
💳 Thawani Mode: test
```

### 2. Test Health Endpoint

**Request:**
```
GET http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Jisr API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📝 API Endpoints for Postman

### Authentication Endpoints

#### 1. Register User

**Request:**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "accountType": "parent"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### 2. Login

**Request:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### 3. Get Current User (Protected)

**Request:**
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <access_token>
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

#### 4. Refresh Token

**Request:**
```
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "refreshToken": "eyJ..."
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJ..."
  }
}
```

### Payment Endpoints

#### 1. Create Payment Session (Protected)

**Request:**
```
POST http://localhost:3000/api/payments/create
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "planId": "family-plan",
  "discountCode": "WELCOME20"
}
```

**Note:** You need to create a payment plan first or use the seeded plan ID.

## 🔧 Troubleshooting

### Issue: "Cannot GET /api/auth/register"

**Solution:** Make sure you're using `POST` not `GET` for registration.

### Issue: "Connection refused" or "ECONNREFUSED"

**Solutions:**
1. Check if server is running: `npm run dev`
2. Verify port 3000 is not in use
3. Check firewall settings

### Issue: "Validation failed"

**Solution:** Check the request body matches the expected format. Common issues:
- Missing required fields
- Invalid email format
- Password too short (min 6 characters)
- Password doesn't meet requirements (uppercase, lowercase, number)

### Issue: "User with this email already exists"

**Solution:** Use a different email or delete the existing user from database.

### Issue: "Invalid email or password"

**Solution:** 
- Verify email and password are correct
- Check if user exists in database
- Make sure password is hashed in database (use seed script)

### Issue: "Authentication required" or "Invalid or expired token"

**Solution:**
- Make sure you're including the `Authorization` header
- Format: `Bearer <token>` (with space after Bearer)
- Token might be expired (15 minutes), use refresh token

### Issue: CORS Error

**Solution:** CORS is configured to allow all origins in development. If you still see CORS errors:
1. Check `NODE_ENV` is set to `development`
2. Restart the server

### Issue: Database Connection Error

**Solutions:**
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` is correct
3. Run migrations: `npm run prisma:migrate`
4. Generate Prisma client: `npm run prisma:generate`

### Issue: Missing Environment Variables

**Solution:** 
1. Create `.env` file (see `SETUP_GUIDE.md`)
2. Make sure all required variables are set
3. Restart server after changing `.env`

## 📋 Postman Collection Setup

### Create Environment Variables in Postman

1. Create a new Environment in Postman
2. Add variables:
   - `base_url`: `http://localhost:3000`
   - `access_token`: (will be set after login)
   - `refresh_token`: (will be set after login)

### Use Variables in Requests

- Base URL: `{{base_url}}`
- Authorization: `Bearer {{access_token}}`

### Auto-save Tokens (Postman Tests)

Add this to your Login request's "Tests" tab:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.accessToken);
    pm.environment.set("refresh_token", response.data.refreshToken);
}
```

## ✅ Quick Test Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Health endpoint works (`GET /health`)
- [ ] Database is connected
- [ ] `.env` file exists with all variables
- [ ] Prisma migrations are run
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Can get current user with token
- [ ] Can refresh token

## 🐛 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Server not running | Start server with `npm run dev` |
| `Validation failed` | Invalid request body | Check body format and required fields |
| `User already exists` | Email already registered | Use different email or delete user |
| `Invalid token` | Token expired or invalid | Use refresh token or login again |
| `Database error` | DB connection issue | Check DATABASE_URL and PostgreSQL |

## 💡 Tips

1. **Use Postman Collections**: Save all requests in a collection for easy testing
2. **Use Environments**: Switch between dev/prod easily
3. **Save Responses**: Use Postman's "Save Response" to debug
4. **Check Console**: Server logs show detailed error messages
5. **Test Health First**: Always test `/health` endpoint first

