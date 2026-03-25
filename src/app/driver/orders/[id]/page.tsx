"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { deliverOrder } from "@/lib/driver-api";
import { getOrder, getMessages, sendMessage } from "@/lib/order-api";
import { formatRupiah } from "@/lib/currency";
import { Order, Message } from "@/lib/types";
import { echo } from "@/lib/echo";
import ChatWindow from "@/components/ChatWindow";

export default function DriverOrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<(Order & { user?: { id: number; name: string; email: string } }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    // We use the general order API to fetch — drivers also use message routes
    fetch(`/api/driver/orders?page=1`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => {
        const found = (res.data || []).find((o: any) => o.id === orderId);
        if (found) {
          const mapped = {
            ...found,
            items: (found.order_products || []).map((op: any) => ({
              id: op.id,
              product_id: op.product_id,
              product_name: op.product?.name || "",
              product_image: op.product?.image_url || null,
              quantity: op.quantity,
              unit_price: op.unit_price,
            })),
          };
          setOrder(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Also try available orders
    fetch(`/api/driver/orders/available?page=1`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => {
        const found = (res.data || []).find((o: any) => o.id === orderId);
        if (found && !order) {
          const mapped = {
            ...found,
            items: (found.order_products || []).map((op: any) => ({
              id: op.id,
              product_id: op.product_id,
              product_name: op.product?.name || "",
              product_image: op.product?.image_url || null,
              quantity: op.quantity,
              unit_price: op.unit_price,
            })),
          };
          setOrder(mapped);
        }
      })
      .catch(() => {});

    if (echo) {
      const orderChannel = echo.channel(`order.${orderId}`);
      orderChannel.listen(".OrderStatusUpdated", () => {
        // Refresh on status change
        window.location.reload();
      });

      return () => {
        orderChannel.stopListening(".OrderStatusUpdated");
        echo?.leaveChannel(`order.${orderId}`);
      };
    }
  }, [orderId, user, authLoading]);

  const handleDeliver = async () => {
    if (!order) return;
    setDelivering(true);
    try {
      await deliverOrder(order.id);
      setOrder((prev) => (prev ? { ...prev, status: "delivered" as const } : prev));
    } catch {
      // fail silently
    } finally {
      setDelivering(false);
    }
  };

  if (authLoading || loading) {
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

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-6xl block mb-6">😕</span>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
          Order not found
        </h1>
        <Link href="/driver" className="text-primary font-medium hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/driver"
        className="text-primary font-medium hover:underline text-sm"
        style={{ display: "inline-block", marginBottom: "1.5rem" }}
      >
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Order #{order.id}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#78716c", marginTop: "0.25rem" }}>
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "#d97706",
            fontFamily: "var(--font-heading)",
          }}
        >
          {formatRupiah(order.total_amount)}
        </div>
      </div>

      {/* Status + Actions */}
      <div
        className="glass-card"
        style={{
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: 500, marginBottom: "0.25rem" }}>
            Order Status
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.375rem 1rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: order.status === "shipping" ? "#fce7f3" : order.status === "delivered" ? "#dcfce7" : "#e0e7ff",
              color: order.status === "shipping" ? "#9d174d" : order.status === "delivered" ? "#166534" : "#3730a3",
            }}
          >
            {order.status === "shipping" ? "🚗" : order.status === "delivered" ? "🎉" : "🍳"}{" "}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {order.status === "shipping" && (
            <button
              onClick={handleDeliver}
              disabled={delivering}
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: delivering ? "not-allowed" : "pointer",
                opacity: delivering ? 0.6 : 1,
              }}
            >
              {delivering ? "Delivering..." : "✅ Mark as Delivered"}
            </button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      {order.user && (
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: 500, marginBottom: "0.25rem" }}>
              Customer
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              👤 {order.user.name}
            </div>
          </div>
          {(order.status === "shipping" || order.status === "delivered") && (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                background: "linear-gradient(135deg, #d97706, #f59e0b)",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              💬 Chat with Customer
            </button>
          )}
        </div>
      )}

      {/* Delivery Address */}
      {order.address && (
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: 500, marginBottom: "0.5rem" }}>
            📍 Delivery Address
          </div>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {order.address}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e7e5e4",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Order Items ({order.items?.length || 0})
        </div>
        {order.items?.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1.25rem",
              borderBottom:
                index < (order.items?.length || 0) - 1
                  ? "1px solid #f5f5f4"
                  : "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "0.625rem",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              🥘
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                {item.product_name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                Qty: {item.quantity}
              </div>
            </div>
            <div
              style={{
                fontWeight: 700,
                color: "#d97706",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
              }}
            >
              {formatRupiah(item.quantity * parseFloat(item.unit_price))}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      {order.user && (
        <ChatWindow
          orderId={orderId}
          receiverId={order.user.id}
          receiverName={order.user.name}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
