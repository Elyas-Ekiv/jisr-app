import { api } from '../utils/api';

/**
 * Progress Analytics
 */
export interface ProgressAnalytics {
  overallProgress: number;
  averageScore: number;
  learningStreak: number;
  weeklyActivity: Array<{
    day: string;
    activities: number;
  }>;
  subjectProgress: Array<{
    subject: string;
    progress: number;
    avgScore: number;
  }>;
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
  learningTimeline: Array<{
    date: string;
    activity: string;
    time: string;
  }>;
}

/**
 * Progress Service
 */
class ProgressService {
  /**
   * Get progress analytics
   */
  async getProgress(timeRange: 'week' | 'month' | 'year' = 'week', childId?: string): Promise<ProgressAnalytics> {
    let endpoint = `progress?range=${timeRange}`;
    if (childId) {
      endpoint += `&childId=${encodeURIComponent(childId)}`;
    }
    const response = await api.get<ProgressAnalytics>(endpoint);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get progress analytics');
  }
}

export const progressService = new ProgressService();
