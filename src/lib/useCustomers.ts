import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Customer } from "../types/database";

export function useCustomers(companyId: string | null) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true });
    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, refetch: fetchCustomers };
}
