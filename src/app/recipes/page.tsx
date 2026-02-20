"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/lib/types";
import { getRecipes } from "@/lib/api";
import RecipeCard from "@/components/ui/RecipeCard";
import CuisineTabs from "@/components/ui/CuisineTabs";

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const cuisineType = activeTab === "all" ? undefined : activeTab;
        const data = await getRecipes(cuisineType);
        setRecipes(data);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-2">
          Recipes
        </h1>
        <p className="text-muted text-lg">
          Authentic Pan-Asian recipes to master at home
        </p>
      </div>

      {/* Cuisine Tabs */}
      <CuisineTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="h-52 bg-surface-warm" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-warm rounded w-3/4" />
                <div className="h-4 bg-surface-warm rounded w-full" />
                <div className="h-4 bg-surface-warm rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📖</span>
          <p className="text-muted text-xl">No recipes found</p>
          <p className="text-sm text-muted mt-1">Try a different cuisine tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
