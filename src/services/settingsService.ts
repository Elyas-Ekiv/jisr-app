import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * AAC Settings
 */
export interface AACSettings {
  id: string;
  childId: string;
  primaryLanguage: string;
  secondaryLanguage?: string;
  voiceType: string;
  speechSpeed: number;
  volume: number;
  maxSentenceLength: number;
  visibleImageCount: number;
  vocabularyLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  speechMode: 'INSTANT' | 'SENTENCE';
  gridColumns: number;
  cardSize: 'small' | 'medium' | 'large';
  createdAt: string;
  updatedAt: string;
}

/**
 * Update Settings Request
 */
export interface UpdateSettingsRequest {
  primaryLanguage?: string;
  secondaryLanguage?: string;
  voiceType?: string;
  speechSpeed?: number;
  volume?: number;
  maxSentenceLength?: number;
  visibleImageCount?: number;
  vocabularyLevel?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  speechMode?: 'INSTANT' | 'SENTENCE';
  gridColumns?: number;
  cardSize?: 'small' | 'medium' | 'large';
}

/**
 * Settings Service
 */
class SettingsService {
  /**
   * Get child's AAC settings
   */
  async getSettings(childId: string): Promise<AACSettings> {
    const response = await api.get<AACSettings>(API_ENDPOINTS.SETTINGS.GET(childId));

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get settings');
  }

  /**
   * Update child's AAC settings
   */
  async updateSettings(childId: string, data: UpdateSettingsRequest): Promise<AACSettings> {
    const response = await api.put<AACSettings>(API_ENDPOINTS.SETTINGS.UPDATE(childId), data);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update settings');
  }
}

export const settingsService = new SettingsService();
