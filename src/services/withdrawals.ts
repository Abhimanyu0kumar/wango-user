import { apiClient } from './api';
import type { Wallet } from '@/src/types';

export interface Withdrawal {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: number;
  payout_method: 'upi' | 'bank_transfer' | 'crypto';
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  crypto_address?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  remarks?: string;
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
}

export interface WithdrawalsResponse {
  data: Withdrawal[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateWithdrawalRequest {
  wallet_id?: number;
  amount: number;
  payout_method: 'upi' | 'bank_transfer' | 'crypto';
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  crypto_address?: string;
}

export const withdrawalService = {
  async getAll(params?: { status?: string; per_page?: number }): Promise<WithdrawalsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/withdrawals?${queryString}` : '/withdrawals';
    return apiClient.get<WithdrawalsResponse>(endpoint);
  },

  async getById(id: number): Promise<{ data: Withdrawal }> {
    return apiClient.get<{ data: Withdrawal }>(`/withdrawals/${id}`);
  },

  async create(data: CreateWithdrawalRequest): Promise<{ data: Withdrawal; message: string }> {
    return apiClient.post<{ data: Withdrawal; message: string }>('/withdrawals', data);
  },
};
