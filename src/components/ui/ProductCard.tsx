"use client";

import Image from "next/image";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const cuisineTag = product.category?.cuisine_type;

  return (
    <div className="glass-card overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-surface-warm flex items-center justify-center text-4xl">
            🥘
          </div>
        )}
        {/* Cuisine tag */}
        {cuisineTag && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold tag-${cuisineTag}`}
          >
            {cuisineTag.charAt(0).toUpperCase() + cuisineTag.slice(1)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold font-heading text-foreground text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-muted ml-1">/ {product.unit}</span>
          </div>
          <button
            id={`add-to-cart-${product.slug}`}
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
            className={`btn-buy ${!product.in_stock ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
