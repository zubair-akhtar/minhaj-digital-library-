// Minhaj Digital Library — Auth API Service

import apiClient, { ApiResponse } from './client';
import { LoginRequest, LoginResponse, User } from '../types/auth';

export const authApi = {
  /**
   * POST /api/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('[authApi] Sending POST /api/login...');
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/login',
      credentials,
    );
    console.log('[authApi] Received response.data:', JSON.stringify(response.data));
    return response.data.data;
  },

  /**
   * GET /api/me
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/me');
    return response.data.data;
  },

  /**
   * POST /api/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/logout');
  },
};
