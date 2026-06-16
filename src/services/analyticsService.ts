import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Usage Analytics
 */
export interface UsageAnalytics {
  id: string;
  childId: string;
  vocabularyIds: string[];
  sentence?: string;
  timestamp: string;
}

/**
 * Analytics Response
 */
export interface AnalyticsData {
  totalUsages: number;
  mostUsed: Array<{
    vocabularyId: string;
    count: number;
  }>;
  dailyUsage: Record<string, number>;
  recentAnalytics: UsageAnalytics[];
}

/**
 * Record Usage Request
 */
export interface RecordUsageRequest {
  vocabularyIds: string[];
  sentence?: string;
}

/**
 * Analytics Service
 */
class AnalyticsService {
  /**
   * Get child's analytics
   */
  async getAnalytics(childId: string): Promise<AnalyticsData> {
    const response = await api.get<AnalyticsData>(API_ENDPOINTS.ANALYTICS.GET(childId));

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get analytics');
  }

  /**
   * Record vocabulary usage
   */
  async recordUsage(childId: string, data: RecordUsageRequest): Promise<UsageAnalytics> {
    const response = await api.post<UsageAnalytics>(
      API_ENDPOINTS.ANALYTICS.RECORD(childId),
      data
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to record usage');
  }
}

export const analyticsService = new AnalyticsService();
