module.exports = {
  apps: [
    {
      // ===== BACKEND APPLICATION =====
      name: 'jisr-backend',
      script: './dist/server.js',
      cwd: './backend',
      
      // ===== ENVIRONMENT =====
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // ===== CLUSTERING =====
      instances: 'max',           // Use all CPU cores
      exec_mode: 'cluster',       // Clustering mode
      
      // ===== AUTO RESTART =====
      watch: false,               // Don't watch files in production
      max_memory_restart: '500M', // Restart if exceeds 500MB
      max_restarts: 10,           // Max restart attempts
      min_uptime: '10s',          // Min uptime before failure count
      
      // ===== LOGGING =====
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // ===== GRACEFUL SHUTDOWN =====
      kill_timeout: 5000,         // 5 seconds before force kill
      listen_timeout: 3000,       // Timeout for listening port
      shutdown_with_message: true,
      
      // ===== MONITORING =====
      merge_logs: false,
      autorestart: true,
      
      // ===== HEALTH CHECK =====
      cron_restart: '0 0 * * *',  // Daily restart at midnight (optional)
      
      // ===== ADVANCED =====
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.env',
        'dist'  // Don't watch build output
      ],
      
      watch_delay: 1000,
      max_listeners: 20,
    }
  ],
  
  // ===== DEPLOYMENT CONFIGURATION =====
  deploy: {
    production: {
      user: 'cpanel_username',
      host: 'your-hosting.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/jisr.git',
      path: '/home/cpanel_username/jisr-backend',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production'
    },
    staging: {
      user: 'cpanel_username',
      host: 'your-hosting.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/jisr.git',
      path: '/home/cpanel_username/jisr-backend-staging',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};

/*
================================================================================
PM2 USAGE GUIDE
================================================================================

INSTALLATION:
  npm install -g pm2

STARTUP:
  pm2 start ecosystem.config.js
  pm2 start ecosystem.config.js --env production

MANAGEMENT:
  pm2 status              # Show all processes
  pm2 logs               # View real-time logs
  pm2 logs jisr-backend  # View specific app logs
  pm2 monit              # Monitor resources
  pm2 restart jisr-backend
  pm2 stop jisr-backend
  pm2 delete jisr-backend

PERSISTENCE:
  pm2 save               # Save current process list
  pm2 startup            # Auto-start on reboot (requires sudo)
  pm2 unstartup          # Remove auto-start

UPDATES:
  pm2 reload ecosystem.config.js  # Zero-downtime reload
  pm2 gracefulReload jisr-backend # Graceful restart

CLUSTERING INFO:
  - instances: 'max' will use all CPU cores
  - exec_mode: 'cluster' enables clustering
  - Each instance listens on same port (load balanced by Node.js)
  - Zero-downtime reloads: pm2 reload

LOGS LOCATION:
  - Error logs: ./backend/logs/err.log
  - Output logs: ./backend/logs/out.log
  - Ensure logs directory exists: mkdir -p logs

HEALTH MONITORING:
  - Max memory: 500MB per process
  - Auto-restart on crash with exponential backoff
  - Keep process list in memory (survives restarts)

DEVELOPMENT vs PRODUCTION:
  Development: Remove 'exec_mode: cluster', use single instance
  Production: Use cluster mode for better CPU utilization

CRON RESTART:
  Optional daily restart at midnight: 0 0 * * *
  Uncomment if needed for memory cleanup

CONNECTION LIMITS:
  - Check connections: netstat -an | grep :3000
  - Increase if needed in system configuration

================================================================================
*/
