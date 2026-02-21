"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Recipe, Product } from "@/lib/types";
import { getRecipe } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [allAdded, setAllAdded] = useState(false);
  const { addItem, addMultipleItems } = useCart();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipe(slug);
        setRecipe(data);
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [slug]);

  const handleBuyIngredient = (product: Product) => {
    addItem(product);
    setAddedItems((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const handleBuyAll = () => {
    if (!recipe?.ingredients) return;
    const purchasableProducts = recipe.ingredients
      .filter((i) => i.product !== null)
      .map((i) => i.product as Product);

    if (purchasableProducts.length === 0) return;
    addMultipleItems(purchasableProducts);
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 2000);
  };

  const purchasableCount =
    recipe?.ingredients?.filter((i) => i.product !== null).length ?? 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-warm rounded w-1/3" />
          <div className="aspect-video bg-surface-warm rounded-2xl" />
          <div className="h-6 bg-surface-warm rounded w-1/2" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-surface-warm rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-5xl block mb-4">😢</span>
        <p className="text-xl text-muted">Recipe not found</p>
        <Link
          href="/recipes"
          className="text-primary font-medium hover:underline mt-4 inline-block"
        >
          ← Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/recipes" className="hover:text-primary transition-colors">
          Recipes
        </Link>
        <span>/</span>
        <span
          className={`tag-${recipe.cuisine_type} px-2 py-0.5 rounded-full text-xs font-semibold`}
        >
          {recipe.cuisine_type.charAt(0).toUpperCase() +
            recipe.cuisine_type.slice(1)}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">{recipe.title}</span>
      </nav>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
        {recipe.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-muted mb-8">
        <span className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-full">
          ⏱️ Prep: {recipe.prep_time_minutes} min
        </span>
        <span className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-full">
          🔥 Cook:{" "}
          {recipe.cook_time_minutes > 60
            ? `${Math.floor(recipe.cook_time_minutes / 60)}h ${recipe.cook_time_minutes % 60}m`
            : `${recipe.cook_time_minutes} min`}
        </span>
        <span className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-full">
          👨‍🍳 {recipe.servings} servings
        </span>
      </div>

      {/* Video Player */}
      {recipe.video_url && (
        <div className="mb-10">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
            <iframe
              src={recipe.video_url}
              title={`${recipe.title} video`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Description */}
      {recipe.description && (
        <div className="mb-10 p-6 bg-surface-warm rounded-2xl">
          <p className="text-foreground leading-relaxed text-lg">
            {recipe.description}
          </p>
        </div>
      )}

      {/* Recipe Image (if no video) */}
      {!recipe.video_url && recipe.image_url && (
        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden mb-10 shadow-xl">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
      )}

      {/* ── Ingredient List ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading">
            Ingredients
          </h2>
          {purchasableCount > 0 && (
            <span className="text-sm text-muted">
              🛒 {purchasableCount} available to buy
            </span>
          )}
        </div>

        <ul className="space-y-3">
          {recipe.ingredients?.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {ingredient.product ? "🛍️" : "🥬"}
                </span>
                <div>
                  <span className="font-medium text-foreground">
                    {ingredient.name}
                  </span>
                  {ingredient.quantity && (
                    <span className="text-muted text-sm ml-2">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Buy Button (only if product exists) */}
              {ingredient.product && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-primary font-semibold hidden sm:inline">
                    ${parseFloat(ingredient.product.price).toFixed(2)}
                  </span>
                  <button
                    id={`buy-ingredient-${ingredient.id}`}
                    onClick={() =>
                      handleBuyIngredient(ingredient.product as Product)
                    }
                    className={`btn-buy text-sm transition-all ${
                      addedItems.has(ingredient.product.id)
                        ? "!bg-green-500 !shadow-green-500/30"
                        : ""
                    }`}
                  >
                    {addedItems.has(ingredient.product.id)
                      ? "✓ Added!"
                      : "Buy this"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Buy All Ingredients Button ── */}
      {purchasableCount > 0 && (
        <div className="sticky bottom-6 z-10">
          <button
            id="buy-all-ingredients"
            onClick={handleBuyAll}
            className={`btn-buy-all text-lg flex items-center justify-center gap-3 py-4 ${
              allAdded ? "!bg-green-600 !shadow-green-600/30" : ""
            }`}
          >
            {allAdded ? (
              <>✓ All Ingredients Added to Cart!</>
            ) : (
              <>
                🛒 Buy All Ingredients
                <span className="text-white/70 text-sm">
                  ({purchasableCount} items)
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
