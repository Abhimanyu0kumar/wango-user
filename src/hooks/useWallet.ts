'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { walletService, type LedgerFilters } from '@/src/services/wallet';
import type { Wallet, WalletLedger } from '@/src/services/wallet';

interface UseWalletReturn {
  wallet: Wallet | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await walletService.getWallet();
      setWallet(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch wallet'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    wallet,
    isLoading,
    error,
    refetch: fetchWallet,
  };
}

interface UseWalletLedgersReturn {
  ledgers: WalletLedger[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWalletLedgers(filters?: LedgerFilters): UseWalletLedgersReturn {
  const [ledgers, setLedgers] = useState<WalletLedger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const filtersRef = useRef(filters);
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey]);

  const fetchLedgers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await walletService.getLedgers(filtersRef.current);
      setLedgers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ledger entries'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (prevFiltersKeyRef.current !== filtersKey) {
      prevFiltersKeyRef.current = filtersKey;
      fetchLedgers();
    }
  }, [fetchLedgers, filtersKey]);

  return {
    ledgers,
    isLoading,
    error,
    refetch: fetchLedgers,
  };
}
