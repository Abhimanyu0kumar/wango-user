const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/user/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const isValidToken = token && token !== 'undefined' && token !== 'null';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (isValidToken) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    // If body is FormData, delete Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown | FormData): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  put<T>(endpoint: string, body: unknown | FormData): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Token management
export const tokenManager = {
  setToken(token: string): void {
    if (typeof window !== 'undefined' && token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token === 'undefined' || token === 'null' || !token) {
        return null;
      }
      return token;
    }
    return null;
  },

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
