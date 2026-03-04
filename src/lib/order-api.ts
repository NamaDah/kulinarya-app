/**
 * Order API — authenticated endpoints for checkout and order management.
 * Uses same-origin requests via Next.js proxy rewrites with XSRF token.
 */

import { Order, PaginatedResponse } from "./types";

/**
 * Read the XSRF-TOKEN cookie value.
 */
function getXsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  if (!match) return "";
  return decodeURIComponent(match.split("=")[1]);
}

interface CheckoutItem {
  product_id: number;
  quantity: number;
}

interface CheckoutResponse {
  message: string;
  order: Order;
}

/**
 * Create an order from cart items and initiate payment.
 */
export async function checkout(
  items: CheckoutItem[],
): Promise<CheckoutResponse> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Checkout failed");
  }

  return res.json();
}

/**
 * Get the authenticated user's orders (paginated).
 */
export async function getOrders(page = 1): Promise<PaginatedResponse<Order>> {
  const res = await fetch(`/api/orders?page=${page}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

/**
 * Get a specific order detail.
 */
export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch order");
  }

  return res.json();
}
