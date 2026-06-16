# Backend Setup Guide

## Step 1: Create .env file

Create a `.env` file in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jisr_db?schema=public"

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Thawani Payment Gateway
THAWANI_API_KEY=your_thawani_api_key_here
THAWANI_SECRET_KEY=your_thawani_secret_key_here
THAWANI_PUBLISHABLE_KEY=your_thawani_publishable_key_here
THAWANI_BASE_URL=https://uatcheckout.thawani.om
THAWANI_WEBHOOK_SECRET=your_webhook_secret_here
THAWANI_MODE=test

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting (disabled automatically when NODE_ENV=development)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_AUTH_MAX_REQUESTS=20
RATE_LIMIT_PAYMENT_MAX_REQUESTS=10
```

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

## Step 4: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Important Notes

1. **Generate strong JWT secrets**: Use a secure random string generator for `JWT_SECRET` and `JWT_REFRESH_SECRET` (minimum 32 characters)

2. **Thawani Credentials**: 
   - For testing: Use UAT credentials from Thawani dashboard
   - For production: Update `THAWANI_BASE_URL` to production URL and use production credentials

3. **Database**: Make sure PostgreSQL is running and accessible

4. **Frontend Integration**: Update your frontend API base URL to point to this backend

