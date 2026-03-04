"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getOrder } from "@/lib/order-api";
import { formatRupiah } from "@/lib/currency";
import { Order } from "@/lib/types";

const statusConfig: Record<
  string,
  { bg: string; color: string; icon: string }
> = {
  pending: { bg: "#fef3c7", color: "#92400e", icon: "⏳" },
  processing: { bg: "#dbeafe", color: "#1e40af", icon: "⚙️" },
  completed: { bg: "#dcfce7", color: "#166534", icon: "✅" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", icon: "❌" },
};

const paymentConfig: Record<
  string,
  { bg: string; color: string; icon: string }
> = {
  unpaid: { bg: "#fef3c7", color: "#92400e", icon: "💳" },
  paid: { bg: "#dcfce7", color: "#166534", icon: "✅" },
  expired: { bg: "#f3f4f6", color: "#6b7280", icon: "⏰" },
  failed: { bg: "#fee2e2", color: "#991b1b", icon: "❌" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    getOrder(orderId)
      .then((data) => setOrder(data))
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  }, [orderId, user, authLoading]);

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

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-6xl block mb-6">😕</span>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
          {error || "Order Not Found"}
        </h1>
        <Link
          href="/orders"
          className="text-primary font-medium hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const sc = statusConfig[order.status] || statusConfig.pending;
  const pc = paymentConfig[order.payment_status] || paymentConfig.unpaid;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/orders"
        className="text-primary font-medium hover:underline text-sm"
        style={{ display: "inline-block", marginBottom: "1.5rem" }}
      >
        ← Back to Orders
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
          <p
            style={{
              fontSize: "0.85rem",
              color: "#78716c",
              marginTop: "0.25rem",
            }}
          >
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.75rem",
              color: "#d97706",
              fontFamily: "var(--font-heading)",
            }}
          >
            {formatRupiah(order.total_amount)}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="glass-card"
          style={{ padding: "1.25rem", cursor: "default" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#78716c",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
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
              background: sc.bg,
              color: sc.color,
            }}
          >
            {sc.icon}{" "}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.25rem", cursor: "default" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#78716c",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            Payment Status
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
              background: pc.bg,
              color: pc.color,
            }}
          >
            {pc.icon}{" "}
            {order.payment_status.charAt(0).toUpperCase() +
              order.payment_status.slice(1)}
          </span>
        </div>
      </div>

      {/* Payment ref */}
      {order.payment_reference && (
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            cursor: "default",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#78716c" }}>Payment Ref: </span>
          <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
            {order.payment_reference}
          </span>
        </div>
      )}

      {/* If unpaid, show pay now link */}
      {order.payment_status === "unpaid" && order.snap_token && (
        <div
          style={{
            background: "linear-gradient(135deg, #fef3c7, #fff7ed)",
            border: "1px solid #fde68a",
            borderRadius: "1rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: "#92400e" }}>
              Payment Pending
            </div>
            <div style={{ fontSize: "0.8rem", color: "#b45309" }}>
              Complete your payment to process this order.
            </div>
          </div>
          <button
            className="btn-buy"
            onClick={() => {
              // For Midtrans Snap, we can try to open the snap popup
              // or redirect to the payment page
              if (order.snap_token) {
                // If redirect_url exists, navigate there
                // Otherwise, open Midtrans snap
                window.open(
                  `https://app.sandbox.midtrans.com/snap/v2/vtweb/${order.snap_token}`,
                  "_blank",
                );
              }
            }}
          >
            Pay Now →
          </button>
        </div>
      )}

      {/* Order Items */}
      <div
        className="glass-card"
        style={{ overflow: "hidden", cursor: "default" }}
      >
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
              padding: "1rem 1.25rem",
              borderBottom:
                index < (order.items?.length || 0) - 1
                  ? "1px solid #f5f5f4"
                  : "none",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "0.75rem",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                flexShrink: 0,
              }}
            >
              🥘
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {item.product_name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#78716c" }}>
                Qty: {item.quantity} × {formatRupiah(item.unit_price)}
              </div>
            </div>
            <div
              style={{
                fontWeight: 700,
                color: "#d97706",
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
              }}
            >
              {formatRupiah(item.quantity * parseFloat(item.unit_price))}
            </div>
          </div>
        ))}

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderTop: "2px solid #e7e5e4",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          <span>Total</span>
          <span style={{ color: "#d97706" }}>
            {formatRupiah(order.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
