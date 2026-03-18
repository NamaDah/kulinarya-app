"use client";

import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "@/lib/admin-order-api";
import { formatRupiah } from "@/lib/currency";
import { AdminOrder } from "@/lib/types";
import { paymentColors, statusColors } from "@/constants/statusColors";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { t, locale } = useLanguage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders(page, statusFilter || undefined);
      // Map order_products to items for our AdminOrder type
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
      setOrders(mappedOrders as AdminOrder[]);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus as AdminOrder["status"] }
            : o,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : t("admin.failedToUpdate"));
    }
    setUpdatingId(null);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#1e293b",
            }}
          >
            {t("admin.orders")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {total} {t("admin.totalOrders_label")}
          </p>
        </div>

        {/* Filter */}
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{ width: 180 }}
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="pending">{t("admin.pending")}</option>
          <option value="processing">{t("admin.processing")}</option>
          <option value="confirmed">{t("admin.confirmed")}</option>
          <option value="shipped">{t("admin.shipped")}</option>
          <option value="delivered">{t("admin.delivered")}</option>
          <option value="cancelled">{t("admin.cancelled")}</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #e2e8f0",
                borderTopColor: "#d97706",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 0.75rem",
              }}
            />
            <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
              {t("admin.loadingOrders")}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</span>
            <p style={{ fontWeight: 600 }}>{t("admin.noOrdersFound")}</p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {statusFilter
                ? t("admin.tryChangingFilter")
                : t("admin.ordersWillAppear")}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.order")}</th>
                <th>{t("admin.customer")}</th>
                <th>{t("admin.total")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.payment")}</th>
                <th>{t("admin.date")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const sc = statusColors[order.status] || statusColors.pending;
                const pc =
                  paymentColors[order.payment_status] || paymentColors.unpaid;
                const isExpanded = expandedId === order.id;
                return (
                  <>
                    <tr
                      key={order.id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                    >
                      <td style={{ fontWeight: 600 }}>#{order.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {order.user?.name || t("admin.guest")}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {order.user?.email || "—"}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#d97706" }}>
                        {formatRupiah(order.total_amount)}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "9999px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "9999px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: pc.bg,
                            color: pc.color,
                          }}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {new Date(order.created_at).toLocaleDateString(
                          locale === "id" ? "id-ID" : "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={updatingId === order.id}
                          style={{
                            width: 130,
                            fontSize: "0.75rem",
                            padding: "0.375rem 0.5rem",
                            opacity: updatingId === order.id ? 0.6 : 1,
                          }}
                        >
                          <option value="pending">{t("admin.pending")}</option>
                          <option value="processing">{t("admin.processing")}</option>
                          <option value="confirmed">{t("admin.confirmed")}</option>
                          <option value="shipped">{t("admin.shipped")}</option>
                          <option value="delivered">{t("admin.delivered")}</option>
                          <option value="cancelled">{t("admin.cancelled")}</option>
                        </select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order.id}-detail`}>
                        <td
                          colSpan={7}
                          style={{
                            background: "#f8fafc",
                            padding: "1rem 1.5rem",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: "0.5rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            {t("admin.orderItems")}
                          </div>
                          {order.items && order.items.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0.5rem 0.75rem",
                                    background: "#fff",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  <span>
                                    {item.product_name}{" "}
                                    <span style={{ color: "#94a3b8" }}>
                                      × {item.quantity}
                                    </span>
                                  </span>
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: "#d97706",
                                    }}
                                  >
                                    {formatRupiah(
                                      item.quantity *
                                      parseFloat(item.unit_price),
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                              {t("admin.noItems")}
                            </p>
                          )}
                          {order.payment_reference && (
                            <div
                              style={{
                                marginTop: "0.75rem",
                                fontSize: "0.8rem",
                                color: "#64748b",
                              }}
                            >
                              {t("admin.paymentRefShort")}{" "}
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 500,
                                }}
                              >
                                {order.payment_reference}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
