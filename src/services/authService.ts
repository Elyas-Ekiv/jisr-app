import { api, saveTokens, clearTokens, ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  accountType?: string;
  emailVerified?: boolean;
  blocked?: boolean;
  restrictions?: string[];
  createdAt?: string;
}

/**
 * Register request data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  accountType?: string;
  recoveryQuestion?: string;
  recoveryAnswer?: string;
}

/**
 * Login request data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      { requireAuth: false }
    );

    if (response.status === 'success' && response.data) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.message || 'Registration failed');
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
      { requireAuth: false }
    );

    if (response.status === 'success' && response.data) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
      // Clear any lingering child session
      localStorage.removeItem('jisr_child_session')
      localStorage.removeItem('jisr_active_child_id')
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }, { requireAuth: false });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    clearTokens();
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);

    if (response.status === 'success' && response.data?.user) {
      return response.data.user;
    }

    throw new Error(response.message || 'Failed to get user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  async getRecoveryQuestion(email: string): Promise<string | null> {
    const response = await api.post<{ question: string | null }>(
      API_ENDPOINTS.AUTH.RECOVERY_QUESTION,
      { email },
      { requireAuth: false }
    );
    if (response.status === 'success' && response.data?.question !== undefined) {
      return response.data.question;
    }
    return null;
  }

  async resetPasswordWithRecovery(
    email: string,
    recoveryAnswer: string,
    newPassword: string
  ): Promise<void> {
    const response = await api.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD_RECOVERY,
      { email, recoveryAnswer, newPassword },
      { requireAuth: false }
    );
    if (response.status !== 'success') {
      throw new Error(response.message || 'Could not reset password');
    }
  }
}

export const authService = new AuthService();

