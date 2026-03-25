
type OrderStatus = "pending" | "processing" | "confirmed" | "shipping" | "done" | "cancelled";

type PaymentStatus = "unpaid" | "paid" | "expired" | "failed";

export const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  confirmed: { bg: "#dbeafe", color: "#1e40af" },
  processing: { bg: "#e0e7ff", color: "#3730a3" },
  shipping: { bg: "#fce7f3", color: "#9d174d" },
  done: { bg: "#dcfce7", color: "#166534" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

export const paymentColors: Record<PaymentStatus, { bg: string; color: string }> = {
  unpaid: { bg: "#fef3c7", color: "#92400e" },
  paid: { bg: "#dcfce7", color: "#166534" },
  expired: { bg: "#f3f4f6", color: "#6b7280" },
  failed: { bg: "#fee2e2", color: "#991b1b" },
};