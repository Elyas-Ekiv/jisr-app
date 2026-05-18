# 🛠️ Jisr Platform - Complete Tech Stack

## 📱 Frontend (React Application)

### Core Framework
- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type-safe JavaScript
- **Vite 5.0.0** - Build tool and dev server

### Routing & Navigation
- **React Router DOM 6.20.0** - Client-side routing

### Styling
- **Tailwind CSS 3.3.5** - Utility-first CSS framework
- **PostCSS 8.4.31** - CSS processing
- **Autoprefixer 10.4.16** - CSS vendor prefixing

### UI & Animations
- **Framer Motion 10.16.4** - Animation library
- **Lucide React 0.294.0** - Icon library

### Development Tools
- **ESLint 8.53.0** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

---

## 🔧 Backend (Node.js API)

### Runtime & Framework
- **Node.js** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **TypeScript 5.3.3** - Type-safe development

### Database & ORM
- **PostgreSQL** - Relational database
- **Prisma 5.7.1** - Modern ORM and database toolkit
- **@prisma/client 5.7.1** - Prisma client for database queries

### Authentication & Security
- **JWT (jsonwebtoken 9.0.2)** - JSON Web Tokens for authentication
- **bcryptjs 2.4.3** - Password hashing
- **Helmet 7.1.0** - Security headers middleware
- **express-rate-limit 7.1.4** - Rate limiting middleware

### Validation & Utilities
- **express-validator 7.0.1** - Input validation
- **Zod 3.22.4** - Schema validation
- **dotenv 16.3.1** - Environment variable management

### HTTP & API
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **Axios 1.6.2** - HTTP client (for Thawani API)
- **crypto 1.0.1** - Cryptographic functions

### Development Tools
- **Nodemon 3.0.2** - Auto-restart on file changes
- **ts-node 10.9.2** - TypeScript execution for Node.js

---

## 💳 Payment Integration

- **Thawani Payment Gateway** - Payment processing for Oman
  - UAT/Production API integration
  - Webhook handling
  - Session management

---

## 🗄️ Database Schema

### Models (Prisma)
- Users (authentication & profiles)
- Children (child profiles)
- Vocabulary (AAC vocabulary items)
- ChildVocabulary (many-to-many relationship)
- AACSettings (per-child settings)
- UsageAnalytics (usage tracking)
- PaymentPlans (subscription plans)
- Discounts (promo codes)
- Orders (payment orders)
- Payments (payment records)
- RefreshTokens (JWT refresh tokens)
- UserSettings (user preferences)

---

## 🏗️ Architecture

### Frontend Architecture
```
React Components
    ↓
Services Layer (API calls)
    ↓
API Utilities (HTTP requests)
    ↓
Backend API
```

### Backend Architecture
```
Express Routes
    ↓
Controllers (request handlers)
    ↓
Services (business logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## 🔐 Security Features

### Frontend
- Token-based authentication
- Secure token storage (localStorage)
- Automatic token refresh
- Protected routes

### Backend
- JWT authentication (access + refresh tokens)
- Password hashing (bcrypt)
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)

---

## 📦 Package Management

- **npm** - Package manager (both frontend and backend)

---

## 🌐 Deployment Ready

### Frontend
- **Vite** - Optimized production builds
- **Static hosting ready** - Can deploy to Vercel, Netlify, etc.

### Backend
- **Node.js** - Can deploy to Railway, Render, AWS, etc.
- **PostgreSQL** - Can use Supabase, Railway, AWS RDS, etc.

---

## 📊 Summary

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router 6 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend Framework** | Express.js + Node.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5 |
| **Authentication** | JWT |
| **Payment Gateway** | Thawani |
| **Language** | TypeScript (both) |

---

## 🚀 Development Environment

- **Node.js** - Required (v16+ recommended)
- **PostgreSQL** - Database server
- **npm** - Package manager
- **Code Editor** - VS Code recommended

---

## 📝 Key Features

✅ **Type-Safe** - Full TypeScript coverage
✅ **Modern Stack** - Latest stable versions
✅ **Production Ready** - Security, validation, error handling
✅ **Scalable** - Clean architecture, separation of concerns
✅ **Developer Friendly** - Hot reload, TypeScript, ESLint

---

**This is a modern, production-ready full-stack TypeScript application!** 🎉

