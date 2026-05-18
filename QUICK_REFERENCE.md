################################################################################
# QUICK REFERENCE - CPANEL DEPLOYMENT COMMAND GUIDE
# Copy & Paste Ready Commands for Production Deployment
################################################################################

=== FRONTEND DEPLOYMENT ===

Connect to Server:
  ssh cpanel_username@your-hosting.com

Navigate to Frontend:
  cd /public_html

Install Dependencies:
  npm ci

Build Frontend:
  npm run build

Create .env:
  echo 'VITE_API_BASE_URL=https://api.yourdomain.com' > .env

Create SPA Routing .htaccess:
  cat > .htaccess << 'EOF'
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  EOF

Verify Frontend Build:
  ls -la dist/ && cat dist/index.html | head -5

=== BACKEND DEPLOYMENT ===

Navigate to Backend:
  cd /home/username/jisr-backend

Install Dependencies:
  npm ci

Generate Prisma Client:
  npm run prisma:generate

Run Database Migrations:
  npm run prisma:migrate

(Optional) Seed Database:
  npm run prisma:seed

Build Backend:
  npm run build

Create .env File:
  cat > .env << 'EOF'
  NODE_ENV=production
  DATABASE_URL="postgresql://user:password@host:5432/jisr_prod"
  JWT_SECRET=your-32-char-random-string-here
  JWT_EXPIRE=7d
  PORT=3000
  RESEND_API_KEY=your-resend-api-key
  FROM_EMAIL=noreply@yourdomain.com
  THAWANI_API_KEY=your-thawani-api-key
  THAWANI_SECRET_KEY=your-thawani-secret-key
  THAWANI_PUBLIC_KEY=your-thawani-public-key
  CORS_ORIGIN=https://yourdomain.com
  LOG_LEVEL=info
  RATE_LIMIT_WINDOW=15
  RATE_LIMIT_MAX_REQUESTS=50
  EOF

Set File Permissions:
  chmod 600 .env

Create Logs Directory:
  mkdir -p logs

Create Uploads Directory:
  mkdir -p uploads/media

Set Upload Permissions:
  chmod 755 uploads/media

Verify Backend Build:
  ls -la dist/server.js && echo "Build successful"

=== APPLICATION STARTUP OPTIONS ===

OPTION A: Using cPanel Node.js Manager (Recommended)
────────────────────────────────────────────────────

1. Go to cPanel → Node.js Environments
2. Click "Create Application"
3. Fill in:
   - Domain: api.yourdomain.com
   - Application root: /home/username/jisr-backend
   - Startup file: dist/server.js
   - Node.js version: 18.18.0
   - Application mode: production
4. Click "Create"
5. Click "Manage" then "Start"

Verify Running:
  curl https://api.yourdomain.com/health

OPTION B: Using PM2 Process Manager
────────────────────────────────────

Install PM2 Globally:
  npm install -g pm2

Start Application:
  pm2 start ecosystem.config.js

Configure Auto-Start:
  pm2 save
  pm2 startup
  (Run the command shown in output with sudo)

Check Status:
  pm2 status

View Logs:
  pm2 logs jisr-backend

Restart Application:
  pm2 restart jisr-backend

Monitor Resources:
  pm2 monit

=== VERIFICATION COMMANDS ===

Test Frontend Loading:
  curl -I https://yourdomain.com/

Test Backend Health:
  curl https://api.yourdomain.com/health

Check Backend Logs (cPanel):
  cd /home/username/jisr-backend
  tail -f logs/out.log

Check Backend Logs (PM2):
  pm2 logs jisr-backend

Database Connection Test:
  psql -U database_user -h localhost -d jisr_prod -c "SELECT 1"

Check Node.js Version:
  node -v
  npm -v

List Running Processes:
  pm2 list

Monitor CPU/Memory (PM2):
  pm2 monit

=== TROUBLESHOOTING QUICK FIXES ===

Module Not Found Error:
  npm ci && npm run prisma:generate && npm run build

Database Connection Error:
  1. Check DATABASE_URL in .env
  2. Verify PostgreSQL running
  3. Verify credentials correct

Port Already in Use:
  1. Change PORT in .env
  2. Restart application

Build Fails:
  rm -rf dist node_modules
  npm ci
  npm run build

CORS Errors:
  1. Check CORS_ORIGIN in backend/.env
  2. Match frontend domain exactly
  3. Restart backend

API Not Responding:
  1. Check backend is running (pm2 status or cPanel)
  2. Check logs (pm2 logs or tail -f logs/out.log)
  3. Verify port (lsof -i :3000)
  4. Check firewall rules

=== MAINTENANCE COMMANDS ===

Weekly Security Audit:
  npm audit

