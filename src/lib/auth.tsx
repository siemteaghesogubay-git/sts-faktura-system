import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const PRIVACY_POLICY_VERSION = "2026-08-14";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? translateAuthError(error.message) : null };
  }

  async function signUp(email: string, password: string) {
    // GDPR: samtycket till integritetspolicyn sparas med tidsstämpel och
    // policy-version i användarens metadata, som ett revisionsspår.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          privacy_consent_at: new Date().toISOString(),
          privacy_policy_version: PRIVACY_POLICY_VERSION,
        },
      },
    });

    if (error) return { error: translateAuthError(error.message), needsConfirmation: false };

    // Om projektet kräver e-postbekräftelse finns ingen session direkt.
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth måste användas inom AuthProvider");
  return ctx;
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Fel e-post eller lösenord.";
  if (message.includes("User already registered")) return "Det finns redan ett konto med den e-postadressen.";
  if (message.includes("Password should be at least")) return "Lösenordet måste vara minst 6 tecken.";
  if (message.includes("Unable to validate email")) return "Ange en giltig e-postadress.";
  return "Något gick fel. Försök igen.";
}
