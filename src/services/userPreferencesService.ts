import { api } from '../utils/api';

/**
 * User Preferences
 */
export interface UserPreferences {
  id: string;
  userId: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  soundEffects: boolean;
  backgroundMusic: boolean;
  contrast: 'normal' | 'high' | 'maximum';
  gridView: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  createdAt: string;
  updatedAt: string;
}

/**
 * Update Preferences Request
 */
export interface UpdatePreferencesRequest {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  soundEffects?: boolean;
  backgroundMusic?: boolean;
  contrast?: 'normal' | 'high' | 'maximum';
  gridView?: boolean;
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
}

/**
 * User Preferences Service
 */
class UserPreferencesService {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<UserPreferences>('user-preferences');

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get preferences');
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const response = await api.put<UserPreferences>('user-preferences', data);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update preferences');
  }
}

export const userPreferencesService = new UserPreferencesService();
