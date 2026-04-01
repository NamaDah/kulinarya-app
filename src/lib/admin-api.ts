import { Category, DashboardStats, User } from "./types";
import {
  AdminProduct,
  PaginatedResponse,
  ProductFilters,
  ProductFormData,
  UserFilters,
} from "./admin-types";

const API_BASE = "/api";

function getXsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  if (!match) return "";
  return decodeURIComponent(match.split("=")[1]);
}

async function adminFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
      ...options?.headers,
    },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw {
      status: res.status,
      message: errorData?.message || `API error: ${res.status}`,
      errors: errorData?.errors || {},
    };
  }

  // 204 No Content
  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}

export async function getAdminProducts(
  filters?: ProductFilters,
): Promise<PaginatedResponse<AdminProduct>> {
  const params = new URLSearchParams();

  if (filters?.search) params.set("search", filters.search);
  if (filters?.category_id) params.set("category_id", filters.category_id);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.per_page) params.set("per_page", String(filters.per_page));

  const query = params.toString() ? `?${params.toString()}` : "";
  return adminFetch<PaginatedResponse<AdminProduct>>(`/admin/products${query}`);
}

export async function getAdminProduct(id: number): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${id}`);
}

export async function createProduct(
  data: ProductFormData,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      category_id: Number(data.category_id),
      price: Number(data.price),
      in_stock: data.in_stock,
    }),
  });
}

export async function updateProduct(
  id: number,
  data: ProductFormData,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...data,
      category_id: Number(data.category_id),
      price: Number(data.price),
      in_stock: data.in_stock,
    }),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return adminFetch<void>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminCategories(): Promise<Category[]> {
  return adminFetch<Category[]>("/categories");
}

export async function getAdminDashboard(): Promise<{
  stats: DashboardStats;
  recent_orders: any[];
}> {
  return adminFetch<{ stats: DashboardStats; recent_orders: any[] }>(
    "/admin/dashboard",
  );
}

export async function getAdminUsers(
  filters?: UserFilters,
): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams();

  if (filters?.search) params.set("search", filters.search);
  if (filters?.email) params.set("email", filters.email);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.per_page) params.set("per_page", String(filters.per_page));

  const query = params.toString() ? `?${params.toString()}` : "";
  return adminFetch<PaginatedResponse<User>>(`/admin/users${query}`);
}

export async function updateUserRole(
  id: number,
  role: "admin" | "user" | "driver",
): Promise<{ message: string; user: User }> {
  return adminFetch<{ message: string; user: User }>(
    `/admin/users/${id}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  return adminFetch<{ message: string }>(`/admin/users/${id}`, {
    method: "DELETE",
  });
}

export async function updateAdminProfile(data: {
  name: string;
  email: string;
}): Promise<{ message: string; user: User }> {
  return adminFetch<{ message: string; user: User }>(
    "/admin/settings/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function updateAdminPassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return adminFetch<{ message: string }>("/admin/settings/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
