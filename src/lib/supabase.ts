import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Saknar VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY. Kopiera .env.example till .env och fyll i värdena från Supabase-projektets API-inställningar."
  );
}

// Note: vi kör klienten utan Database-generic. supabase-js v2.112 introducerade
// ett internt __InternalSupabase-schema-kontrakt för generics som gör handskrivna
// typer sköra mellan versioner. Våra egna domäntyper i types/database.ts
// används istället direkt i hooks/komponenter för typtrygghet i appkoden.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
