export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  cuisine_type: "chinese" | "japanese" | "korean";
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string; // decimal comes as string from Laravel
  image_url: string | null;
  unit: string;
  in_stock: boolean;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  product_id: number | null;
  name: string;
  quantity: string | null;
  unit: string | null;
  product: Product | null;
}

export interface Recipe {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  cuisine_type: "chinese" | "japanese" | "korean";
  category?: Category;
  ingredients?: RecipeIngredient[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
