// Minhaj Digital Library — Book Types

export interface Book {
  id: number;
  title: string;
  author: string;
  category_id: number;
  category_name: string;
  description: string | null;
  cover_image: string | null;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

export interface BookFormData {
  title: string;
  author: string;
  category_id: number;
  description?: string;
  cover_image?: string;
  pdf_url: string;
}

export interface BooksQueryParams {
  search?: string;
  category_id?: number;
}
