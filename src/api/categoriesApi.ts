// Minhaj Digital Library — Categories API Service

import apiClient, { ApiResponse } from './client';
import { Category, CategoryFormData } from '../types/category';

export const categoriesApi = {
  /**
   * GET /api/categories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/api/categories',
    );
    return response.data.data;
  },

  /**
   * POST /api/categories (Admin only)
   */
  create: async (data: CategoryFormData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      '/api/categories',
      data,
    );
    return response.data.data;
  },
};
