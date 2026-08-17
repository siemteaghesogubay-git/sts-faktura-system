import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Company } from "../types/database";

export function useCompanySettings(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("companies").select("*").eq("id", companyId).single();
    if (fetchError || !data) {
      setError("Kunde inte hämta företagsuppgifter.");
      setLoading(false);
      return;
    }
    setCompany(data as Company);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  async function updateCompany(patch: Partial<Company>) {
    const { data, error: updateError } = await supabase
      .from("companies")
      .update(patch)
      .eq("id", companyId)
      .select()
      .single();

    if (updateError || !data) {
      return { error: "Kunde inte spara ändringarna." };
    }
    setCompany(data as Company);
    return { error: null };
  }

  return { company, loading, error, refetch: fetchCompany, updateCompany };
}