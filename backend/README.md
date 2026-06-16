# Jisr Backend API

Production-ready backend for Jisr AAC Communication Platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
cd backend
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database:**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

4. **Start development server:**

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── config/             # Configuration files
│   │   ├── db.js          # Prisma client
│   │   ├── env.js         # Environment config
│   │   └── thawani.js     # Thawani payment service
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── middlewares/       # Express middlewares
│   ├── utils/             # Utility functions
│   └── validations/       # Input validation
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

## 🔐 Authentication

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "accountType": "parent"
}
```

**Response:**
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

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

## 💳 Payment Integration (Thawani)

### Payment Flow

1. **Create Payment Session**

```http
POST /api/payments/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "planId": "plan_id_here",
  "discountCode": "WELCOME20" // optional
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment session created",
  "data": {
    "orderId": "clx...",
    "orderReference": "clx...",
    "sessionId": "thawani_session_id",
    "sessionUrl": "https://checkout.thawani.om/...",
    "amount": 15.0,
    "currency": "OMR"
  }
}
```

2. **Redirect user to `sessionUrl`**

3. **After payment, verify payment:**

```http
POST /api/payments/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "sessionId": "thawani_session_id"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "data": {
    "success": true,
    "payment": {
      "id": "clx...",
      "status": "COMPLETED",
      "amount": 15.0
    },
    "order": {
      "id": "clx...",
      "status": "PAID"
    }
  }
}
```

### Webhook Configuration

Thawani will send webhooks to:
```
POST /api/webhooks/thawani
```

Configure this URL in your Thawani dashboard.

**Webhook Payload:**
```json
{
  "session_id": "thawani_session_id",
  "payment_status": "paid",
  "payment_id": "payment_id"
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Payments
- `POST /api/payments/create` - Create payment session
- `POST /api/payments/verify` - Verify payment
- `POST /api/webhooks/thawani` - Thawani webhook handler

## 🔒 Security Features

- ✅ JWT authentication with access & refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth & payment endpoints
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database (development only)
npx prisma migrate reset
```

## 🌍 Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `THAWANI_API_KEY` - Thawani API key
- `THAWANI_SECRET_KEY` - Thawani secret key
- `THAWANI_BASE_URL` - Thawani API base URL
- `THAWANI_WEBHOOK_SECRET` - Webhook signature secret
- `FRONTEND_URL` - Frontend application URL

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 TODO

- [ ] Implement remaining routes (users, children, vocabulary, settings, analytics, admin)
- [ ] Add file upload for vocabulary images
- [ ] Implement email notifications
- [ ] Add comprehensive logging
- [ ] Write unit and integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement caching
- [ ] Add monitoring and error tracking

## 🚢 Deployment

### Build for production:

```bash
npm run build
npm start
```

### Recommended hosting:

- **Backend**: Railway, Render, DigitalOcean, AWS
- **Database**: Supabase, Railway PostgreSQL, AWS RDS
- **Environment**: Set all environment variables in hosting platform

## 📚 Additional Resources

- [Thawani Documentation](https://docs.thawani.om)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 📄 License

ISC

