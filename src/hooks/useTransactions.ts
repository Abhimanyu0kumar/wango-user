'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { transactionService, type TransactionFilters } from '@/src/services/transactions';
import type { Transaction } from '@/src/services/transactions';

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTransactions(filters?: TransactionFilters): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const filtersRef = useRef(filters);
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKeyRef = useRef<string | null>(null);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await transactionService.getAll(filtersRef.current);
      setTransactions(response.data?.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (prevFiltersKeyRef.current !== filtersKey) {
      prevFiltersKeyRef.current = filtersKey;
      fetchTransactions();
    }
  }, [fetchTransactions, filtersKey]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
