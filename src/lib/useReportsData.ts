import { useMemo } from "react";
import { useInvoices } from "./useInvoices";
import { isOverdue } from "./format";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

export function useReportsData(companyId: string) {
  const { invoices, loading, error, refetch } = useInvoices(companyId);

  const revenueByMonth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totals = new Array(12).fill(0);

    for (const invoice of invoices) {
      if (invoice.status !== "paid") continue;
      const date = new Date(invoice.invoice_date);
      if (date.getFullYear() !== currentYear) continue;
      totals[date.getMonth()] += invoice.total;
    }

    return MONTH_LABELS.map((label, i) => ({ month: label, omsattning: totals[i] }));
  }, [invoices]);

  const statusBreakdown = useMemo(() => {
    const buckets: Record<string, { count: number; sum: number }> = {
      draft: { count: 0, sum: 0 },
      sent: { count: 0, sum: 0 },
      overdue: { count: 0, sum: 0 },
      paid: { count: 0, sum: 0 },
      credited: { count: 0, sum: 0 },
      cancelled: { count: 0, sum: 0 },
    };

    for (const invoice of invoices) {
      const key = isOverdue(invoice.due_date, invoice.status) ? "overdue" : invoice.status;
      if (!buckets[key]) buckets[key] = { count: 0, sum: 0 };
      buckets[key].count += 1;
      buckets[key].sum += invoice.total;
    }

    return buckets;
  }, [invoices]);

  const topCustomers = useMemo(() => {
    const byCustomer = new Map<string, { name: string; total: number; count: number }>();

    for (const invoice of invoices) {
      if (invoice.status !== "paid") continue;
      const name = invoice.customer?.name ?? "Okänd kund";
      const existing = byCustomer.get(name) ?? { name, total: 0, count: 0 };
      existing.total += invoice.total;
      existing.count += 1;
      byCustomer.set(name, existing);
    }

    return [...byCustomer.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [invoices]);

  const avgPaymentDays = useMemo(() => {
    const paidInvoices = invoices.filter((i) => i.status === "paid");
    if (paidInvoices.length === 0) return null;

    const totalDays = paidInvoices.reduce((sum, i) => {
      const issued = new Date(i.invoice_date).getTime();
      const paid = new Date(i.updated_at).getTime();
      const days = Math.max(0, Math.round((paid - issued) / (1000 * 60 * 60 * 24)));
      return sum + days;
    }, 0);

    return Math.round(totalDays / paidInvoices.length);
  }, [invoices]);

  return { loading, error, refetch, revenueByMonth, statusBreakdown, topCustomers, avgPaymentDays, hasInvoices: invoices.length > 0 };
}