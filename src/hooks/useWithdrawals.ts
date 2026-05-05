'use client';

import { useState, useEffect, useCallback } from 'react';
import { withdrawalService, type Withdrawal } from '@/src/services/withdrawals';

interface UseWithdrawalsReturn {
  withdrawals: Withdrawal[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWithdrawals(params?: { status?: string; per_page?: number }): UseWithdrawalsReturn {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await withdrawalService.getAll(params);
      setWithdrawals(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch withdrawals'));
    } finally {
      setIsLoading(false);
    }
  }, [params?.status, params?.per_page]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return {
    withdrawals,
    isLoading,
    error,
    refetch: fetchWithdrawals,
  };
}
