import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Invoice } from "../types/database";

export function useInvoices(companyId: string | null) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("invoices")
      .select("*, customer:customers(*)")
      .eq("company_id", companyId)
      .order("invoice_date", { ascending: false });

    if (fetchError) {
      setError("Kunde inte hämta fakturor. Försök igen om en stund.");
      setLoading(false);
      return;
    }

    setInvoices((data ?? []) as unknown as Invoice[]);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refetch: fetchInvoices };
}
