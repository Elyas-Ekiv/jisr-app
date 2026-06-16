import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * User
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  accountType?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update User Request
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * Email Check Response
 */
export interface EmailCheckResponse {
  exists: boolean;
  accountType: string | null;
}

/**
 * User Service
 */
class UserService {
  /**
   * Get user by ID (or current user if no ID)
   */
  async getUser(userId?: string): Promise<User> {
    const endpoint = userId ? `users/${userId}` : API_ENDPOINTS.AUTH.ME;
    const response = await api.get<{ user: User } | User>(endpoint);

    if (response.status === 'success' && response.data) {
      // Handle both { user: ... } and direct user object
      const user = 'user' in response.data ? response.data.user : response.data;
      return user;
    }

    throw new Error(response.message || 'Failed to get user');
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`users/${userId}`, data);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update user');
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Get current user ID
    const currentUser = await this.getUser();
    
    const response = await api.put(`users/${currentUser.id}`, {
      password: newPassword,
      currentPassword,
    });

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  /**
   * Check if email exists
   */
  async checkEmail(email: string): Promise<EmailCheckResponse> {
    const response = await api.get<EmailCheckResponse>(`users/check-email?email=${encodeURIComponent(email)}`);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    return { exists: false, accountType: null };
  }
}

export const userService = new UserService();
