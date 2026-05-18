import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Vocabulary Item from Backend
 */
export interface VocabularyItem {
  id: string;
  text: any; // JSON: { en: string, ar: string }
  category: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  imageUrl?: string;
  audioUrl?: string;
  order: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Vocabulary Service
 */
class VocabularyService {
  /**
   * Get all vocabulary (for admin or all enabled for users)
   */
  async getAllVocabulary(): Promise<VocabularyItem[]> {
    const response = await api.get<VocabularyItem[]>(API_ENDPOINTS.VOCABULARY.LIST);

    if (response.status === 'success' && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }

    return [];
  }

  /**
   * Get child's vocabulary
   */
  async getChildVocabulary(childId: string): Promise<VocabularyItem[]> {
    const response = await api.get<VocabularyItem[]>(
      `${API_ENDPOINTS.VOCABULARY.CHILD}?childId=${childId}`
    );

    if (response.status === 'success' && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }

    return [];
  }

  /**
   * Get vocabulary by ID
   */
  async getVocabulary(id: string): Promise<VocabularyItem> {
    const response = await api.get<VocabularyItem>(API_ENDPOINTS.VOCABULARY.GET(id));

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get vocabulary');
  }

  /**
   * Assign vocabulary to child
   */
  async assignToChild(vocabularyId: string, childId: string): Promise<void> {
    const response = await api.post(API_ENDPOINTS.VOCABULARY.ASSIGN(vocabularyId), {
      childId,
    });

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to assign vocabulary');
    }
  }

  /**
   * Unassign vocabulary from child
   */
  async unassignFromChild(vocabularyId: string, childId: string): Promise<void> {
    const response = await api.delete(API_ENDPOINTS.VOCABULARY.UNASSIGN(vocabularyId), {
      body: JSON.stringify({ childId }),
    });

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to unassign vocabulary');
    }
  }
  /**
   * Create new vocabulary item
   */
  async createVocabulary(data: Partial<VocabularyItem>): Promise<VocabularyItem> {
    const response = await api.post<VocabularyItem>(API_ENDPOINTS.VOCABULARY.CREATE, data);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create vocabulary');
  }

  /**
   * Update vocabulary item
   */
  async updateVocabulary(id: string, data: Partial<VocabularyItem>): Promise<VocabularyItem> {
    const response = await api.put<VocabularyItem>(API_ENDPOINTS.VOCABULARY.UPDATE(id), data);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update vocabulary');
  }

  /**
   * Delete vocabulary item
   */
  async deleteVocabulary(id: string): Promise<void> {
    const response = await api.delete(API_ENDPOINTS.VOCABULARY.DELETE(id));

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to delete vocabulary');
    }
  }
}

export const vocabularyService = new VocabularyService();
