import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { TextField } from "../components/FormField";
import { Button } from "../components/Button";
import { uploadCompanyLogo } from "../lib/uploadLogo";

export function OnboardingPage({ onCreated }: { onCreated: () => void }) {
  const { signOut } = useAuth();
  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !orgNumber.trim() || !vatNumber.trim()) {
      setError("Fyll i företagsnamn, organisationsnummer och momsregistreringsnummer.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data: companyId, error: rpcError } = await supabase.rpc("create_company_with_owner", {
      p_name: name.trim(),
      p_org_number: orgNumber.trim(),
      p_vat_number: vatNumber.trim(),
    });

    if (rpcError || !companyId) {
      setLoading(false);
      setError("Kunde inte skapa företaget. Försök igen.");
      return;
    }

    if (logoFile) {
      const { error: logoError } = await uploadCompanyLogo(companyId, logoFile);
      if (logoError) {
        // Företaget skapades ändå — loggan kan läggas till senare under
        // Inställningar, så  blockeraras inte hela flödet för det.
        setLoading(false);
        onCreated();
        return;
      }
    }

    setLoading(false);
    onCreated();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold text-[var(--color-text-primary)]">
          Skapa ditt företag
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
          Du blir automatiskt ägare (owner) för företaget.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="Företagsnamn"
            id="onboard-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="STS Tech Solution AB"
          />
          <TextField
            label="Organisationsnummer"
            id="onboard-org"
            value={orgNumber}
            onChange={(e) => setOrgNumber(e.target.value)}
            required
            placeholder="556677-8899"
          />
          <TextField
            label="Momsregistreringsnummer"
            id="onboard-vat"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            required
            placeholder="SE556677889901"
            hint="Krävs på alla svenska fakturor enligt momslagen."
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="onboard-logo" className="text-sm font-medium text-[var(--color-text-primary)]">
              Logotyp (valfritt)
            </label>
            <div className="flex items-center gap-3">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Förhandsvisning av logotyp"
                  className="h-12 w-12 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] object-contain bg-white"
                />
              )}
              <input
                id="onboard-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="text-sm text-[var(--color-text-secondary)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--color-surface-elevated)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--color-text-primary)]"
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Visas på PDF-fakturor. Kan läggas till senare under Inställningar.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full">
            Skapa företag
          </Button>
        </form>
        <button
          onClick={() => signOut()}
          className="mt-6 w-full text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          Logga ut
        </button>
      </div>
    </div>
  );
}