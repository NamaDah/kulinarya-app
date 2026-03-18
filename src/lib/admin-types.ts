import { Category } from "./types";

export interface AdminProduct {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  image_url: string | null;
  unit: string;
  in_stock: boolean;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  price: string;
  unit: string;
  image_url: string;
  in_stock: boolean;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface UserFilters {
  search?: string;
  email?: string;
  page?: number;
  per_page?: number;
}

export type FormErrors = Partial<Record<keyof ProductFormData, string>>;
