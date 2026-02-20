"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import CuisineTabs from "@/components/ui/CuisineTabs";

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cuisineType = activeTab === "all" ? undefined : activeTab;
        const data = await getProducts(cuisineType);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-2">
          Shop Ingredients
        </h1>
        <p className="text-muted text-lg">
          Premium Pan-Asian ingredients delivered to your door
        </p>
      </div>

      {/* Cuisine Tabs */}
      <CuisineTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="h-48 bg-surface-warm" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-warm rounded w-3/4" />
                <div className="h-4 bg-surface-warm rounded w-full" />
                <div className="flex justify-between">
                  <div className="h-6 bg-surface-warm rounded w-16" />
                  <div className="h-9 bg-surface-warm rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🍃</span>
          <p className="text-muted text-xl">No products found</p>
          <p className="text-sm text-muted mt-1">Try a different cuisine tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
