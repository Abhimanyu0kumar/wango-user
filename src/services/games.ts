import { apiClient } from './api';
import type { GamesResponse, Game } from '@/src/types';

export interface GameFilters {
  category_id?: number;
  provider?: string;
  engine_key?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export const gameService = {
  async getAll(filters?: GameFilters): Promise<GamesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/games?${queryString}` : '/games';
    
    return apiClient.get<GamesResponse>(endpoint);
  },

  async getById(id: number): Promise<{ data: Game }> {
    return apiClient.get<{ data: Game }>(`/games/${id}`);
  },
};
