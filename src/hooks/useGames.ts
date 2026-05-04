'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { gameService, type GameFilters } from '@/src/services/games';
import type { Game } from '@/src/types';

interface UseGamesReturn {
  games: Game[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGames(filters?: GameFilters): UseGamesReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store filters in ref to prevent re-renders
  const filtersRef = useRef(filters);

  // Update filters ref when they actually change (JSON comparison)
  const filtersKey = JSON.stringify(filters);
  
  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey]);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gameService.getAll(filtersRef.current);
      setGames(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'));
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
      fetchGames();
    }
  }, [fetchGames, filtersKey]);

  return {
    games,
    isLoading,
    error,
    refetch: fetchGames,
  };
}
