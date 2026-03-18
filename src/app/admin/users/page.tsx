"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminUsers, updateUserRole, deleteUser } from "@/lib/admin-api";
import { User } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const { t, locale } = useLanguage();

  // Fetch all users once
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ per_page: 1000 });
      setAllUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setAllUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return allUsers;
    const query = searchInput.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [allUsers, searchInput]);

  const handleRoleChange = async (
    userId: number,
    newRole: "admin" | "user",
  ) => {
    setProcessingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err: any) {
      alert(err.message || t("admin.failedToUpdateRole"));
    }
    setProcessingId(null);
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (
      !confirm(
        t("admin.deleteUserConfirm").replace("{name}", userName),
      )
    ) {
      return;
    }

    setProcessingId(userId);
    try {
      await deleteUser(userId);
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message || t("admin.failedToDeleteUser"));
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
           {t("admin.usersManagement")}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
           {searchInput ? `${filteredUsers.length} / ${allUsers.length}` : allUsers.length} {t("admin.registeredUsers")}
        </p>
      </div>

      <div
        className="admin-card"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <svg
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "1rem",
              height: "1rem",
              color: "#94a3b8",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
             placeholder={t("admin.searchUsersPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem 0.6rem 2.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #e2e8f0",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              color: "#1e293b",
              background: "#fff",
            }}
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
              }}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "1.1rem",
                lineHeight: 1,
                padding: "0.25rem",
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
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
               {t("admin.loadingUsers")}
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</span>
             <p style={{ fontWeight: 600 }}>{t("admin.noUsersFound")}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                 <th>{t("admin.name")}</th>
                 <th>{t("admin.emailCol")}</th>
                 <th>{t("admin.role")}</th>
                 <th>{t("admin.joined")}</th>
                 <th style={{ textAlign: "right" }}>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
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
                     {new Date(user.created_at).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
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
                         <option value="user">{t("admin.user")}</option>
                         <option value="admin">{t("admin.admin_role")}</option>
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



      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
