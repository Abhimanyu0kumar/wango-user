const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/user/v1';

export const auth = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export const api = {
  baseUrl: API_BASE_URL,

  async request(endpoint: string, options: RequestInit = {}) {
    const token = auth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL.replace('/user/v1', '')}${endpoint.startsWith('/bet') ? endpoint : '/user/v1' + endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },

  async login(emailOrPhone: string, password: string) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({
        email_or_phone: emailOrPhone,
        password,
      }),
    });
  },

  async signup(data: {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
    password_confirmation?: string;
    referral_code?: string;
  }) {
    return this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    });
  },

  // Profile APIs
  async getProfile() {
    return this.request('/me');
  },

  async updateProfile(data: {
    name?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    country_code?: string;
    preferred_currency?: string;
    address_data?: object;
  }) {
    return this.request('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateAvatar(avatarUrl: string) {
    return this.request('/me/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });
  },

  // Categories APIs
  async getCategories() {
    return this.request('/categories');
  },

  async getCategory(id: number) {
    return this.request(`/categories/${id}`);
  },

  // Games APIs
  async getGames(params?: {
    category_id?: number;
    provider?: string;
    engine_key?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString() : '';
    return this.request(`/games${queryString}`);
  },

  async getGame(id: number) {
    return this.request(`/games/${id}`);
  },

  async getActiveRounds(gameId: number) {
    return this.request(`/games/${gameId}/active-rounds`);
  },

  async placeBet(data: {
    game_id: number;
    duration_sec: number;
    amount: number;
    selection: string;
    idempotency_key?: string;
  }) {
    return this.request('/bet/v1/place', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getBetHistory(params?: {
    game_id?: number;
    status?: string;
    per_page?: number;
    page?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString() : '';
    return this.request(`/bet/v1/history${queryString}`);
  },
};
