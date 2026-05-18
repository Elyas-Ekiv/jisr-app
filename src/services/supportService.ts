import { api } from '../utils/api';

/**
 * Support Ticket
 */
export interface SupportTicket {
  id: string;
  subject: string;
  category: 'TECHNICAL' | 'BILLING' | 'QUESTION' | 'FEATURE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  messages: number;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
}

/**
 * Support Message
 */
export interface SupportMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromUser: boolean;
  createdAt: string;
}

/**
 * Create Ticket Request
 */
export interface CreateTicketRequest {
  subject: string;
  category: 'TECHNICAL' | 'BILLING' | 'QUESTION' | 'FEATURE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  message: string;
}

/**
 * Support Service
 */
class SupportService {
  /**
   * Get support tickets
   */
  async getTickets(options?: {
    status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    limit?: number;
  }): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await api.get<SupportTicket[]>(
      `support/tickets${params.toString() ? `?${params.toString()}` : ''}`
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get a single ticket with messages
   */
  async getTicket(id: string): Promise<SupportTicket & { messages: SupportMessage[] }> {
    const response = await api.get<SupportTicket & { messages: SupportMessage[] }>(
      `support/tickets/${id}`
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get ticket');
  }

  /**
   * Create a new ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
    const response = await api.post<SupportTicket>('support/tickets', {
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      message: data.message,
    });

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to create ticket');
  }

  /**
   * Add message to ticket
   */
  async addMessage(ticketId: string, message: string): Promise<SupportMessage> {
    const response = await api.post<SupportMessage>(
      `support/tickets/${ticketId}/messages`,
      { message }
    );

    if (response.status === 'success' && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to add message');
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    const response = await api.put(`support/tickets/${ticketId}/status`, { status });

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to update ticket status');
    }
  }
}

export const supportService = new SupportService();
