// Minhaj Digital Library — Auth Types

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'reader' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