Monthly Updates (Test First!):
  npm update
  npm run build
  npm start (test locally first)

Check Disk Usage:
  df -h

Check Backend Memory:
  pm2 monit

Restart Application Gracefully (PM2):
  pm2 gracefulReload jisr-backend

Restart Application (cPanel):
  Via cPanel Node.js Application Manager → Manage → Restart

Backup Database:
  pg_dump jisr_prod > backup_$(date +%Y%m%d_%H%M%S).sql

Save PM2 Process List:
  pm2 save

View Saved Processes:
  pm2 show jisr-backend

Delete Application from PM2:
  pm2 delete jisr-backend

=== DEPLOYMENT CHECKLIST (Quick Version) ===

Before Upload:
  ✓ All .env files removed from code
  ✓ node_modules deleted locally
  ✓ dist/ deleted locally
  ✓ .git/ excluded from upload

After Upload:
  ✓ SSH access working
  ✓ FTP credentials verified

Build Phase:
  ✓ npm ci runs without errors
  ✓ npm run build succeeds
  ✓ npm run prisma:generate works
  ✓ npm run prisma:migrate succeeds

Environment:
  ✓ .env files created with real values
  ✓ Database URL correct
  ✓ API keys valid
  ✓ JWT_SECRET strong (32+ chars)

Startup:
  ✓ Application starts without errors
  ✓ Logs show "Server running"
  ✓ Health check returns 200
  ✓ API endpoint accessible

Verification:
  ✓ Frontend loads (https://yourdomain.com)
  ✓ Backend responds (https://api.yourdomain.com)
  ✓ Database connected
  ✓ Authentication working
  ✓ File uploads working
  ✓ Payments processing

=== EMERGENCY PROCEDURES ===

If Application Crashes:
  pm2 restart jisr-backend
  pm2 logs jisr-backend  (check error)
  Fix issue in code
  npm run build
  pm2 restart jisr-backend

If Database Corrupted:
  1. Restore from backup: psql < backup_timestamp.sql
  2. Run migrations: npm run prisma:migrate
  3. Restart application

If Out of Disk Space:
  1. Check largest folders: du -sh *
  2. Delete old logs: rm logs/*.log*
  3. Clear npm cache: npm cache clean --force
  4. Delete old uploads if safe

If Need to Rollback:
  1. Restore previous code version: git checkout previous-tag
  2. Delete node_modules: rm -rf node_modules
  3. Run: npm ci
  4. Run: npm run build
  5. Run: npm run prisma:migrate (if needed)
  6. Restart: pm2 restart jisr-backend

=== SSH LOGIN TEMPLATE ===

Replace these values:
  cpanel_username = Your cPanel username
  your-hosting.com = Your hosting domain

Command:
  ssh cpanel_username@your-hosting.com

Password: Your cPanel password

=== FTP LOGIN TEMPLATE ===

Server: your-ftp-hostname.com
Username: cpanel_username
Password: Your cPanel password
Port: 21
SSL: Recommended (SFTP port 22)

=== ENVIRONMENT VARIABLE TEMPLATE ===

Copy to backend/.env:

NODE_ENV=production
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME
JWT_SECRET=GENERATE_RANDOM_32_CHAR_STRING
JWT_EXPIRE=7d
PORT=3000
RESEND_API_KEY=YOUR_RESEND_API_KEY
FROM_EMAIL=noreply@yourdomain.com
THAWANI_API_KEY=YOUR_THAWANI_KEY
THAWANI_SECRET_KEY=YOUR_THAWANI_SECRET
THAWANI_PUBLIC_KEY=YOUR_THAWANI_PUBLIC_KEY
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info

=== HELPFUL ALIASES (Add to ~/.bashrc) ===

alias logs='pm2 logs jisr-backend'
alias status='pm2 status'
alias restart='pm2 restart jisr-backend'
alias monit='pm2 monit'
alias audit='npm audit'
alias build='npm run build && cd backend && npm run build'

=== USEFUL LINKS ===

cPanel Documentation: https://cpanel.net/docs
Express.js Docs: https://expressjs.com
Prisma Docs: https://www.prisma.io/docs
Node.js Docs: https://nodejs.org/docs
PM2 Docs: https://pm2.keymetrics.io/docs

=== EMERGENCY CONTACTS ===

Hosting Support: [Your hosting provider]
Database Admin: [Your DB admin]
API Support: Thawani: https://thawani.om, Resend: https://resend.com
NodeJS Issues: https://github.com/nodejs/node/issues

################################################################################
# Keep this file handy during deployment!
# Reference: CPANEL_DEPLOYMENT_GUIDE.md for detailed information
# Last Updated: May 2026
################################################################################
