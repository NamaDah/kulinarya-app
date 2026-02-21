"use client";

import { useState, useEffect, useCallback } from "react";
import { Category } from "@/lib/types";
import { ProductFormData, FormErrors } from "@/lib/admin-types";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  categories: Category[];
  initialData?: ProductFormData;
  mode: "add" | "edit";
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  unit: "piece",
  image_url: "",
  in_stock: true,
};

export default function ItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  mode,
}: ItemFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || defaultFormData);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.price || Number(formData.price) < 0)
      newErrors.price = "Valid price is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    if (formData.image_url && !/^https?:\/\/.+/.test(formData.image_url))
      newErrors.image_url = "Enter a valid URL";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 560 }}
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
          <div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {mode === "add" ? "Add New Item" : "Edit Item"}
            </h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#94a3b8",
                margin: "0.25rem 0 0",
              }}
            >
              {mode === "add"
                ? "Fill in the details to create a new product"
                : "Update the product information"}
            </p>
          </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Name */}
            <div>
              <label style={labelStyle}>
                Item Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className={`admin-input ${errors.name ? "error" : ""}`}
                type="text"
                placeholder="e.g. Premium Soy Sauce"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                className="admin-input"
                placeholder="Describe the product..."
                rows={3}
                style={{ resize: "vertical" }}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Category & Price row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Category <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className={`admin-select ${errors.category_id ? "error" : ""}`}
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p style={errorStyle}>{errors.category_id}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>
                  Price <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  className={`admin-input ${errors.price ? "error" : ""}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                {errors.price && <p style={errorStyle}>{errors.price}</p>}
              </div>
            </div>

            {/* Unit & Stock row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Unit <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className={`admin-select ${errors.unit ? "error" : ""}`}
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                >
                  <option value="piece">Piece</option>
                  <option value="bottle">Bottle</option>
                  <option value="pack">Pack</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="ml">Milliliter</option>
                  <option value="l">Liter</option>
                  <option value="box">Box</option>
                </select>
                {errors.unit && <p style={errorStyle}>{errors.unit}</p>}
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input
                  className={`admin-input ${errors.image_url ? "error" : ""}`}
                  type="text"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
                {errors.image_url && (
                  <p style={errorStyle}>{errors.image_url}</p>
                )}
              </div>
            </div>

            {/* Status Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1rem",
                background: "#f8fafc",
                borderRadius: "0.625rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  Active Status
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {formData.in_stock
                    ? "Product is available"
                    : "Product is hidden"}
                </div>
              </div>
              <button
                type="button"
                className={`toggle-switch ${formData.in_stock ? "active" : ""}`}
                onClick={() =>
                  setFormData({ ...formData, in_stock: !formData.in_stock })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-admin-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                  Saving...
                </>
              ) : mode === "add" ? (
                <>
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
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Add Item
                </>
              ) : (
                <>
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
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                  Update Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "0.375rem",
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#ef4444",
  marginTop: "0.25rem",
  margin: "0.25rem 0 0",
};
