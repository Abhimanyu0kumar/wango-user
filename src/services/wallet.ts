import { apiClient } from './api';
import type { Wallet } from '@/src/types';

export interface WalletLedger {
  id: number;
  wallet_id: number;
  user_id: number;
  txn_type: string;
  direction: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: number;
  description: string;
  metadata?: object;
  created_at: string;
}

export interface WalletResponse {
  data: Wallet;
}

export interface WalletLedgersResponse {
  data: WalletLedger[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LedgerFilters {
  txn_type?: string;
  direction?: 'credit' | 'debit';
  from_date?: string;
  to_date?: string;
  per_page?: number;
}

export const walletService = {
  async getWallet(): Promise<WalletResponse> {
    return apiClient.get<WalletResponse>('/wallet');
  },

  async getLedgers(filters?: LedgerFilters): Promise<WalletLedgersResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/wallet/ledgers?${queryString}` : '/wallet/ledgers';
    
    return apiClient.get<WalletLedgersResponse>(endpoint);
  },
};
