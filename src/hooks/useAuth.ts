'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userService } from '@/src/services';
import type { User, UserProfile, Wallet } from '@/src/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    wallet: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      fetchUserData();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await userService.getProfile();
      setState({
        user: response.data.user,
        profile: response.data.profile,
        wallet: response.data.wallet,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      authService.clearToken();
      setState({
        user: null,
        profile: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const response = await authService.login(emailOrPhone, password);
    authService.setToken(response.data.token);
    await fetchUserData();
    return response;
  }, [fetchUserData]);

  const signup = useCallback(async (data: {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
    password_confirmation?: string;
    referral_code?: string;
  }) => {
    const response = await authService.signup(data);
    authService.setToken(response.data.token);
    await fetchUserData();
    return response;
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      authService.clearToken();
      setState({
        user: null,
        profile: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.push('/');
    }
  }, [router]);

  return {
    ...state,
    login,
    signup,
    logout,
    refreshUser: fetchUserData,
  };
}
