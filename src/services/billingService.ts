import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Current Plan
 */
export interface CurrentPlan {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  period: string;
  features: string[];
  status: string; // 'active' | 'cancelled' | 'expired' | 'none'
  startDate: string;
  endDate: string;
  daysRemaining: number;
  orderId: string;
}

/**
 * Billing History Item
 */
export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  currency: string;
  planName: string;
  status: string;
  discountCode?: string | null;
  payment: {
    id: string;
    transactionId?: string;
    createdAt: string;
  } | null;
}

/**
 * Billing Information
 */
export interface BillingInfo {
  currentPlan: CurrentPlan | null;
  subscriptionStatus: string; // 'active' | 'cancelled' | 'expired' | 'none'
  childLimit: number;
  billingHistory: BillingHistoryItem[];
}

/**
 * Cancel subscription response
 */
export interface CancelResponse {
  success: boolean;
  message: string;
  endDate: string;
  planName: string;
}

/**
 * Billing Service
 */
class BillingService {
  /**
   * Get user's billing information
   */
  async getBilling(): Promise<BillingInfo> {
    const response = await api.get<BillingInfo>(API_ENDPOINTS.BILLING.INFO);

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    return {
      currentPlan: null,
      subscriptionStatus: 'none',
      childLimit: 1,
      billingHistory: [],
    };
  }

  /**
   * Cancel active subscription
   */
  async cancelSubscription(): Promise<CancelResponse> {
    const response = await api.post<CancelResponse>(API_ENDPOINTS.BILLING.CANCEL, {});

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to cancel subscription');
  }
}

export const billingService = new BillingService();
