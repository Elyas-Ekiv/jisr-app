require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Thawani
  thawaniApiKey: process.env.THAWANI_API_KEY,
  thawaniSecretKey: process.env.THAWANI_SECRET_KEY,
  thawaniPublishableKey: process.env.THAWANI_PUBLISHABLE_KEY,
  thawaniBaseUrl: process.env.THAWANI_BASE_URL || 'https://uatcheckout.thawani.om',
  thawaniWebhookSecret: process.env.THAWANI_WEBHOOK_SECRET,
  thawaniMode: process.env.THAWANI_MODE || 'test',

  // Resend (transactional email)
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
  resendFromName: process.env.RESEND_FROM_NAME || 'Jisr',

  // File Upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};

// Validate required environment variables (only in production)
if (config.nodeEnv === 'production') {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'THAWANI_API_KEY',
    'THAWANI_SECRET_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }
} else {
  // Development: Warn about missing vars but don't exit
  const importantVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missingVars = importantVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Warning: Missing important environment variables:');
    missingVars.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('   Some features may not work correctly.');
  }
}

module.exports = config;
