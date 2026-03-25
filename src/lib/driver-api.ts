/**
 * Driver API — authenticated endpoints for driver operations.
 */

import { Order, PaginatedResponse } from "./types";

function getXsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  if (!match) return "";
  return decodeURIComponent(match.split("=")[1]);
}

/**
 * Get orders assigned to the current driver.
 */
export async function getDriverOrders(page = 1): Promise<PaginatedResponse<Order & { user?: { id: number; name: string; email: string } }>> {
  const res = await fetch(`/api/driver/orders?page=${page}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch driver orders");
  }

  return res.json();
}

/**
 * Get available orders for pickup.
 */
export async function getAvailableOrders(page = 1): Promise<PaginatedResponse<Order & { user?: { id: number; name: string; email: string } }>> {
  const res = await fetch(`/api/driver/orders/available?page=${page}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch available orders");
  }

  return res.json();
}

/**
 * Pick up an order.
 */
export async function pickupOrder(orderId: number): Promise<{ message: string }> {
  const res = await fetch(`/api/driver/orders/${orderId}/pickup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to pick up order");
  }

  return res.json();
}

/**
 * Deliver an order.
 */
export async function deliverOrder(orderId: number): Promise<{ message: string }> {
  const res = await fetch(`/api/driver/orders/${orderId}/deliver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to deliver order");
  }

  return res.json();
}
