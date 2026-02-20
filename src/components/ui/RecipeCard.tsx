import Image from "next/image";
import Link from "next/link";
import { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const cuisineTag = recipe.cuisine_type;
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <Link href={`/recipes/${recipe.slug}`} className="block">
      <div className="glass-card overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-warm flex items-center justify-center text-4xl">
              📖
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Cuisine tag */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold tag-${cuisineTag}`}
          >
            {cuisineTag.charAt(0).toUpperCase() + cuisineTag.slice(1)}
          </span>

          {/* Time badge */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium text-foreground">
              {totalTime} min
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold font-[family-name:var(--font-heading)] text-foreground text-lg mb-1 line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-muted text-sm line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span>👨‍🍳</span> {recipe.servings} servings
            </span>
            <span className="flex items-center gap-1">
              <span>⏱️</span> {recipe.prep_time_minutes}m prep
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
