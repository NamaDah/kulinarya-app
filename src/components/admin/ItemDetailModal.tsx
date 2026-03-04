"use client";

import { useEffect, useCallback } from "react";
import { AdminProduct } from "@/lib/admin-types";
import { formatRupiah } from "@/lib/currency";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProduct | null;
}

export default function ItemDetailModal({
  isOpen,
  onClose,
  product,
}: ItemDetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !product) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Item Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "0.5rem",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {/* Image */}
          {product.image_url && (
            <div
              style={{
                width: "100%",
                height: 200,
                borderRadius: "0.75rem",
                overflow: "hidden",
                marginBottom: "1.5rem",
                background: "#f1f5f9",
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* Title & Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {product.name}
            </h3>
            <span
              className={`badge ${product.in_stock ? "badge-active" : "badge-inactive"}`}
            >
              {product.in_stock ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "#64748b",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              {product.description}
            </p>
          )}

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <DetailItem
              label="Category"
              value={product.category?.name || "—"}
            />
            <DetailItem label="Price" value={formatRupiah(product.price)} />
            <DetailItem label="Unit" value={product.unit} />
            <DetailItem label="Slug" value={product.slug} />
            <DetailItem
              label="Created"
              value={formatDate(product.created_at)}
            />
            <DetailItem
              label="Updated"
              value={formatDate(product.updated_at)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.875rem",
          color: "#1e293b",
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}
