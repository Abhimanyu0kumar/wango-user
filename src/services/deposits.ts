import { apiClient } from './api';
import type { DepositsResponse, Deposit, CreateDepositRequest } from '@/src/types';

export interface DepositFilters {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  from_date?: string;
  to_date?: string;
  per_page?: number;
}

export const depositService = {
  async getAll(filters?: DepositFilters): Promise<DepositsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/deposits?${queryString}` : '/deposits';
    
    return apiClient.get<DepositsResponse>(endpoint);
  },

  async getById(id: number): Promise<{ data: Deposit }> {
    return apiClient.get<{ data: Deposit }>(`/deposits/${id}`);
  },

  async create(data: CreateDepositRequest): Promise<{ data: Deposit; message: string }> {
    return apiClient.post<{ data: Deposit; message: string }>('/deposits', data);
  },
};
