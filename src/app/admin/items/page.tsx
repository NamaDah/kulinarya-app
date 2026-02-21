"use client";

import { useState, useEffect, useCallback } from "react";
import { Category } from "@/lib/types";
import {
  AdminProduct,
  PaginatedResponse,
  ProductFormData,
  ProductFilters,
} from "@/lib/admin-types";
import {
  getAdminProducts,
  getAdminCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/admin-api";
import ItemFormModal from "@/components/admin/ItemFormModal";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import ItemDetailModal from "@/components/admin/ItemDetailModal";

export default function AdminItemsPage() {
  // Data
  const [products, setProducts] =
    useState<PaginatedResponse<AdminProduct> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category_id: "",
    status: "",
    page: 1,
    per_page: 10,
  });
  const [searchInput, setSearchInput] = useState("");

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(
    null,
  );

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch categories
  useEffect(() => {
    getAdminCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handlers
  const handleAdd = () => {
    setFormMode("add");
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setFormMode("edit");
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleView = (product: AdminProduct) => {
    setViewingProduct(product);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (product: AdminProduct) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    if (formMode === "add") {
      await createProduct(data);
    } else if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    }
    fetchProducts();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
  };

  const getEditFormData = (): ProductFormData | undefined => {
    if (!editingProduct) return undefined;
    return {
      name: editingProduct.name,
      description: editingProduct.description || "",
      category_id: String(editingProduct.category_id),
      price: editingProduct.price,
      unit: editingProduct.unit,
      image_url: editingProduct.image_url || "",
      in_stock: editingProduct.in_stock,
    };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Items
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#94a3b8",
              margin: "0.25rem 0 0",
            }}
          >
            Manage your product catalog
          </p>
        </div>
        <button className="btn-admin-primary" onClick={handleAdd}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Filters */}
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
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <svg
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search items..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>

        {/* Category Filter */}
        <select
          className="admin-select"
          style={{ flex: "0 0 180px" }}
          value={filters.category_id}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category_id: e.target.value, page: 1 }))
          }
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="admin-select"
          style={{ flex: "0 0 150px" }}
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
          }
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Total count */}
        {products && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              whiteSpace: "nowrap",
            }}
          >
            {products.total} item{products.total !== 1 && "s"}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: "hidden" }}>
        {loading ? (
          /* Skeleton Loading */
          <div style={{ padding: "1rem" }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  padding: "0.875rem 0",
                  borderBottom: i < 4 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div className="skeleton" style={{ width: 44, height: 44 }} />
                <div
                  className="skeleton"
                  style={{ height: 14, flex: "0 0 140px" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, flex: "0 0 80px" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, flex: "0 0 60px" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, flex: "0 0 50px" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 24, flex: "0 0 70px", borderRadius: 9999 }}
                />
              </div>
            ))}
          </div>
        ) : !products || products.data.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <p style={{ fontWeight: 600, fontSize: "1rem", color: "#64748b" }}>
              No items found
            </p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {filters.search || filters.category_id || filters.status
                ? "Try adjusting your filters"
                : "Get started by adding your first item"}
            </p>
            {!filters.search && !filters.category_id && !filters.status && (
              <button
                className="btn-admin-primary"
                onClick={handleAdd}
                style={{ marginTop: "1rem" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Add First Item
              </button>
            )}
          </div>
        ) : (
          /* Data Table */
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.data.map((product) => (
                  <tr key={product.id}>
                    {/* Image */}
                    <td>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "0.5rem",
                          overflow: "hidden",
                          background: "#f1f5f9",
                          flexShrink: 0,
                        }}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#cbd5e1",
                            }}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="3"
                                rx="2"
                                ry="2"
                              />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {product.name}
                      </div>
                      {product.description && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            marginTop: "0.125rem",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          background: "#f1f5f9",
                          padding: "0.25rem 0.625rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          color: "#475569",
                        }}
                      >
                        {product.category?.name || "—"}
                      </span>
                    </td>

                    {/* Price */}
                    <td>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>

                    {/* Unit */}
                    <td>{product.unit}</td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge ${product.in_stock ? "badge-active" : "badge-inactive"}`}
                      >
                        {product.in_stock ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Created At */}
                    <td>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        {formatDate(product.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <button
                          className="action-btn action-btn-view"
                          title="View"
                          onClick={() => handleView(product)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="action-btn action-btn-edit"
                          title="Edit"
                          onClick={() => handleEdit(product)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          title="Delete"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {products && products.last_page > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderTop: "1px solid #f1f5f9",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              Showing {products.from || 0} to {products.to || 0} of{" "}
              {products.total} results
            </div>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              {/* Prev */}
              <button
                className="pagination-btn"
                disabled={products.current_page <= 1}
                onClick={() => handlePageChange(products.current_page - 1)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {/* Page numbers */}
              {(() => {
                const pages: number[] = [];
                const current = products.current_page;
                const last = products.last_page;

                let start = Math.max(1, current - 2);
                let end = Math.min(last, current + 2);

                if (end - start < 4) {
                  if (start === 1) end = Math.min(last, start + 4);
                  else start = Math.max(1, end - 4);
                }

                for (let i = start; i <= end; i++) pages.push(i);

                return pages.map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === current ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ));
              })()}

              {/* Next */}
              <button
                className="pagination-btn"
                disabled={products.current_page >= products.last_page}
                onClick={() => handlePageChange(products.current_page + 1)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ItemFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={getEditFormData()}
        mode={formMode}
      />
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingProduct?.name || ""}
        deleting={deleting}
      />
      <ItemDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        product={viewingProduct}
      />

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
