// Minhaj Digital Library — Books API Service

import apiClient, { ApiResponse } from './client';
import { Book, BookFormData, BooksQueryParams } from '../types/book';

export const booksApi = {
  /**
   * GET /api/books
   */
  getAll: async (params?: BooksQueryParams): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>('/api/books', {
      params,
    });
    return response.data.data;
  },

  /**
   * GET /api/books/{id}
   */
  getById: async (id: number): Promise<Book> => {
    const response = await apiClient.get<ApiResponse<Book>>(
      `/api/books/${id}`,
    );
    return response.data.data;
  },

  /**
   * POST /api/books (Admin only)
   */
  create: async (data: BookFormData): Promise<Book> => {
    const response = await apiClient.post<ApiResponse<Book>>(
      '/api/books',
      data,
    );
    return response.data.data;
  },

  /**
   * PUT /api/books/{id} (Admin only)
   */
  update: async (id: number, data: Partial<BookFormData>): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(
      `/api/books/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * DELETE /api/books/{id} (Admin only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/books/${id}`);
  },
};
