import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Contract } from "../types/database";

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Kunde inte hämta avtal.");
      setLoading(false);
      return;
    }
    setContracts((data ?? []) as Contract[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return { contracts, loading, error, refetch: fetchContracts };
}
