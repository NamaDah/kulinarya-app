"use client";

import { useEffect, useState } from "react";
import { getAdminDashboard } from "@/lib/admin-api";
import { DashboardStats, AdminOrder } from "@/lib/types";
import { formatRupiah } from "@/lib/currency";
import Link from "next/link";
import { paymentColors, statusColors } from "@/constants/statusColors";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getAdminDashboard();
        setStats(data.stats);
        setRecentOrders(data.recent_orders);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
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
          Loading dashboard...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.75rem",
            color: "#1e293b",
            marginBottom: "0.5rem",
          }}
        >
          Dashboard Overview
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {/* Total Revenue */}
        <div
          className="admin-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "0.75rem",
              background: "#fef08a",
              color: "#a16207",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.25rem",
              }}
            >
              Total Revenue
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e293b",
                fontFamily: "var(--font-heading)",
              }}
            >
              {formatRupiah(stats.total_revenue)}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div
          className="admin-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "0.75rem",
              background: "#dbeafe",
              color: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.25rem",
              }}
            >
              Total Orders
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e293b",
                fontFamily: "var(--font-heading)",
              }}
            >
              {stats.total_orders}
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div
          className="admin-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "0.75rem",
              background: "#dcfce7",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.25rem",
              }}
            >
              Total Users
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e293b",
                fontFamily: "var(--font-heading)",
              }}
            >
              {stats.total_users}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "#1e293b",
            }}
          >
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            style={{
              fontSize: "0.85rem",
              color: "#d97706",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "0.9rem",
            }}
          >
            No recent orders found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const sc = statusColors[order.status] || statusColors.pending;
                const pc =
                  paymentColors[order.payment_status] || paymentColors.unpaid;
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>#{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {order.user?.name || "Guest"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {order.user?.email || "—"}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
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
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
