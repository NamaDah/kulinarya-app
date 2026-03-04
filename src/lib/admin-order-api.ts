/**
 * Admin Order API — authenticated admin endpoints for order management.
 */

import { AdminOrder, PaginatedResponse } from "./types";

function getXsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  if (!match) return "";
  return decodeURIComponent(match.split("=")[1]);
}

/**
 * Get all orders with optional filters (admin).
 */
export async function getAdminOrders(
  page = 1,
  status?: string,
  paymentStatus?: string,
): Promise<PaginatedResponse<AdminOrder>> {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (paymentStatus) params.set("payment_status", paymentStatus);

  const res = await fetch(`/api/admin/orders?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

/**
 * Get a specific order detail (admin).
 */
export async function getAdminOrder(id: number): Promise<AdminOrder> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

/**
 * Update order status (admin).
 */
export async function updateOrderStatus(
  id: number,
  status: string,
): Promise<{
  message: string;
  order: { id: number; status: string; payment_status: string };
}> {
  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update order status");
  }
  return res.json();
}
