"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getOrder, rateOrder } from "@/lib/order-api";
import { formatRupiah } from "@/lib/currency";
import { Order } from "@/lib/types";
import { echo } from "@/lib/echo";
import ChatWindow from "@/components/ChatWindow";

/* ── Step definitions ────────────────────────────────────── */
const ORDER_STEPS = [
  { key: "confirmed", label: "Confirmed", icon: "✅", desc: "Order accepted" },
  { key: "processing", label: "Cooking", icon: "🍳", desc: "Being prepared" },
  { key: "shipping", label: "Shipping", icon: "🚗", desc: "On the way" },
  { key: "done", label: "Done", icon: "🎉", desc: "Delivered" },
] as const;

function stepIndex(status: string): number {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

/* ── Status / payment badge config ───────────────────────── */
const statusConfig: Record<string, { bg: string; color: string; icon: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e", icon: "⏳" },
  confirmed: { bg: "#dbeafe", color: "#1e40af", icon: "✅" },
  processing: { bg: "#e0e7ff", color: "#3730a3", icon: "🍳" },
  shipping: { bg: "#fce7f3", color: "#9d174d", icon: "🚗" },
  done: { bg: "#dcfce7", color: "#166534", icon: "🎉" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", icon: "❌" },
};

const paymentConfig: Record<string, { bg: string; color: string; icon: string }> = {
  unpaid: { bg: "#fef3c7", color: "#92400e", icon: "💳" },
  paid: { bg: "#dcfce7", color: "#166534", icon: "✅" },
  expired: { bg: "#f3f4f6", color: "#6b7280", icon: "⏰" },
  failed: { bg: "#fee2e2", color: "#991b1b", icon: "❌" },
};

/* ── Star Rating Widget ───────────────────────────────────── */
function StarRating({
  rating,
  onRate,
  disabled,
}: {
  rating: number | null | undefined;
  onRate: (stars: number) => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(0);
  const current = rating || 0;

  return (
    <div
      className="glass-card"
      style={{
        padding: "1.25rem",
        marginBottom: "1.5rem",
        textAlign: "center",
        cursor: "default",
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          color: "#78716c",
          fontWeight: 600,
          marginBottom: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {current ? "Your Rating" : "Rate this order"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.35rem" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !disabled && !current && onRate(star)}
            onMouseEnter={() => !current && setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={disabled || !!current}
            style={{
              background: "none",
              border: "none",
              fontSize: "2rem",
              cursor: current ? "default" : disabled ? "not-allowed" : "pointer",
              transform:
                !current && hover >= star
                  ? "scale(1.2)"
                  : current >= star
                    ? "scale(1.05)"
                    : "scale(1)",
              transition: "transform 0.15s, filter 0.15s",
              filter:
                (hover >= star && !current) || current >= star
                  ? "none"
                  : "grayscale(1) opacity(0.3)",
            }}
          >
            ⭐
          </button>
        ))}
      </div>
      {current > 0 && (
        <div style={{ fontSize: "0.8rem", color: "#78716c", marginTop: "0.5rem" }}>
          You rated {current}/5 stars — thank you!
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchOrder = () => {
      setLoading(true);
      getOrder(orderId)
        .then((data) => setOrder(data))
        .catch(() => setError(t("orderDetail.orderNotFound")))
        .finally(() => setLoading(false));
    };

    fetchOrder();

    if (echo) {
      // Listen for payment updates
      const paymentChannel = echo.channel(`payment.${orderId}`);
      paymentChannel.listen(".PaymentStatusUpdated", () => {
        getOrder(orderId).then((data) => setOrder(data));
      });

      // Listen for order status updates
      const orderChannel = echo.channel(`order.${orderId}`);
      orderChannel.listen(".OrderStatusUpdated", () => {
        getOrder(orderId).then((data) => setOrder(data));
      });

      return () => {
        paymentChannel.stopListening(".PaymentStatusUpdated");
        echo?.leaveChannel(`payment.${orderId}`);
        orderChannel.stopListening(".OrderStatusUpdated");
        echo?.leaveChannel(`order.${orderId}`);
      };
    }
  }, [orderId, user, authLoading, t]);

  const handleRate = async (stars: number) => {
    setRatingLoading(true);
    try {
      await rateOrder(orderId, stars);
      setOrder((prev) => (prev ? { ...prev, rating: stars } : prev));
    } catch {
      // fail silently
    } finally {
      setRatingLoading(false);
    }
  };

  /* ── Loading / Error states ─────────────────────────── */
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
          {error || t("orderDetail.orderNotFound")}
        </h1>
        <Link href="/orders" className="text-primary font-medium hover:underline">
          {t("orderDetail.backToOrders")}
        </Link>
      </div>
    );
  }

  const sc = statusConfig[order.status] || statusConfig.pending;
  const pc = paymentConfig[order.payment_status] || paymentConfig.unpaid;
  const currentStep = stepIndex(order.status);
  const showStepper = order.status !== "pending" && order.status !== "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/orders"
        className="text-primary font-medium hover:underline text-sm"
        style={{ display: "inline-block", marginBottom: "1.5rem" }}
      >
        {t("orderDetail.backToOrders")}
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
            {t("orders.orderPrefix")}
            {order.id}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#78716c", marginTop: "0.25rem" }}>
            {t("orderDetail.placedOn")}{" "}
            {new Date(order.created_at).toLocaleDateString(dateLocale, {
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

      {/* ── Order Progress Stepper ─────────────────────── */}
      {showStepper && (
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            marginBottom: "1.5rem",
            cursor: "default",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#78716c",
              fontWeight: 600,
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Order Progress
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "12.5%",
                right: "12.5%",
                height: 3,
                background: "#e7e5e4",
                zIndex: 0,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "12.5%",
                width:
                  currentStep >= 0
                    ? `${Math.min((currentStep / (ORDER_STEPS.length - 1)) * 75, 75)}%`
                    : "0%",
                height: 3,
                background: "linear-gradient(90deg, #d97706, #f59e0b)",
                zIndex: 1,
                borderRadius: 2,
                transition: "width 0.6s ease",
              }}
            />

            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = currentStep >= idx;
              const isCurrent = currentStep === idx;
              return (
                <div
                  key={step.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "25%",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      background: isCompleted
                        ? "linear-gradient(135deg, #d97706, #f59e0b)"
                        : "#f5f5f4",
                      color: isCompleted ? "#fff" : "#a8a29e",
                      boxShadow: isCurrent
                        ? "0 0 0 4px rgba(217,119,6,0.2)"
                        : "none",
                      transition: "all 0.3s ease",
                      border: isCompleted ? "none" : "2px solid #d6d3d1",
                    }}
                  >
                    {step.icon}
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: isCompleted ? 700 : 500,
                      color: isCompleted ? "#292524" : "#a8a29e",
                      textAlign: "center",
                      transition: "color 0.3s",
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: isCompleted ? "#78716c" : "#d6d3d1",
                      marginTop: "0.15rem",
                      textAlign: "center",
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="glass-card" style={{ padding: "1.25rem", cursor: "default" }}>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#78716c",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            {t("orderDetail.orderStatus")}
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
            {sc.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="glass-card" style={{ padding: "1.25rem", cursor: "default" }}>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#78716c",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            {t("orderDetail.paymentStatus")}
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
            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
          </span>
        </div>
      </div>

      {/* Driver info */}
      {order.driver && (
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            cursor: "default",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: 500, marginBottom: "0.25rem" }}>
              Driver
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              🚗 {order.driver.name}
            </div>
          </div>
          {(order.status === "shipping" || order.status === "done") && (
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
              💬 Chat
            </button>
          )}
        </div>
      )}

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
          <span style={{ color: "#78716c" }}>{t("orderDetail.paymentRef")} </span>
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
              {t("orderDetail.paymentPending")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#b45309" }}>
              {t("orderDetail.completePayment")}
            </div>
          </div>
          <button
            className="btn-buy"
            onClick={() => {
              if (order.snap_token) {
                window.open(
                  `https://app.sandbox.midtrans.com/snap/v2/vtweb/${order.snap_token}`,
                  "_blank",
                );
              }
            }}
          >
            {t("orderDetail.payNow")}
          </button>
        </div>
      )}

      {/* Address */}
      {order.address && (
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            cursor: "default",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#78716c",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            {t("orderDetail.deliveryAddress")}
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {order.address}
          </div>
        </div>
      )}

      {/* Star Rating — only when order is done */}
      {order.status === "done" && (
        <StarRating
          rating={order.rating}
          onRate={handleRate}
          disabled={ratingLoading}
        />
      )}

      {/* Order Items */}
      <div className="glass-card" style={{ overflow: "hidden", cursor: "default" }}>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e7e5e4",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {t("orderDetail.orderItems")} ({order.items?.length || 0})
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
                {t("orderDetail.qty")} {item.quantity} × {formatRupiah(item.unit_price)}
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
          <span>{t("orderDetail.total")}</span>
          <span style={{ color: "#d97706" }}>{formatRupiah(order.total_amount)}</span>
        </div>
      </div>

      {/* Chat Window */}
      {order.driver && (
        <ChatWindow
          orderId={orderId}
          receiverId={order.driver.id}
          receiverName={order.driver.name}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
