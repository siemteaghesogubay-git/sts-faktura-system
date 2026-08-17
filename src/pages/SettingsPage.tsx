import { useEffect, useState } from "react";
import { useCompanySettings } from "../lib/useCompanySettings";
import { TextField } from "../components/FormField";
import { Button } from "../components/Button";
import { LoadingState, ErrorState } from "../components/States";
import type { CompanyRole } from "../types/database";

export function SettingsPage({ companyId, role }: { companyId: string; role: CompanyRole }) {
  const { company, loading, error, refetch, updateCompany } = useCompanySettings(companyId);
  const canEdit = role === "owner" || role === "admin";

  const [form, setForm] = useState({
    name: "",
    org_number: "",
    vat_number: "",
    address_line1: "",
    postal_code: "",
    city: "",
    email: "",
    phone: "",
    bankgiro: "",
    plusgiro: "",
    f_skatt: true,
    invoice_prefix: "",
    default_payment_days: 30,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name,
      org_number: company.org_number,
      vat_number: company.vat_number ?? "",
      address_line1: company.address_line1 ?? "",
      postal_code: company.postal_code ?? "",
      city: company.city ?? "",
      email: company.email ?? "",
      phone: company.phone ?? "",
      bankgiro: company.bankgiro ?? "",
      plusgiro: company.plusgiro ?? "",
      f_skatt: company.f_skatt,
      invoice_prefix: company.invoice_prefix,
      default_payment_days: company.default_payment_days,
    });
  }, [company]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.org_number.trim()) {
      setFormError("Företagsnamn och organisationsnummer är obligatoriska.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const { error: saveError } = await updateCompany({
      name: form.name.trim(),
      org_number: form.org_number.trim(),
      vat_number: form.vat_number.trim() || null,
      address_line1: form.address_line1.trim() || null,
      postal_code: form.postal_code.trim() || null,
      city: form.city.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      bankgiro: form.bankgiro.trim() || null,
      plusgiro: form.plusgiro.trim() || null,
      f_skatt: form.f_skatt,
      invoice_prefix: form.invoice_prefix.trim(),
      default_payment_days: form.default_payment_days,
    });

    setSaving(false);

    if (saveError) {
      reportError(saveError);
      setFormError(saveError);
      return;
    }
    setSaved(true);
  }

  if (loading) return <LoadingState label="Hämtar företagsuppgifter…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-semibold text-[var(--color-text-primary)]">Inställningar</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Företagsuppgifterna används på alla fakturor, inklusive PDF-export.
      </p>

      {!canEdit && (
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          Endast owner och admin kan ändra företagsuppgifter. Du kan se dem här.
        </p>
      )}

      <fieldset disabled={!canEdit} className="mt-6 flex flex-col gap-6 disabled:opacity-70">
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">Företagsuppgifter</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Företagsnamn"
              id="s-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <TextField
              label="Organisationsnummer"
              id="s-org"
              value={form.org_number}
              onChange={(e) => update("org_number", e.target.value)}
              required
            />
            <TextField
              label="Momsregistreringsnummer"
              id="s-vat"
              value={form.vat_number}
              onChange={(e) => update("vat_number", e.target.value)}
              placeholder="SE556677889901"
            />
            <TextField
              label="E-post"
              id="s-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <TextField
              label="Telefon"
              id="s-phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">Adress</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <TextField
                label="Adress"
                id="s-address"
                value={form.address_line1}
                onChange={(e) => update("address_line1", e.target.value)}
              />
            </div>
            <TextField
              label="Postnummer"
              id="s-postal"
              value={form.postal_code}
              onChange={(e) => update("postal_code", e.target.value)}
            />
            <TextField label="Stad" id="s-city" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">Betalning & fakturering</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Bankgiro"
              id="s-bankgiro"
              value={form.bankgiro}
              onChange={(e) => update("bankgiro", e.target.value)}
            />
            <TextField
              label="Plusgiro"
              id="s-plusgiro"
              value={form.plusgiro}
              onChange={(e) => update("plusgiro", e.target.value)}
            />
            <TextField
              label="Fakturaprefix"
              id="s-prefix"
              value={form.invoice_prefix}
              onChange={(e) => update("invoice_prefix", e.target.value)}
              hint="T.ex. STS- ger fakturanummer som STS-2026-0001"
            />
            <TextField
              label="Standard betalningsvillkor (dagar)"
              id="s-payment-days"
              type="number"
              min={1}
              value={form.default_payment_days}
              onChange={(e) => update("default_payment_days", Number(e.target.value))}
            />
          </div>
          <label className="mt-4 flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={form.f_skatt}
              onChange={(e) => update("f_skatt", e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border-strong)] bg-[var(--color-background)]"
            />
            Innehar F-skattsedel (visas på fakturor)
          </label>
        </section>

        {formError && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {formError}
          </p>
        )}

        {canEdit && (
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Spara ändringar
            </Button>
            {saved && <span className="text-sm text-[var(--color-success)]">Sparat.</span>}
          </div>
        )}
      </fieldset>
    </div>
  );
}