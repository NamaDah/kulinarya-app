"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getFeaturedRecipes, getCategories } from "@/lib/api";
import RecipeCard from "@/components/ui/RecipeCard";
import { Recipe, Category } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([getFeaturedRecipes(), getCategories()])
      .then(([r, c]) => {
        setRecipes(r);
        setCategories(c);
      })
      .catch(() => {
        // API might be down; render gracefully
      });
  }, []);

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-2xl">
              <span className="inline-block text-5xl mb-4 animate-fade-in-up">
                🍜
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold font-[family-name:var(--font-heading)] text-foreground leading-tight mb-6 animate-fade-in-up">
                {t("home.heroTitle")}{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  {t("home.heroPanAsia")}
                </span>
              </h1>
              <p
                className="text-lg md:text-xl text-muted mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                {t("home.heroSubtitle")}
              </p>
              <div
                className="flex flex-wrap gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <Link
                  href="/recipes"
                  className="btn-buy-all inline-block text-center !w-auto !px-8"
                >
                  {t("home.exploreRecipes")}
                </Link>
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3.5 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  {t("home.shopIngredients")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 40C1248 36.7 1344 33.3 1392 31.7L1440 30V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="var(--color-background)"
            />
          </svg>
        </div>
      </section>

      {/* ── Featured Recipes ── */}
      {recipes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
                {t("home.featuredRecipes")}
              </h2>
              <p className="text-muted mt-1">
                {t("home.featuredSubtitle")}
              </p>
            </div>
            <Link
              href="/recipes"
              className="hidden sm:inline-flex items-center gap-1 text-primary font-medium hover:underline"
            >
              {t("home.viewAll")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* ── Shop by Cuisine ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">
              {t("home.shopByCuisine")}
            </h2>
            <p className="text-muted">
              {t("home.shopByCuisineSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?cuisine=${cat.cuisine_type}`}
                className="block group"
              >
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-warm" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="gradient-warm rounded-3xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {t("home.ctaSubtitle")}
          </p>
          <Link
            href="/recipes"
            className="inline-block px-8 py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg"
          >
            {t("home.browseAllRecipes")}
          </Link>
        </div>
      </section>
    </>
  );
}
