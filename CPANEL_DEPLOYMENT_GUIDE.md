################################################################################
# CPANEL DEPLOYMENT GUIDE
# Complete Step-by-Step Production Deployment
# Jisr AAC Communication Platform
################################################################################

=== PRE-DEPLOYMENT CHECKLIST ===

[ ] All environment variables defined in .env files
[ ] Database backups created
[ ] SSL certificate installed (AutoSSL recommended)
[ ] Node.js installed via cPanel (v18 or v20 LTS)
[ ] PostgreSQL database created and accessible
[ ] Firewall rules configured for database access
[ ] Disk space verified (minimum 2GB free)
[ ] API keys validated:
    - Thawani payment gateway
    - Resend email service
    - JWT_SECRET generated (32+ characters)

=== CPANEL HOSTING SETUP ===

1. Create cPanel Account:
   - Select "Node.js" addon domain or subdomain
   - Example: api.yourdomain.com for backend
   - Example: yourdomain.com for frontend

2. Database Setup:
   - Create PostgreSQL database in cPanel
   - Database name: jisr_prod (or similar)
   - Create dedicated database user with strong password
   - Grant all privileges to database user
   - Note the connection details:
     Host: localhost or your-host
     Port: 5432
     Username: database_user
     Password: secure_password
     Database: jisr_prod

