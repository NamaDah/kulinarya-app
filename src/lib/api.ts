import { Category, Product, Recipe } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>("/categories");
}

export async function getCategory(
  slug: string,
): Promise<Category & { products: Product[] }> {
  return fetchApi<Category & { products: Product[] }>(`/categories/${slug}`);
}

export async function getProducts(cuisineType?: string): Promise<Product[]> {
  const query = cuisineType ? `?cuisine_type=${cuisineType}` : "";
  return fetchApi<Product[]>(`/products${query}`);
}

export async function getProduct(slug: string): Promise<Product> {
  return fetchApi<Product>(`/products/${slug}`);
}

export async function getRecipes(cuisineType?: string): Promise<Recipe[]> {
  const query = cuisineType ? `?cuisine_type=${cuisineType}` : "";
  return fetchApi<Recipe[]>(`/recipes${query}`);
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  return fetchApi<Recipe[]>("/recipes/featured");
}

export async function getRecipe(slug: string): Promise<Recipe> {
  return fetchApi<Recipe>(`/recipes/${slug}`);
}
