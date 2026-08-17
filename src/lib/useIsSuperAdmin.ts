import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

export function useIsSuperAdmin() {
  const { session } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase.rpc("is_superadmin").then(({ data }) => {
      setIsSuperAdmin(Boolean(data));
      setLoading(false);
    });
  }, [session?.user]);

  return { isSuperAdmin, loading };
}
