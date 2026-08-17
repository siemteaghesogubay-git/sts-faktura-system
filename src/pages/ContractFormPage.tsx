import { useState } from "react";
import { supabase } from "../lib/supabase";
import { TextField, SelectField } from "../components/FormField";
import { Button } from "../components/Button";
import type { Contract, FeeType } from "../types/database";

const FEE_TYPE_LABELS: Record<FeeType, string> = {
  fixed: "Fast pris",
  hourly: "Löpande räkning (timpris)",
  monthly: "Månadsvis",
};

export function ContractFormPage({
  existing,
  onSaved,
  onCancel,
}: {
  existing?: Contract;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [clientName, setClientName] = useState(existing?.client_name ?? "");
  const [clientOrgNumber, setClientOrgNumber] = useState(existing?.client_org_number ?? "");
  const [clientContactPerson, setClientContactPerson] = useState(existing?.client_contact_person ?? "");
  const [clientEmail, setClientEmail] = useState(existing?.client_email ?? "");
  const [clientAddress, setClientAddress] = useState(existing?.client_address ?? "");
  const [contractDate, setContractDate] = useState(
    existing?.contract_date ?? new Date().toISOString().slice(0, 10)
  );
  const [startDate, setStartDate] = useState(existing?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(existing?.end_date ?? "");
  const [scopeOfWork, setScopeOfWork] = useState(existing?.scope_of_work ?? "");
  const [feeType, setFeeType] = useState<FeeType>(existing?.fee_type ?? "fixed");
  const [feeAmount, setFeeAmount] = useState(existing?.fee_amount ?? 0);
  const [paymentTerms, setPaymentTerms] = useState(existing?.payment_terms ?? "30 dagar netto");
  const [additionalTerms, setAdditionalTerms] = useState(existing?.additional_terms ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!clientName.trim()) newErrors.clientName = "Ange klientens namn.";
    if (!startDate) newErrors.startDate = "Ange startdatum.";
    if (!scopeOfWork.trim()) newErrors.scopeOfWork = "Beskriv uppdragets omfattning.";
    if (feeAmount <= 0) newErrors.feeAmount = "Ange ett belopp större än 0.";
    if (endDate && endDate < startDate) newErrors.endDate = "Slutdatum kan inte vara före startdatum.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(status: "draft" | "sent") {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      client_name: clientName.trim(),
      client_org_number: clientOrgNumber.trim() || null,
      client_contact_person: clientContactPerson.trim() || null,
      client_email: clientEmail.trim() || null,
      client_address: clientAddress.trim() || null,
      contract_date: contractDate,
      start_date: startDate,
      end_date: endDate || null,
      scope_of_work: scopeOfWork.trim(),
      fee_type: feeType,
      fee_amount: feeAmount,
      payment_terms: paymentTerms.trim() || null,
      additional_terms: additionalTerms.trim() || null,
      status,
    };

    const { error } = existing
      ? await supabase.from("contracts").update(payload).eq("id", existing.id)
      : await supabase.from("contracts").insert(payload);

    setSaving(false);

    if (error) {
      setErrors({ form: "Kunde inte spara avtalet. Försök igen." });
      return;
    }

    onSaved();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {existing ? "Redigera avtal" : "Nytt kunduppdragsavtal"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Endast synligt för superadmin.
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          Avbryt
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Klient</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Klientens namn / företag"
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              error={errors.clientName}
              required
            />
            <TextField
              label="Org.nummer"
              id="client-org"
              value={clientOrgNumber}
              onChange={(e) => setClientOrgNumber(e.target.value)}
              placeholder="556677-8899"
            />
            <TextField
              label="Kontaktperson"
              id="client-contact"
              value={clientContactPerson}
              onChange={(e) => setClientContactPerson(e.target.value)}
            />
            <TextField
              label="E-post"
              id="client-email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <TextField
              label="Adress"
              id="client-address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Avtalsperiod</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              label="Avtalsdatum"
              id="contract-date"
              type="date"
              value={contractDate}
              onChange={(e) => setContractDate(e.target.value)}
              required
            />
            <TextField
              label="Startdatum"
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
              required
            />
            <TextField
              label="Slutdatum (valfritt)"
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.endDate}
              hint="Lämna tomt vid löpande uppdrag."
            />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Uppdrag och ersättning</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="scope" className="text-sm font-medium text-[var(--color-text-primary)]">
                Uppdragets omfattning <span className="text-[var(--color-danger)]">*</span>
              </label>
              <textarea
                id="scope"
                rows={4}
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                placeholder="T.ex. utveckling och underhåll av webbplats enligt separat kravspecifikation…"
                className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              />
              {errors.scopeOfWork && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.scopeOfWork}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SelectField
                label="Ersättningsform"
                id="fee-type"
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as FeeType)}
              >
                {Object.entries(FEE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Belopp (kr)"
                id="fee-amount"
                type="number"
                min={0}
                step="0.01"
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                error={errors.feeAmount}
              />
              <TextField
                label="Betalningsvillkor"
                id="payment-terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <label htmlFor="additional-terms" className="text-sm font-medium text-[var(--color-text-primary)]">
            Särskilda villkor (fritext)
          </label>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Sekretess, uppsägningstid, immateriella rättigheter eller annat som inte täcks av fälten ovan.
          </p>
          <textarea
            id="additional-terms"
            rows={6}
            value={additionalTerms}
            onChange={(e) => setAdditionalTerms(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />
        </section>

        {errors.form && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {errors.form}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Avbryt
          </Button>
          <Button variant="outline" onClick={() => handleSave("draft")} loading={saving}>
            Spara som utkast
          </Button>
          <Button variant="primary" onClick={() => handleSave("sent")} loading={saving}>
            Markera som skickat
          </Button>
        </div>
      </div>
    </div>
  );
}
