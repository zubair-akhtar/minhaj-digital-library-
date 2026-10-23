// Minhaj Digital Library — Upload API Service

import apiClient, { ApiResponse } from './client';

interface UploadResponse {
  path: string;
  url: string;
}

export const uploadApi = {
  /**
   * POST /api/upload-cover (Admin only)
   * Uploads a cover image via multipart form-data.
   */
  uploadCover: async (imageUri: string): Promise<UploadResponse> => {
    const formData = new FormData();

    // Extract filename and type from URI
    const filename = imageUri.split('/').pop() || 'cover.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('cover', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      '/api/upload-cover',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.data;
  },
};
