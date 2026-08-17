import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
import type { Company, CompanyRole } from "../types/database";

export interface Membership {
  company: Company;
  role: CompanyRole;
}

export function useCompanies() {
  const { session } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberships = useCallback(async () => {
    if (!session?.user) {
      setMemberships([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("company_users")
      .select("role, company:companies(*)")
      .eq("user_id", session.user.id);

    setMemberships(((data ?? []) as unknown as { role: CompanyRole; company: Company }[]).map((row) => ({
      company: row.company,
      role: row.role,
    })));
    setLoading(false);
  }, [session?.user]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return { memberships, loading, refetch: fetchMemberships };
}
