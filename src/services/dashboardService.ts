import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalCards: number;
  sentencesToday: number;
  mostUsedCard: string;
  communicationStreak: number;
  totalChildren: number;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  read: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity Log
 */
export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  time: string;
  childName?: string;
  createdAt: string;
}

/**
 * Dashboard Service
 */
class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('dashboard/stats');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get dashboard stats');
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<Activity[]> {
    const response = await api.get<Activity[]>(`dashboard/activity?limit=${limit}`);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get notifications
   */
  async getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<Notification[]> {
    const response = await api.get<Notification[]>(
      `dashboard/notifications?unreadOnly=${unreadOnly}&limit=${limit}`
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('dashboard/notifications/unread-count');

    if (response.status === 'success' && response.data) {
      return response.data.count;
    }

    return 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const response = await api.put(`dashboard/notifications/${notificationId}/read`);

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const response = await api.put('dashboard/notifications/read-all');

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to mark all notifications as read');
    }
  }
}

export const dashboardService = new DashboardService();
