################################################################################
# PRODUCTION DEPLOYMENT CHECKLIST
# Jisr AAC Communication Platform - cPanel Deployment
# Status Tracking & Verification
################################################################################

=== PRE-DEPLOYMENT PHASE ===

Code Quality & Preparation:
  [ ] All code committed to git repository
  [ ] No uncommitted changes on main/production branch
  [ ] Code review completed and approved
  [ ] All tests passing (if applicable)
  [ ] Linting passed: npm run lint
  [ ] No console.log statements in production code
  [ ] No hardcoded credentials in code
  [ ] Security audit passed: npm audit

Version Control:
  [ ] Create git tag for this release: git tag -a v1.0.0
  [ ] Update CHANGELOG with release notes
  [ ] All dependencies locked in package-lock.json
  [ ] .gitignore properly configured (verified ✓)
  [ ] No node_modules in git

=== INFRASTRUCTURE PREPARATION ===

Hosting Setup:
  [ ] cPanel account created and accessible
  [ ] SSH access configured and tested
  [ ] FTP/SFTP credentials verified
  [ ] Domain/subdomain added to cPanel
  [ ] DNS records pointing to hosting
  [ ] Disk space available: minimum 2GB

Database Setup:
  [ ] PostgreSQL installed and running
  [ ] Database created: jisr_prod
  [ ] Database user created with secure password
  [ ] User permissions configured (SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER)
  [ ] Connection can be established locally
  [ ] Connection can be established remotely (if needed)
  [ ] Database backup strategy defined
  [ ] First backup completed

SSL/TLS Certificate:
  [ ] SSL certificate obtained (AutoSSL or manual)
  [ ] Certificate installed on domain
  [ ] Certificate installed on API subdomain
  [ ] Certificate validity checked (not expired)
  [ ] Certificate auto-renewal configured
  [ ] HTTPS forcing configured in .htaccess

Node.js Installation:
  [ ] Node.js installed on hosting (v18 or v20 LTS)
  [ ] npm version verified (9.8.1 or higher)
  [ ] Node.js PATH configured correctly
  [ ] npm ci command works

API Keys & Credentials:
  [ ] Thawani API keys obtained and verified
  [ ] Thawani test mode configuration documented
  [ ] Resend email API key obtained
  [ ] Sender email address verified in Resend
  [ ] JWT_SECRET generated (32+ random characters)
  [ ] All credentials stored securely (not in git)

=== FILE PREPARATION ===

