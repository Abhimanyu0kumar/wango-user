import { apiClient } from './api';
import type { CategoriesResponse, Category } from '@/src/types';

export const categoryService = {
  async getAll(): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>('/categories');
  },

  async getById(id: number): Promise<{ data: Category }> {
    return apiClient.get<{ data: Category }>(`/categories/${id}`);
  },
};
