import { apiClient, tokenManager } from './api';
import type { AuthResponse } from '@/src/types';

export const authService = {
  // Token management
  setToken: tokenManager.setToken.bind(tokenManager),
  getToken: tokenManager.getToken.bind(tokenManager),
  clearToken: tokenManager.clearToken.bind(tokenManager),
  isAuthenticated: tokenManager.isAuthenticated.bind(tokenManager),

  // Auth endpoints
  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/login', {
      email_or_phone: emailOrPhone,
      password,
    });
  },

  async signup(data: {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
    password_confirmation?: string;
    referral_code?: string;
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/signup', data);
  },

  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/logout', {});
  },
};
