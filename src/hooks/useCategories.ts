'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { categoryService } from '@/src/services/categories';
import type { Category } from '@/src/types';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Track if we've fetched to prevent duplicate calls
let hasFetchedInitially = false;

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCategories();
    }
  }, []); // Empty deps - only run once

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
