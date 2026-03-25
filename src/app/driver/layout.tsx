"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "driver")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
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

  if (!user || user.role !== "driver") {
    return null;
  }

  return (
    <div>
      {/* Driver Nav Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #292524, #44403c)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🚗</span>
          <span
            style={{
              color: "#f59e0b",
              fontWeight: 700,
              fontSize: "1.1rem",
              fontFamily: "var(--font-heading)",
            }}
          >
            Driver Dashboard
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#d6d3d1",
            fontSize: "0.85rem",
          }}
        >
          <span>👤</span>
          <span>{user.name}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
