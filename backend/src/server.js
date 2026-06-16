const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/db');
const { startNudgeWorker } = require('./workers/nudge.worker');

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  console.log(`💳 Thawani Mode: ${config.thawaniMode}`);

  // Start the Nudge Engine (daily payment reminder cron job)
  startNudgeWorker();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

