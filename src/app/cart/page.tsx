"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { checkout } from "@/lib/order-api";
import { formatRupiah } from "@/lib/currency";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const checkoutItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const response = await checkout(checkoutItems);
      clearCart();

      // If we got a redirect URL from Midtrans, open it
      if (response.order.redirect_url) {
        window.open(response.order.redirect_url, "_blank");
      }

      // Navigate to the order detail page
      router.push(`/orders/${response.order.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-6xl block mb-6">🛒</span>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-muted text-lg mb-8">
          Start exploring recipes and shop premium Pan-Asian ingredients!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/shop" className="btn-buy-all !w-auto !px-8">
            Browse Shop
          </Link>
          <Link
            href="/recipes"
            className="px-8 py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
          >
            Explore Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Shopping Cart
          </h1>
          <p className="text-muted mt-1">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-muted hover:text-secondary transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#dc2626",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            marginBottom: "1rem",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* Items */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.product.id} className="glass-card p-5 flex gap-4">
            {/* Emoji placeholder */}
            <div className="w-20 h-20 rounded-xl bg-surface-warm flex items-center justify-center text-3xl flex-shrink-0">
              🥘
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold font-[family-name:var(--font-heading)] text-lg">
                    {item.product.name}
                  </h3>
                  <p className="text-muted text-sm line-clamp-1 mt-0.5">
                    {item.product.description}
                  </p>
                  {item.product.category && (
                    <span
                      className={`inline-block mt-1.5 tag-${item.product.category.cuisine_type} px-2 py-0.5 rounded-full text-xs font-semibold`}
                    >
                      {item.product.category.cuisine_type
                        .charAt(0)
                        .toUpperCase() +
                        item.product.category.cuisine_type.slice(1)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-muted hover:text-secondary transition-colors p-1 cursor-pointer"
                  aria-label="Remove item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-sm font-bold hover:bg-stone-300 transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-sm font-bold hover:bg-stone-300 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">
                    {formatRupiah(
                      parseFloat(item.product.price) * item.quantity,
                    )}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-muted block">
                      {formatRupiah(item.product.price)} each
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <h3 className="font-bold font-[family-name:var(--font-heading)] text-lg mb-4">
          Order Summary
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal ({totalItems} items)</span>
            <span className="font-medium">{formatRupiah(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex justify-between items-center mb-6">
          <span className="font-semibold text-lg">Total</span>
          <span className="text-2xl font-bold text-primary">
            {formatRupiah(totalPrice)}
          </span>
        </div>

        <button
          className="btn-buy-all text-lg py-4"
          onClick={handleCheckout}
          disabled={isCheckingOut}
          style={{ opacity: isCheckingOut ? 0.7 : 1 }}
        >
          {isCheckingOut ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Processing...
            </span>
          ) : user ? (
            "Proceed to Checkout"
          ) : (
            "Login to Checkout"
          )}
        </button>

        <Link
          href="/shop"
          className="block text-center text-primary font-medium mt-4 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
