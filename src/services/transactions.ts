import { apiClient } from './api';

export interface Transaction {
  id: number;
  user_id: number;
  wallet_id: number;
  txn_type: 'credit' | 'debit';
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  source_table?: string;
  source_id?: number;
  transaction_code?: string;
  metadata?: object;
  created_at: string;
  updated_at: string;
}

export interface TransactionsResponse {
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TransactionResponse {
  data: {
    transaction: Transaction;
    source_details?: any;
  };
}

export interface TransactionFilters {
  status?: 'pending' | 'success' | 'failed' | 'reversed';
  txn_type?: 'credit' | 'debit';
  from_date?: string;
  to_date?: string;
  search?: string;
  per_page?: number;
}

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<TransactionsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key !== 'per_page') {
          queryParams.append(key, String(value));
        }
      });
      
      if (filters.per_page) {
        queryParams.append('per_page', String(filters.per_page));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
    
    return apiClient.get<TransactionsResponse>(endpoint);
  },

  async getById(id: number): Promise<TransactionResponse> {
    return apiClient.get<TransactionResponse>(`/transactions/${id}`);
  },
};
