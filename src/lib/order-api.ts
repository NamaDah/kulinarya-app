import { Order, PaginatedResponse, Message } from "./types";

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
  address: string,
): Promise<CheckoutResponse> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({ items, address }),
  });

  console.log(JSON.stringify({ items, address }))

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

/**
 * Rate a completed order (1-5 stars).
 */
export async function rateOrder(orderId: number, rating: number): Promise<{ message: string; rating: number }> {
  const res = await fetch(`/api/orders/${orderId}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({ rating }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to rate order");
  }

  return res.json();
}

/**
 * Get messages for an order.
 */
export async function getMessages(orderId: number): Promise<Message[]> {
  const res = await fetch(`/api/orders/${orderId}/messages`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

/**
 * Send a message on an order.
 */
export async function sendMessage(orderId: number, receiverId: number, message: string): Promise<Message> {
  const res = await fetch(`/api/orders/${orderId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({ receiver_id: receiverId, message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to send message");
  }

  return res.json();
}

