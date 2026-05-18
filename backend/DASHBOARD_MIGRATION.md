# Dashboard Migration Guide

## Database Migration Required

The dashboard functionality requires new database models. Run the following commands:

```bash
cd backend
npx prisma migrate dev --name add_dashboard_models
npx prisma generate
```

This will create:
- `notifications` table
- `activity_logs` table

## What Was Added

### Backend

1. **New Models** (Prisma Schema):
   - `Notification` - User notifications
   - `ActivityLog` - Activity tracking

2. **New Services**:
   - `dashboard.service.js` - Dashboard statistics aggregation
   - `notification.service.js` - Notification management
   - `activity.service.js` - Activity log management

3. **New Routes**:
   - `GET /api/dashboard/stats` - Get dashboard statistics
   - `GET /api/dashboard/activity` - Get recent activity
   - `GET /api/dashboard/notifications` - Get notifications
   - `GET /api/dashboard/notifications/unread-count` - Get unread count
   - `PUT /api/dashboard/notifications/:id/read` - Mark as read
   - `PUT /api/dashboard/notifications/read-all` - Mark all as read

### Frontend

1. **New Service**:
   - `dashboardService.ts` - Frontend service for dashboard data

2. **Updated Component**:
   - `Dashboard.tsx` - Now uses real data from backend

## Next Steps

1. Run the migration: `npx prisma migrate dev --name add_dashboard_models`
2. Restart backend server
3. The dashboard will now show real data!

## Activity Logging

To automatically create activity logs, update these services to call `activityService`:
- When vocabulary is added/updated/deleted
- When settings are updated
- When children are created
- When vocabulary is used (already tracked via analytics)

Example:
```javascript
const activityService = require('../services/activity.service');
await activityService.logVocabularyAdded(userId, childId, vocabId, vocabText);
```
