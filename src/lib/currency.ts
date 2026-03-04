/**
 * Format a number or numeric string as USD.
 * Note: Still named formatRupiah for backward compatibility in imports
 * Example: formatRupiah(25) => "$25.00"
 */
export function formatRupiah(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0.00";
  return "$" + num.toFixed(2);
}
