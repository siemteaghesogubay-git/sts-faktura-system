import { supabase } from "./supabase";

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadCompanyLogo(
  companyId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: "Logotypen måste vara PNG, JPG eller WEBP." };
  }
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return { url: null, error: "Logotypen får max vara 2 MB." };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${companyId}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) {
    return { url: null, error: "Kunde inte ladda upp logotypen. Försök igen." };
  }

  const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
  // Cache-bust med en tidsstämpel så en ny logga syns direkt, inte den gamla
  // cachade bilden på samma URL.
  const url = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase.from("companies").update({ logo_url: url }).eq("id", companyId);
  if (updateError) {
    return { url: null, error: "Logotypen laddades upp men kunde inte sparas på företaget." };
  }

  return { url, error: null };
}