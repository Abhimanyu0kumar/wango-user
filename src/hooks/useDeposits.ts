'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { depositService, type DepositFilters } from '@/src/services/deposits';
import type { Deposit } from '@/src/types';

interface UseDepositsReturn {
  deposits: Deposit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDeposits(filters?: DepositFilters): UseDepositsReturn {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store filters in ref to prevent re-renders
  const filtersRef = useRef(filters);

  // Update filters ref when they actually change (JSON comparison)
  const filtersKey = JSON.stringify(filters);
  
  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey]);

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await depositService.getAll(filtersRef.current);
      setDeposits(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch deposits'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track previous filters key to detect actual changes
  const prevFiltersKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if filters have actually changed (or on initial mount)
    if (prevFiltersKeyRef.current !== filtersKey) {
      prevFiltersKeyRef.current = filtersKey;
      fetchDeposits();
    }
  }, [fetchDeposits, filtersKey]);

  return {
    deposits,
    isLoading,
    error,
    refetch: fetchDeposits,
  };
}