3. Upload Files:
   Use File Manager or FTP/SFTP (recommended):
   
   a) Connected to: your-cpanel-ftp.com
   b) Username: cPanel_username
   c) Password: cPanel_password
   d) Upload to: /public_html/ (for frontend)
                 /home/username/jisr-backend/ (for backend)
   
   Exclude during upload:
   - node_modules/
   - .git/
   - dist/ (will be created during build)
   - .env (create manually)
   - uploads/media/* (user uploads)
   - coverage/
   - .vscode/

=== FRONTEND DEPLOYMENT (React + Vite) ===

1. SSH Access (if available):
   ssh cpanel_username@your-hosting.com
   cd public_html

2. Install Dependencies:
   npm ci
   
   This uses package-lock.json for exact versions (RECOMMENDED)
   Do NOT use 'npm install' in production

3. Build Frontend:
   npm run build
   
   Output: Creates 'dist/' folder with optimized files

4. Verify Build:
   ls -la dist/
   You should see: index.html, assets/, etc.

5. Configure Web Server:
   In cPanel Public HTML, ensure:
   - index.html is in document root
   - Rewrite rules for SPA routing (see .htaccess below)

6. Create .htaccess for SPA routing:
   Location: /public_html/.htaccess
   
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>

=== BACKEND DEPLOYMENT (Node.js + Express) ===

1. SSH into Backend Directory:
   ssh cpanel_username@your-hosting.com
   cd /home/username/jisr-backend

2. Install Dependencies:
   npm ci
   
   This installs exact versions from package-lock.json

3. Generate Prisma Client:
   npm run prisma:generate
   
   Creates: node_modules/.prisma/client/

4. Database Migrations:
   npm run prisma:migrate
   
   Applies all pending migrations to PostgreSQL
   First time: Creates all tables

5. (Optional) Seed Database:
   npm run prisma:seed
   
   Populates initial/test data

6. Build TypeScript:
   npm run build
   
   Compiles src/ to dist/
   Output: dist/server.js (production entry point)

7. Create .env file in backend/:
   
   NODE_ENV=production
   PORT=3000
   
   DATABASE_URL="postgresql://jisr_user:secure_password@localhost:5432/jisr_prod"
   
   JWT_SECRET="generate-random-32-char-string-here"
   JWT_EXPIRE=7d
   
   # Email Configuration
   RESEND_API_KEY="your-resend-api-key"
   FROM_EMAIL="noreply@yourdomain.com"
   
   # Payment Gateway
   THAWANI_API_KEY="your-thawani-api-key"
   THAWANI_SECRET_KEY="your-thawani-secret-key"
   THAWANI_PUBLIC_KEY="your-thawani-public-key"
   
   # CORS
   CORS_ORIGIN="https://yourdomain.com"
   
   # Optional
   LOG_LEVEL=info
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100

8. Test Backend Start:
   npm start
   
   Should see: "Server running on port 3000"
   Ctrl+C to stop

=== NODE.JS APPLICATION MANAGEMENT IN CPANEL ===

Option A: cPanel Node.js Application Manager (Recommended)
   1. Go to cPanel → Node.js Environments
   2. Create New Application:
      - Domain: api.yourdomain.com
      - Application root: /home/username/jisr-backend
      - Application URL: https://api.yourdomain.com
      - Application startup file: dist/server.js
      - Node.js version: 18.18.0
      - Application Mode: production
   3. Click "Create"
   4. Click "Manage" to start/restart application

Option B: PM2 Process Manager
   1. Install PM2 globally:
      npm install -g pm2
   
   2. Create ecosystem.config.js in backend/:
      module.exports = {
        apps: [{
          name: 'jisr-backend',
          script: './dist/server.js',
          env: {
            NODE_ENV: 'production',
            PORT: 3000
          },
          instances: 'max',
          exec_mode: 'cluster',
          watch: false,
          max_memory_restart: '500M',
          error_file: './logs/err.log',
          out_file: './logs/out.log',
          log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        }]
      };
   
   3. Start application:
      pm2 start ecosystem.config.js
      pm2 save
      pm2 startup
   
   4. Manage:
      pm2 status     # Check running processes
      pm2 logs       # View logs
      pm2 restart jisr-backend
      pm2 stop jisr-backend

=== CONFIGURE REVERSE PROXY (Apache) ===

If using Option B (PM2), configure cPanel to proxy requests:

1. Create .htaccess in backend public directory:
   
   <IfModule mod_proxy.c>
     ProxyPreserveHost On
     ProxyPass / http://127.0.0.1:3000/
     ProxyPassReverse / http://127.0.0.1:3000/
   </IfModule>

2. Or configure in cPanel "Addon Domains":
   - Set document root to proxy target
   - Enable SSL

=== CONNECTING FRONTEND TO BACKEND ===

1. Update Frontend Environment:
   Create src/.env.production:
   
   VITE_API_BASE_URL=https://api.yourdomain.com

2. Update Frontend Code:
   In src/config/api.ts or similar:
   
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
     || 'https://api.yourdomain.com';

3. Rebuild Frontend:
   npm run build

=== VERIFY DEPLOYMENT ===

1. Frontend Check:
   curl https://yourdomain.com/
   Should return HTML with React app

2. Backend Health Check:
   curl https://api.yourdomain.com/health
   (Or your actual API endpoint)
   Should return JSON response

3. Database Connection:
   Check backend logs for connection success

4. Test Payment Gateway:
   Use Thawani's test API keys
   Process test transaction

=== SSL/HTTPS SETUP ===

1. Enable AutoSSL in cPanel:
   cPanel → SSL/TLS → Manage AutoSSL

2. Or Use Let's Encrypt:
   cPanel → SSL/TLS → Issue, Install, or Renew SSL Certificates

3. Force HTTPS in .htaccess:
   
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{HTTPS} !=on
     RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L]
   </IfModule>

=== MONITORING & MAINTENANCE ===

1. Regular Backups:
   - cPanel → Backup Wizard
   - Schedule automated daily backups
   - Test restore procedures

2. Monitor Resources:
   - cPanel → Resource Usage
   - Monitor disk space (especially uploads/)
   - Monitor CPU and memory

3. Check Logs:
   Backend: /home/username/jisr-backend/logs/
   Web Server: /home/username/logs/

4. Update Dependencies:
   npm audit
   npm audit fix
   Test thoroughly before production

5. Database Maintenance:
   # Via cPanel phpPgAdmin:
   - Vacuum database regularly
   - Analyze query performance
   - Monitor table sizes

=== TROUBLESHOOTING ===

Problem: "Cannot find module"
Solution:
  - npm ci && npm run prisma:generate
  - Verify package-lock.json is in git

Problem: "Database connection refused"
Solution:
  - Verify DATABASE_URL in .env
  - Check PostgreSQL running: psql -U username -d database
  - Verify firewall rules
  - Check user permissions

Problem: "Port 3000 already in use"
Solution:
  - Change PORT in .env
  - Or: lsof -i :3000 && kill -9 PID
  - Or restart cPanel Node.js app

Problem: "CORS errors"
Solution:
  - Update CORS_ORIGIN in backend .env
  - Verify frontend domain matches CORS_ORIGIN
  - Rebuild backend and restart

Problem: "File upload fails"
Solution:
  - Create uploads/media directory: mkdir -p uploads/media
  - Set permissions: chmod 755 uploads/media
  - Verify MAX_FILE_SIZE in .env
  - Check disk space

Problem: "Prisma client not found"
Solution:
  npm run prisma:generate

=== POST-DEPLOYMENT ===

1. Test all features:
   - User authentication
   - File uploads
   - Payment processing
   - Email notifications
   - AAC functionality

2. Performance testing:
   - Load testing with ab or wrk
   - Database query performance
   - Image optimization verification

3. Security audit:
   - npm audit
   - OWASP top 10 review
   - SSL/TLS certificate validation

4. Documentation:
   - Update deployment notes
   - Document any custom configurations
   - Create rollback plan

=== QUICK REFERENCE COMMANDS ===

SSH into server:
  ssh cpanel_user@hosting.com

Navigate to project:
  cd /path/to/project

Install dependencies:
  npm ci

Build frontend:
  npm run build

Build backend:
  cd backend && npm run build

Restart backend (cPanel):
  Via Node.js Application Manager in cPanel

View logs:
  tail -f logs/app.log

Check Node.js version:
  node -v

Check npm version:
  npm -v

Test database connection:
  psql -U username -h localhost -d database_name

=== SUPPORT & DOCUMENTATION ===

For detailed information, refer to:
- NODE_REQUIREMENTS.txt (dependency versions)
- package.json (frontend dependencies)
- backend/package.json (backend dependencies)
- backend/prisma/schema.prisma (database schema)
- backend/src/config/ (configuration files)

Emergency contacts:
- Hosting provider support
- Database administrator
- API provider support (Thawani, Resend)

################################################################################
# Last Updated: May 2026
# Created for: Jisr AAC Communication Platform
# Deployment Type: cPanel Shared Hosting
################################################################################
