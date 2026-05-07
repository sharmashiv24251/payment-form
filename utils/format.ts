export function formatCurrency(amount: number | string, currency: string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!n || isNaN(n)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
