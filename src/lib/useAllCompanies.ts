import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Company } from "../types/database";

export interface CompanyWithCounts extends Company {
  member_count: number;
  invoice_count: number;
}

export function useAllCompanies() {
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: companyRows, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError || !companyRows) {
      setError("Kunde inte hämta företag.");
      setLoading(false);
      return;
    }

    // Räknar medlemmar och fakturor per företag. Görs som separata frågor
    // (inte en enda join) eftersom Supabase-klientens count-stöd är
    // enklast att kombinera på det sättet för flera oberoende tabeller.
    const withCounts = await Promise.all(
      companyRows.map(async (company) => {
        const [{ count: memberCount }, { count: invoiceCount }] = await Promise.all([
          supabase.from("company_users").select("id", { count: "exact", head: true }).eq("company_id", company.id),
          supabase.from("invoices").select("id", { count: "exact", head: true }).eq("company_id", company.id),
        ]);
        return { ...company, member_count: memberCount ?? 0, invoice_count: invoiceCount ?? 0 } as CompanyWithCounts;
      })
    );

    setCompanies(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, loading, error, refetch: fetchCompanies };
}