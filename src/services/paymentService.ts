import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Payment Plan interface
 */
export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  enabled?: boolean;
}

/**
 * Create payment session request
 */
export interface CreatePaymentRequest {
  planId: string;
  discountCode?: string;
}

/**
 * Payment session response
 */
export interface PaymentSessionResponse {
  orderId: string;
  orderReference: string;
  sessionId: string;
  sessionUrl: string;
  amount: number;
  currency: string;
}

/**
 * Verify payment request
 */
export interface VerifyPaymentRequest {
  sessionId: string;
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  success: boolean;
  payment?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    thawaniPaymentId?: string;
  };
  order?: {
    id: string;
    status: string;
    amount: number;
  };
  message?: string;
  status?: string;
}

/**
 * Transaction item from history
 */
export interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  thawaniPaymentId?: string;
  transactionId?: string;
  createdAt: string;
  order: {
    id: string;
    orderReference: string;
    status: string;
    plan: {
      name: string;
      period: string;
    };
  };
}

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  payments: TransactionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Discount validation response
 */
export interface DiscountValidationResponse {
  valid: boolean;
  message?: string;
  discount?: {
    code: string;
    type: string;
    value: number;
    description?: string;
  };
  originalPrice?: number;
  discountAmount?: number;
  discountedPrice?: number;
}

/**
 * Payment Service
 */
class PaymentService {
  /**
   * Create payment session
   */
  async createPaymentSession(data: CreatePaymentRequest): Promise<PaymentSessionResponse> {
    const response = await api.post<PaymentSessionResponse>(
      API_ENDPOINTS.PAYMENTS.CREATE,
      data
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create payment session');
  }

  /**
   * Verify payment
   */
  async verifyPayment(sessionId: string): Promise<PaymentVerificationResponse> {
    const response = await api.post<PaymentVerificationResponse>(
      API_ENDPOINTS.PAYMENTS.VERIFY,
      { sessionId }
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    // Even if status is 'fail', return the data for handling
    if (response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to verify payment');
  }

  /**
   * Get transaction history
   */
  async getTransactions(page = 1, limit = 20): Promise<TransactionListResponse> {
    const response = await api.get<TransactionListResponse>(
      `${API_ENDPOINTS.PAYMENTS.TRANSACTIONS}?page=${page}&limit=${limit}`
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    return { payments: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }

  /**
   * Validate discount code
   */
  async validateDiscount(code: string, planId: string): Promise<DiscountValidationResponse> {
    const response = await api.post<DiscountValidationResponse>(
      API_ENDPOINTS.PAYMENTS.VALIDATE_DISCOUNT,
      { code, planId }
    );

    if (response.data) {
      return response.data;
    }

    return { valid: false, message: 'Failed to validate discount code' };
  }

  /**
   * Redirect to Thawani checkout
   */
  redirectToCheckout(sessionUrl: string): void {
    window.location.href = sessionUrl;
  }
}

export const paymentService = new PaymentService();
