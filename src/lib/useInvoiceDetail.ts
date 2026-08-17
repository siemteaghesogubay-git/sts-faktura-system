import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Company, Customer, Invoice, InvoiceLine } from "../types/database";

export interface InvoiceDetail {
  invoice: Invoice;
  lines: InvoiceLine[];
  customer: Customer;
  company: Company;
}

export function useInvoiceDetail(invoiceId: string) {
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, customer:customers(*), company:companies(*)")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      setError("Kunde inte hämta fakturan.");
      setLoading(false);
      return;
    }

    const { data: lines, error: linesError } = await supabase
      .from("invoice_lines")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("position", { ascending: true });

    if (linesError) {
      setError("Kunde inte hämta fakturarader.");
      setLoading(false);
      return;
    }

    const raw = invoice as unknown as Invoice & { customer: Customer; company: Company };
    setDetail({
      invoice: raw,
      lines: (lines ?? []) as InvoiceLine[],
      customer: raw.customer,
      company: raw.company,
    });
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, error, refetch: fetchDetail };
}
