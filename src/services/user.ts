import { apiClient } from './api';
import type { ApiResponse, UserProfile } from '@/src/types';

interface ProfileResponse {
  data: {
    user: any;
    profile: UserProfile;
    wallet: any;
    kyc_status: number;
  };
}

export const userService = {
  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>('/me');
  },

  async updateProfile(data: {
    name?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    country_code?: string;
    preferred_currency?: string;
    address_data?: object;
  }): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<ApiResponse<UserProfile>>('/me', data);
  },

  async updateAvatar(avatarUrl: string): Promise<ApiResponse<{ avatar_url: string }>> {
    return apiClient.put<ApiResponse<{ avatar_url: string }>>('/me/avatar', {
      avatar_url: avatarUrl,
    });
  },
};