Frontend Files:
  [ ] Delete node_modules/ (don't upload)
  [ ] Delete .git/ directory (don't upload)
  [ ] Delete dist/ directory (will be built)
  [ ] Keep package.json and package-lock.json
  [ ] Keep public/ directory
  [ ] Keep src/ directory
  [ ] Keep configuration files (tailwind, postcss, vite, tsconfig)
  [ ] Copy .env.example as reference

Backend Files:
  [ ] Delete node_modules/ (don't upload)
  [ ] Delete dist/ directory (will be built)
  [ ] Delete .git/ directory (don't upload)
  [ ] Keep package.json and package-lock.json
  [ ] Keep src/ directory
  [ ] Keep prisma/ directory (schema.prisma, migrations)
  [ ] Keep configuration files
  [ ] Copy .env.example as reference
  [ ] Delete test files (test-payment.js, test-server.js)

Documentation Files to Upload:
  [ ] README.md
  [ ] NODE_REQUIREMENTS.txt ✓ (created)
  [ ] PACKAGE_VERSIONS.txt ✓ (created)
  [ ] CPANEL_DEPLOYMENT_GUIDE.md ✓ (created)
  [ ] PRODUCTION_DEPLOYMENT_CHECKLIST.md ✓ (this file)

=== FILE UPLOAD PHASE ===

Upload Configuration:
  [ ] Use SFTP (more secure than FTP)
  [ ] Create backups before upload
  [ ] Upload to correct directories:
      - Frontend: /public_html/
      - Backend: /home/username/jisr-backend/ (or custom path)

Frontend Upload:
  [ ] Upload index.html
  [ ] Upload public/ directory
  [ ] Upload src/ directory
  [ ] Upload tailwind.config.js
  [ ] Upload postcss.config.js
  [ ] Upload vite.config.ts
  [ ] Upload tsconfig.json
  [ ] Upload tsconfig.node.json
  [ ] Upload package.json
  [ ] Upload package-lock.json
  [ ] Verify file count matches expected
  [ ] Create dist/ directory (mkdir dist)

Backend Upload:
  [ ] Create /home/username/jisr-backend directory
  [ ] Upload src/ directory
  [ ] Upload prisma/ directory (with schema.prisma and migrations)
  [ ] Upload package.json
  [ ] Upload package-lock.json
  [ ] Upload tsconfig.json
  [ ] Upload ecosystem.config.js ✓
  [ ] Upload .npmrc ✓
  [ ] Upload .nvmrc ✓
  [ ] Create logs/ directory (mkdir logs)
  [ ] Create uploads/media directory (mkdir -p uploads/media)
  [ ] Set directory permissions (chmod 755)
  [ ] Set file permissions (chmod 644)

=== BUILD & INSTALLATION PHASE ===

Frontend Build:
  [ ] SSH into hosting
  [ ] Navigate to /public_html
  [ ] Run: npm ci
  [ ] Verify installation: ls node_modules | wc -l (should be ~50+)
  [ ] Run: npm run build
  [ ] Verify dist/ folder created
  [ ] Check dist/index.html exists
  [ ] Check dist/assets/ folder exists with .js and .css files

Backend Installation:
  [ ] Navigate to /home/username/jisr-backend
  [ ] Run: npm ci
  [ ] Run: npm run prisma:generate
  [ ] Verify Prisma client generated
  [ ] Run: npm run build
  [ ] Verify dist/ folder created
  [ ] Verify dist/server.js exists

=== ENVIRONMENT CONFIGURATION ===

Frontend Environment (.env):
  [ ] Create file: /public_html/.env
  [ ] Add: VITE_API_BASE_URL=https://api.yourdomain.com
  [ ] Save and close

Backend Environment (.env):
  [ ] Create file: /home/username/jisr-backend/.env
  [ ] NODE_ENV=production
  [ ] DATABASE_URL=postgresql://user:pass@host:port/db
  [ ] JWT_SECRET=<32-char-random-string>
  [ ] JWT_EXPIRE=7d
  [ ] PORT=3000
  [ ] RESEND_API_KEY=<your-key>
  [ ] FROM_EMAIL=noreply@yourdomain.com
  [ ] THAWANI_API_KEY=<your-key>
  [ ] THAWANI_SECRET_KEY=<your-key>
  [ ] THAWANI_PUBLIC_KEY=<your-key>
  [ ] CORS_ORIGIN=https://yourdomain.com
  [ ] LOG_LEVEL=info
  [ ] RATE_LIMIT_WINDOW=15
  [ ] RATE_LIMIT_MAX_REQUESTS=50
  [ ] File permissions: chmod 600 .env
  [ ] Verify no .env file in git (.gitignore checked ✓)

=== DATABASE SETUP ===

Database Migration:
  [ ] Navigate to /home/username/jisr-backend
  [ ] Run: npm run prisma:migrate
  [ ] Review migration output for errors
  [ ] Verify all tables created in PostgreSQL
  [ ] Check database size is reasonable

Database Seeding (Optional):
  [ ] Run: npm run prisma:seed
  [ ] Verify initial data inserted
  [ ] Check specific tables for test data

Database Backup:
  [ ] Create initial backup
  [ ] Backup filename includes date
  [ ] Store backup securely
  [ ] Document backup location

=== APPLICATION STARTUP ===

Option A: Using cPanel Node.js Manager (Recommended):
  [ ] Go to cPanel → Node.js Environments
  [ ] Click "Create Application"
  [ ] Domain: api.yourdomain.com
  [ ] Application Root: /home/username/jisr-backend
  [ ] Startup File: dist/server.js
  [ ] Node.js Version: 18.18.0
  [ ] Application Mode: production
  [ ] Click "Create"
  [ ] Click "Manage" → Start
  [ ] Verify "Running" status
  [ ] Check Node.js selector shows running

Option B: Using PM2:
  [ ] Install PM2: npm install -g pm2
  [ ] Navigate to backend directory
  [ ] Run: pm2 start ecosystem.config.js
  [ ] Run: pm2 save
  [ ] Run: pm2 startup
  [ ] Run shown sudo command (for auto-start)
  [ ] Run: pm2 status (verify running)

=== WEB SERVER CONFIGURATION ===

Frontend Routing (.htaccess):
  [ ] Create: /public_html/.htaccess
  [ ] Add SPA routing rules (see CPANEL_DEPLOYMENT_GUIDE.md)
  [ ] Test routing for non-existent pages
  [ ] Should load index.html and route in React

HTTPS Forcing:
  [ ] Add HTTPS forcing to .htaccess
  [ ] Test: curl -I https://yourdomain.com (should show 200)
  [ ] Test: curl -I http://yourdomain.com (should redirect to https)

API Proxy (if using PM2):
  [ ] Create proxy rules in Apache
  [ ] Or use cPanel addon domain reverse proxy
  [ ] Test API endpoint accessibility

=== VERIFICATION PHASE ===

Frontend Verification:
  [ ] Browse to https://yourdomain.com
  [ ] Page loads without JavaScript errors
  [ ] Check browser console (F12) for errors
  [ ] Test React Router navigation
  [ ] Test all main pages load
  [ ] Check responsive design on mobile
  [ ] Verify styling loaded (CSS working)
  [ ] Network tab shows all assets loading

Backend Verification:
  [ ] Test health check endpoint: curl https://api.yourdomain.com/health
  [ ] Test API response: curl https://api.yourdomain.com/api/endpoint
  [ ] Check response headers include security headers
  [ ] Test CORS headers: Origin header match in response
  [ ] Review backend logs: tail -f logs/out.log

Frontend-Backend Connection:
  [ ] Open frontend in browser
  [ ] Open DevTools Network tab
  [ ] Test API call from frontend
  [ ] Verify request goes to api.yourdomain.com
  [ ] Verify no CORS errors
  [ ] Verify response returns correctly

Authentication Testing:
  [ ] Test user registration
  [ ] Test user login
  [ ] Verify JWT token generated
  [ ] Verify token sent in Authorization header
  [ ] Test protected routes
  [ ] Verify token expiry working

File Upload Testing:
  [ ] Test file upload functionality
  [ ] Verify files saved to uploads/media/
  [ ] Verify file permissions correct (644)
  [ ] Test image optimization (sharp)
  [ ] Check disk space after upload

Email Service Testing:
  [ ] Trigger email-sending action
  [ ] Check email received
  [ ] Verify email content correct
  [ ] Check email headers (from, reply-to)
  [ ] Test with multiple email providers

Payment Gateway Testing:
  [ ] Use Thawani test API keys
  [ ] Process test payment
  [ ] Verify payment recorded in database
  [ ] Test payment callback/webhook
  [ ] Verify user account updated after payment
  [ ] Test cancel payment flow
  [ ] Test failed payment handling

Database Verification:
  [ ] Connect via phpPgAdmin or terminal
  [ ] Verify all tables exist
  [ ] Check record counts
  [ ] Verify foreign key relationships
  [ ] Check indexes exist
  [ ] Verify no errors in logs

=== SECURITY VERIFICATION ===

Vulnerability Check:
  [ ] Run: npm audit (in both frontend and backend)
  [ ] No critical vulnerabilities shown
  [ ] No high vulnerabilities without fixes

Security Headers:
  [ ] X-Content-Type-Options: nosniff
  [ ] X-Frame-Options: DENY or SAMEORIGIN
  [ ] X-XSS-Protection: 1; mode=block
  [ ] Strict-Transport-Security: max-age=...
  [ ] Content-Security-Policy configured
  [ ] Test with: https://securityheaders.com

Environment Variables:
  [ ] Verify .env file not accessible via web
  [ ] Verify .env not in git
  [ ] Verify sensitive values not in code
  [ ] Verify JWT_SECRET strong (32+ chars)
  [ ] Verify API keys not logged

File Permissions:
  [ ] .env files: 600 (owner read/write only)
  [ ] Directories: 755 (owner rwx, others rx)
  [ ] Public files: 644 (owner rw, others r)
  [ ] node_modules: 755
  [ ] uploads directory: 755

Password Security:
  [ ] Database password strong (16+ chars, mixed)
  [ ] cPanel password strong and changed
  [ ] FTP/SFTP password strong and changed
  [ ] No passwords in code or logs

CORS Configuration:
  [ ] CORS_ORIGIN matches frontend domain exactly
  [ ] Credentials: true only when necessary
  [ ] Allowed methods: POST, GET, PUT, DELETE (only needed)
  [ ] Allowed headers: Content-Type, Authorization (only needed)

=== PERFORMANCE VERIFICATION ===

Page Load Testing:
  [ ] Frontend load time < 3 seconds
  [ ] First Contentful Paint < 1.5 seconds
  [ ] Time to Interactive < 3 seconds
  [ ] Check with: Chrome DevTools → Lighthouse

API Response Testing:
  [ ] API response time < 500ms
  [ ] Database queries optimized
  [ ] No N+1 query problems
  [ ] Connection pooling working

Memory Usage:
  [ ] Backend process memory < 200MB
  [ ] No memory leaks over time
  [ ] Check: pm2 monit or top

CPU Usage:
  [ ] CPU usage < 50% average
  [ ] Spikes acceptable under load
  [ ] Check: pm2 monit or top

Database Performance:
  [ ] Slow queries logged and reviewed
  [ ] Indexes present on frequently queried columns
  [ ] Query execution time < 100ms average
  [ ] Connection pool not saturated

=== MONITORING & MAINTENANCE SETUP ===

Logging:
  [ ] Application logs enabled
  [ ] Error logs captured: logs/err.log
  [ ] Output logs captured: logs/out.log
  [ ] Log rotation configured (if available)
  [ ] Log retention policy defined

Backups:
  [ ] Database backup schedule: Daily
  [ ] File backup schedule: Weekly
  [ ] Backup location secure and remote
  [ ] Backup restore tested
  [ ] Backup retention policy: 30 days minimum

Monitoring:
  [ ] Set up uptime monitoring (uptime.com, etc.)
  [ ] Set up error rate alerts
  [ ] Set up performance alerts
  [ ] Contact information updated
  [ ] Escalation procedures defined

Updates & Patches:
  [ ] Schedule for npm audit: Weekly
  [ ] Schedule for npm updates: Monthly
  [ ] Document update procedures
  [ ] Test updates in staging first
  [ ] Create rollback procedure

=== DOCUMENTATION ===

Deployment Notes:
  [ ] Document deployment date and time
  [ ] Document all environment variables
  [ ] Document database connection details
  [ ] Document API keys and access
  [ ] Document any custom configurations
  [ ] Document troubleshooting procedures

Team Knowledge:
  [ ] Training completed for ops team
  [ ] Runbooks created for common tasks
  [ ] Emergency contacts listed
  [ ] Escalation procedures documented
  [ ] Access credentials stored securely

=== POST-DEPLOYMENT ===

First 24 Hours:
  [ ] Monitor error logs continuously
  [ ] Monitor performance metrics
  [ ] Test all critical user journeys
  [ ] Check payment processing
  [ ] Monitor database size growth
  [ ] Monitor disk space usage

First Week:
  [ ] Verify daily backups running
  [ ] Check database maintenance
  [ ] Review security audit logs
  [ ] Monitor user feedback/errors
  [ ] Performance metrics baseline
  [ ] Check scheduled jobs running

Ongoing:
  [ ] Weekly: npm audit
  [ ] Monthly: npm update & test
  [ ] Quarterly: Full security audit
  [ ] Annually: Major version upgrades
  [ ] Continuous: Monitor alerts & logs

=== ROLLBACK PROCEDURE ===

If Critical Issues Occur:
  [ ] Immediately stop new deployments
  [ ] Revert code to last known good version
  [ ] Restore database from backup
  [ ] Clear npm cache: npm cache clean --force
  [ ] Reinstall dependencies: npm ci
  [ ] Rebuild: npm run build
  [ ] Restart application
  [ ] Verify previous version working
  [ ] Post-mortem: Document what failed
  [ ] Fix issue and test thoroughly

=== SIGN-OFF ===

Deployment Ready:
  [ ] All checklist items completed
  [ ] All tests passing
  [ ] Security review passed
  [ ] Performance acceptable
  [ ] Documentation complete
  [ ] Team trained and ready
  [ ] Monitoring configured
  [ ] Backup procedures verified

Deployment Authorization:
  Name: ____________________________
  Date: ____________________________
  Time: ____________________________
  Notes: ____________________________
        ____________________________

=== COMPLETION ===

Deployment completed successfully on: ______________
Total downtime: ______________
Issues encountered: ____________________________
   Solutions applied: ____________________________

================================================================================
# For detailed information, refer to CPANEL_DEPLOYMENT_GUIDE.md
# Last Updated: May 2026
================================================================================
