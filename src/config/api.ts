/**
 * API Configuration
 * Base URL for backend API
 *
 * Production (Docker/nginx): defaults to same-origin `/api`
 * Development: defaults to local backend on port 3000
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

/**
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: 'auth/register',
    LOGIN: 'auth/login',
    CHILD_LOGIN: 'auth/child-login',
    LOGOUT: 'auth/logout',
    REFRESH: 'auth/refresh',
    ME: 'auth/me',
    RECOVERY_QUESTION: 'auth/recovery-question',
    RESET_PASSWORD_RECOVERY: 'auth/reset-password-recovery',
  },
  // Children
  CHILDREN: {
    LIST: 'children',
    CREATE: 'children',
    GET: (id: string) => `children/${id}`,
    UPDATE: (id: string) => `children/${id}`,
    DELETE: (id: string) => `children/${id}`,
  },
  // Vocabulary
  VOCABULARY: {
    LIST: 'vocabulary',
    CHILD: 'vocabulary/child',
    GET: (id: string) => `vocabulary/${id}`,
    CREATE: 'vocabulary',
    UPDATE: (id: string) => `vocabulary/${id}`,
    DELETE: (id: string) => `vocabulary/${id}`,
    ASSIGN: (id: string) => `vocabulary/${id}/assign`,
    UNASSIGN: (id: string) => `vocabulary/${id}/unassign`,
  },
  // Settings
  SETTINGS: {
    GET: (childId: string) => `settings/${childId}`,
    UPDATE: (childId: string) => `settings/${childId}`,
  },
  // Analytics
  ANALYTICS: {
    GET: (childId: string) => `analytics/${childId}`,
    RECORD: (childId: string) => `analytics/${childId}/usage`,
  },
  // Locations
  LOCATIONS: {
    GET: (childId: string) => `locations/${childId}`,
    CREATE: (childId: string) => `locations/${childId}`,
    UPDATE: (childId: string, locationId: string) => `locations/${childId}/${locationId}`,
    DELETE: (childId: string, locationId: string) => `locations/${childId}/${locationId}`,
  },
  // Payments
  PAYMENTS: {
    CREATE: 'payments/create',
    VERIFY: 'payments/verify',
    TRANSACTIONS: 'payments/transactions',
    VALIDATE_DISCOUNT: 'payments/validate-discount',
  },
  // Dashboard
  DASHBOARD: {
    STATS: 'dashboard/stats',
    ACTIVITY: 'dashboard/activity',
    NOTIFICATIONS: 'dashboard/notifications',
    UNREAD_COUNT: 'dashboard/notifications/unread-count',
  },
  // Progress
  PROGRESS: 'progress',
  // Support
  SUPPORT: {
    TICKETS: 'support/tickets',
    TICKET: (id: string) => `support/tickets/${id}`,
  },
  // Billing
  BILLING: {
    INFO: 'billing',
    CANCEL: 'billing/cancel',
  },
  // User Preferences
  USER_PREFERENCES: 'user-preferences',
  // Admin
  ADMIN: {
    STATS: 'admin/stats',
    ANALYTICS: 'admin/analytics',
    USERS: 'admin/users',
    USER: (id: string) => `admin/users/${id}`,
    PLANS: 'admin/payment-plans',
    PLAN: (id: string) => `admin/payment-plans/${id}`,
    DISCOUNTS: 'admin/discounts',
    DISCOUNT: (id: string) => `admin/discounts/${id}`,
    BLOG: 'admin/blog',
    BLOG_ITEM: (id: string) => `admin/blog/${id}`,
    SETTINGS: 'admin/settings',
    TICKETS: 'admin/tickets',
    TICKET: (id: string) => `admin/tickets/${id}`,
    TICKET_REPLY: (id: string) => `admin/tickets/${id}/reply`,
    BLOCK_USER: (id: string) => `admin/users/${id}/block`,
    UNBLOCK_USER: (id: string) => `admin/users/${id}/unblock`,
    USER_RESTRICTIONS: (id: string) => `admin/users/${id}/restrictions`,
    MEDIA: 'admin/media',
    MEDIA_ITEM: (id: string) => `admin/media/${id}`,
    CHILDREN: 'admin/children',
    CHILD: (id: string) => `admin/children/${id}`,
    REVIEWS: 'admin/reviews',
    REVIEW: (id: string) => `admin/reviews/${id}`,
  },
  // Public (no auth)
  PUBLIC: {
    SETTINGS: 'public/settings',
    BLOG: 'public/blog',
    BLOG_ITEM: (slug: string) => `public/blog/${slug}`,
    PLANS: 'public/plans',
    MEDIA: 'public/media',
    REVIEWS: 'public/reviews',
  },
} as const;

