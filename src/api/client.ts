// Minhaj Digital Library — API Client (Axios)
// Configured with bearer token interceptor and error handling.

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// ─── Configuration ────────────────────────────────────────────
// For Android emulator: http://10.0.2.2
// For physical device on LAN: http://<YOUR_PC_IP>
// For production: https://your-domain.com

export const API_BASE_URL = 'http://10.117.0.237/backend/public';

/**
 * Resolves a cover image URL for mobile devices.
 * Automatically converts localhost/127.0.0.1/10.0.2.2 URLs or relative paths
 * into fully-qualified URLs pointing to the active backend IP.
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return null;
  }

  // Handle localhost / 127.0.0.1 / 10.0.2.2 URLs coming from local server or database seeds
  if (
    trimmed.startsWith('http://localhost') ||
    trimmed.startsWith('http://127.0.0.1') ||
    trimmed.startsWith('http://10.0.2.2')
  ) {
    return trimmed.replace(
      /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/MinhajLiberary)?\/backend\/public/,
      API_BASE_URL,
    );
  }

  // Handle relative paths like "uploads/covers/xxx.png"
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `${API_BASE_URL}/${cleanPath}`;
  }

  return trimmed;
};


// ─── API Response Types ───────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

export interface ApiError {
  success: false;
  message: string;
  data: null;
  errors?: Record<string, string>;
}

// ─── Token Management ─────────────────────────────────────────

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

export const setOnUnauthorized = (callback: () => void): void => {
  onUnauthorized = callback;
};

// ─── Axios Instance ───────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 — clear session
      if (status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      // Return API error data for the caller to handle
      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || null,
        isApiError: true,
      });
    }

    if (error.request) {
      // Network error — no response received
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        errors: null,
        isApiError: false,
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null,
      isApiError: false,
    });
  },
);

export default apiClient;
