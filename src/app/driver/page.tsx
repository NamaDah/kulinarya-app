"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDriverOrders, getAvailableOrders, pickupOrder } from "@/lib/driver-api";
import { formatRupiah } from "@/lib/currency";
import { Order } from "@/lib/types";

type DriverOrder = Order & { user?: { id: number; name: string; email: string } };

export default function DriverDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"my" | "available">("my");
  const [myOrders, setMyOrders] = useState<DriverOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [my, avail] = await Promise.all([
        getDriverOrders(),
        getAvailableOrders(),
      ]);
      setMyOrders(
        (my.data as DriverOrder[]).map((o) => ({
          ...o,
          items: (o as any).order_products?.map((op: any) => ({
            id: op.id,
            product_id: op.product_id,
            product_name: op.product?.name || "",
            quantity: op.quantity,
            unit_price: op.unit_price,
          })) || o.items || [],
        }))
      );
      setAvailableOrders(
        (avail.data as DriverOrder[]).map((o) => ({
          ...o,
          items: (o as any).order_products?.map((op: any) => ({
            id: op.id,
            product_id: op.product_id,
            product_name: op.product?.name || "",
            quantity: op.quantity,
            unit_price: op.unit_price,
          })) || o.items || [],
        }))
      );
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

  const orders = tab === "my" ? myOrders : availableOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          background: "#f5f5f4",
          borderRadius: "0.75rem",
          padding: "0.25rem",
        }}
      >
        {(["my", "available"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "0.625rem",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#292524" : "#78716c",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}
          >
            {t === "my" ? `🚗 My Deliveries (${myOrders.length})` : `📦 Available (${availableOrders.length})`}
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
          <span className="text-6xl block mb-6">{tab === "my" ? "🚗" : "📦"}</span>
          <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2">
            {tab === "my" ? "No active deliveries" : "No available orders"}
          </h2>
          <p style={{ color: "#78716c" }}>
            {tab === "my"
              ? "Pick up available orders to start delivering."
              : "No orders are ready for pickup right now."}
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
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    color: "#d97706",
                  }}
                >
                  {formatRupiah(order.total_amount)}
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
