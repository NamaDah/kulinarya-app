"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/order-api";
import { formatRupiah } from "@/lib/currency";
import { Order } from "@/lib/types";
import { paymentColors, statusColors } from "@/constants/statusColors";

export default function OrdersPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    setLoading(true);
    getOrders(page)
      .then((res) => {
        // The API returns paginated data where each item has nested order_products
        // We need to map the API response to our Order type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedOrders = (res.data as any[]).map((order) => ({
          ...order,
          items: (order.order_products || []).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (op: any) => ({
              id: op.id,
              product_id: op.product_id,
              product_name: op.product?.name || "",
              product_image: op.product?.image_url || null,
              quantity: op.quantity,
              unit_price: op.unit_price,
            }),
          ),
        }));
        setOrders(mappedOrders as Order[]);
        setLastPage(res.last_page);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, page]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #e7e5e4",
            borderTopColor: "#d97706",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-6xl block mb-6">🔒</span>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-3">
          Sign In Required
        </h1>
        <p className="text-muted text-lg mb-8">
          Please sign in to view your orders.
        </p>
        <button onClick={openAuthModal} className="btn-buy-all !w-auto !px-10">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8">
        My Orders
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 120, borderRadius: "1rem" }}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-6">📦</span>
          <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2">
            No Orders Yet
          </h2>
          <p className="text-muted mb-6">
            Start shopping and your orders will appear here!
          </p>
          <Link href="/shop" className="btn-buy-all w-auto! px-10!">
            Browse Shop
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const sc = statusColors[order.status] || statusColors.pending;
              const pc =
                paymentColors[order.payment_status] || paymentColors.unpaid;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="glass-card p-5 block"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                      >
                        Order #{order.id}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#78716c",
                          marginTop: "0.25rem",
                        }}
                      >
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          color: "#d97706",
                        }}
                      >
                        {formatRupiah(order.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: sc.bg,
                        color: sc.color,
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: pc.bg,
                        color: pc.color,
                      }}
                    >
                      💳{" "}
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "0.8rem",
                        color: "#78716c",
                      }}
                    >
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}:{" "}
                      {order.items
                        .slice(0, 3)
                        .map((i) => i.product_name)
                        .join(", ")}
                      {order.items.length > 3 &&
                        ` +${order.items.length - 3} more`}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "2rem",
              }}
            >
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ←
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${p === page ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
