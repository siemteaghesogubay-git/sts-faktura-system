export function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === "paid" || status === "credited" || status === "cancelled") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
