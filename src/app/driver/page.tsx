"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDriverOrders, getAvailableOrders, pickupOrder, getDriverHistory, getDriverProfile } from "@/lib/driver-api";
import { formatRupiah } from "@/lib/currency";
import { Order, DriverProfile } from "@/lib/types";

type DriverOrder = Order & { user?: { id: number; name: string; email: string } };

/* ── Star Display (read-only) ───────────────────────────── */
function StarDisplay({ rating, size = "1rem" }: { rating: number; size?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: "0.1rem" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: size,
            filter: star <= rating ? "none" : "grayscale(1) opacity(0.25)",
            transition: "filter 0.15s",
          }}
        >
          ⭐
        </span>
      ))}
    </span>
  );
}

export default function DriverDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"my" | "available" | "history">("my");
  const [myOrders, setMyOrders] = useState<DriverOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<DriverOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<DriverOrder[]>([]);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState<number | null>(null);

  const mapOrders = (data: any[]): DriverOrder[] =>
    data.map((o) => ({
      ...o,
      items: (o as any).order_products?.map((op: any) => ({
        id: op.id,
        product_id: op.product_id,
        product_name: op.product?.name || "",
        quantity: op.quantity,
        unit_price: op.unit_price,
      })) || o.items || [],
    }));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [my, avail, history, prof] = await Promise.all([
        getDriverOrders(),
        getAvailableOrders(),
        getDriverHistory(),
        getDriverProfile(),
      ]);
      setMyOrders(mapOrders(my.data as any[]));
      setAvailableOrders(mapOrders(avail.data as any[]));
      setHistoryOrders(mapOrders(history.data as any[]));
      setProfile(prof);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchOrders();
  }, [user, authLoading]);

  const handlePickup = async (orderId: number) => {
    setPickingUp(orderId);
    try {
      await pickupOrder(orderId);
      await fetchOrders();
    } catch {
      // fail silently
    } finally {
      setPickingUp(null);
    }
  };

  const orders = tab === "my" ? myOrders : tab === "available" ? availableOrders : historyOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Driver Rating Card ─────────────────────────── */}
      {profile && (
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
            border: "1px solid #fde68a",
            cursor: "default",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#92400e",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.5rem",
                }}
              >
                Your Driver Rating
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-heading)",
                    color: "#292524",
                    lineHeight: 1,
                  }}
                >
                  {profile.average_rating ? parseFloat(profile.average_rating).toFixed(1) : "—"}
                </span>
                {profile.average_rating && (
                  <StarDisplay rating={Math.round(parseFloat(profile.average_rating))} size="1.25rem" />
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", textAlign: "center" }}>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#292524",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {profile.total_ratings}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#78716c", fontWeight: 500 }}>
                  Ratings
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#292524",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {profile.total_deliveries}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#78716c", fontWeight: 500 }}>
                  Deliveries
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.5rem",
          background: "#f5f5f4",
          borderRadius: "0.75rem",
          padding: "0.25rem",
        }}
      >
        {(["my", "available", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "0.625rem",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#292524" : "#78716c",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}
          >
            {t === "my"
              ? `🚗 My Deliveries (${myOrders.length})`
              : t === "available"
                ? `📦 Available (${availableOrders.length})`
                : `📊 History (${historyOrders.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: "1rem" }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-6">
            {tab === "my" ? "🚗" : tab === "available" ? "📦" : "📊"}
          </span>
          <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2">
            {tab === "my"
              ? "No active deliveries"
              : tab === "available"
                ? "No available orders"
                : "No delivery history yet"}
          </h2>
          <p style={{ color: "#78716c" }}>
            {tab === "my"
              ? "Pick up available orders to start delivering."
              : tab === "available"
                ? "No orders are ready for pickup right now."
                : "Completed deliveries will appear here with ratings."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card"
              style={{ padding: "1.25rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
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
                  {order.user && (
                    <div style={{ fontSize: "0.8rem", color: "#78716c", marginTop: "0.25rem" }}>
                      👤 {order.user.name}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: "#d97706",
                    }}
                  >
                    {formatRupiah(order.total_amount)}
                  </div>
                  {/* Show rating for history orders */}
                  {tab === "history" && (
                    <div style={{ marginTop: "0.35rem" }}>
                      {order.rating ? (
                        <StarDisplay rating={order.rating} size="0.85rem" />
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#a8a29e",
                            fontStyle: "italic",
                          }}
                        >
                          Not rated yet
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {order.address && (
                <div
                  style={{
                    background: "#fafaf9",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    marginBottom: "0.75rem",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>📍 </span>
                  {order.address}
                </div>
              )}

              {/* Items summary */}
              {order.items && order.items.length > 0 && (
                <div style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "0.75rem" }}>
                  {order.items.length} item{order.items.length !== 1 && "s"}:{" "}
                  {order.items
                    .slice(0, 3)
                    .map((i) => i.product_name)
                    .join(", ")}
                  {order.items.length > 3 && ` +${order.items.length - 3} more`}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {tab === "available" && (
                  <button
                    onClick={() => handlePickup(order.id)}
                    disabled={pickingUp === order.id}
                    style={{
                      background: "linear-gradient(135deg, #d97706, #f59e0b)",
                      color: "#fff",
                      border: "none",
                      padding: "0.5rem 1.25rem",
                      borderRadius: "0.75rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: pickingUp === order.id ? "not-allowed" : "pointer",
                      opacity: pickingUp === order.id ? 0.6 : 1,
                    }}
                  >
                    {pickingUp === order.id ? "Picking up..." : "🏁 Pick Up Order"}
                  </button>
                )}
                <Link
                  href={`/driver/orders/${order.id}`}
                  style={{
                    background: "#f5f5f4",
                    color: "#292524",
                    border: "none",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "0.75rem",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
