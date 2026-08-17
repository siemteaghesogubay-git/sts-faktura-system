import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface DashboardStats {
  totalInvoices: number;
  totalCustomers: number;
  invoicesThisMonth: number;
}

export function useDashboardStats(companyId: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

      const [invoicesRes, customersRes, thisMonthRes] = await Promise.all([
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .gte("invoice_date", monthStart),
      ]);

      if (cancelled) return;

      setStats({
        totalInvoices: invoicesRes.count ?? 0,
        totalCustomers: customersRes.count ?? 0,
        invoicesThisMonth: thisMonthRes.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return { stats, loading };
}