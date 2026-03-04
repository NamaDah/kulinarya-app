"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, updateUserRole, deleteUser } from "@/lib/admin-api";
import { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers(page);
      setUsers(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRoleChange = async (
    userId: number,
    newRole: "admin" | "user",
  ) => {
    setProcessingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
    setProcessingId(null);
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the user "${userName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setProcessingId(userId);
    try {
      await deleteUser(userId);
      // reload or filter out
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
    setProcessingId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "#1e293b",
          }}
        >
          Users Management
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
          {total} registered user{total !== 1 ? "s" : ""}
        </p>
      </div>

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
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</span>
            <p style={{ fontWeight: 600 }}>No users found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500, color: "#1e293b" }}>
                    {user.name}
                  </td>
                  <td style={{ color: "#64748b" }}>{user.email}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        background:
                          user.role === "admin" ? "#dcfce7" : "#f1f5f9",
                        color: user.role === "admin" ? "#166534" : "#475569",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      <select
                        className="admin-select"
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as "admin" | "user",
                          )
                        }
                        disabled={processingId === user.id}
                        style={{
                          width: 100,
                          fontSize: "0.75rem",
                          padding: "0.3rem 0.5rem",
                          opacity: processingId === user.id ? 0.6 : 1,
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={processingId === user.id}
                        style={{
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "none",
                          borderRadius: "0.375rem",
                          padding: "0.375rem 0.5rem",
                          cursor:
                            processingId === user.id
                              ? "not-allowed"
                              : "pointer",
                          opacity: processingId === user.id ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete User"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
