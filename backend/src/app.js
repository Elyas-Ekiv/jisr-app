const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config/env');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');
const userRoutes = require('./routes/user.routes');
const childRoutes = require('./routes/child.routes');
const vocabularyRoutes = require('./routes/vocabulary.routes');
const settingsRoutes = require('./routes/settings.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const progressRoutes = require('./routes/progress.routes');
const supportRoutes = require('./routes/support.routes');
const billingRoutes = require('./routes/billing.routes');
const userPreferencesRoutes = require('./routes/userPreferences.routes');
const publicRoutes = require('./routes/public.routes');
const locationRoutes = require('./routes/location.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.nodeEnv === 'development' ? true : config.frontendUrl, // Allow all origins in dev (for Postman)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
// The verify callback captures the raw buffer for the Thawani webhook route so we can
// compute the HMAC signature over the exact bytes that were transmitted.
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf, encoding) => {
    if (req.originalUrl && req.originalUrl.includes('/webhooks/thawani')) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Static files — serve uploaded media assets with cross-origin access
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Jisr API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

