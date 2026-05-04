// User Types
export interface User {
  id: number;
  email?: string;
  phone?: string;
  referral_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  country_code?: string;
  preferred_currency?: string;
  address_data?: object;
  avatar_url?: string;
  kyc_status?: number;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency?: string;
}

export interface AuthResponse {
  data: {
    user: User;
    profile?: UserProfile;
    wallet?: Wallet;
    token: string;
  };
  message?: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image_url?: string;
  games_count?: number;
  sort_order?: number;
  status: 'active' | 'inactive';
}

export interface CategoriesResponse {
  data: Category[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Game Types
export interface Game {
  id: number;
  name: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
  icon?: string;
  provider?: string;
  engine_key?: string;
  category_id?: number;
  category?: Category;
  views_count?: number;
  rating?: number;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface GamesResponse {
  data: Game[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Deposit Types
export interface Deposit {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: number;
  payment_method: 'upi' | 'bank_transfer' | 'card' | 'crypto';
  gateway_name?: string;
  merchant_order_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  wallet?: Wallet;
}

export interface DepositsResponse {
  data: Deposit[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateDepositRequest {
  wallet_id: number;
  amount: number;
  payment_method: 'upi' | 'bank_transfer' | 'card' | 'crypto';
  gateway_name?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
